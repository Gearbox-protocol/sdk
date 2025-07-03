import { BotPermissions } from "../constants";
import type { BotBaseType } from "./types";

export const PERMISSION_BY_TYPE: Record<BotBaseType, bigint> = {
  LIQUIDATION_PROTECTION: BigInt(
    BotPermissions.ADD_COLLATERAL |
      BotPermissions.WITHDRAW_COLLATERAL |
      BotPermissions.DECREASE_DEBT,
  ),
};
