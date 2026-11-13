import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  decodeFunctionData,
  encodeFunctionData,
  type Hex,
} from "viem";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { MultiCall } from "../../../types/index.js";
import type { AssetsMap } from "../../../utils/index.js";
import { iSecuritizeRedemptionGatewayAdapterV311Abi } from "../abi/adapters/iSecuritizeRedemptionGatewayAdapterV311.js";
import { iSecuritizeNAVProviderAbi } from "../abi/securitize/iSecuritizeNAVProvider.js";
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
   * Facade call redeeming every DS token the credit account holds above
   * `leftoverAmount` when it executes, with the intent `extraData` logged
   * alongside. Names no amount, so it can redeem what an earlier call of the
   * same multicall brings in.
   */
  public redeemDiffCall(leftoverAmount: bigint, extraData: Hex): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi,
        functionName: "redeemDiff",
        args: [leftoverAmount, extraData],
      }),
    };
  }

  /**
   * Stable coin a redemption of `dsTokenAmount` started now is worth, at the
   * NAV rate it would start at — what the redemption phantom token reports
   * for it, and the amount the withdrawal compressor quotes.
   */
  public async redemptionValue(dsTokenAmount: bigint): Promise<bigint> {
    const navProvider = await this.client.readContract({
      address: this.targetContract,
      abi: this.protocolAbi,
      functionName: "navProvider",
    });
    const rate = await this.client.readContract({
      address: navProvider,
      abi: iSecuritizeNAVProviderAbi,
      functionName: "rate",
    });
    const dsUnit = 10n ** BigInt(this.sdk.tokensMeta.decimals(this.dsToken));
    const stableUnit =
      10n ** BigInt(this.sdk.tokensMeta.decimals(this.stableCoinToken));
    return (dsTokenAmount * stableUnit * rate) / (dsUnit * dsUnit);
  }

  /**
   * `redeem` — the request call the withdrawal compressor emits — and
   * `redeemDiff` spend the DS token and mint the redemption phantom token; the
   * stable coin is received when the redemption is claimed. The 2-arg
   * overloads carry the intent `extraData`.
   */
  public override parseDelayedWithdrawalRequest(
    calldata: Hex,
  ): DelayedWithdrawalRequest | undefined {
    const decoded = decodeFunctionData({ abi: this.abi, data: calldata });
    if (
      decoded.functionName !== "redeem" &&
      decoded.functionName !== "redeemDiff"
    ) {
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

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      // no-op:
      // `redeem` is only emitted by the withdrawal compressor and `redeemDiff`
      // only by a request for a balance arriving in the same multicall; both
      // sit in a bracket whose negative storeExpectedBalances delta is the
      // spent DS token amount
      case "redeemDiff":
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
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
