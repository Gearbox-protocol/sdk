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
import { iSecuritizeOnRampAdapterV310Abi } from "../abi/adapters/iSecuritizeOnRampAdapterV310.js";
import { iBaseOnRampAbi } from "../abi/securitize/iBaseOnRamp.js";
import { iSecuritizeOnRampAbi } from "../abi/securitize/iSecuritizeOnRamp.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iSecuritizeOnRampAdapterV310Abi;
type abi = typeof abi;

const protocolAbi = [...iSecuritizeOnRampAbi, ...iBaseOnRampAbi] as const;
type protocolAbi = typeof protocolAbi;

export class SecuritizeOnRampAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #dsToken?: Address;
  #liquidityToken?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "dsToken" },
          { type: "address", name: "liquidityToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#dsToken = decoded[2];
      this.#liquidityToken = decoded[3];
    }
  }

  get dsToken(): Address {
    if (!this.#dsToken) throw new MissingSerializedParamsError("dsToken");
    return this.#dsToken;
  }

  get liquidityToken(): Address {
    if (!this.#liquidityToken)
      throw new MissingSerializedParamsError("liquidityToken");
    return this.#liquidityToken;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      dsToken: this.#dsToken ? this.labelAddress(this.#dsToken) : undefined,
      liquidityToken: this.#liquidityToken
        ? this.labelAddress(this.#liquidityToken)
        : undefined,
    };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      // swaps the liquidity token into dsToken
      case "swapDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.liquidityToken, leftoverAmount);
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
