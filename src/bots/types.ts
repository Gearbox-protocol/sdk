import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";

import type { iPeripheryCompressorAbi } from "../abi/compressors.js";
import type { BaseContractStateHuman, Unarray } from "../sdk/index.js";

export type BotState = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iPeripheryCompressorAbi, "getBots">["outputs"]
  >
>;

export interface BotParameters {
  minHealthFactor: number;
  maxHealthFactor: number;
  premiumScaleFactor: number;
  feeScaleFactor: number;
}

export const BOT_TYPES = [
  "PARTIAL_LIQUIDATION_BOT",
  "DELEVERAGE_BOT_PEGGED",
  "DELEVERAGE_BOT_LV",
  "DELEVERAGE_BOT_HV",
] as const;

export type BotType = (typeof BOT_TYPES)[number];

export interface BotStateV300Human extends BaseContractStateHuman {
  botType: BotType;
  minHealthFactor: string;
  maxHealthFactor: string;
  premiumScaleFactor: string;
  feeScaleFactor: string;
  requiredPermissions: string;
}

export interface BotsPluginStateHuman {
  bots: Record<string, BotStateV300Human[]>;
}
