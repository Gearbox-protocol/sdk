import type { Address } from "viem";
import type {
  AccountMetrics,
  AccountProjection,
  BorrowRateBreakdown,
  Bps,
  DelayedReceivedAsset,
  Position,
  PositionClaimableWithdrawal,
  PositionCollateral,
  PositionKind,
  PositionPendingWithdrawal,
  PositionWithdrawals,
  StrategyPosition,
  TxCall,
} from "../../model/index.js";
import {
  isFilterSet,
  matchesPositionFilter,
  STRATEGY_POSITION_COLLATERAL_ERROR,
} from "../../model/index.js";
import type {
  ClaimableWithdrawal,
  CurrentWithdrawals,
  PendingWithdrawal,
  WithdrawalOutput,
} from "../accounts/withdrawal-compressor/index.js";
import type { CreditAccountData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import { DUST_THRESHOLD } from "../constants/index.js";
import { creditOperationMarket } from "../market/credit/creditOperationMarket.js";
import {
  bpsToRay,
  calcBorrowApy,
  calcPositionLeverage,
  healthFactorBps,
  usdToNumber,
} from "../market/math.js";
import { collateralPriceInUnderlying } from "../market/oracle/collateralPriceInUnderlying.js";
import type { IPriceOracleContract } from "../market/oracle/index.js";
import {
  borrowRateAtUtilization,
  type RateModelParams,
  utilizationAfterLiquidityChange,
} from "../market/pool/math.js";
import type { MultiCall } from "../types/index.js";
import { AddressMap } from "../utils/index.js";
import { calcBorrowRate } from "./calcBorrowRate.js";
import { calcHealthFactor } from "./calcHealthFactor.js";
import {
  calcLiquidationPrice,
  soleNonUnderlyingCollateral,
} from "./calcLiquidationPrice.js";
import { calcTimeToLiquidationMs } from "./calcTimeToLiquidationMs.js";
import {
  type AccountSnapshot,
  accountSnapshotFromCreditAccountData,
  type GetCurrentWithdrawalsProps,
  type ListPositionsProps,
  type ListStrategyPositionsProps,
} from "./types.js";

/**
 * Market-side inputs collected once from the SDK for a snapshot's credit
 * manager: prices, decimals and thresholds for the snapshot's tokens plus
 * the market underlying (even when the account holds none of it).
 **/
interface PositionMetricMarketData {
  underlying: Address;
  decimals: Record<Address, number>;
  prices: Record<Address, bigint>;
  reservePrices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, Bps>;
  activeQuotas: Record<Address, boolean>;
  quotaRates: Record<Address, Bps>;
  baseInterestRate: bigint;
  feeInterest: number;
}

/**
 * Options of the projection-aware position metrics: {@link PositionsService.borrowRate}
 * and {@link PositionsService.timeToLiquidation}.
 **/
export interface ProjectedPoolOptions {
  /**
   * Change the operation makes to the pool's available liquidity, in
   * underlying units: `oldDebt − newDebt`. Negative when the operation borrows
   * more (liquidity leaves the pool, utilization and the base rate rise),
   * positive when it repays. When set, the base borrow rate is re-quoted from
   * the interest rate model at the projected utilization instead of the pool's
   * current rate.
   **/
  availableLiquidityChange?: bigint;
}

/**
 * The `positions` read model of one chain: everything a wallet holds in the
 * protocol — pool shares, open credit accounts, and delayed withdrawals it
 * took over by liquidating.
 **/
export class PositionsService extends SDKConstruct {
  /**
   * Every position of a wallet on this chain, optionally narrowed by
   * {@link PositionFilter} (see {@link matchesPositionFilter} for what each
   * condition selects). Reads live chain state, so rows reflect the moment of
   * the call rather than the SDK's loaded snapshot.
   **/
  public async list(props: ListPositionsProps): Promise<Position[]> {
    const { wallet, filter, blockNumber } = props;
    if (filter?.chainIds && !filter.chainIds.includes(this.chainId)) {
      return [];
    }

    const wantedKind = filter?.kind;
    const wanted = (kind: PositionKind): boolean =>
      !isFilterSet(wantedKind) || wantedKind === kind;

    const isZeroDebt = filter?.isZeroDebt;
    const [pool, strategy, liquidation] = await Promise.all([
      wanted("pool")
        ? this.sdk.pools.listPositions({ wallet, blockNumber })
        : Promise.resolve([]),
      wanted("strategy")
        ? this.listStrategyPositions({
            owner: wallet,
            // a filter that asks for accounts with debt narrows the account
            // query itself; anything else needs them all
            includeZeroDebt: !isFilterSet(isZeroDebt) || isZeroDebt,
            blockNumber,
          })
        : Promise.resolve([]),
      wanted("liquidation")
        ? this.sdk.liquidations.getLiquidationPositions({
            liquidator: wallet,
            blockNumber,
          })
        : Promise.resolve([]),
    ]);

    return [...pool, ...strategy, ...liquidation].filter(row =>
      matchesPositionFilter(row, filter),
    );
  }

  /**
   * Describes all credit accounts of a wallet as strategy positions.
   *
   * @param props - {@link ListStrategyPositionsProps}
   **/
  public async listStrategyPositions(
    props: ListStrategyPositionsProps,
  ): Promise<StrategyPosition[]> {
    const { owner, includeZeroDebt, blockNumber } = props;
    // phantom token lookups below are sync; the cache is populated by attach/hydrate
    const accounts = await this.sdk.accounts.getBorrowerCreditAccounts(
      owner,
      { includeZeroDebt },
      blockNumber,
    );

    const withdrawals = await Promise.all(
      accounts.map(ca => this.#accountWithdrawals(ca, blockNumber)),
    );

    return accounts.map((ca, i) =>
      this.#toStrategyPosition(ca, withdrawals[i] ?? new AddressMap()),
    );
  }

  /**
   * Returns delayed withdrawals of a strategy position
   *
   * Empty when this chain has no withdrawal compressor, or the account does
   * not exist.
   **/
  public async getCurrentWithdrawals(
    props: GetCurrentWithdrawalsProps,
  ): Promise<PositionWithdrawals> {
    const { creditAccount, blockNumber } = props;
    const empty: PositionWithdrawals = { claimable: [], pending: [] };
    const compressor = this.sdk.withdrawalCompressor;
    if (!compressor) {
      return empty;
    }
    const ca = await this.sdk.accounts.getCreditAccountData(
      creditAccount,
      blockNumber,
    );
    if (!ca) {
      return empty;
    }
    const { priceOracle } = this.sdk.marketRegister.findByCreditManager(
      ca.creditManager,
    );
    return this.#toPositionWithdrawals(
      await compressor.getCurrentWithdrawals(creditAccount, blockNumber),
      priceOracle,
    );
  }

  /**
   * Health factor of an account state, in basis points (`10000` = 1.0).
   **/
  public healthFactor(
    snapshot: AccountSnapshot,
    options?: { safePrices?: boolean },
  ): Bps {
    const data = this.#marketData(snapshot);
    return calcHealthFactor({
      snapshot,
      underlying: data.underlying,
      decimals: data.decimals,
      prices: data.prices,
      reservePrices: data.reservePrices,
      safePrices: options?.safePrices,
      liquidationThresholds: data.liquidationThresholds,
      activeQuotas: data.activeQuotas,
    });
  }

  /**
   * Cost of an account state's debt, broken down into the pool's base rate
   * and per-token quota rates. A projection passes the operation's liquidity
   * delta via {@link ProjectedPoolOptions} to have the base rate re-quoted at
   * the post-operation pool utilization.
   **/
  public borrowRate(
    snapshot: AccountSnapshot,
    options?: ProjectedPoolOptions,
  ): BorrowRateBreakdown {
    const data = this.#marketData(snapshot);
    return calcBorrowRate({
      snapshot,
      baseInterestRate: this.#baseInterestRate(snapshot, data, options),
      feeInterest: data.feeInterest,
      quotaRates: data.quotaRates,
      resolveToken: address => this.sdk.tokensMeta.mustGetToken(address),
    });
  }

  /**
   * Estimated milliseconds until the account's health factor decays to
   * `10000` under its current borrow rate, or `null` when the debt carries
   * no rate (or the account is already liquidatable). Takes the same
   * projection options as {@link PositionsService.borrowRate}, so a projected
   * state decays at the projected rate.
   **/
  public timeToLiquidation(
    snapshot: AccountSnapshot,
    options?: ProjectedPoolOptions,
  ): bigint | null {
    const data = this.#marketData(snapshot);
    return calcTimeToLiquidationMs(
      calcHealthFactor({
        snapshot,
        underlying: data.underlying,
        decimals: data.decimals,
        prices: data.prices,
        liquidationThresholds: data.liquidationThresholds,
        activeQuotas: data.activeQuotas,
      }),
      BigInt(
        calcBorrowRate({
          snapshot,
          baseInterestRate: this.#baseInterestRate(snapshot, data, options),
          feeInterest: data.feeInterest,
          quotaRates: data.quotaRates,
          resolveToken: address => this.sdk.tokensMeta.mustGetToken(address),
        }).totalOnDebt,
      ),
    );
  }

  /**
   * The base rate a metric is computed at, in ray: the pool's own, or — for a
   * projection carrying a liquidity delta — the rate the interest model quotes
   * at the utilization that delta leaves behind. A market whose rate model is
   * not the linear one has nothing to re-quote from, and keeps the current
   * rate.
   *
   * Callers pass the operation's total-debt change. On a borrow that is the
   * principal leaving the pool; on a repayment it is the whole transfer back,
   * interest and fees included. Either way it is the pool's own liquidity
   * move, to within the share of a repayment the fees take.
   **/
  #baseInterestRate(
    snapshot: AccountSnapshot,
    data: PositionMetricMarketData,
    options?: ProjectedPoolOptions,
  ): bigint {
    const delta = options?.availableLiquidityChange;
    if (!delta) {
      return data.baseInterestRate;
    }
    const suite = this.sdk.marketRegister.findByCreditManager(
      snapshot.creditManager,
    ).pool;
    let params: RateModelParams;
    try {
      params = suite.linearModel.params;
    } catch {
      return data.baseInterestRate;
    }
    const { pool } = suite;
    return bpsToRay(
      borrowRateAtUtilization(
        utilizationAfterLiquidityChange(
          pool.expectedLiquidity,
          pool.availableLiquidity,
          delta,
        ),
        params,
      ),
    );
  }

  /**
   * Price of the single non-underlying collateral at which the account
   * becomes liquidatable, or `null` when the account holds zero or several
   * non-underlying assets.
   **/
  public liquidationPrice(snapshot: AccountSnapshot): bigint | null {
    const data = this.#marketData(snapshot);
    return calcLiquidationPrice({
      snapshot,
      underlying: data.underlying,
      decimals: data.decimals,
      liquidationThresholds: data.liquidationThresholds,
    });
  }

  /**
   * What the collateral {@link liquidationPrice} is quoted for costs in the
   * market underlying right now, in the same `PRICE_DECIMALS` fixed point —
   * the pair a form shows beside the liquidation price. `null` under exactly
   * the conditions that leave the liquidation price `null`, plus an oracle
   * that cannot answer for either side.
   **/
  public currentPrice(snapshot: AccountSnapshot): bigint | null {
    const market = this.sdk.marketRegister.findByCreditManager(
      snapshot.creditManager,
    );
    const underlying = market.pool.underlying;
    const collateral = soleNonUnderlyingCollateral(snapshot, underlying);
    if (!collateral) {
      return null;
    }
    return collateralPriceInUnderlying(
      market.priceOracle,
      collateral,
      underlying,
    );
  }

  /**
   * Every derived number of an account state at once — the whole
   * {@link AccountMetrics} half of a projection.
   *
   * This is what both halves of the SDK fill their answers from: `prepare`, for
   * a state it walked an intent into, and `preview`, for one it replayed out of
   * calldata. One snapshot in, one set of metrics out, so the two descriptions
   * of the same operation cannot disagree because one of them grew its own
   * formula.
   *
   * Identical to the four methods above field for field, and cheaper than
   * calling them one by one: the market data is collected once, and the health
   * factor and borrow rate the time to liquidation decays at are the very ones
   * reported beside it.
   **/
  public metrics(
    snapshot: AccountSnapshot,
    options?: ProjectedPoolOptions,
  ): AccountMetrics {
    const data = this.#marketData(snapshot);
    const factor = (safePrices: boolean): Bps =>
      calcHealthFactor({
        snapshot,
        underlying: data.underlying,
        decimals: data.decimals,
        prices: data.prices,
        reservePrices: data.reservePrices,
        safePrices,
        liquidationThresholds: data.liquidationThresholds,
        activeQuotas: data.activeQuotas,
      });
    const healthFactor = factor(false);
    const borrowRate = calcBorrowRate({
      snapshot,
      baseInterestRate: this.#baseInterestRate(snapshot, data, options),
      feeInterest: data.feeInterest,
      quotaRates: data.quotaRates,
      resolveToken: address => this.sdk.tokensMeta.mustGetToken(address),
    });

    return {
      healthFactor,
      safeHealthFactor: factor(true),
      borrowRate,
      timeToLiquidation: calcTimeToLiquidationMs(
        healthFactor,
        BigInt(borrowRate.totalOnDebt),
      ),
      liquidationPrice: calcLiquidationPrice({
        snapshot,
        underlying: data.underlying,
        decimals: data.decimals,
        liquidationThresholds: data.liquidationThresholds,
      }),
      leverage: calcPositionLeverage(snapshot.totalValue, snapshot.totalDebt),
    };
  }

  /**
   * A projected account state as both halves of the SDK report it: the holdings
   * priced and named, and the metrics of {@link PositionsService.metrics}.
   *
   * The snapshot is taken at its word — what it lists is what comes back, so a
   * caller that drops dust before the walk reports an account without it, and
   * one that keeps wei reports them. That is the whole of the policy left to
   * the caller; everything downstream of the balances is decided here.
   *
   * @param options - The operation's effect on the pool, for the rate the
   * metrics are quoted at, see {@link ProjectedPoolOptions}.
   **/
  public projection(
    snapshot: AccountSnapshot,
    options?: ProjectedPoolOptions,
  ): AccountProjection {
    const { creditManager, totalValue, totalDebt } = snapshot;
    const market = this.sdk.marketRegister.findByCreditManager(creditManager);
    const { priceOracle } = market;

    return {
      ...creditOperationMarket(
        this.sdk.marketRegister.findCreditManager(creditManager),
      ),
      totalValue: market.toUnderlyingAmount(totalValue),
      totalDebt: market.toUnderlyingAmount(totalDebt),
      netValue: market.toUnderlyingAmount(totalValue - totalDebt),
      assets: snapshot.assets.map(a =>
        priceOracle.toTokenAmount(a.token, a.balance),
      ),
      // a quota is bought in underlying, so only the token it applies to comes
      // from the entry itself
      quotas: snapshot.quotas.map(q => ({
        token: this.sdk.tokensMeta.mustGetToken(q.token),
        ...priceOracle.toAmount(market.underlying, q.balance),
      })),
      ...this.metrics(snapshot, options),
    };
  }

  /**
   * Builds one strategy position from an account snapshot.
   *
   * @param withdrawals - Delayed withdrawals of the account, keyed by the
   * phantom token that represents them on it.
   **/
  #toStrategyPosition(
    ca: CreditAccountData,
    withdrawals: AddressMap<DelayedReceivedAsset[]>,
  ): StrategyPosition {
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const { market } = suite;
    const { priceOracle } = market;
    const { pool } = market.pool;

    // for RWA markets, amounts are denominated in the unwrapped asset
    // (e.g. USDC instead of dcUSDC); the wrapped underlying converts 1:1
    const token = suite.underlyingToken;
    const totalDebtValue = ca.debt + ca.accruedInterest + ca.accruedFees;

    // compressor totals only cover enabled tokens; after a full repay the
    // remaining collateral is disabled, so zero-debt totals are summed from
    // oracle prices over every above-dust balance instead. The same fallback
    // is used when the compressor could not value the account.
    const priceFailed = !ca.success;
    const recomputeTotals = ca.debt === 0n || priceFailed;
    const collaterals: PositionCollateral[] = [];
    let totalValue = recomputeTotals ? 0n : ca.totalValue;
    let totalValueUSD = recomputeTotals ? 0n : ca.totalValueUSD;
    for (const t of ca.tokens) {
      if (t.balance <= DUST_THRESHOLD) {
        continue;
      }
      collaterals.push({
        // phantom tokens are reported as themselves, the asset they
        // redeem into shows up in `withdrawals`
        collateral: priceOracle.toTokenAmount(t.token, t.balance),
        quota: priceOracle.toTokenAmount(market.underlying, t.quota),
        withdrawals: withdrawals.get(t.token) ?? [],
      });
      if (recomputeTotals) {
        const value =
          priceOracle.safeConvert(t.token, market.underlying, t.balance) || 0n;
        totalValue += value;
        const usd = priceOracle.safeConvertToUSD(t.token, t.balance) || 0n;
        totalValueUSD += usd;
      }
    }

    // healthFactor / leverage / borrowApy / netApy keep their existing
    // sources; only the fields the position does not have natively are filled
    const snapshot = {
      ...accountSnapshotFromCreditAccountData(ca),
      totalValue,
    };
    const borrowRate = this.borrowRate(snapshot);
    const timeToLiquidation = this.timeToLiquidation(snapshot);
    const liquidationPrice = this.liquidationPrice(snapshot);
    const totalDebtUSD = priceFailed
      ? (priceOracle.safeConvertToUSD(market.underlying, totalDebtValue) ?? 0n)
      : ca.totalDebtUSD;

    return {
      kind: "strategy",
      chainId: this.sdk.chainId,
      creditManager: ca.creditManager,
      creditAccount: ca.creditAccount,
      underlyingToken: token,
      name: suite.accountStrategyName(ca.creditAccount),
      targetCollateral: suite.accountTargetCollateral(ca.creditAccount),
      leverage: calcPositionLeverage(totalValue, totalDebtValue),
      borrowApy: calcBorrowApy(
        pool.baseInterestRate,
        suite.creditManager.feeInterest,
      ),
      // the compressor prices the whole account in one pass, so the USD values
      // of the two totals come from it rather than from a second price lookup
      // — except zero-debt and unpriceable accounts, whose totals are summed
      // above
      totalDebt: {
        token,
        value: totalDebtValue,
        valueUsd: usdToNumber(totalDebtUSD),
      },
      totalValue: {
        token,
        value: totalValue,
        valueUsd: usdToNumber(totalValueUSD),
      },
      healthFactor: priceFailed
        ? this.healthFactor(snapshot)
        : healthFactorBps(ca.healthFactor),
      borrowRate,
      timeToLiquidation,
      liquidationPrice,
      collaterals,
      ...(priceFailed ? { error: STRATEGY_POSITION_COLLATERAL_ERROR } : {}),
    };
  }

  /**
   * Delayed withdrawals of one account, keyed by the phantom token that
   * represents them on it, so that each collateral row can pick up its own.
   **/
  async #accountWithdrawals(
    ca: CreditAccountData,
    blockNumber?: bigint,
  ): Promise<AddressMap<DelayedReceivedAsset[]>> {
    const compressor = this.sdk.withdrawalCompressor;
    const byPhantomToken = new AddressMap<DelayedReceivedAsset[]>(
      undefined,
      "accountWithdrawals",
    );
    // an account with no phantom token balance has nothing on its way out, and
    // asking the compressor about it would be one RPC call per such account
    const holdsPhantomToken = ca.tokens.some(
      t =>
        t.balance > DUST_THRESHOLD &&
        compressor?.getWithdrawalSourceToken(t.token) !== undefined,
    );
    if (!compressor || !holdsPhantomToken) {
      return byPhantomToken;
    }
    const { priceOracle } = this.sdk.marketRegister.findByCreditManager(
      ca.creditManager,
    );
    const { claimable, pending } = await compressor.getCurrentWithdrawals(
      ca.creditAccount,
      blockNumber,
    );

    const add = (
      w: ClaimableWithdrawal | PendingWithdrawal,
      outputs: readonly WithdrawalOutput[],
      claimableAt?: bigint,
    ): void => {
      const assets = outputs.map(
        (o): DelayedReceivedAsset => ({
          isDelayed: true,
          ...priceOracle.toTokenAmount(o.token, o.amount),
          redeemer: w.redeemer,
          claimableAt:
            claimableAt === undefined ? undefined : Number(claimableAt),
        }),
      );
      byPhantomToken.upsert(w.withdrawalPhantomToken, [
        ...(byPhantomToken.get(w.withdrawalPhantomToken) ?? []),
        ...assets,
      ]);
    };

    for (const w of claimable) {
      add(w, w.outputs);
    }
    for (const w of pending) {
      add(w, w.expectedOutputs, w.claimableAt);
    }
    return byPhantomToken;
  }

  /**
   * Maps compressor withdrawals into the read model's vocabulary.
   **/
  #toPositionWithdrawals(
    raw: CurrentWithdrawals,
    priceOracle: IPriceOracleContract,
  ): PositionWithdrawals {
    return {
      claimable: raw.claimable.map(w =>
        this.#toPositionClaimableWithdrawal(w, priceOracle),
      ),
      pending: raw.pending.map(w =>
        this.#toPositionPendingWithdrawal(w, priceOracle),
      ),
    };
  }

  #toPositionClaimableWithdrawal(
    w: ClaimableWithdrawal,
    priceOracle: IPriceOracleContract,
  ): PositionClaimableWithdrawal {
    return {
      sourceToken: this.sdk.tokensMeta.mustGetToken(w.token),
      withdrawalPhantomToken: priceOracle.toTokenAmount(
        w.withdrawalPhantomToken,
        w.withdrawalTokenSpent,
      ),
      outputs: w.outputs.map(o => priceOracle.toTokenAmount(o.token, o.amount)),
      claimCall: this.#claimTx(w.claimCalls, w.token),
      redeemer: w.redeemer,
      intent: w.intent,
    };
  }

  #toPositionPendingWithdrawal(
    w: PendingWithdrawal,
    priceOracle: IPriceOracleContract,
  ): PositionPendingWithdrawal {
    return {
      sourceToken: this.sdk.tokensMeta.mustGetToken(w.token),
      withdrawalPhantomToken: this.sdk.tokensMeta.mustGetToken(
        w.withdrawalPhantomToken,
      ),
      expectedOutputs: w.expectedOutputs.map(o =>
        priceOracle.toTokenAmount(o.token, o.amount),
      ),
      claimableAt: Number(w.claimableAt),
      redeemer: w.redeemer,
      intent: w.intent,
    };
  }

  /**
   * Subcompressors always report exactly one adapter call per claimable
   * withdrawal.
   **/
  #claimTx(claimCalls: readonly MultiCall[], sourceToken: Address): TxCall {
    const call = claimCalls[0];
    if (claimCalls.length !== 1 || !call) {
      throw new Error(
        `expected exactly one claim call for withdrawal of ${sourceToken}, got ${claimCalls.length}`,
      );
    }
    return { to: call.target, callData: call.callData };
  }

  /**
   * Collects decimals, prices and thresholds for the snapshot's tokens plus
   * the market underlying, even when the account holds no underlying balance.
   **/
  #marketData(snapshot: AccountSnapshot): PositionMetricMarketData {
    const market = this.sdk.marketRegister.findByCreditManager(
      snapshot.creditManager,
    );
    const cm = this.sdk.marketRegister.findCreditManager(
      snapshot.creditManager,
    ).creditManager;
    const { priceOracle } = market;
    const underlying = market.pool.underlying;
    const { pqk, pool } = market.pool;

    const tokens: Address[] = [underlying];
    for (const a of snapshot.assets) {
      tokens.push(a.token);
    }
    for (const q of snapshot.quotas) {
      tokens.push(q.token);
    }

    const decimals: Record<Address, number> = {};
    const prices: Record<Address, bigint> = {};
    const reservePrices: Record<Address, bigint> = {};
    const liquidationThresholds: Record<Address, Bps> = {};
    const activeQuotas: Record<Address, boolean> = {};
    const quotaRates: Record<Address, Bps> = {};

    for (const token of tokens) {
      const meta = this.sdk.tokensMeta.get(token);
      if (meta) {
        decimals[token] = meta.decimals;
      }

      try {
        prices[token] = priceOracle.mainPrice(token);
      } catch {
        // unpriceable: omitted so the calc treats the token as contributing nothing
      }

      try {
        reservePrices[token] = priceOracle.reservePrice(token);
      } catch {
        // no reserve feed
      }

      const lt = cm.liquidationThresholds.get(token);
      if (lt !== undefined) {
        liquidationThresholds[token] = lt;
      }

      if (pqk.hasActiveQuota(token)) {
        activeQuotas[token] = true;
        quotaRates[token] = pqk.quotaRate(token);
      }
    }

    return {
      underlying,
      decimals,
      prices,
      reservePrices,
      liquidationThresholds,
      activeQuotas,
      quotaRates,
      baseInterestRate: pool.baseInterestRate,
      feeInterest: cm.feeInterest,
    };
  }
}
