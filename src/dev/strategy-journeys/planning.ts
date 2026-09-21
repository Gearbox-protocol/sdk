import type { StrategyOpportunity } from "../../model/index.js";
import { LEVERAGE_DECIMALS as LEVERAGE_SCALE } from "../../onchain/constants/math.js";
import type { LeverageBand } from "../../sdk/prepare/types.js";
import {
  type JourneySession,
  type JourneyState,
  JourneyUnavailable,
} from "./types.js";

export function ceilDiv(value: bigint, divisor: bigint): bigint {
  return (value + divisor - 1n) / divisor;
}

/** Leaves borrowing headroom for growth and debt headroom for partial exits. */
export function planOpening(
  strategy: Pick<
    StrategyOpportunity,
    "minDebt" | "maxBorrowAmount" | "maxLeverage" | "underlyingToken"
  >,
  requested: { collateral?: bigint; leverage?: bigint } = {},
): { collateral: bigint; leverage: bigint } {
  const ceiling = BigInt(Math.floor(strategy.maxLeverage * 100));
  if (ceiling <= LEVERAGE_SCALE) {
    throw new JourneyUnavailable(
      "blocked",
      "The strategy has no leveraged opening range",
    );
  }
  const middle = LEVERAGE_SCALE + (ceiling - LEVERAGE_SCALE) / 2n;
  const leverage = requested.leverage ?? (middle < 200n ? middle : 200n);
  if (leverage <= LEVERAGE_SCALE || leverage > ceiling) {
    throw new Error(
      "Opening leverage must be above 1x and within the strategy limit",
    );
  }
  const minimum = strategy.minDebt.value;
  const available = strategy.maxBorrowAmount.value;
  const desiredDebt =
    minimum > 0n
      ? minimum * 3n
      : 10n ** BigInt(strategy.underlyingToken.decimals);
  const debt = desiredDebt < available / 2n ? desiredDebt : available / 2n;
  const collateral =
    requested.collateral ??
    ceilDiv(debt * LEVERAGE_SCALE, leverage - LEVERAGE_SCALE);
  const actualDebt =
    (collateral * (leverage - LEVERAGE_SCALE)) / LEVERAGE_SCALE;
  if (collateral <= 0n || actualDebt <= minimum || actualDebt > available) {
    throw new JourneyUnavailable(
      "blocked",
      "Not enough borrowing room to open above minDebt; fund the pool or choose a smaller position",
    );
  }
  return { collateral, leverage };
}

export function chooseLeverage(
  current: number,
  band: LeverageBand | undefined,
  direction: "up" | "down",
): bigint {
  if (!band)
    throw new JourneyUnavailable(
      "blocked",
      "No leverage band for the current position",
    );
  const now = BigInt(Math.round(current * 100));
  const bound = BigInt(
    direction === "up" ? Math.floor(band.max * 100) : Math.ceil(band.min * 100),
  );
  const room = direction === "up" ? bound - now : now - bound;
  if (room < 2n)
    throw new JourneyUnavailable(
      "unsupported",
      `No room to move leverage ${direction} at this position size`,
    );
  const delta = room / 2n < 50n ? room / 2n : 50n;
  return direction === "up" ? now + delta : now - delta;
}

export function partialAmount(limit: bigint, label: string): bigint {
  if (limit <= 0n)
    throw new JourneyUnavailable(
      "unsupported",
      `No safe ${label} amount for this position`,
    );
  return limit / 4n || 1n;
}

/** Picks a reachable leverage for the position's equity, optionally after adding wallet funds. */
export function pickLeverage(
  session: Pick<JourneySession, "prepare" | "options" | "underlying">,
  before: Pick<JourneyState, "debt" | "value" | "leverage">,
  direction: "up" | "down",
  extraEquity = 0n,
): bigint {
  const band = session.prepare.leverageBand(session.options.key, [
    {
      token: session.underlying,
      balance: before.value - before.debt + extraEquity,
    },
  ]);
  return chooseLeverage(before.leverage, band, direction);
}
