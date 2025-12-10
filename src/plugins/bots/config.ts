import type { Address } from "viem";
import type { NetworkType } from "../../sdk/index.js";
import type { BotParameters } from "./types.js";

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
