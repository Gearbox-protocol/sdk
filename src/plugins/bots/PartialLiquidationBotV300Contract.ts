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
  #botType: LiquidationBotType | undefined;

  constructor(sdk: GearboxSDK, args: BotState, marketConfigurator: Address) {
    super(sdk, {
      abi,
      ...args.baseParams,
      requiredPermissions: args.requiredPermissions,
      marketConfigurator,
      name: "PartialLiquidationBotV300",
    });
  }

  public stateHuman(raw?: boolean): BotStateV300Human {
    return {
      ...super.stateHuman(raw),
      botType: this.botType,
    };
  }

  /**
   * Set the bot type
   * This method should only be called once from BotsPlugin
   */
  public set botType(type: LiquidationBotType) {
    if (this.#botType) {
      throw new Error("bot type already set");
    }
    this.#botType = type;
    this.name = `PartialLiquidationBotV300 (${type})`;
  }

  public get botType(): LiquidationBotType {
    if (!this.#botType) {
      throw new Error("bot type not set");
    }
    return this.#botType;
  }
}
