import type { Address } from "viem";
import type { OnchainSDK } from "../../index.js";
import type { AccountView } from "./plan.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";
import { pickFattestNonPhantomToken } from "./utils/pick-token.js";
import { withRwaConversion } from "./utils/rwa-conversion.js";

/**
 * The account as the planners see it: a handful of numbers in underlying units
 * plus balance / price lookups. Read once per preview.
 *
 * Amounts use the market oracle, valuing an RWA backing asset through its
 * wrapper. Other unpriceable tokens contribute 0n rather than throwing.
 */
export function accountView(
  creditAccount: CreditAccountSlice,
  sdk: OnchainSDK,
): AccountView {
  const { underlying, creditManager } = creditAccount;
  const oracle =
    sdk.marketRegister.findByCreditManager(creditManager).priceOracle;
  const price = withRwaConversion(
    (from, to, amount) => oracle.safeConvert(from, to, amount).value,
    underlying,
    sdk,
  );
  const { creditFacade } = sdk.marketRegister.findCreditManager(creditManager);

  let totalValue = 0n;
  for (const t of creditAccount.tokens) {
    totalValue += price(t.token, underlying, t.balance);
  }

  return {
    underlying,
    sdk,
    rwaAsset: sdk.tokensMeta.rwaUnderlyings.get(underlying)?.asset,
    debt: creditAccount.totalDebt,
    collateral: totalValue - creditAccount.totalDebt,
    debtLimits: {
      minDebt: creditFacade.minDebt,
      maxDebt: creditFacade.maxDebt,
    },
    balanceOf: (token: Address) =>
      creditAccount.tokens.find(t => eq(t.token, token))?.balance ?? 0n,
    price,
    fattest: (exclude?: Address[]) =>
      pickFattestNonPhantomToken({ creditAccount, sdk, exclude })?.token,
  };
}
