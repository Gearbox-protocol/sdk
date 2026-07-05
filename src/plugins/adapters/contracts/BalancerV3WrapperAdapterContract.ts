import { iBalancerV3WrapperAdapterAbi } from "@gearbox-protocol/integrations-v3";
import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import type { AddressMap, ConstructOptions } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import { iBalancerV3WrapperAbi } from "../abi/targetContractAbi.js";
import type { DiffLeftover } from "../types.js";
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

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

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

  protected override decodeDiffLeftovers(
    decoded: DecodeFunctionDataReturnType<abi>,
    balances: AddressMap<bigint>,
  ): DiffLeftover[] {
    switch (decoded.functionName) {
      // mint spends the pool token, burn spends the wrapper (target contract)
      case "mintDiff": {
        const [leftoverAmount] = decoded.args;
        return [{ tokenIn: this.balancerPoolToken, leftoverAmount }];
      }
      case "burnDiff": {
        const [leftoverAmount] = decoded.args;
        return [{ tokenIn: this.targetContract, leftoverAmount }];
      }
      default:
        return super.decodeDiffLeftovers(decoded, balances);
    }
  }
}
