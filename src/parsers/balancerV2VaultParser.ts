import { SupportedContract } from "@gearbox-protocol/sdk-gov";

import { IBalancerV2Vault__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class BalancerV2VaultParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.ifc = IBalancerV2Vault__factory.createInterface();
    if (!isContract) this.adapterName = "BalancerV2Vault";
  }

  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      default:
        return this.reportUnknownFragment(
          functionName,
          functionFragment,
          calldata,
        );
    }
  }
}
