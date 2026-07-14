import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import type { AssetsMap, ConstructOptions } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import { iTraderJoeRouterAdapterAbi } from "../abi/adapters/index.js";
import { iTraderJoeRouterAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

export enum TraderJoePoolVersion {
  V1 = 0,
  V2 = 1,
  V2_1 = 2,
  V2_2 = 3,
}

export interface TraderJoePool {
  token0: Address;
  token1: Address;
  binStep: number;
  poolVersion: TraderJoePoolVersion;
}

const abi = iTraderJoeRouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iTraderJoeRouterAbi;
type protocolAbi = typeof protocolAbi;

export class TraderJoeRouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPools?: TraderJoePool[];

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
              { type: "uint256", name: "binStep" },
              { type: "uint8", name: "poolVersion" },
            ],
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#supportedPools = decoded[2].map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
        binStep: Number(pool.binStep),
        poolVersion: pool.poolVersion as TraderJoePoolVersion,
      }));
    }
  }

  get supportedPools(): TraderJoePool[] {
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
        binStep: p.binStep,
        poolVersion: p.poolVersion,
      })),
    };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "swapDiffTokensForTokens": {
        const [leftoverAmount, , path] = decoded.args;
        this.setLeftover(balances, path.tokenPath[0], leftoverAmount);
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
