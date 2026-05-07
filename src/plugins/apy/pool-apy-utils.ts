import type { Address } from "viem";
import type { ExternalApy, PoolExtraApy } from "../../rewards/apy/index.js";
import type { PoolPointsBase } from "../../rewards/rewards/extra-apy.js";
import { PERCENTAGE_FACTOR, RAY } from "../../sdk/constants/index.js";
import type { AddressMap } from "../../sdk/index.js";
import { formatBN, rayToNumber } from "../../sdk/utils/formatter.js";
import type {
  PoolBaseAPY,
  PoolExternalAPY,
  PoolFullAPY,
  PoolFullAPY7DAgo,
  PoolPointsWithTips,
} from "./pool-apy-types.js";

const SCALE = 1_000_000n;
// TODO: check if this is correct, maybe we should use 52n?
const WEEKS_PER_YEAR = 54n;

// ---------------------------------------------------------------------------
// getPoolExtraAPY
// ---------------------------------------------------------------------------

/**
 * Collects extra APY entries for the given token addresses from the
 * `poolExtraAPYList` map.
 *
 * In the client, `lookupAddresses` = [pool.address, ...pool.stakedDieselToken].
 * The caller is responsible for providing the correct set of addresses.
 */
export function getPoolExtraAPY(
  lookupAddresses: Address[],
  poolExtraAPYList: Record<Address, PoolExtraApy[]> | undefined,
): PoolExtraApy[] {
  if (!poolExtraAPYList) return [];

  const result: PoolExtraApy[] = [];
  for (const addr of lookupAddresses) {
    const extra = poolExtraAPYList[addr.toLowerCase() as Address];

    if (extra) {
      result.push(...extra);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// calculateSupplyApy7d
// ---------------------------------------------------------------------------

/**
 * Computes annualized supply APY based on diesel rate change over ~7 days.
 *
 * Returns a value in "percentage" units (e.g. 5 ≈ 5 %).
 * Falls back to current on-chain `supplyRate` if 7d-ago diesel rate is
 * missing or higher than the current rate.
 */
export function calculateSupplyApy7d(
  currentDieselRate: bigint,
  currentSupplyRate: bigint,
  dieselRate7DAgo: bigint,
): number {
  if (dieselRate7DAgo > currentDieselRate) {
    return rayToNumber(currentSupplyRate * SCALE) / Number(PERCENTAGE_FACTOR);
  }

  const apy =
    ((currentDieselRate * RAY) / dieselRate7DAgo - RAY) * WEEKS_PER_YEAR;
  return rayToNumber(apy * SCALE) / Number(PERCENTAGE_FACTOR);
}

// ---------------------------------------------------------------------------
// calculatePoolFullAPY
// ---------------------------------------------------------------------------

interface CalculatePoolFullAPYProps {
  depositAPY: number;
  underlyingAPY: number;
  extraAPY: PoolExtraApy[] | undefined;
  currentExternalList: ExternalApy[] | undefined;
}

/**
 * Aggregates all APY components for a single pool.
 *
 * `depositAPY` and returned values are in "percentage" units (5 ≈ 5 %).
 * `underlyingAPY` comes from `apyList` (scaled by `PERCENTAGE_FACTOR`),
 *  so it is divided by `PERCENTAGE_FACTOR` here.
 *
 * External APY: first entry in `currentExternalList`, enriched with `totalValue`.
 */
export function calculatePoolFullAPY({
  depositAPY,
  underlyingAPY,
  extraAPY,
  currentExternalList,
}: CalculatePoolFullAPYProps): PoolFullAPY {
  const baseAPY: PoolBaseAPY[] = [
    { type: "supplyAPY", apy: depositAPY },
    ...(underlyingAPY > 0
      ? ([
          {
            type: "tokenYield" as const,
            apy: Number(underlyingAPY) / Number(PERCENTAGE_FACTOR),
          },
        ] as const)
      : []),
  ];

  const filteredExtra = [...(extraAPY ?? [])].filter(r => r.apy > 0);

  const baseAPYTotal = baseAPY.reduce((s, r) => s + (r.apy || 0), 0);
  const extraAPYTotal = filteredExtra.reduce((s, r) => s + (r.apy || 0), 0);

  const total = baseAPYTotal + extraAPYTotal;

  const externalAPY = resolveExternalAPY(currentExternalList, total);

  return {
    totalAPY: total,
    baseAPY,
    extraAPY: filteredExtra,
    extraAPYTotal,
    externalAPY,
  };
}

function resolveExternalAPY(
  list: ExternalApy[] | undefined,
  baseTotal: number,
): PoolExternalAPY | undefined {
  const first = list?.[0];
  if (!first) return undefined;
  return {
    ...first,
    totalValue: baseTotal + first.value,
  };
}

// ---------------------------------------------------------------------------
// calculatePoolFullAPY7DAgo
// ---------------------------------------------------------------------------

interface CalculatePoolFullAPY7DAgoProps {
  depositAPY: number;
  /**
   * Annualized supply APY from the ~7d diesel snapshot, in the same units as
   * `depositAPY`.
   *
   * - `undefined` — 7d snapshot not loaded yet (`loading7DAgo: true`); supply
   *   row uses `depositAPY`.
   * - `null` — snapshot loaded but no numeric 7d supply; supply row uses
   *   `depositAPY` (`||` semantics, same as client `pool7DAgo` with missing
   *   `supplyAPY7DAgo`).
   * - `number` — explicit 7d supply; `0` falls back to `depositAPY` via `||`.
   */
  supplyAPY7DAgo?: number | null;
  poolAPY?: PoolFullAPY | null;
}

/**
 * Computes the 7-days-ago APY snapshot for a pool.
 *
 * `supplyAPY7DAgo` replaces the current deposit APY in the base component;
 * extra & external APY are kept from the "current" calculation.
 */
export function calculatePoolFullAPY7DAgo({
  supplyAPY7DAgo,
  depositAPY,
  poolAPY,
}: CalculatePoolFullAPY7DAgoProps): PoolFullAPY7DAgo {
  const {
    baseAPY = [],
    extraAPYTotal = 0,
    extraAPY = [],
    externalAPY,
  } = poolAPY ?? {};

  const base: PoolBaseAPY[] = [
    { apy: supplyAPY7DAgo || depositAPY, type: "supplyAPY" },
    ...baseAPY.filter(r => r.type !== "supplyAPY"),
  ];

  const baseTotal = base.reduce((acc, r) => acc + r.apy, 0);
  const total = baseTotal + extraAPYTotal;

  return {
    totalAPY: total,
    extraAPYTotal,
    baseAPY: base,
    extraAPY,
    externalAPY,
    loading7DAgo: supplyAPY7DAgo === undefined,
  };
}

// ---------------------------------------------------------------------------
// calculatePoolPoints
// ---------------------------------------------------------------------------

interface CalculatePoolPointsProps {
  poolTokenSymbol: string | undefined;
  points: PoolPointsBase[Address] | undefined;
  tokensList: AddressMap<{ decimals: number }>;
}

/**
 * Transforms raw `PoolPointsBase` entries into consumer-friendly
 * `PoolPointsWithTips` items with formatted amounts and tooltip strings.
 */
export function calculatePoolPoints({
  poolTokenSymbol,
  points,
  tokensList,
}: CalculatePoolPointsProps): PoolPointsWithTips[] | undefined {
  return points?.map(({ info, points: pts }): PoolPointsWithTips => {
    const { decimals = 18 } = tokensList.get(info.token) || {};
    const amount = formatBN(pts, decimals);

    const { name = "Points", duration } = info ?? {};

    return {
      reward: info,
      name,
      amount,
      tokenTitle: poolTokenSymbol,
      fullTip: [
        `${amount} ${name}`,
        ...(duration ? [duration] : []),
        ...(poolTokenSymbol ? [poolTokenSymbol] : []),
      ].join(" per "),
    };
  });
}
