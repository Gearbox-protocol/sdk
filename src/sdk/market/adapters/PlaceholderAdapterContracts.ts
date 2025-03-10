import type { Address } from "viem";

import type { AdapterData } from "../../base/index.js";
import { PlaceholderContract } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { IAdapterContract } from "./types.js";

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
