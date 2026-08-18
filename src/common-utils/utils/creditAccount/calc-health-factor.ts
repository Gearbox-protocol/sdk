import type { Address } from "viem";
import type { Asset } from "../../../sdk/index.js";
import { calcHealthFactor as calcHealthFactorFromSnapshot } from "../../../sdk/positions/calcHealthFactor.js";
import type { QuotaInfoIsActiveSlice, TokenDataSlice } from "./types.js";

export interface CalcHealthFactorProps {
  assets: Array<Asset>;
  quotas: Record<Address, Asset>;
  quotasInfo: Record<Address, QuotaInfoIsActiveSlice | undefined>;

  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, bigint>;
  underlyingToken: Address;
  debt: bigint;
  tokensList: Record<Address, TokenDataSlice>;
}

/**
 * Computes account health factor in percentage-factor units.
 *
 * The function evaluates collateral value under liquidation thresholds,
 * applies quota caps for quoted tokens, and compares the resulting
 * liquidation-adjusted collateral against borrowed value.
 *
 * @param props Credit account balances, quotas, prices, thresholds, and debt context.
 * @returns Health factor as a number in `PERCENTAGE_FACTOR` scale,
 * or `65535` when debt is zero.
 *
 * @deprecated Use `calcHealthFactor` from `sdk/positions` instead; this
 * wrapper only maps the legacy props onto an `AccountSnapshot`.
 */
export function calcHealthFactor({
  assets,
  quotas,
  quotasInfo,

  liquidationThresholds,
  underlyingToken,
  debt,

  prices,
  tokensList,
}: CalcHealthFactorProps): number {
  const decimals: Record<Address, number> = {};
  for (const [token, meta] of Object.entries(tokensList)) {
    decimals[token as Address] = meta.decimals;
  }

  const lts: Record<Address, number> = {};
  for (const [token, lt] of Object.entries(liquidationThresholds)) {
    lts[token as Address] = Number(lt);
  }

  const activeQuotas: Record<Address, boolean> = {};
  for (const [token, info] of Object.entries(quotasInfo)) {
    if (info?.isActive) {
      activeQuotas[token as Address] = true;
    }
  }

  return calcHealthFactorFromSnapshot({
    snapshot: {
      creditManager: underlyingToken,
      assets,
      quotas: Object.values(quotas),
      totalDebt: debt,
      totalValue: 0n,
    },
    underlying: underlyingToken,
    decimals,
    prices,
    liquidationThresholds: lts,
    activeQuotas,
  });
}
