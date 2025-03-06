import type { Address } from "viem";

import type { AdapterData } from "../../base";
import { PlaceholderContract } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { IAdapterContract } from "./types";

export class PlaceholderAdapterContract
  extends PlaceholderContract
  implements IAdapterContract
{
  public readonly targetContract: Address;

  constructor(sdk: GearboxSDK, args: AdapterData) {
    super(sdk, args.baseParams);
    this.targetContract = args.targetContract;
  }
}
