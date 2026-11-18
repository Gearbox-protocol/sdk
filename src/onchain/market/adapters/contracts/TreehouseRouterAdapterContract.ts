import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { AssetsMap } from "../../../utils/index.js";
import { iTreehouseRouterAdapterAbi } from "../abi/adapters/index.js";
import { iTreehouseRouterAbi } from "../abi/treehouse/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iTreehouseRouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iTreehouseRouterAbi;
type protocolAbi = typeof protocolAbi;

export class TreehouseRouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedAssets?: Address[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedAssets" },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedAssets = [...decoded[2]];
    }
  }

  get allowedAssets(): Address[] {
    if (!this.#allowedAssets)
      throw new MissingSerializedParamsError("allowedAssets");
    return this.#allowedAssets;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedAssets: this.#allowedAssets?.map(a => this.labelAddress(a)),
    };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "depositDiff": {
        const [token, leftoverAmount] = decoded.args;
        this.setLeftover(balances, token, leftoverAmount);
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
