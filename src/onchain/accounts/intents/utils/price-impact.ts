import type { Address } from "viem";
// Not the package barrel: this file is pulled in through it, so a value read
// from there would still be uninitialised here.
import {
  PERCENTAGE_FACTOR_1KK,
  PRICE_DECIMALS,
  WAD,
} from "../../../constants/math.js";
import type { Asset, IPriceOracleContract } from "../../../index.js";
import type { PathLossRate } from "../types.js";

/** `b1 = b0 / V0`: a dollar of the basket, the reference implementation's anchor. */
const PROBE_UNIT_USD_WAD = WAD;

interface ProbeBasket {
  /** The basket, scaled down to `probeWad`. */
  balances: Asset[];
  /** Oracle value of the real basket. */
  basketWad: bigint;
  /** Oracle value of the scaled one. */
  probeWad: bigint;
}

/** One leg's contribution to the preview's impact. */
export interface LegProbe {
  tokenOut: Address;
  /**
   * The real route's `amount`, never its `minAmount`: the floor is a tolerance
   * the caller chose, not a cost the market charged.
   */
  realAmount: bigint;
  basketWad: bigint;
  probeWad: bigint;
  /** Already in flight, and already neutralised — see {@link startProbe}. */
  probe: Promise<bigint | undefined>;
}

/**
 * `V0 = Σ b0ᵢ·pᵢ`, then `b1 = b0 / V0`, proportions kept.
 *
 * Refuses only what the reference refuses — a basket worth nothing, or one that
 * rounds away entirely. Stricter guards here would report nothing where the old
 * client reported a number.
 */
function probeBasket(
  balances: Asset[],
  oracle: IPriceOracleContract,
): ProbeBasket | undefined {
  if (balances.length === 0) {
    return undefined;
  }

  // An unpriceable component is left out of the total but stays in the basket,
  // as the reference does.
  let basketWad = 0n;
  for (const asset of balances) {
    if (asset.balance <= 0n) {
      continue;
    }
    const usd = oracle.safeConvertToUSD(asset.token, asset.balance).value;
    if (usd > 0n) {
      basketWad += (usd * WAD) / PRICE_DECIMALS;
    }
  }
  if (basketWad <= 0n) {
    return undefined;
  }

  const probeWad = PROBE_UNIT_USD_WAD;
  const scaled = balances.map(asset => ({
    token: asset.token,
    balance: (asset.balance * probeWad) / basketWad,
  }));
  // Only a basket that rounds away entirely has nothing to ask for.
  if (!scaled.some(a => a.balance > 0n)) {
    return undefined;
  }

  return { balances: scaled, basketWad, probeWad };
}

/** Fires the marginal-price quote for one leg; `undefined` if it cannot be measured. */
export function startProbe(args: {
  basket: Asset[];
  tokenOut: Address;
  oracle: IPriceOracleContract;
  route: (basket: Asset[]) => Promise<bigint | undefined>;
}): Omit<LegProbe, "realAmount"> | undefined {
  const basket = probeBasket(args.basket, args.oracle);
  if (!basket) {
    return undefined;
  }

  return {
    tokenOut: args.tokenOut,
    basketWad: basket.basketWad,
    probeWad: basket.probeWad,
    // Neutralised at creation, not at the await: a failed probe is a missing
    // measurement, never a failed preview, and a guard may abort before the fold.
    probe: args.route(basket.balances).catch(() => undefined),
  };
}

/** `convert` answers `0` for a negative amount, so convert the magnitude and re-sign. */
function toUnderlyingSigned(
  convert: (from: Address, amount: bigint) => bigint,
  token: Address,
  amount: bigint,
): bigint | undefined {
  if (amount === 0n) {
    return 0n;
  }
  const magnitude = amount < 0n ? -amount : amount;
  const converted = convert(token, magnitude);
  if (converted <= 0n) {
    return undefined;
  }
  return amount < 0n ? -converted : converted;
}

/**
 * In `PERCENTAGE_FACTOR_1KK` (1_000_000 = 100%), negative for a loss. A base
 * that is not positive falls back to the routed output.
 */
export function lossRate(args: {
  lossUnd: bigint;
  expectedUnd: bigint;
  totalValue: bigint;
  netValue: bigint;
}): PathLossRate {
  const { lossUnd, expectedUnd, totalValue, netValue } = args;
  const against = (base: bigint): bigint =>
    -((PERCENTAGE_FACTOR_1KK * lossUnd) / (base > 0n ? base : expectedUnd));

  return {
    pathPriceImpact: against(expectedUnd),
    netValuePriceImpact: against(netValue),
    totalValuePriceImpact: against(totalValue),
  };
}

/**
 * Folds every leg into one rate, in the underlying — the unit its bases are in.
 *
 * All or nothing: a partial sum would understate the loss and draw a better
 * price than the route offers.
 */
export async function collectPriceImpact(
  probes: LegProbe[],
  ctx: {
    totalValue: bigint;
    netValue: bigint;
    toUnderlying: (from: Address, amount: bigint) => bigint;
  },
): Promise<PathLossRate | undefined> {
  if (probes.length === 0) {
    return undefined;
  }

  // Every probe has been in flight since its leg was quoted; awaiting them
  // together states that rather than leaving it to the reader of a loop.
  const quotes = await Promise.all(probes.map(leg => leg.probe));

  let expectedUnd = 0n;
  let lossUnd = 0n;

  for (const [index, leg] of probes.entries()) {
    const unit = quotes[index];
    if (unit === undefined || unit <= 0n) {
      return undefined;
    }
    // What the leg would return at the marginal price, i.e. with no depth cost.
    const expected = (unit * leg.basketWad) / leg.probeWad;
    if (expected <= 0n) {
      return undefined;
    }
    const expectedInUnd = ctx.toUnderlying(leg.tokenOut, expected);
    if (expectedInUnd <= 0n) {
      return undefined;
    }
    const loss = toUnderlyingSigned(
      ctx.toUnderlying,
      leg.tokenOut,
      expected - leg.realAmount,
    );
    if (loss === undefined) {
      return undefined;
    }
    expectedUnd += expectedInUnd;
    lossUnd += loss;
  }

  if (expectedUnd <= 0n) {
    return undefined;
  }

  return lossRate({
    lossUnd,
    expectedUnd,
    totalValue: ctx.totalValue,
    netValue: ctx.netValue,
  });
}
