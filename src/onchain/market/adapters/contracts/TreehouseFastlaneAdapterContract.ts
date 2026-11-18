import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { AssetsMap } from "../../../utils/index.js";
import { iTreehouseFastlaneAdapterAbi } from "../abi/adapters/index.js";
import { iTreehouseFastlaneAbi } from "../abi/treehouse/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iTreehouseFastlaneAdapterAbi;
type abi = typeof abi;

const protocolAbi = iTreehouseFastlaneAbi;
type protocolAbi = typeof protocolAbi;

export class TreehouseFastlaneAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #tAsset?: Address;
  #vaultUnderlying?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "tAsset" },
          { type: "address", name: "vaultUnderlying" },
        ],
        args.baseParams.serializedParams,
      );

      this.#tAsset = decoded[2];
      this.#vaultUnderlying = decoded[3];
    }
  }

  get tAsset(): Address {
    if (!this.#tAsset) throw new MissingSerializedParamsError("tAsset");
    return this.#tAsset;
  }

  get vaultUnderlying(): Address {
    if (!this.#vaultUnderlying)
      throw new MissingSerializedParamsError("vaultUnderlying");
    return this.#vaultUnderlying;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      tAsset: this.#tAsset ? this.labelAddress(this.#tAsset) : undefined,
      vaultUnderlying: this.#vaultUnderlying
        ? this.labelAddress(this.#vaultUnderlying)
        : undefined,
    };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "redeemAndFinalizeDiff": {
        const [leftoverShares] = decoded.args;
        this.setLeftover(balances, this.tAsset, leftoverShares);
        break;
      }
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
