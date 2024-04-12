import type { BigNumberish } from "ethers";

export type BotType =
  | "partialLiquidationBot"
  | "deleverageBotPegged"
  | "deleverageBotLV"
  | "deleverageBotHV";

export interface BotDataPayload {
  type: BotType;
  address: string;

  minHealthFactor: BigNumberish;
  maxHealthFactor: BigNumberish;
  premiumScaleFactor: BigNumberish;
  feeScaleFactor: BigNumberish;
}
