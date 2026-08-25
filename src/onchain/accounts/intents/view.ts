import type { Address } from "viem";
import type { OnchainSDK } from "../../index.js";
import type { AccountView } from "./plan.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";
import { convertAmount } from "./utils/convert-amount.js";
import { pickFattestNonPhantomToken } from "./utils/pick-token.js";

/**
 * The account as the planners see it: a handful of numbers in underlying units
 * plus balance / price lookups. Read once per preview.
 *
 * TVL uses the RWA-aware conversion so an `rwa.asset` balance without a direct
 * pool price still counts at its wrapped value instead of throwing.
 */
export function accountView(
  creditAccount: CreditAccountSlice,
  sdk: OnchainSDK,
): AccountView {
  const { underlying, creditManager } = creditAccount;
  const price = convertAmount(sdk, creditManager);
  const { creditFacade } = sdk.marketRegister.findCreditManager(creditManager);

  let totalValue = 0n;
  for (const t of creditAccount.tokens) {
    totalValue += price(t.token, underlying, t.balance);
  }

  return {
    underlying,
    rwaAsset: sdk.tokensMeta.rwaUnderlyings.get(underlying)?.asset,
    debt: creditAccount.accountDebt,
    collateral: totalValue - creditAccount.accountDebt,
    band: { minDebt: creditFacade.minDebt, maxDebt: creditFacade.maxDebt },
    balanceOf: (token: Address) =>
      creditAccount.tokens.find(t => eq(t.token, token))?.balance ?? 0n,
    price,
    fattest: (exclude?: Address[]) =>
      pickFattestNonPhantomToken({ creditAccount, sdk, exclude })?.token,
  };
}
