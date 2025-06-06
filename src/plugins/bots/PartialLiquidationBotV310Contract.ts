import type { Address } from "abitype";

import type { GearboxSDK } from "../../sdk/index.js";
import { iPartialLiquidationBotV310Abi } from "./abi/index.js";
import { PartialLiquidationBotBaseContract } from "./PartialLiquidationBotBaseContract.js";
import type { BotState } from "./types.js";

const abi = iPartialLiquidationBotV310Abi;
type abi = typeof abi;

export class PartialLiquidationBotV310Contract extends PartialLiquidationBotBaseContract<abi> {
  constructor(sdk: GearboxSDK, args: BotState, marketConfigurator: Address) {
    super(sdk, {
      abi,
      ...args.baseParams,
      requiredPermissions: args.requiredPermissions,
      marketConfigurator,
      name: "PartialLiquidationBotV310",
    });
  }
}
