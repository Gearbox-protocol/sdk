import type { Address } from "viem";
import type {
  BorrowRateBreakdown,
  Bps,
  DelayedReceivedAsset,
  Position,
  PositionCollateral,
  PositionKind,
  StrategyPosition,
} from "../../model/index.js";
import { isFilterSet, matchesPositionFilter } from "../../model/index.js";
import type {
  ClaimableWithdrawal,
  PendingWithdrawal,
  WithdrawalOutput,
} from "../accounts/withdrawal-compressor/index.js";
import type { CreditAccountData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import { getAccountTargetCollateral } from "../chain/chains.js";
import { DUST_THRESHOLD } from "../constants/index.js";
import {
  bpsToRay,
  calcBorrowApy,
  calcPositionLeverage,
  healthFactorBps,
  usdToNumber,
} from "../market/math.js";
import {
  borrowRateAtUtilization,
  type RateModelParams,
  utilizationAfterLiquidityChange,
} from "../market/pool/math.js";
import { strategyName } from "../market/strategyName.js";
import { AddressMap } from "../utils/index.js";
import { calcBorrowRate } from "./calcBorrowRate.js";
import { calcHealthFactor } from "./calcHealthFactor.js";
import { calcLiquidationPrice } from "./calcLiquidationPrice.js";
import { calcTimeToLiquidationMs } from "./calcTimeToLiquidationMs.js";
import {
  type AccountSnapshot,
  accountSnapshotFromCreditAccountData,
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

    const describable = accounts.filter(ca => {
      // collateral computation reverted (e.g. dead price feed) — none of the
      // account's amounts can be computed, so it is left out of the list
      if (!ca.success) {
        this.logger?.warn(
          `cannot describe position of ${this.labelAddress(ca.creditAccount)}: collateral computation failed`,
        );
      }
      return ca.success;
    });

    const withdrawals = await Promise.all(
      describable.map(ca => this.#accountWithdrawals(ca, blockNumber)),
    );

    return describable.map((ca, i) =>
      this.#toStrategyPosition(ca, withdrawals[i] ?? new AddressMap()),
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
    const token = this.sdk.tokensMeta.mustGetToken(market.unwrappedUnderlying);
    const totalDebtValue = ca.debt + ca.accruedInterest + ca.accruedFees;
    const target =
      getAccountTargetCollateral(ca.creditAccount, this.sdk.chainId) ??
      suite.strategyTargetCollateral;

    // healthFactor / leverage / borrowApy / netApy keep their existing
    // sources; only the fields the position does not have natively are filled
    const snapshot = accountSnapshotFromCreditAccountData(ca);
    const borrowRate = this.borrowRate(snapshot);
    const timeToLiquidation = this.timeToLiquidation(snapshot);
    const liquidationPrice = this.liquidationPrice(snapshot);

    // compressor totals only cover enabled tokens; after a full repay the
    // remaining collateral is disabled, so zero-debt totals are summed from
    // oracle prices over every above-dust balance instead
    const zeroDebt = ca.debt === 0n;
    const collaterals: PositionCollateral[] = [];
    let totalValue = zeroDebt ? 0n : ca.totalValue;
    let totalValueUSD = zeroDebt ? 0n : ca.totalValueUSD;
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
      if (zeroDebt) {
        const value =
          priceOracle.safeConvert(t.token, market.underlying, t.balance) || 0n;
        totalValue += value;
        const usd = priceOracle.safeConvertToUSD(t.token, t.balance) || 0n;
        totalValueUSD += usd;
      }
    }

    return {
      kind: "strategy",
      chainId: this.sdk.chainId,
      creditManager: ca.creditManager,
      creditAccount: ca.creditAccount,
      name: target
        ? strategyName(
            this.sdk.tokensMeta.mustGetToken(target),
            token,
            this.sdk.chainId,
          )
        : token.symbol,
      targetCollateral: target
        ? this.sdk.tokensMeta.mustGetToken(target)
        : null,
      leverage: calcPositionLeverage(totalValue, totalDebtValue),
      borrowApy: calcBorrowApy(
        pool.baseInterestRate,
        suite.creditManager.feeInterest,
      ),
      // the compressor prices the whole account in one pass, so the USD values
      // of the two totals come from it rather than from a second price lookup
      // — except zero-debt accounts, whose totals are summed above
      totalDebt: {
        token,
        value: totalDebtValue,
        valueUsd: usdToNumber(ca.totalDebtUSD),
      },
      totalValue: {
        token,
        value: totalValue,
        valueUsd: usdToNumber(totalValueUSD),
      },
      healthFactor: healthFactorBps(ca.healthFactor),
      borrowRate,
      timeToLiquidation,
      liquidationPrice,
      collaterals,
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
