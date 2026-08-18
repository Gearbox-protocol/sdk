import type { Address } from "viem";
import type { Asset, OnchainSDK } from "../../../sdk/index.js";
import { liquidationPriceForTarget } from "../../../sdk/market/position-metrics/liquidation-price.js";
import type { TokenDataSlice } from "./types.js";

interface LiquidationPriceProps {
  liquidationThresholds: Record<Address, bigint>;

  debt: bigint;
  underlyingToken: Address;
  targetToken: Address;
  assets: Record<Address, Asset>;
  tokensList: Record<Address, TokenDataSlice>;
}

/**
 * Calculates target token liquidation price for a credit account.
 *
 * The formula uses:
 * - effective debt adjusted by underlying-token collateral contribution
 * - target token effective balance
 * - target token liquidation threshold
 *
 * @param props Debt context, assets, thresholds, and token metadata.
 * @returns Target token price in `PRICE_DECIMALS` precision that corresponds
 * to liquidation boundary; returns `0n` when target balance or LT is non-positive.
 *
 * @deprecated Use `liquidationPrice` from `sdk/market/position-metrics`
 * instead; this wrapper only maps the legacy props onto an `AccountSnapshot`
 * over a minimal sdk stub, so existing callers keep working with identical
 * results.
 */
export function liquidationPrice({
  liquidationThresholds,

  debt,
  underlyingToken,
  targetToken,
  assets,
  tokensList,
}: LiquidationPriceProps) {
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

  return liquidationPriceForTarget(
    sdk,
    {
      creditManager: underlyingToken,
      assets: Object.values(assets),
      quotas: [],
      debt,
      totalValue: 0n,
    },
    targetToken,
  );
}
