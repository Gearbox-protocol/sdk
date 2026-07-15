import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AssetsMap,
  MissingSerializedParamsError,
  type OnchainSDK,
} from "../../../sdk/index.js";
import { iSecuritizeRedemptionGatewayAdapterV311Abi } from "../abi/adapters/iSecuritizeRedemptionGatewayAdapterV311.js";
import { iSecuritizeRedemptionGatewayV311Abi } from "../abi/securitize/iSecuritizeRedemptionGatewayV311.js";
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

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      case "redeem": {
        const [dsTokenAmount] = decoded.args;
        this.spendExact(balances, this.dsToken, dsTokenAmount);
        break;
      }
      // diff-style redemption: spends the DS token down to the leftover
      case "redeemDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.dsToken, leftoverAmount);
        break;
      }
      // TODO:
      // `claim(address[] redeemers)` (the claim call emitted by the
      // withdrawal compressor) cannot be previewed offline: the redemption
      // phantom token burn (the compressor's `withdrawalTokenSpent`, i.e.
      // each redeemer's `getRedemptionAmount()`) lives in per-redeemer clone
      // contracts and is not recoverable from calldata. For claimable
      // redeemers it equals the stablecoin credit, but that value is not in
      // calldata either.
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
