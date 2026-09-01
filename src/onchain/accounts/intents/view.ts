import type { Address } from "viem";
import type { OnchainSDK } from "../../index.js";
import type { ConvertFn } from "../../market/oracle/types.js";
import type { AccountView } from "./plan.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";
import { pickFattestNonPhantomToken } from "./utils/pick-token.js";

/**
 * The account as the planners see it: a handful of numbers in underlying units
 * plus balance / price lookups. Read once per preview.
 *
 * TVL uses the market oracle: an unpriceable token contributes 0n rather
 * than throwing.
 */
export function accountView(
  creditAccount: CreditAccountSlice,
  sdk: OnchainSDK,
): AccountView {
  const { underlying, creditManager } = creditAccount;
  const oracle =
    sdk.marketRegister.findByCreditManager(creditManager).priceOracle;
  const price: ConvertFn = (from, to, amount) =>
    oracle.safeConvert(from, to, amount).value;
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
    band: { minDebt: creditFacade.minDebt, maxDebt: creditFacade.maxDebt },
    balanceOf: (token: Address) =>
      creditAccount.tokens.find(t => eq(t.token, token))?.balance ?? 0n,
    price,
    fattest: (exclude?: Address[]) =>
      pickFattestNonPhantomToken({ creditAccount, sdk, exclude })?.token,
  };
}
