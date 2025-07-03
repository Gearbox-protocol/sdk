import { BotPermissions } from "../constants/bot-permissions.js";
import type { BotBaseType } from "./types.js";

export const PERMISSION_BY_TYPE: Record<BotBaseType, bigint> = {
  LIQUIDATION_PROTECTION: BigInt(
    BotPermissions.ADD_COLLATERAL |
      BotPermissions.WITHDRAW_COLLATERAL |
      BotPermissions.DECREASE_DEBT,
  ),
};
