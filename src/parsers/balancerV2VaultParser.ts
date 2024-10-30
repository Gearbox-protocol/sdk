import { SupportedContract } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iBalancerV2VaultAdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class BalancerV2VaultParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iBalancerV2VaultAdapterAbi;
    if (!isContract) this.adapterName = "BalancerV2Vault";
  }

  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "batchSwap": {
        return `${functionName}(undefined)`;
      }

      case "swapDiff": {
        const [{ leftoverAmount = 0, assetIn = "", assetOut = "" }] =
          functionData.args || [{}];

        return `${functionName}(${this.tokenSymbol(
          assetIn,
        )} => ${this.tokenSymbol(assetOut)} ${this.formatBN(
          leftoverAmount,
          this.tokenSymbol(assetIn),
        )}}`;
      }

      case "swap": {
        const [{ assetIn = "", assetOut = "", amount = 0 }] =
          functionData.args || [{}];

        return `${functionName}(${this.tokenSymbol(
          assetIn,
        )} => ${this.tokenSymbol(assetOut)} ${this.formatBN(
          amount,
          this.tokenSymbol(assetIn),
        )}}`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          functionName,
          calldata,
        );
    }
  }
}
