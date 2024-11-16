import type { Address } from "viem";

export type BotBaseType = "liquidationProtection";
export type LiquidationBotType =
  | "deleverageBotPegged"
  | "deleverageBotLV"
  | "deleverageBotHV";

export type BotDetailedType = LiquidationBotType;

export interface BotDataPayload {
  baseType: BotBaseType;
  detailedType: BotDetailedType;
  address: Address;
  minHealthFactor: number;
  maxHealthFactor: number;
  premiumScaleFactor: number;
  feeScaleFactor: number;
}
