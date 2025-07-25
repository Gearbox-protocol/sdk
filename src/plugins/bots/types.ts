import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address } from "viem";

import type { iPeripheryCompressorAbi } from "../../abi/compressors.js";
import type { BaseContractStateHuman, Unarray } from "../../sdk/index.js";

export type BotState = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iPeripheryCompressorAbi, "getBots">["outputs"]
  >
>;

export interface BotParameters {
  treasury: Address;
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

export interface BotStateBaseHuman extends BaseContractStateHuman {
  treasury: Address;
  minHealthFactor: string;
  maxHealthFactor: string;
  premiumScaleFactor: string;
  feeScaleFactor: string;
  requiredPermissions: string;
}

export interface BotStateV300Human extends BotStateBaseHuman {
  botType: BotType;
}

export type BotStateV310Human = BotStateBaseHuman;

export type BotStateHuman = BotStateV300Human | BotStateV310Human;

export interface BotsPluginStateHuman {
  /**
   * Mapping market configurator to bot states
   */
  bots: Record<string, BotStateHuman[]>;
}

export interface BotsPluginState {
  /**
   * Mapping market configurator address to bot states
   */
  bots: Record<Address, BotState[]>;
}
