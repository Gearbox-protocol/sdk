import { SupportedContract } from "@gearbox-protocol/sdk-gov";

import { IAaveV2_LendingPoolAdapter__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class AaveV2LendingPoolAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.ifc = IAaveV2_LendingPoolAdapter__factory.createInterface();
    if (!isContract) this.adapterName = "AaveV2_LendingPoolAdapter";
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
