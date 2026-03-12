import { iLidoV1AdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { lidoV1_WETHGatewayAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iLidoV1AdapterAbi;
type abi = typeof abi;

const protocolAbi = lidoV1_WETHGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class LidoV1AdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #stETH?: Address;
  #weth?: Address;
  #treasury?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "stETH" },
          { type: "address", name: "weth" },
          { type: "address", name: "treasury" },
        ],
        args.baseParams.serializedParams,
      );

      this.#stETH = decoded[2];
      this.#weth = decoded[3];
      this.#treasury = decoded[4];
    }
  }

  get stETH(): Address {
    if (!this.#stETH) throw new MissingSerializedParamsError("stETH");
    return this.#stETH;
  }

  get weth(): Address {
    if (!this.#weth) throw new MissingSerializedParamsError("weth");
    return this.#weth;
  }

  get treasury(): Address {
    if (!this.#treasury) throw new MissingSerializedParamsError("treasury");
    return this.#treasury;
  }

  /** @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L277-L282 */
  protected override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    return { operation: "LidoSubmit", ...swapFromTransfers(transfers) };
  }
}
