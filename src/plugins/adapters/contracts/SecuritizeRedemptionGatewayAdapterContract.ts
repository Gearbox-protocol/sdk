import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
} from "viem";
import {
  type AssetsMap,
  MissingSerializedParamsError,
  type OnchainSDK,
} from "../../../sdk/index.js";
import { iSecuritizeRedemptionGatewayAdapterV311Abi } from "../abi/adapters/iSecuritizeRedemptionGatewayAdapterV311.js";
import { iSecuritizeRedemptionGatewayV311Abi } from "../abi/securitize/iSecuritizeRedemptionGatewayV311.js";
import type {
  DelayedWithdrawalClaim,
  DelayedWithdrawalRequest,
} from "../types.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iSecuritizeRedemptionGatewayAdapterV311Abi;
type abi = typeof abi;

const protocolAbi = iSecuritizeRedemptionGatewayV311Abi;
type protocolAbi = typeof protocolAbi;

export class SecuritizeRedemptionGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #dsToken?: Address;
  #stableCoinToken?: Address;
  #redemptionPhantomToken?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "dsToken" },
          { type: "address", name: "stableCoinToken" },
          { type: "address", name: "redemptionPhantomToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#dsToken = decoded[2];
      this.#stableCoinToken = decoded[3];
      this.#redemptionPhantomToken = decoded[4];
    }
  }

  get dsToken(): Address {
    if (!this.#dsToken) throw new MissingSerializedParamsError("dsToken");
    return this.#dsToken;
  }

  get stableCoinToken(): Address {
    if (!this.#stableCoinToken)
      throw new MissingSerializedParamsError("stableCoinToken");
    return this.#stableCoinToken;
  }

  get redemptionPhantomToken(): Address {
    if (!this.#redemptionPhantomToken)
      throw new MissingSerializedParamsError("redemptionPhantomToken");
    return this.#redemptionPhantomToken;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      dsToken: this.#dsToken ? this.labelAddress(this.#dsToken) : undefined,
      stableCoinToken: this.#stableCoinToken
        ? this.labelAddress(this.#stableCoinToken)
        : undefined,
      redemptionPhantomToken: this.#redemptionPhantomToken
        ? this.labelAddress(this.#redemptionPhantomToken)
        : undefined,
    };
  }

  /**
   * `redeem` (the only request call the withdrawal compressor emits) spends
   * the DS token and mints the redemption phantom token; the stable coin is
   * received when the redemption is claimed. The 2-arg overload carries the
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
      phantomToken: this.redemptionPhantomToken,
      claimToken: this.stableCoinToken,
      extraData,
    };
  }

  /**
   * `claim(address[] redeemers)` claims matured redemptions from redeemer
   * contracts. Transactions built by the withdrawal compressor always claim
   * from a single redeemer, so only the first one is reported.
   */
  public override parseDelayedWithdrawalClaim(
    calldata: Hex,
  ): DelayedWithdrawalClaim | undefined {
    const decoded = decodeFunctionData({ abi: this.abi, data: calldata });
    if (decoded.functionName !== "claim") {
      return undefined;
    }
    const [redeemers] = decoded.args;
    if (redeemers.length === 0) {
      return undefined;
    }
    return { redeemer: redeemers[0] };
  }

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      // no-op:
      // `redeem` is only emitted by the withdrawal compressor, and
      // sdk now encodes the spent DS token amount as a negative storeExpectedBalances delta
      case "redeem": {
        // const [dsTokenAmount] = decoded.args;
        // this.spendExact(balances, this.dsToken, dsTokenAmount);
        break;
      }
      // no-op:
      // the redemption phantom token burn of a `claim(address[])` is
      // not recoverable from calldata (it lives in per-redeemer clone
      // contracts, `SecuritizeRedeemer.getRedemptionAmount()`); instead,
      // sdk now encodes it as a negative storeExpectedBalances delta.
      case "claim":
        break;
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
