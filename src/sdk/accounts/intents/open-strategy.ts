import type { Address } from "viem";
import type { BorrowRateBreakdown, Bps } from "../../../model/index.js";
import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import type { Asset, MultiCall, OnchainSDK } from "../../index.js";
import type { AccountSnapshot } from "../../positions/types.js";
import {
  assertCanBorrow,
  assertCollateralised,
  assertGrowthAllowed,
  assertMarketOperable,
  assertQuotaHeadroom,
} from "./guards.js";
import { assertDebtInBand, debtForLeverage } from "./math.js";
import type { CreditAccountSlice } from "./types.js";
import { IntentPreviewError } from "./types.js";
import {
  convertAmount,
  createRouterPaths,
  getQuotasForUpdate,
} from "./utils/index.js";

/** Stand-in account address: nothing exists on chain until the tx lands. */
const NO_ACCOUNT = "0x0000000000000000000000000000000000000000" as Address;

export interface OpenStrategyProps {
  sdk: OnchainSDK;
  /** Credit manager to open the account in. */
  creditManager: Address;
  /** Collateral coming from the wallet, in their own tokens. */
  collateral: Asset[];
  /** Token the position ends up in. */
  targetToken: Address;
  /** Target total leverage scaled by `LEVERAGE_DECIMALS` (300n = 3x). */
  leverage: bigint;
  /** Router slippage in PERCENTAGE_FORMAT (100% = 10_000). */
  slippage: number | undefined;
  /** Extra quota headroom in PERCENTAGE_FORMAT. */
  quotaReserve: number | undefined;
  /** Balances to leave unswapped; everything else is routed into the target. */
  leftoverBalances?: Asset[];
}

/**
 * Projected result of opening a brand-new leveraged position.
 *
 * Unlike every other flow this one reports **both** branches: the pathfinder
 * hands back expected and floor balances from a single call, and `openCA` wants
 * both `minQuota` and `averageQuota`, so there is nothing to gain by dropping one.
 */
export interface OpenStrategyPreview {
  /**
   * Health factor in basis points: below `10000` the account is liquidatable.
   *
   * @example `12500` for a health factor of 1.25
   **/
  healthFactor: Bps;
  /**
   * Net rate the whole position earns, collateral yield minus borrow cost.
   **/
  overallApy: Bps;
  /**
   * Cost of the debt, broken down by source.
   **/
  borrowRate: BorrowRateBreakdown;
  /**
   * Estimated milliseconds until the health factor decays to `10000` under
   * the current borrow rate, or `null` when the debt carries no rate (or the
   * account is already liquidatable).
   **/
  timeToLiquidation: bigint | null;
  /**
   * Price of the single non-underlying collateral at which the account
   * becomes liquidatable, in the oracle's 8-decimal fixed point, or `null`
   * when the account holds zero or several non-underlying assets.
   **/
  liquidationPrice: bigint | null;
  /** Debt drawn, in underlying. */
  debt: bigint;
  /** Collateral supplied, valued in underlying. */
  collateral: bigint;
  /** Position size — collateral plus debt, in underlying. */
  totalValue: bigint;
  /** Expected post-open balances. */
  averageAssets: Asset[];
  /** Floor post-open balances after slippage. */
  minAssets: Asset[];
  /** Quotas to buy against `averageAssets`; feeds `openCA.averageQuota`. */
  averageQuota: Asset[];
  /** Quotas to buy against `minAssets`; feeds `openCA.minQuota`. */
  minQuota: Asset[];
  /** Router path; feeds `openCA.calls`. */
  calls: MultiCall[];
}

/**
 * Previews opening a leveraged position out of wallet collateral.
 *
 * Debt follows from the target leverage against the supplied margin
 * (`debt = margin * (L - 1)`, `totalValue = margin * L`); the collateral and the
 * borrowed underlying are then routed into the target token in one pathfinder call.
 *
 * There is no account yet, so this does not go through `startIntent` and produces
 * no operation list — the caller passes the numbers and calls straight to
 * `sdk.accounts.openCA`.
 */
export async function previewOpenStrategy(
  props: OpenStrategyProps,
): Promise<OpenStrategyPreview> {
  const {
    sdk,
    creditManager,
    collateral,
    targetToken,
    leverage,
    slippage = 0,
    quotaReserve,
    leftoverBalances = [],
  } = props;

  if (leverage < LEVERAGE_DECIMALS) {
    throw new IntentPreviewError(
      "leverageOutOfRange",
      `openStrategy: leverage ${leverage} is below 1x`,
    );
  }

  const suite = sdk.marketRegister.findCreditManager(creditManager);
  const market = sdk.marketRegister.findByCreditManager(creditManager);
  assertMarketOperable(suite);
  const underlying = market.pool.underlying.toLowerCase() as Address;
  const convert = convertAmount(sdk, creditManager);

  const margin = collateral.reduce(
    (acc, a) => acc + convert(a.token, underlying, a.balance),
    0n,
  );
  if (margin <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "openStrategy: collateral is worth nothing in underlying",
    );
  }

  const debt = debtForLeverage(margin, leverage);

  // Synthetic slice so the router helper can be reused even though no account
  // exists yet.
  const account: CreditAccountSlice = {
    creditAccount: NO_ACCOUNT,
    creditManager: creditManager.toLowerCase() as Address,
    creditFacade: suite.creditFacade.address.toLowerCase() as Address,
    underlying,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    accountDebt: 0n,
    tokens: [],
  };
  assertDebtInBand(debt, suite.creditFacade);
  assertCanBorrow(suite, debt);

  const paths = createRouterPaths({ sdk, creditAccount: account, slippage });
  const leg = await paths.openStrategy({
    expectedBalances: mergeExpectedBalances(collateral, underlying, debt),
    leftoverBalances,
    target: targetToken,
  });

  const averageAssets = toAssets(leg.balances);
  const minAssets = toAssets(leg.minBalances);

  const quotasFor = (assets: Asset[]): Asset[] =>
    getQuotasForUpdate({
      assetsBefore: [],
      assetsAfter: assets,
      initialQuotas: [],
      quotaReserve,
      underlyingToken: underlying,
      liquidationThresholds: suite.creditManager.liquidationThresholds,
      quotas: market.pool.pqk.quotas,
      maxDebt: suite.creditFacade.maxDebt,
      convert,
      // A fresh account starts at zero quota, so the increase *is* the level
      // `openCA` expects.
    }).quotaIncrease;

  const averageQuota = quotasFor(averageAssets);
  const minQuota = quotasFor(minAssets);
  // The expected branch is the one the account is opened on, so it is the one
  // the market has to have room for.
  assertGrowthAllowed({ sdk, suite, market, before: [], after: averageAssets });
  assertQuotaHeadroom(market, averageQuota);

  // The floor branch is what the open is signed against, so it is the one that
  // has to clear the collateral check.
  const snapshot: AccountSnapshot = {
    creditManager,
    assets: averageAssets,
    quotas: averageQuota,
    totalDebt: debt,
    totalValue: margin + debt,
  };
  const metrics = {
    healthFactor: sdk.positions.healthFactor(snapshot),
    // TODO: overall APY needs the collateral yield (lpAPY), which market
    // state alone does not carry — wire it up together with the ApyPlugin
    overallApy: 0,
    borrowRate: sdk.positions.borrowRate(snapshot),
    timeToLiquidation: sdk.positions.timeToLiquidation(snapshot),
    liquidationPrice: sdk.positions.liquidationPrice(snapshot),
  };
  assertCollateralised(metrics.healthFactor);

  return {
    debt,
    collateral: margin,
    totalValue: margin + debt,
    averageAssets,
    minAssets,
    averageQuota,
    minQuota,
    calls: [...leg.calls],
    // metrics follow the expected branch, not the slippage floor; the target
    // for the liquidation price comes out of `averageAssets`
    ...metrics,
  };
}

/** Collateral plus the borrowed underlying, folded into one balance per token. */
function mergeExpectedBalances(
  collateral: Asset[],
  underlying: Address,
  debt: bigint,
): Asset[] {
  const merged = new Map<Address, bigint>();
  for (const a of collateral) {
    const token = a.token.toLowerCase() as Address;
    merged.set(token, (merged.get(token) ?? 0n) + a.balance);
  }
  if (debt > 0n) {
    merged.set(underlying, (merged.get(underlying) ?? 0n) + debt);
  }
  return [...merged.entries()].map(([token, balance]) => ({ token, balance }));
}

/** Router balance records carry mixed-case keys; normalise and drop empties. */
function toAssets(balances: Record<Address, bigint>): Asset[] {
  const merged = new Map<Address, bigint>();
  for (const [token, balance] of Object.entries(balances)) {
    if (balance <= 0n) {
      continue;
    }
    const key = token.toLowerCase() as Address;
    merged.set(key, (merged.get(key) ?? 0n) + balance);
  }
  return [...merged.entries()].map(([token, balance]) => ({ token, balance }));
}
