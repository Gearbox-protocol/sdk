import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import type { AddressMap, ConstructOptions } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import { iCamelotV3AdapterAbi } from "../abi/adapters/index.js";
import { iCamelotV3RouterAbi } from "../abi/targetContractAbi.js";
import type { DiffLeftover } from "../types.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

export interface CamelotPool {
  token0: Address;
  token1: Address;
}

const abi = iCamelotV3AdapterAbi;
type abi = typeof abi;

const protocolAbi = iCamelotV3RouterAbi;
type protocolAbi = typeof protocolAbi;

export class CamelotV3AdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPools?: CamelotPool[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          {
            type: "tuple[]",
            name: "supportedPools",
            components: [
              { type: "address", name: "token0" },
              { type: "address", name: "token1" },
            ],
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#supportedPools = decoded[2].map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
      }));
    }
  }

  get supportedPools(): CamelotPool[] {
    if (!this.#supportedPools)
      throw new MissingSerializedParamsError("supportedPools");
    return this.#supportedPools;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      supportedPools: this.#supportedPools?.map(p => ({
        token0: this.labelAddress(p.token0),
        token1: this.labelAddress(p.token1),
      })),
    };
  }

  protected override decodeDiffLeftovers(
    decoded: DecodeFunctionDataReturnType<abi>,
    balances: AddressMap<bigint>,
  ): DiffLeftover[] {
    switch (decoded.functionName) {
      case "exactDiffInputSingle": {
        const [params] = decoded.args;
        return [
          {
            tokenIn: params.tokenIn,
            leftoverAmount: params.leftoverAmount,
          },
        ];
      }
      case "exactDiffInput": {
        const [params] = decoded.args;
        const tokenIn =
          `0x${params.path.replace("0x", "").slice(0, 40)}` as Address;
        return [{ tokenIn, leftoverAmount: params.leftoverAmount }];
      }
      default:
        return super.decodeDiffLeftovers(decoded, balances);
    }
  }
}
