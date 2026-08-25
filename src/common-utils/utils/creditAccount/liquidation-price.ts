import type { Address } from "viem";
import type { Asset } from "../../../onchain/index.js";
import { calcLiquidationPriceForTarget } from "../../../onchain/positions/calcLiquidationPriceForTarget.js";
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
 * @deprecated Use `calcLiquidationPriceForTarget` from `sdk/positions`
 * instead; this wrapper only maps the legacy props onto an `AccountSnapshot`.
 */
export function liquidationPrice({
  liquidationThresholds,

  debt,
  underlyingToken,
  targetToken,
  assets,
  tokensList,
}: LiquidationPriceProps) {
  const decimals: Record<Address, number> = {};
  for (const [token, meta] of Object.entries(tokensList)) {
    decimals[token as Address] = meta.decimals;
  }

  const lts: Record<Address, number> = {};
  for (const [token, lt] of Object.entries(liquidationThresholds)) {
    lts[token as Address] = Number(lt);
  }

  return calcLiquidationPriceForTarget({
    snapshot: {
      creditManager: underlyingToken,
      assets: Object.values(assets),
      quotas: [],
      totalDebt: debt,
      totalValue: 0n,
    },
    targetToken,
    underlying: underlyingToken,
    decimals,
    liquidationThresholds: lts,
  });
}
