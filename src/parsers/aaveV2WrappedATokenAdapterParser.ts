import { SupportedContract } from "@gearbox-protocol/sdk-gov";

import { IAaveV2_WrappedATokenAdapter__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class AaveV2WrappedATokenAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.ifc = IAaveV2_WrappedATokenAdapter__factory.createInterface();
    if (!isContract) this.adapterName = "AaveV2_WrappedATokenAdapter";
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
