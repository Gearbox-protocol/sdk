import type { Address } from "viem";
import { BotPermissions, type NetworkType } from "../../sdk/index.js";
import type { BotBaseType, BotParameters, MigrationBotState } from "./types.js";

export const PARTIAL_LIQUIDATION_BOT_CONFIGS: Partial<
  Record<NetworkType, Omit<BotParameters, "treasury">[]>
> = {
  Mainnet: [
    {
      minHealthFactor: 10300,
      maxHealthFactor: 10700,
      premiumScaleFactor: 10000,
      feeScaleFactor: 10000,
    },
  ],
  Monad: [
    {
      minHealthFactor: 10300,
      maxHealthFactor: 10700,
      premiumScaleFactor: 10000,
      feeScaleFactor: 10000,
    },
  ],
  Plasma: [
    {
      minHealthFactor: 10300,
      maxHealthFactor: 10700,
      premiumScaleFactor: 10000,
      feeScaleFactor: 10000,
    },
  ],
};

export const PARTIAL_LIQUIDATION_BOT_SALT = "GEARBOX";
export const PARTIAL_LIQUIDATION_BOT_DEPLOYER: Address =
  "0xc93155E0a835Cf4E17a19463Fa67ed43c164d06a";

// TODO: HARDCODED
const ACCOUNT_MIGRATOR_BOT =
  "0x286Fe53994f5668D56538Aa10eaa3Ac36f878e9C".toLowerCase() as Address;
const ACCOUNT_MIGRATOR_PREVIEWER =
  "0x6523B8c9daB92eea7944a79b4Dbb598c7934DCca".toLowerCase() as Address;
export const LEGACY_MIGRATION_BOT: MigrationBotState = {
  address: ACCOUNT_MIGRATOR_BOT,
  previewer: ACCOUNT_MIGRATOR_PREVIEWER,
  version: 310,
  botType: "MIGRATION_BOT",
};

export const PERMISSION_BY_TYPE: Record<BotBaseType, bigint> = {
  LIQUIDATION_PROTECTION: BigInt(
    BotPermissions.ADD_COLLATERAL |
      BotPermissions.WITHDRAW_COLLATERAL |
      BotPermissions.DECREASE_DEBT,
  ),

  MIGRATION: BigInt(
    BotPermissions.EXTERNAL_CALLS |
      BotPermissions.UPDATE_QUOTA |
      BotPermissions.DECREASE_DEBT,
  ),
};
