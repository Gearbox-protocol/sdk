import type { GearboxSDK } from "../sdk/index.js";
import { BaseContract, formatPercentage } from "../sdk/index.js";
import { iPartialLiquidationBotV300Abi } from "./abi/index.js";
import type {
  BotParameters,
  BotState,
  BotStateV300Human,
  BotType,
} from "./types.js";

const abi = iPartialLiquidationBotV300Abi;
type abi = typeof abi;

// Augmenting contract class with interface of compressor data object
export interface PartialLiquidationBotV300Contract
  extends BotParameters,
    BaseContract<abi> {}

export class PartialLiquidationBotV300Contract extends BaseContract<abi> {
  public readonly requiredPermissions: bigint;
  public readonly botType: BotType;

  constructor(
    sdk: GearboxSDK,
    args: BotState,
    params: BotParameters,
    type: BotType,
  ) {
    super(sdk, {
      abi,
      ...args.baseParams,
      name: `PartialLiquidationBotV300 (${type})`,
    });
    this.requiredPermissions = args.requiredPermissions;
    Object.assign(this, params);
    this.botType = type;
  }

  public stateHuman(raw?: boolean): BotStateV300Human {
    return {
      ...super.stateHuman(raw),
      botType: this.botType,
      minHealthFactor: formatPercentage(this.minHealthFactor),
      maxHealthFactor: formatPercentage(this.maxHealthFactor),
      premiumScaleFactor: formatPercentage(this.premiumScaleFactor),
      feeScaleFactor: formatPercentage(this.feeScaleFactor),
      requiredPermissions: this.requiredPermissions.toString(10),
    };
  }
}
