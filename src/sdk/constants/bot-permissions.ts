export enum BotPermissions {
  ADD_COLLATERAL = 1,
  INCREASE_DEBT = 1 << 1,
  DECREASE_DEBT = 1 << 2,
  ENABLE_TOKEN = 1 << 3,
  DISABLE_TOKEN = 1 << 4,
  WITHDRAW_COLLATERAL = 1 << 5,
  UPDATE_QUOTA = 1 << 6,
  REVOKE_ALLOWANCES = 1 << 7,

  EXTERNAL_CALLS = 1 << 16,

  ALL_CREDIT_FACADE_CALLS = ADD_COLLATERAL |
    WITHDRAW_COLLATERAL |
    INCREASE_DEBT |
    DECREASE_DEBT |
    ENABLE_TOKEN |
    DISABLE_TOKEN |
    UPDATE_QUOTA |
    REVOKE_ALLOWANCES,

  ALLS = ALL_CREDIT_FACADE_CALLS | EXTERNAL_CALLS,
}

export function botPermissionsToString(value: bigint): string {
  let result = "";
  for (let i = 0; i < 16; i++) {
    if ((value & (1n << BigInt(i))) !== 0n) {
      if (result.length > 0) {
        result += " | ";
      }
      result += BotPermissions[1 << i];
    }
  }
  return result;
}
