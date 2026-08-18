import type { Address } from "viem";
import type {
  BorrowRateBreakdown,
  Bps,
  Position,
  PositionKind,
} from "../../model/index.js";
import { isFilterSet, matchesPositionFilter } from "../../model/index.js";
import { SDKConstruct } from "../base/index.js";
import { calcBorrowRate } from "./calcBorrowRate.js";
import { calcHealthFactor } from "./calcHealthFactor.js";
import { calcLiquidationPrice } from "./calcLiquidationPrice.js";
import { calcTimeToLiquidationMs } from "./calcTimeToLiquidationMs.js";
import type { AccountSnapshot, ListPositionsProps } from "./types.js";

/**
 * Market-side inputs collected once from the SDK for a snapshot's credit
 * manager: prices, decimals and thresholds for the snapshot's tokens plus
 * the market underlying (even when the account holds none of it).
 **/
interface PositionMetricMarketData {
  underlying: Address;
  decimals: Record<Address, number>;
  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, Bps>;
  activeQuotas: Record<Address, boolean>;
  quotaRates: Record<Address, Bps>;
  baseInterestRate: bigint;
  feeInterest: number;
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
        ? this.sdk.accounts.listPositions({
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
   * Health factor of an account state, in basis points (`10000` = 1.0).
   **/
  public healthFactor(snapshot: AccountSnapshot): Bps {
    const data = this.#marketData(snapshot);
    return calcHealthFactor({
      snapshot,
      underlying: data.underlying,
      decimals: data.decimals,
      prices: data.prices,
      liquidationThresholds: data.liquidationThresholds,
      activeQuotas: data.activeQuotas,
    });
  }

  /**
   * Cost of an account state's debt, broken down into the pool's base rate
   * and per-token quota rates.
   **/
  public borrowRate(snapshot: AccountSnapshot): BorrowRateBreakdown {
    const data = this.#marketData(snapshot);
    return calcBorrowRate({
      snapshot,
      baseInterestRate: data.baseInterestRate,
      feeInterest: data.feeInterest,
      quotaRates: data.quotaRates,
    });
  }

  /**
   * Estimated milliseconds until the account's health factor decays to
   * `10000` under its current borrow rate, or `null` when the debt carries
   * no rate (or the account is already liquidatable).
   **/
  public timeToLiquidation(snapshot: AccountSnapshot): bigint | null {
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
          baseInterestRate: data.baseInterestRate,
          feeInterest: data.feeInterest,
          quotaRates: data.quotaRates,
        }).totalOnDebt,
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
      liquidationThresholds,
      activeQuotas,
      quotaRates,
      baseInterestRate: pool.baseInterestRate,
      feeInterest: cm.feeInterest,
    };
  }
}
