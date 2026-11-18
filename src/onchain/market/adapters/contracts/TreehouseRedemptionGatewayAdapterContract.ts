import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
} from "viem";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { AssetsMap } from "../../../utils/index.js";
import { iTreehouseRedemptionGatewayAdapterAbi } from "../abi/adapters/index.js";
import { iTreehouseRedemptionGatewayAbi } from "../abi/treehouse/index.js";
import type {
  DelayedWithdrawalClaim,
  DelayedWithdrawalRequest,
} from "../types.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iTreehouseRedemptionGatewayAdapterAbi;
type abi = typeof abi;

const protocolAbi = iTreehouseRedemptionGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class TreehouseRedemptionGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #tAsset?: Address;
  #vaultUnderlying?: Address;
  #phantomToken?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "tAsset" },
          { type: "address", name: "vaultUnderlying" },
          { type: "address", name: "phantomToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#tAsset = decoded[2];
      this.#vaultUnderlying = decoded[3];
      this.#phantomToken = decoded[4];
    }
  }

  get tAsset(): Address {
    if (!this.#tAsset) throw new MissingSerializedParamsError("tAsset");
    return this.#tAsset;
  }

  get vaultUnderlying(): Address {
    if (!this.#vaultUnderlying)
      throw new MissingSerializedParamsError("vaultUnderlying");
    return this.#vaultUnderlying;
  }

  get phantomToken(): Address {
    if (!this.#phantomToken)
      throw new MissingSerializedParamsError("phantomToken");
    return this.#phantomToken;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      tAsset: this.#tAsset ? this.labelAddress(this.#tAsset) : undefined,
      vaultUnderlying: this.#vaultUnderlying
        ? this.labelAddress(this.#vaultUnderlying)
        : undefined,
      phantomToken: this.#phantomToken
        ? this.labelAddress(this.#phantomToken)
        : undefined,
    };
  }

  /**
   * `redeem` (the only request call the withdrawal compressor emits) spends
   * the tAsset and mints the redemption phantom token; the vault underlying is
   * received when the redemption is finalized. The 2-arg overload carries the
   * intent `extraData`.
   */
  public override parseDelayedWithdrawalRequest(
    calldata: Hex,
  ): DelayedWithdrawalRequest | undefined {
    const decoded = decodeFunctionData({ abi: this.abi, data: calldata });
    if (decoded.functionName !== "redeem") {
      return undefined;
    }
    const [, extraData] = decoded.args;
    return {
      phantomToken: this.phantomToken,
      claimToken: this.vaultUnderlying,
      extraData,
    };
  }

  /**
   * `finalizeRedeem(address redeemer)` claims a matured redemption from a
   * redeemer contract.
   */
  public override parseDelayedWithdrawalClaim(
    calldata: Hex,
  ): DelayedWithdrawalClaim | undefined {
    const decoded = decodeFunctionData({ abi: this.abi, data: calldata });
    if (decoded.functionName !== "finalizeRedeem") {
      return undefined;
    }
    const [redeemer] = decoded.args;
    return { redeemer };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      // delayed redemption spends the tAsset down to the leftover (the
      // minted phantom token is accounted for elsewhere)
      case "redeemDiff": {
        const [leftoverShares] = decoded.args;
        this.setLeftover(balances, this.tAsset, leftoverShares);
        break;
      }
      // no-op:
      // `redeem` is only emitted by the withdrawal compressor,
      // and sdk encodes the spent tAsset amount as a negative storeExpectedBalances delta
      case "redeem":
        break;
      // no-op:
      // `finalizeRedeem` is only emitted by the withdrawal compressor,
      // and sdk encodes the phantom token burn as a negative storeExpectedBalances delta
      case "finalizeRedeem":
        break;
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
