import type {
  Abi,
  Address,
  Chain,
  ContractFunctionReturnType,
  GetContractReturnType,
  PublicClient,
  Transport,
} from "viem";
import { isAddressEqual } from "viem";
import type { iWithdrawalCompressorV313Abi } from "../../../abi/IWithdrawalCompressorV313.js";
import type { BaseContractArgs } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { decodeDelayedIntent, encodeDelayedIntent } from "./intent-codec.js";
import type {
  ClaimableWithdrawal,
  CurrentWithdrawals,
  DelayedIntent,
  DelayedIntentExtended,
  IWithdrawalCompressorContract,
  PendingWithdrawal,
  RequestableWithdrawal,
  WithdrawableAsset,
} from "./types.js";

const iCreditAccountAbi = [
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const;

/**
 * v313 ABI is a type-level superset of v310/v311 for the read methods used
 * here. Fields missing in older versions (`maxWithdrawals`, `extraData`) are
 * required in the inferred types but absent at runtime on v310/v311, so the
 * normalization helpers must not assume their presence.
 **/
type CommonAbi = typeof iWithdrawalCompressorV313Abi;
type CommonContract = GetContractReturnType<
  CommonAbi,
  PublicClient<Transport, Chain>,
  Address
>;

type OnchainWithdrawableAsset = ContractFunctionReturnType<
  CommonAbi,
  "view",
  "getWithdrawableAssets"
>[number];

type OnchainCurrentWithdrawals = ContractFunctionReturnType<
  CommonAbi,
  "view",
  "getCurrentWithdrawals"
>;
type OnchainClaimableWithdrawal = OnchainCurrentWithdrawals[0][number];
type OnchainPendingWithdrawal = OnchainCurrentWithdrawals[1][number];

/**
 * Base class for WithdrawalCompressor contracts of different versions.
 * Implements version-agnostic reads, normalizing results to common types.
 **/
export abstract class AbstractWithdrawalCompressorContract<abi extends Abi>
  extends BaseContract<abi>
  implements IWithdrawalCompressorContract
{
  readonly #sdk: OnchainSDK;

  constructor(sdk: OnchainSDK, args: BaseContractArgs<abi>) {
    super(sdk, args);
    this.#sdk = sdk;
  }

  /**
   * The contract is instantiated with the actual versioned ABI,
   * this cast is type-level only (see {@link CommonAbi}).
   **/
  private get common(): CommonContract {
    return this.contract as unknown as CommonContract;
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawableAssets}
   **/
  public async getWithdrawableAssets(
    creditManager: Address,
  ): Promise<WithdrawableAsset[]> {
    const resp = await this.common.read.getWithdrawableAssets([creditManager]);
    return resp.map(a => toWithdrawableAsset(a, creditManager));
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawableAssetsBatch}
   **/
  public async getWithdrawableAssetsBatch(
    creditManagers?: Address[],
  ): Promise<WithdrawableAsset[]> {
    const cms =
      creditManagers ??
      this.#sdk.marketRegister.creditManagers.map(
        cm => cm.creditManager.address,
      );
    const resp = await this.client.multicall({
      contracts: cms.map(
        cm =>
          ({
            address: this.address,
            abi: this.abi as unknown as CommonAbi,
            functionName: "getWithdrawableAssets",
            args: [cm],
          }) as const,
      ),
      allowFailure: true,
      batchSize: 0,
    });
    return resp.flatMap((r, i) => {
      if (r.status !== "success") {
        this.logger?.warn(
          `failed to get withdrawable assets of credit manager ${cms[i]}: ${r.error}`,
        );
        return [];
      }
      return r.result.map(a => toWithdrawableAsset(a, cms[i]));
    });
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getCurrentWithdrawals}
   **/
  public async getCurrentWithdrawals(
    creditAccount: Address,
  ): Promise<CurrentWithdrawals> {
    const [[claimable, pending], creditManager] = await this.client.multicall({
      contracts: [
        {
          address: this.address,
          abi: this.abi as unknown as CommonAbi,
          functionName: "getCurrentWithdrawals",
          args: [creditAccount],
        },
        {
          address: creditAccount,
          abi: iCreditAccountAbi,
          functionName: "creditManager",
        },
      ] as const,
      allowFailure: false,
      batchSize: 0,
    });
    return {
      claimable: claimable.map(w =>
        toClaimableWithdrawal(w, creditManager, this.version >= 313),
      ),
      pending: pending
        .map(w => toPendingWithdrawal(w, creditManager, this.version >= 313))
        .sort((a, b) => (a.claimableAt < b.claimableAt ? -1 : 1)),
    };
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawalRequestResult}
   **/
  public async getWithdrawalRequestResult(
    creditAccount: Address,
    token: Address,
    amount: bigint,
    intent?: DelayedIntent,
  ): Promise<RequestableWithdrawal> {
    const resp = intent
      ? await this.#getWithdrawalRequestResultWithIntent(
          creditAccount,
          token,
          amount,
          intent,
        )
      : await this.common.read.getWithdrawalRequestResult([
          creditAccount,
          token,
          amount,
        ]);
    return {
      token: resp.token,
      amountIn: resp.amountIn,
      outputs: [...resp.outputs],
      requestCalls: [...resp.requestCalls],
      claimableAt: resp.claimableAt,
    };
  }

  /**
   * Previews a delayed withdrawal request with an intent attached as
   * `extraData`. Only supported on v313+ compressors; on older versions,
   * throws if `sdk.strictContractTypes` is `true`, otherwise logs a warning
   * and previews the request without the intent.
   *
   * The contract overload accepting `extraData` also requires the withdrawal
   * phantom token, which is resolved here the same way the 3-arg overload
   * does it internally: via `getWithdrawableAssets` of the account's credit
   * manager.
   **/
  async #getWithdrawalRequestResultWithIntent(
    creditAccount: Address,
    token: Address,
    amount: bigint,
    intent: DelayedIntent,
  ): Promise<
    ContractFunctionReturnType<
      CommonAbi,
      "view",
      "getWithdrawalRequestResult",
      readonly [Address, Address, bigint]
    >
  > {
    if (this.version < 313) {
      const message = `withdrawal intents are not supported by ${this.name} v${this.version}`;
      if (this.#sdk.strictContractTypes) {
        throw new Error(message);
      }
      this.logger?.warn(`${message}, requesting withdrawal without intent`);
      return this.common.read.getWithdrawalRequestResult([
        creditAccount,
        token,
        amount,
      ]);
    }
    const extraData = encodeDelayedIntent(intent);
    const creditManager = await this.client.readContract({
      address: creditAccount,
      abi: iCreditAccountAbi,
      functionName: "creditManager",
    });
    const assets = await this.common.read.getWithdrawableAssets([
      creditManager,
    ]);
    const asset = assets.find(a => isAddressEqual(a.token, token));
    if (!asset) {
      throw new Error(
        `token ${token} is not withdrawable from credit manager ${creditManager}`,
      );
    }
    return this.common.read.getWithdrawalRequestResult([
      creditAccount,
      token,
      asset.withdrawalPhantomToken,
      amount,
      extraData,
    ]);
  }
}

function toWithdrawableAsset(
  a: OnchainWithdrawableAsset,
  creditManager: Address,
): WithdrawableAsset {
  return { creditManager, ...a };
}

function toClaimableWithdrawal(
  w: OnchainClaimableWithdrawal,
  creditManager: Address,
  decodeIntent: boolean,
): ClaimableWithdrawal {
  let intent: DelayedIntentExtended | undefined;
  if (decodeIntent && w.extraData && w.extraData !== "0x") {
    intent = { ...decodeDelayedIntent(w.extraData), creditManager };
  }
  return {
    token: w.token,
    withdrawalPhantomToken: w.withdrawalPhantomToken,
    withdrawalTokenSpent: w.withdrawalTokenSpent,
    outputs: [...w.outputs],
    claimCalls: [...w.claimCalls],
    intent,
  };
}

function toPendingWithdrawal(
  w: OnchainPendingWithdrawal,
  creditManager: Address,
  decodeIntent: boolean,
): PendingWithdrawal {
  let intent: DelayedIntentExtended | undefined;
  if (decodeIntent && w.extraData && w.extraData !== "0x") {
    intent = { ...decodeDelayedIntent(w.extraData), creditManager };
  }
  return {
    token: w.token,
    withdrawalPhantomToken: w.withdrawalPhantomToken,
    expectedOutputs: [...w.expectedOutputs],
    claimableAt: w.claimableAt,
    intent,
  };
}
