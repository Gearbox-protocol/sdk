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
import { AddressMap } from "../../utils/index.js";
import { decodeDelayedIntent } from "./intent-codec.js";
import type {
  ClaimableWithdrawal,
  CurrentWithdrawals,
  DelayedIntentExtended,
  GetWithdrawalRequestResultProps,
  IWithdrawalCompressorContract,
  PendingWithdrawal,
  RequestableWithdrawal,
  WithdrawableAsset,
  WithdrawalStatus,
  WithdrawalsState,
} from "./types.js";

export const iCreditAccountAbi = [
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const;

const MAP_LABEL = "withdrawableAssets";

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
 * Withdrawable assets are cached for the lifetime of the instance (which is
 * reused across calls via the SDK's contracts register).
 **/
export abstract class AbstractWithdrawalCompressorContract<abi extends Abi>
  extends BaseContract<abi>
  implements IWithdrawalCompressorContract
{
  readonly #sdk: OnchainSDK;
  #withdrawableAssets?: AddressMap<WithdrawableAsset[]>;

  constructor(sdk: OnchainSDK, args: BaseContractArgs<abi>) {
    super(sdk, args);
    this.#sdk = sdk;
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.hydrate}
   **/
  public hydrate(state: WithdrawalsState): void {
    this.#withdrawableAssets = new AddressMap(
      Object.entries(state.withdrawableAssets),
      MAP_LABEL,
    );
  }

  /**
   * The contract is instantiated with the actual versioned ABI,
   * this cast is type-level only (see {@link CommonAbi}).
   **/
  private get common(): CommonContract {
    return this.contract as unknown as CommonContract;
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.state}
   **/
  public get state(): WithdrawalsState | undefined {
    return this.#withdrawableAssets
      ? { withdrawableAssets: this.#withdrawableAssets.asRecord() }
      : undefined;
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawableAssets}
   **/
  public getWithdrawableAssets(
    ...creditManagers: Address[]
  ): WithdrawableAsset[] {
    const cache = this.#withdrawableAssets;
    if (!cache) {
      throw new Error(
        "withdrawable assets are not loaded, call loadWithdrawableAssets first",
      );
    }
    if (creditManagers.length === 0) {
      return cache.values().flat();
    }
    return creditManagers.flatMap(cm => cache.get(cm) ?? []);
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.loadWithdrawableAssets}
   **/
  public async loadWithdrawableAssets(
    force?: boolean,
  ): Promise<WithdrawableAsset[]> {
    if (this.#withdrawableAssets && !force) {
      return this.getWithdrawableAssets();
    }
    const cms = this.#sdk.marketRegister.creditManagers.map(
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
    const cache = new AddressMap<WithdrawableAsset[]>(undefined, MAP_LABEL);
    for (let i = 0; i < resp.length; i++) {
      const r = resp[i];
      if (r.status !== "success") {
        this.logger?.warn(
          `failed to get withdrawable assets of credit manager ${cms[i]}: ${r.error}`,
        );
        continue;
      }
      if (r.result.length > 0) {
        cache.upsert(
          cms[i],
          r.result.map(a => toWithdrawableAsset(a, cms[i])),
        );
      }
    }
    this.#withdrawableAssets = cache;
    return this.getWithdrawableAssets();
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.findWithdrawableAssets}
   **/
  public async findWithdrawableAssets(
    creditManager: Address,
    token: Address,
  ): Promise<WithdrawableAsset[]> {
    await this.loadWithdrawableAssets();
    return this.getWithdrawableAssets(creditManager).filter(a =>
      isAddressEqual(a.token, token),
    );
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.findWithdrawableAssetsByPhantomToken}
   **/
  public async findWithdrawableAssetsByPhantomToken(
    withdrawalPhantomToken: Address,
  ): Promise<WithdrawableAsset[]> {
    await this.loadWithdrawableAssets();
    return this.getWithdrawableAssets().filter(a =>
      isAddressEqual(a.withdrawalPhantomToken, withdrawalPhantomToken),
    );
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawalPhantomToken}
   **/
  public async getWithdrawalPhantomToken(
    creditManager: Address,
    token: Address,
  ): Promise<Address> {
    const [asset] = await this.findWithdrawableAssets(creditManager, token);
    if (!asset) {
      throw new Error(
        `token ${token} is not withdrawable from credit manager ${creditManager}`,
      );
    }
    return asset.withdrawalPhantomToken;
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawalSourceToken}
   **/
  public getWithdrawalSourceToken(
    withdrawalPhantomToken: Address,
  ): Address | undefined {
    return this.getWithdrawableAssets().find(a =>
      isAddressEqual(a.withdrawalPhantomToken, withdrawalPhantomToken),
    )?.token;
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
    // intent decoding is effectively a no-op on legacy compressors:
    // their ABIs have no `extraData` field in the withdrawal structs
    return {
      claimable: claimable.map(w => toClaimableWithdrawal(w, creditManager)),
      pending: pending
        .map(w => toPendingWithdrawal(w, creditManager))
        .sort((a, b) => (a.claimableAt < b.claimableAt ? -1 : 1)),
    };
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getExternalAccountCurrentWithdrawals}
   **/
  public async getExternalAccountCurrentWithdrawals(
    _withdrawalToken: Address,
    _account: Address,
  ): Promise<CurrentWithdrawals> {
    this.#reportUnsupported("external account withdrawals");
    return { claimable: [], pending: [] };
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawalStatus}
   **/
  public async getWithdrawalStatus(
    ...redeemers: Address[]
  ): Promise<WithdrawalStatus[]> {
    if (redeemers.length === 0) {
      return [];
    }
    this.#reportUnsupported("withdrawal status");
    return redeemers.map(() => "NULL");
  }

  /**
   * {@inheritDoc IWithdrawalCompressorContract.getWithdrawalRequestResult}
   *
   * Legacy compressors only support the 3-arg overload: `intent` and
   * `withdrawalPhantomToken` are reported as unsupported (in non-strict mode
   * the request is previewed without them).
   **/
  public async getWithdrawalRequestResult({
    creditAccount,
    token,
    amount,
    withdrawalPhantomToken,
    intent,
  }: GetWithdrawalRequestResultProps): Promise<RequestableWithdrawal> {
    if (intent) {
      this.#reportUnsupported("withdrawal intents");
    } else if (withdrawalPhantomToken) {
      this.#reportUnsupported("withdrawal config selection");
    }
    const resp = await this.common.read.getWithdrawalRequestResult([
      creditAccount,
      token,
      amount,
    ]);
    return toRequestableWithdrawal(resp);
  }

  /**
   * Reports that a feature is not supported by this compressor version:
   * throws if `sdk.strictContractTypes` is `true`, otherwise logs a warning.
   **/
  #reportUnsupported(feature: string): void {
    const message = `${feature} is not supported by ${this.name} v${this.version}`;
    if (this.#sdk.strictContractTypes) {
      throw new Error(message);
    }
    this.logger?.warn(message);
  }
}

export type OnchainRequestableWithdrawal = ContractFunctionReturnType<
  CommonAbi,
  "view",
  "getWithdrawalRequestResult",
  readonly [Address, Address, bigint]
>;

function toWithdrawableAsset(
  a: OnchainWithdrawableAsset,
  creditManager: Address,
): WithdrawableAsset {
  return { creditManager, ...a };
}

/**
 * Normalizes a previewed withdrawal request.
 **/
export function toRequestableWithdrawal(
  resp: OnchainRequestableWithdrawal,
): RequestableWithdrawal {
  return {
    token: resp.token,
    amountIn: resp.amountIn,
    outputs: [...resp.outputs],
    requestCalls: [...resp.requestCalls],
    claimableAt: resp.claimableAt,
  };
}

/**
 * Normalizes a claimable withdrawal. The intent is decoded from `extraData`
 * only when `creditManager` is provided (it is required to build
 * {@link DelayedIntentExtended} and is only meaningful for credit account
 * withdrawals on v313+ compressors).
 **/
export function toClaimableWithdrawal(
  w: OnchainClaimableWithdrawal,
  creditManager: Address | undefined,
): ClaimableWithdrawal {
  let intent: DelayedIntentExtended | undefined;
  if (creditManager && w.extraData && w.extraData !== "0x") {
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

/**
 * Normalizes a pending withdrawal, see {@link toClaimableWithdrawal} for
 * intent decoding rules.
 **/
export function toPendingWithdrawal(
  w: OnchainPendingWithdrawal,
  creditManager: Address | undefined,
): PendingWithdrawal {
  let intent: DelayedIntentExtended | undefined;
  if (creditManager && w.extraData && w.extraData !== "0x") {
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
