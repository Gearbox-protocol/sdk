import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AddressMap,
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import type { DiffLeftover } from "../types.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO: not yet mered into integrations-v3/main branch
// minimal ABI for the diff call emitted by the router's SecuritizeSwapWorker
const abi = [
  {
    type: "function",
    name: "buyExactInDiff",
    inputs: [
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
type abi = typeof abi;

const protocolAbi = [] as const;
type protocolAbi = typeof protocolAbi;

export class SecuritizeSwapAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #dsToken?: Address;
  #stableCoinToken?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "dsToken" },
          { type: "address", name: "stableCoinToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#dsToken = decoded[2];
      this.#stableCoinToken = decoded[3];
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

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      dsToken: this.#dsToken ? this.labelAddress(this.#dsToken) : undefined,
      stableCoinToken: this.#stableCoinToken
        ? this.labelAddress(this.#stableCoinToken)
        : undefined,
    };
  }

  protected override decodeDiffLeftovers(
    decoded: DecodeFunctionDataReturnType<abi>,
    balances: AddressMap<bigint>,
  ): DiffLeftover[] {
    switch (decoded.functionName) {
      // buys dsToken with the stablecoin
      case "buyExactInDiff": {
        const [leftoverAmount] = decoded.args;
        return [{ tokenIn: this.stableCoinToken, leftoverAmount }];
      }
      default:
        return super.decodeDiffLeftovers(decoded, balances);
    }
  }
}
