import type { Address } from "viem";
import type { CreditAccountData } from "../../base/types.js";

/**
 * Whether a credit account should be dropped from the liquidatable list:
 * collateral computation failed, or it holds a Mellow withdrawal phantom
 * token above dust (no liquidation subcompressor for that type).
 **/
export function skipLiquidatableAccount(
  account: Pick<CreditAccountData, "success" | "tokens">,
  getContractType: (token: Address) => string | undefined,
): boolean {
  return (
    !account.success ||
    account.tokens.some(
      t => getContractType(t.token) === "PHANTOM_TOKEN::MELLOW_WITHDRAWAL",
    )
  );
}
