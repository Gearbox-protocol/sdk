import type { Address } from "viem";
import type {
  AccountProjection,
  Bps,
  TokenAmount,
} from "../../../model/index.js";
import type { Asset, MultiCall, OnchainSDK } from "../../index.js";
import { calcPositionLeverage } from "../../market/math.js";
import type { ConvertFn } from "../../market/oracle/types.js";
import type { AccountSnapshot } from "../../positions/types.js";
import { IntentPreviewError } from "../../validation/refusal.js";
import {
  assertCanBorrow,
  assertCollateralised,
  assertGrowthAllowed,
  assertMarketOperable,
  assertQuotaHeadroom,
} from "./guards.js";
import {
  assertDebtInBand,
  assertLeverageAtLeastOne,
  debtForLeverage,
} from "./math.js";
import type { CreditAccountSlice, PathLossRate } from "./types.js";
import {
  collectPriceImpact,
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
export interface OpenStrategyPreview
  extends Omit<AccountProjection, "assets" | "quotas"> {
  /**
   * The same factor with collateral valued at safe prices, which is what the
   * credit manager weighs an opening at on-chain. Always reported here: an
   * opening always hands the pool's funds over.
   **/
  safeHealthFactor: Bps;
  /** What the routed leg lost to market depth; `undefined` if not measured. */
  priceImpact: PathLossRate | undefined;
  /** Expected post-open balances. */
  averageAssets: TokenAmount[];
  /** Floor post-open balances after slippage. */
  minAssets: TokenAmount[];
  /**
   * Quotas to buy against `averageAssets`; feeds `openCA.averageQuota`.
   *
   * Bare pairs rather than priced amounts, like `calls` below: these three are
   * transport for the transaction, handed to `openCA` untouched, and are the
   * only fields here a caller is not meant to display.
   **/
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

  assertLeverageAtLeastOne(leverage);

  const suite = sdk.marketRegister.findCreditManager(creditManager);
  const market = sdk.marketRegister.findByCreditManager(creditManager);
  assertMarketOperable(suite);
  const underlying = market.pool.underlying.toLowerCase() as Address;
  const convert: ConvertFn = (from, to, amount) =>
    market.priceOracle.safeConvert(from, to, amount) ?? 0n;

  const margin = collateral.reduce(
    (acc, a) => acc + convert(a.token, underlying, a.balance),
    0n,
  );
  if (margin <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      undefined,
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
    totalDebt: 0n,
    tokens: [],
  };
  assertDebtInBand(sdk, debt, suite.creditFacade, underlying);
  assertCanBorrow(sdk, suite, debt);

  const paths = createRouterPaths({ sdk, creditAccount: account, slippage });
  const expectedBalances = mergeExpectedBalances(collateral, underlying, debt);
  const leg = await paths.openStrategy({
    expectedBalances,
    leftoverBalances,
    target: targetToken,
  });

  const priced = ({ token, balance }: Asset): TokenAmount =>
    market.priceOracle.toTokenAmount(token, balance);

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
  assertQuotaHeadroom(sdk, market, averageQuota);

  // The floor branch is what the open is signed against, so it is the one that
  // has to clear the collateral check.
  const snapshot: AccountSnapshot = {
    creditManager,
    assets: averageAssets,
    quotas: averageQuota,
    totalDebt: debt,
    totalValue: margin + debt,
  };
  // opening borrows the whole debt from the pool
  const projectedPool = { availableLiquidityChange: -debt };
  const metrics = {
    healthFactor: sdk.positions.healthFactor(snapshot),
    safeHealthFactor: sdk.positions.healthFactor(snapshot, {
      safePrices: true,
    }),
    borrowRate: sdk.positions.borrowRate(snapshot, projectedPool),
    timeToLiquidation: sdk.positions.timeToLiquidation(snapshot, projectedPool),
    liquidationPrice: sdk.positions.liquidationPrice(snapshot),
  };
  assertCollateralised(metrics.healthFactor, false);

  const priceImpact = await collectPriceImpact(leg.probe ? [leg.probe] : [], {
    totalValue: margin + debt,
    // Opening borrows the rest, so the margin is the equity.
    netValue: margin,
    toUnderlying: (from, amount) => convert(from, underlying, amount),
  });

  return {
    creditManager,
    name: suite.name,
    totalDebt: market.toUnderlyingAmount(debt),
    netValue: market.toUnderlyingAmount(margin),
    totalValue: market.toUnderlyingAmount(margin + debt),
    leverage: calcPositionLeverage(margin + debt, debt),
    priceImpact,
    averageAssets: averageAssets.map(priced),
    minAssets: minAssets.map(priced),
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
