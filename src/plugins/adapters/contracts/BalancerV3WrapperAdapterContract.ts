import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import type { AssetsMap, OnchainSDK } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import { iBalancerV3WrapperAdapterAbi } from "../abi/adapters/index.js";
import { iBalancerV3WrapperAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iBalancerV3WrapperAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBalancerV3WrapperAbi;
type protocolAbi = typeof protocolAbi;

export class BalancerV3WrapperAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #balancerPoolToken?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "balancerPoolToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#balancerPoolToken = decoded[2];
    }
  }

  get balancerPoolToken(): Address {
    if (!this.#balancerPoolToken)
      throw new MissingSerializedParamsError("balancerPoolToken");
    return this.#balancerPoolToken;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      balancerPoolToken: this.#balancerPoolToken
        ? this.labelAddress(this.#balancerPoolToken)
        : undefined,
    };
  }

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      // mint spends the pool token, burn spends the wrapper (target contract)
      case "mintDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.balancerPoolToken, leftoverAmount);
        break;
      }
      case "burnDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.targetContract, leftoverAmount);
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
