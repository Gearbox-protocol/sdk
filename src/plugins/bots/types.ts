import type { Address } from "viem";
import type { BaseContractStateHuman } from "../../sdk/index.js";
import type { PartialLiquidationBotV310Params } from "./PartialLiquidationBotV310Contract.js";

export interface BotParameters {
  treasury: Address;
  minHealthFactor: number;
  maxHealthFactor: number;
  premiumScaleFactor: number;
  feeScaleFactor: number;
}

export const BOT_PARTIAL_LIQUIDATION = "BOT::PARTIAL_LIQUIDATION";

export const BOT_PARAMS_ABI = [
  { type: "address", name: "treasury" },
  { type: "uint16", name: "minHealthFactor" },
  { type: "uint16", name: "maxHealthFactor" },
  { type: "uint16", name: "premiumScaleFactor" },
  { type: "uint16", name: "feeScaleFactor" },
] as const;

export interface BotStateV310Human extends BaseContractStateHuman {
  treasury: Address;
  minHealthFactor: string;
  maxHealthFactor: string;
  premiumScaleFactor: string;
  feeScaleFactor: string;
}

export type BotStateHuman = BotStateV310Human;

export type BotState = PartialLiquidationBotV310Params;

export interface BotsPluginStateHuman {
  bots: BotStateHuman[];
}

export interface BotsPluginState {
  bots: BotState[];
}

export type BotBaseType = "LIQUIDATION_PROTECTION" | "MIGRATION";

export const MIGRATION_BOT_TYPES = ["MIGRATION_BOT"] as const;
export type MigrationBotType = (typeof MIGRATION_BOT_TYPES)[number];

export type MigrationBotState = {
  address: Address;
  version: 310;

  previewer: Address;
  botType: MigrationBotType;
};
