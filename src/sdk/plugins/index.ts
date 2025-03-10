import type { BaseState, IBaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";

export interface IGearboxSDKPlugin {
  name: string;
  createContract: (
    sdk: GearboxSDK,
    params: BaseState,
  ) => IBaseContract | undefined;
}
