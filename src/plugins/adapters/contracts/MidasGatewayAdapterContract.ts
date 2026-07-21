import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
  isAddressEqual,
  zeroAddress,
} from "viem";
import {
  type AssetsMap,
  MissingSerializedParamsError,
  type OnchainSDK,
} from "../../../sdk/index.js";
import {
  iMidasGatewayAdapterV311Abi,
  iMidasGatewayV311Abi,
} from "../abi/adapters/index.js";
import type {
  DelayedWithdrawalClaim,
  DelayedWithdrawalRequest,
} from "../types.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMidasGatewayAdapterV311Abi;
type abi = typeof abi;

const protocolAbi = iMidasGatewayV311Abi;
type protocolAbi = typeof protocolAbi;

export class MidasGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #gateway?: Address;
  #mToken?: Address;
  #quoteToken?: Address;
  #phantomToken?: Address;
  #referrerId?: string;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "gateway" },
          { type: "address", name: "mToken" },
          { type: "address", name: "quoteToken" },
          { type: "address", name: "phantomToken" },
          { type: "bytes32", name: "referrerId" },
        ],
        args.baseParams.serializedParams,
      );

      this.#gateway = decoded[2];
      this.#mToken = decoded[3];
      this.#quoteToken = decoded[4];
      this.#phantomToken = decoded[5];
      this.#referrerId = decoded[6];
    }
  }

  get gateway(): Address {
    if (!this.#gateway) throw new MissingSerializedParamsError("gateway");
    return this.#gateway;
  }

  get mToken(): Address {
    if (!this.#mToken) throw new MissingSerializedParamsError("mToken");
    return this.#mToken;
  }

  get quoteToken(): Address {
    if (!this.#quoteToken) throw new MissingSerializedParamsError("quoteToken");
    return this.#quoteToken;
  }

  /**
   * Redemption phantom token; `zeroAddress` when the gateway was deployed
   * without delayed withdrawals
   */
  get phantomToken(): Address {
    if (!this.#phantomToken)
      throw new MissingSerializedParamsError("phantomToken");
    return this.#phantomToken;
  }

  get referrerId(): string {
    if (this.#referrerId === undefined)
      throw new MissingSerializedParamsError("referrerId");
    return this.#referrerId;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      gateway: this.#gateway ? this.labelAddress(this.#gateway) : undefined,
      mToken: this.#mToken ? this.labelAddress(this.#mToken) : undefined,
      quoteToken: this.#quoteToken
        ? this.labelAddress(this.#quoteToken)
        : undefined,
      phantomToken: this.#phantomToken
        ? this.labelAddress(this.#phantomToken)
        : undefined,
      referrerId: this.#referrerId,
    };
  }

  /**
   * `redeemRequest` (the only request call the withdrawal compressor emits)
   * spends the mToken and mints the redemption phantom token; the quote token
   * is received when the redemption is claimed. The 2-arg overload carries
   * the intent `extraData`.
   */
  public override parseDelayedWithdrawalRequest(
    calldata: Hex,
  ): DelayedWithdrawalRequest | undefined {
    const decoded = decodeFunctionData({ abi: this.abi, data: calldata });
    if (decoded.functionName !== "redeemRequest") {
      return undefined;
    }
    if (isAddressEqual(this.phantomToken, zeroAddress)) {
      return undefined;
    }
    const [, extraData] = decoded.args;
    return {
      phantomToken: this.phantomToken,
      claimToken: this.quoteToken,
      extraData,
    };
  }

  /**
   * `withdrawFromRedeemer(address redeemer, uint256 amount)` claims a matured
   * redemption from a redeemer contract.
   */
  public override parseDelayedWithdrawalClaim(
    calldata: Hex,
  ): DelayedWithdrawalClaim | undefined {
    const decoded = decodeFunctionData({ abi: this.abi, data: calldata });
    if (decoded.functionName !== "withdrawFromRedeemer") {
      return undefined;
    }
    const [redeemer] = decoded.args;
    return { redeemer };
  }

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      case "depositInstantDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.quoteToken, leftoverAmount);
        break;
      }
      // instant redemption spends the mToken down to the leftover
      case "redeemInstantDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.mToken, leftoverAmount);
        break;
      }
      // delayed redemption also spends the mToken down to the leftover (the
      // minted phantom token is accounted for elsewhere)
      case "redeemRequestDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.mToken, leftoverAmount);
        break;
      }
      // no-op:
      // `redeemRequest` is only emitted by the withdrawal compressor,
      // and sdk now encodes the spent mToken amount as a negative storeExpectedBalances delta
      case "redeemRequest": {
        // const [amountMTokenIn] = decoded.args;
        // this.spendExact(balances, this.mToken, amountMTokenIn);
        break;
      }
      // no-op:
      // `withdrawFromRedeemer` is only emitted by the withdrawal
      // compressor, and `assembleClaimDelayedCalls` encodes the phantom token
      // burn as a negative storeExpectedBalances delta
      case "withdrawFromRedeemer": {
        // const [, amount] = decoded.args;
        // this.spendExact(balances, this.phantomToken, amount);
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
