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
import { iFluidDexAdapterAbi } from "../abi/adapters/index.js";
import { iFluidDexAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iFluidDexAdapterAbi;
type abi = typeof abi;

const protocolAbi = iFluidDexAbi;
type protocolAbi = typeof protocolAbi;

export class FluidDexAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #token0?: Address;
  #token1?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "token0" },
          { type: "address", name: "token1" },
        ],
        args.baseParams.serializedParams,
      );

      this.#token0 = decoded[2];
      this.#token1 = decoded[3];
    }
  }

  get token0(): Address {
    if (!this.#token0) throw new MissingSerializedParamsError("token0");
    return this.#token0;
  }

  get token1(): Address {
    if (!this.#token1) throw new MissingSerializedParamsError("token1");
    return this.#token1;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      token0: this.#token0 ? this.labelAddress(this.#token0) : undefined,
      token1: this.#token1 ? this.labelAddress(this.#token1) : undefined,
    };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "swapInDiff": {
        const [swap0to1, leftoverAmount] = decoded.args;
        this.setLeftover(
          balances,
          swap0to1 ? this.token0 : this.token1,
          leftoverAmount,
        );
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
