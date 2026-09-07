import type { Address } from "viem";
import { DUST_THRESHOLD, LEVERAGE_DECIMALS } from "../../constants/math.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { calcLeverageBand, type LeverageBandProps } from "./leverage-band.js";
import { maxProportionalWithdrawal } from "./math.js";
import {
  type MaxWithdrawCollateralProps,
  maxWithdrawCollateral,
} from "./maxWithdrawCollateral.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";
import { accountView } from "./view.js";

export type LimitConstraintId =
  | "balance"
  | "collateral"
  | "minimumDebt"
  | "maxDebt"
  | "poolLiquidity"
  | "creditManagerDebtLimit"
  | "blockBorrowLimit"
  | "quota"
  | "route"
  | "market"
  | "valuation"
  | "forbiddenTokens";

/** Each numerical cap uses the operation input's units, never USD. */
export interface LimitConstraint<T extends bigint | number> {
  id: LimitConstraintId;
  max?: T;
  status: "calculated" | "unresolved" | "notApplicable";
  reason?: string;
}

export interface AmountLimitReport {
  token: Address;
  /** A wallet payout always enables the facade's safe-price collateral check. */
  useSafePrices: true;
  /** Minimum known cap. Only a complete report can claim a final maximum. */
  max: bigint | undefined;
  constraints: LimitConstraint<bigint>[];
  complete: boolean;
}

export interface StrategyWithdrawLimitReport extends AmountLimitReport {
  /** Oracle net value in underlying units; a separate exit, not a partial cap. */
  exit: bigint | undefined;
}

export interface LeverageLimitReport {
  /** Opening's adapter calls decide this; no route has been selected yet. */
  useSafePrices: undefined;
  /** Minimum nonzero-debt leverage; 1x remains the separate debt-free case. */
  min: number | undefined;
  /** Native leverage (3 means 3x), limited to hundredths like the planner. */
  max: number | undefined;
  constraints: LimitConstraint<number>[];
  complete: boolean;
}

function knownMax<T extends bigint | number>(
  constraints: LimitConstraint<T>[],
): T | undefined {
  let max: T | undefined;
  for (const c of constraints) {
    if (c.max !== undefined && (max === undefined || c.max < max)) max = c.max;
  }
  return max;
}

function marketConstraint<T extends bigint | number>(
  blocked: boolean,
  zero: T,
): LimitConstraint<T> {
  return {
    id: "market",
    status: "calculated",
    ...(blocked ? { max: zero, reason: "Market is paused or expired" } : {}),
  };
}

/** Fixed-debt withdrawal, valued with the same safe prices as preparation. */
export function withdrawCollateralLimits(
  props: MaxWithdrawCollateralProps,
): AmountLimitReport {
  const { creditAccount: ca, sdk, token } = props;
  const balance = ca.tokens.find(t => eq(t.token, token))?.balance ?? 0n;
  const constraints: LimitConstraint<bigint>[] = [
    { id: "balance", max: balance, status: "calculated" },
  ];
  let unavailable: LimitConstraintId = "market";
  try {
    const suite = sdk.marketRegister.findCreditManager(ca.creditManager);
    const oracle = suite.market.priceOracle;
    constraints.push(marketConstraint(suite.isPaused || suite.isExpired, 0n));
    const forbidden = suite.forbiddenTokens.some(f =>
      ca.tokens.some(
        t => eq(f, t.token) && (t.mask & ca.enabledTokensMask) !== 0n,
      ),
    );
    constraints.push({
      id: "forbiddenTokens",
      status: forbidden ? "unresolved" : "notApplicable",
      ...(forbidden
        ? {
            reason:
              "Withdrawal requires the final enabled mask to contain no forbidden tokens",
          }
        : {}),
    });
    unavailable = "collateral";
    // Only holdings counted by the collateral check need safe prices. Missing
    // reserve configuration is valid zero collateral; a failed feed is unknown.
    if (ca.totalDebt > 0n) {
      oracle.convertToUSD(ca.underlying, ca.totalDebt);
      for (const t of ca.tokens) {
        if (
          t.balance <= DUST_THRESHOLD ||
          ((t.mask & ca.enabledTokensMask) === 0n &&
            !eq(t.token, ca.underlying) &&
            !eq(t.token, token))
        )
          continue;
        if (eq(t.token, ca.underlying)) oracle.convertToUSD(t.token, t.balance);
        else if (oracle.safeConvertMinUSD(t.token, t.balance).error)
          throw new Error("Collateral feed unavailable");
      }
    }
    constraints.push({
      id: "collateral",
      status: "calculated",
      max: maxWithdrawCollateral(props),
    });
  } catch {
    constraints.push({
      id: unavailable,
      status: "unresolved",
      reason: "Required market or price data unavailable",
    });
  }
  constraints.push({
    id: "quota",
    status: "unresolved",
    reason:
      "Preparation refreshes quotas; the collateral cap uses current quotas",
  });
  return {
    token,
    useSafePrices: true,
    max: knownMax(constraints),
    constraints,
    complete: false,
  };
}

/** Partial proportional withdrawal. Route proceeds and full exit are distinct. */
export function withdrawStrategyLimits({
  sdk,
  creditAccount: ca,
}: {
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
}): StrategyWithdrawLimitReport {
  const constraints: LimitConstraint<bigint>[] = [];
  let exit: bigint | undefined;
  try {
    const suite = sdk.marketRegister.findCreditManager(ca.creditManager);
    constraints.push(marketConstraint(suite.isPaused || suite.isExpired, 0n));
    for (const t of ca.tokens) {
      if (
        t.balance > 0n &&
        suite.market.priceOracle.safeConvert(t.token, ca.underlying, t.balance)
          .error
      )
        throw new Error("Position price unavailable");
    }
    const view = accountView(ca, sdk);
    exit = view.collateral > 0n ? view.collateral : 0n;
    constraints.push({
      id: "minimumDebt",
      status: "calculated",
      max: maxProportionalWithdrawal(view, view.band),
      reason:
        "Partial repayment must leave minDebt; exit is a separate operation",
    });
  } catch {
    constraints.push({
      id: "minimumDebt",
      status: "unresolved",
      reason: "Required market or price data unavailable",
    });
  }
  constraints.push({
    id: "route",
    status: "unresolved",
    reason:
      "Route proceeds, safe-price health and refreshed quotas require preparation",
  });
  return {
    token: ca.underlying,
    useSafePrices: true,
    max: knownMax(constraints),
    exit,
    constraints,
    complete: false,
  };
}

/** Upfront opening leverage caps. A route must still validate the final holding. */
export function leverageLimits(props: LeverageBandProps): LeverageLimitReport {
  const constraints: LimitConstraint<number>[] = [];
  let min: number | undefined;
  let unavailable: LimitConstraintId = "market";
  try {
    const suite = props.sdk.marketRegister.findCreditManager(
      props.creditManager,
    );
    const { market } = suite;
    constraints.push(marketConstraint(suite.isPaused || suite.isExpired, 0));
    try {
      const target = suite.strategyTargetCollateral;
      if (!target) throw new Error("No strategy target");
      constraints.push({
        id: "collateral",
        status: "calculated",
        max: suite.creditManager.maxLeverage(target, props.targetHF),
      });
    } catch {
      constraints.push({
        id: "collateral",
        status: "unresolved",
        reason: "Strategy threshold unavailable",
      });
    }
    const { maxDebt, maxDebtPerBlockMultiplier } = suite.creditFacade;
    if (maxDebtPerBlockMultiplier === 255)
      constraints.push({ id: "blockBorrowLimit", status: "notApplicable" });
    if (maxDebtPerBlockMultiplier === 0)
      constraints.push({
        id: "blockBorrowLimit",
        status: "calculated",
        max: 1,
      });
    unavailable = "valuation";
    let netValue = 0n;
    for (const a of props.collateral) {
      const value = market.priceOracle.safeConvert(
        a.token,
        market.pool.underlying,
        a.balance,
      );
      if (value.error) throw new Error("Collateral price unavailable");
      netValue += value.value;
    }
    if (netValue <= 0n)
      throw new Error("A positive collateral value is required");
    // debt = netValue * (L - 1); round caps down to the planner's hundredths.
    const cap = (debt: bigint): number =>
      1 +
      Number((debt * LEVERAGE_DECIMALS) / netValue) / Number(LEVERAGE_DECIMALS);
    const pool = market.pool.pool;
    constraints.push(
      { id: "maxDebt", status: "calculated", max: cap(maxDebt) },
      {
        id: "poolLiquidity",
        status: "calculated",
        max: cap(pool.availableLiquidity),
      },
    );
    if (maxDebtPerBlockMultiplier !== 255 && maxDebtPerBlockMultiplier !== 0)
      constraints.push({
        id: "blockBorrowLimit",
        status: "calculated",
        max: cap(maxDebt * BigInt(maxDebtPerBlockMultiplier)),
        reason: "Upper bound before borrowing already performed in this block",
      });
    const available = pool.creditManagerDebtParams.get(
      suite.creditManager.address,
    )?.available;
    constraints.push(
      available === undefined
        ? {
            id: "creditManagerDebtLimit",
            status: "unresolved",
            reason: "Manager debt allowance unavailable",
          }
        : {
            id: "creditManagerDebtLimit",
            status: "calculated",
            max: cap(available),
          },
    );
    unavailable = "minimumDebt";
    min = calcLeverageBand(props)?.min;
  } catch {
    constraints.push({
      id: unavailable,
      status: "unresolved",
      reason: "Required market, collateral or price data unavailable",
    });
  }
  constraints.push({
    id: "route",
    status: "unresolved",
    reason: "Route output, safe-price health and quotas require preparation",
  });
  return {
    min,
    useSafePrices: undefined,
    max: knownMax(constraints),
    constraints,
    complete: false,
  };
}
