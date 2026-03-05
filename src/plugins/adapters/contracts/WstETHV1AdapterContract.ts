import { iwstEthv1AdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iwstETHAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iwstEthv1AdapterAbi;
type abi = typeof abi;

const protocolAbi = iwstETHAbi;
type protocolAbi = typeof protocolAbi;

export class WstETHV1AdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #stETH?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "stETH" },
        ],
        args.baseParams.serializedParams,
      );

      this.#stETH = decoded[2];
    }
  }

  get stETH(): Address {
    if (!this.#stETH) throw new MissingSerializedParamsError("stETH");
    return this.#stETH;
  }

  /** @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L264-L275 */
  protected override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    if (parsed.functionName.startsWith("wrap")) {
      return { operation: "WstETHWrap", ...swapFromTransfers(transfers) };
    }
    if (parsed.functionName.startsWith("unwrap")) {
      return { operation: "WstETHUnwrap", ...swapFromTransfers(transfers) };
    }
    return super.classifyLegacyOperation(parsed, transfers);
  }
}
