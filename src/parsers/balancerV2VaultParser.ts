import { SupportedContract } from "@gearbox-protocol/sdk-gov";

import { IBalancerV2VaultAdapter__factory } from "../types";
import {
  SingleSwapDiffStructOutput,
  SingleSwapStructOutput,
} from "../types/IBalancerV2VaultAdapter.sol/IBalancerV2VaultAdapter";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class BalancerV2VaultParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.ifc = IBalancerV2VaultAdapter__factory.createInterface();
    if (!isContract) this.adapterName = "BalancerV2Vault";
  }

  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "batchSwap": {
        return `${functionName}(undefined)`;
      }

      case "swapDiff": {
        const d = this.decodeFunctionData(functionFragment, calldata);
        const {
          assetIn = "",
          assetOut = "",
          leftoverAmount = 0,
        } = (d?.[0] || {}) as SingleSwapDiffStructOutput;

        return `${functionName}(${this.tokenSymbol(
          assetIn,
        )} => ${this.tokenSymbol(assetOut)} ${this.formatBN(
          leftoverAmount,
          this.tokenSymbol(assetIn),
        )}}`;
      }

      case "swap": {
        const d = this.decodeFunctionData(functionFragment, calldata);
        const {
          assetIn = "",
          assetOut = "",
          amount = 0,
        } = (d?.[0] || {}) as SingleSwapStructOutput;

        return `${functionName}(${this.tokenSymbol(
          assetIn,
        )} => ${this.tokenSymbol(assetOut)} ${this.formatBN(
          amount,
          this.tokenSymbol(assetIn),
        )}}`;
      }

      default:
        return this.reportUnknownFragment(
          functionName,
          functionFragment,
          calldata,
        );
    }
  }
}
