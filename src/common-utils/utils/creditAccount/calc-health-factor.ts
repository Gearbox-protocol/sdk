import type { Address } from "viem";
import { healthFactor } from "../../../sdk/accounts/position-metrics/index.js";
import type { Asset, OnchainSDK } from "../../../sdk/index.js";
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
 * @deprecated Use `healthFactor` from `sdk/accounts/position-metrics` instead;
 * this wrapper only maps the legacy props onto an `AccountSnapshot` over a
 * minimal sdk stub, so existing callers keep working with identical results.
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
  const sdk = {
    tokensMeta: {
      get: (token: Address) => {
        const meta = tokensList[token];
        return meta ? { decimals: meta.decimals } : undefined;
      },
    },
    marketRegister: {
      findByCreditManager: () => ({
        pool: {
          underlying: underlyingToken,
          pqk: {
            hasActiveQuota: (token: Address) =>
              quotasInfo?.[token]?.isActive ?? false,
          },
        },
        priceOracle: {
          convertToUSD: (token: Address, amount: bigint) => {
            const price = prices[token];
            if (price === undefined) {
              throw new Error(`no answer found for token ${token}`);
            }
            const decimals = tokensList[token]?.decimals ?? 18;
            return (amount * price) / 10n ** BigInt(decimals);
          },
          safeConvertToUSD: (token: Address, amount: bigint) => {
            const price = prices[token];
            if (price === undefined) {
              return null;
            }
            const decimals = tokensList[token]?.decimals ?? 18;
            return (amount * price) / 10n ** BigInt(decimals);
          },
        },
      }),
      findCreditManager: () => ({
        creditManager: {
          liquidationThresholds: {
            get: (token: Address) => {
              const lt = liquidationThresholds[token];
              return lt === undefined ? undefined : Number(lt);
            },
          },
        },
      }),
    },
  } as unknown as OnchainSDK;

  return healthFactor(sdk, {
    creditManager: underlyingToken,
    assets,
    quotas: Object.values(quotas),
    totalDebt: debt,
    totalValue: 0n,
  });
}
