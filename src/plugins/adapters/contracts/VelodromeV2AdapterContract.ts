import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import type { AssetsMap, OnchainSDK } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import { iVelodromeV2RouterAdapterAbi } from "../abi/adapters/index.js";
import { iVelodromeV2RouterAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iVelodromeV2RouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iVelodromeV2RouterAbi;
type protocolAbi = typeof protocolAbi;

export class VelodromeV2RouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPools?: {
    token0: Address;
    token1: Address;
    stable: boolean;
    factory: Address;
  }[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

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
              { type: "bool", name: "stable" },
              { type: "address", name: "factory" },
            ],
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#supportedPools = decoded[2].map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
        stable: pool.stable,
        factory: pool.factory,
      }));
    }
  }

  get supportedPools(): {
    token0: Address;
    token1: Address;
    stable: boolean;
    factory: Address;
  }[] {
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
        stable: p.stable,
        factory: this.labelAddress(p.factory),
      })),
    };
  }

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      case "swapDiffTokensForTokens": {
        const [leftoverAmount, , routes] = decoded.args;
        this.setLeftover(balances, routes[0].from, leftoverAmount);
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
