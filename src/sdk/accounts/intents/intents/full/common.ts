import { LEVERAGE_DECIMALS } from "../../../../constants/math.js";
import type { OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";
import { convertAmount } from "../../utils/index.js";
import { IntentPreviewError } from "./types.js";

/**
 * Account TVL priced in the market underlying.
 *
 * Uses the RWA-aware conversion rather than the raw price oracle so that an
 * `rwa.asset` balance without a direct pool price still contributes its wrapped
 * value instead of throwing.
 */
export function accountTotalValue(
  creditAccount: CreditAccountSlice,
  sdk: OnchainSDK,
): bigint {
  const convert = convertAmount(sdk, creditAccount.creditManager);
  let total = 0n;
  for (const t of creditAccount.tokens) {
    total += convert(t.token, creditAccount.underlying, t.balance);
  }
  return total;
}

/** Own funds backing the position: TVL minus debt. */
export function accountCollateral(
  creditAccount: CreditAccountSlice,
  sdk: OnchainSDK,
): bigint {
  return accountTotalValue(creditAccount, sdk) - creditAccount.accountDebt;
}

/**
 * Debt that realises `leverage` while collateral stays put.
 *
 * `leverage` is total leverage scaled by {@link LEVERAGE_DECIMALS} (300n = 3x),
 * so the debt-to-collateral factor is `leverage - LEVERAGE_DECIMALS` and
 * `debt = collateral * factor`. At 1x the debt is zero.
 */
export function debtForLeverage(collateral: bigint, leverage: bigint): bigint {
  return (collateral * (leverage - LEVERAGE_DECIMALS)) / LEVERAGE_DECIMALS;
}

/**
 * Rejects a debt the facade would revert on.
 *
 * Zero debt is always fine — it means the position carries no loan at all — but
 * any non-zero debt has to sit inside the facade's `[minDebt, maxDebt]` band.
 */
export function assertDebtInRange(
  debt: bigint,
  creditAccount: CreditAccountSlice,
  sdk: OnchainSDK,
): void {
  const { creditFacade } = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );

  if (debt > creditFacade.maxDebt) {
    throw new IntentPreviewError(
      "debtOutOfRange",
      `debt ${debt} exceeds maxDebt ${creditFacade.maxDebt}`,
    );
  }
  if (debt > 0n && debt < creditFacade.minDebt) {
    throw new IntentPreviewError(
      "debtOutOfRange",
      `debt ${debt} is below minDebt ${creditFacade.minDebt}`,
    );
  }
}
