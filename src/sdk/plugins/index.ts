import type { BaseState, IBaseContract } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";

export interface IGearboxSDKPlugin {
  name: string;
  createContract: (
    sdk: GearboxSDK,
    params: BaseState,
  ) => IBaseContract | undefined;
}
