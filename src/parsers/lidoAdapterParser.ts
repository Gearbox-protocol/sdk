import type { SupportedContract } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { iLidoV1AdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

export class LidoAdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iLidoV1AdapterAbi;
    if (!isContract) this.adapterName = "LidoV1Adapter";
  }
  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "submit": {
        const [amount] = functionData.args || [];
        return `${operationName}(amount: ${this.formatBN(amount, "STETH")})`;
      }
      case "submitDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${operationName}(leftoverAmount: ${this.formatBN(
          leftoverAmount,
          "STETH",
        )})`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
          calldata,
        );
    }
  }
}
