import type { BigNumberish } from "ethers";

export type BotBaseType = "liquidationProtection";
export type LiquidationBotType =
  | "deleverageBotPegged"
  | "deleverageBotLV"
  | "deleverageBotHV";
export type BotDetailedType = LiquidationBotType;

export interface BotDataPayload {
  baseType: BotBaseType;
  detailedType: BotDetailedType;
  address: string;

  minHealthFactor: BigNumberish;
  maxHealthFactor: BigNumberish;
  premiumScaleFactor: BigNumberish;
  feeScaleFactor: BigNumberish;
}
