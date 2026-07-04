import { iMellowWrapperAdapterAbi } from "@gearbox-protocol/integrations-v3";
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
import { iMellowWrapperAbi } from "../abi/targetContractAbi.js";
import { clampToLeftover } from "../balanceChanges.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellowWrapperAdapterAbi;
type abi = typeof abi;

const protocolAbi = iMellowWrapperAbi;
type protocolAbi = typeof protocolAbi;

export class MellowWrapperAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedVaults?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedVaults" },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedVaults = [...decoded[2]];
    }
  }

  get allowedVaults(): Address[] {
    if (!this.#allowedVaults)
      throw new MissingSerializedParamsError("allowedVaults");
    return this.#allowedVaults;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedVaults: this.#allowedVaults?.map(v => this.labelAddress(v)),
    };
  }

  protected override previewDecodedBalanceChanges(
    balances: AddressMap<bigint>,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): AddressMap<bigint> {
    switch (decoded.functionName) {
      case "depositDiff": {
        // the wrapper wraps WETH into wstETH and deposits it into the vault;
        // WETH is not part of the serialized params, so resolve it from token
        // metadata
        // TODO: expose sdk and get WETH_TOKEN from address provider
        const weth = this.tokensMeta.mustFindBySymbol("WETH").addr;
        const [leftoverAmount] = decoded.args;
        return clampToLeftover(balances, weth, leftoverAmount);
      }
      default:
        return super.previewDecodedBalanceChanges(balances, decoded);
    }
  }
}
