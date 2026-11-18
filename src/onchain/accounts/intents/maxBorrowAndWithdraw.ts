import { PERCENTAGE_FACTOR } from "../../constants/math.js";
import type { OnchainSDK } from "../../index.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import { collateralValuation } from "./collateral-valuation.js";
import type { CreditAccountSlice } from "./types.js";
import { toTargetDecimals } from "./utils/common.js";

export interface MaxBorrowAndWithdrawProps {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  targetHF: bigint;
  targetSafeHF: bigint;
}

export function maxBorrowAndWithdraw(props: MaxBorrowAndWithdrawProps): bigint {
  const { sdk, creditAccount, targetHF, targetSafeHF } = props;
  const suite = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );
  const { market } = suite;
  if (targetHF <= 0n || targetSafeHF <= 0n || suite.isPaused || suite.isExpired)
    return 0n;
  const supportedDebt = (target: bigint, safePrices: boolean): bigint => {
    const valuation = collateralValuation(creditAccount, sdk, safePrices);
    let backed = 0n;
    for (const holding of creditAccount.tokens) {
      if (!valuation.counts(holding)) continue;
      // This operation keeps quotas: an active quoted token without quota backs nothing.
      if (holding.quota === 0n && market.pool.pqk.hasActiveQuota(holding.token))
        continue;
      backed += valuation.weigh(holding);
    }
    return market.priceOracle.safeConvertFromUSD(
      creditAccount.underlying,
      backed / target,
    ).value;
  };
  const totalDebt = BigIntMath.min(
    supportedDebt(targetHF, false),
    supportedDebt(targetSafeHF, true),
    suite.creditFacade.maxDebt,
  );
  // Leave two basis points for capacity shrinking between the read and execution.
  const borrowable =
    (suite.maxBorrowAmount().amount.value * (PERCENTAGE_FACTOR - 2n)) /
    PERCENTAGE_FACTOR;
  const additional = BigIntMath.max(
    0n,
    BigIntMath.min(totalDebt - creditAccount.totalDebt, borrowable),
  );
  const asset = sdk.tokensMeta.rwaUnderlyings.get(
    creditAccount.underlying,
  )?.asset;
  const payout = asset
    ? toTargetDecimals(additional, creditAccount.underlying, asset, sdk)
    : additional;
  const increase = asset
    ? toTargetDecimals(payout, asset, creditAccount.underlying, sdk)
    : payout;
  return creditAccount.totalDebt + increase < suite.creditFacade.minDebt
    ? 0n
    : payout;
}
