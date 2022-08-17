import { TokenType } from "../tokens/tokenType";

export const priority: Record<TokenType, number> = {
  [TokenType.CONNECTOR]: 1,
  [TokenType.NORMAL_TOKEN]: 2,
  [TokenType.CURVE_LP]: 3,
  [TokenType.YEARN_VAULT]: 3,
  [TokenType.META_CURVE_LP]: 4,
  [TokenType.YEARN_VAULT_OF_CURVE_LP]: 4,
  [TokenType.CONVEX_LP_TOKEN]: 5,
  [TokenType.YEARN_VAULT_OF_META_CURVE_LP]: 5,
  [TokenType.CONVEX_STAKED_PHANTOM_TOKEN]: 5,
  [TokenType.DIESEL_LP_TOKEN]: 6,
};
