import type { Address } from "abitype";

import type { GearboxSDK } from "../../sdk/index.js";
import { iPartialLiquidationBotV300Abi } from "./abi/index.js";
import { PartialLiquidationBotBaseContract } from "./PartialLiquidationBotBaseContract.js";
import type {
  BotState,
  BotStateV300Human,
  LiquidationBotType,
} from "./types.js";

const abi = iPartialLiquidationBotV300Abi;
type abi = typeof abi;

export class PartialLiquidationBotV300Contract extends PartialLiquidationBotBaseContract<abi> {
  public readonly botType: LiquidationBotType;

  constructor(
    sdk: GearboxSDK,
    args: BotState,
    marketConfigurator: Address,
    botType: LiquidationBotType,
  ) {
    super(sdk, {
      abi,
      ...args.baseParams,
      requiredPermissions: args.requiredPermissions,
      marketConfigurator,
      name: `PartialLiquidationBotV300 (${botType})`,
    });
    this.botType = botType;
  }

  public stateHuman(raw?: boolean): BotStateV300Human {
    return {
      ...super.stateHuman(raw),
      botType: this.botType,
    };
  }
}
