import type { Address, PublicClient } from "viem";
import { iPriceFeedAbi } from "../../../abi/iPriceFeed.js";
import { fixedRateWindowPriceFeedAbi } from "../../../onchain/abi/index.js";
import {
  bytes32ToString,
  createRawTx,
  PERCENTAGE_FACTOR,
  type PriceFeedTreeNode,
  type RawTx,
  SECONDS_PER_YEAR,
  simulateMulticall,
} from "../../../onchain/index.js";
import { nextLowerBound } from "./nextLowerBound.js";

const FIXED_RATE_WINDOW = "PRICE_FEED::FIXED_RATE_WINDOW";

/**
 * Minimum span the realized rate is measured over. A feed whose underlying
 * may go longer than this without printing is measured over its staleness
 * period instead, so that the span still holds several prints.
 **/
const MIN_RATE_LOOKBACK = 30 * 24 * 60 * 60;

/**
 * How far, in percent of the current rate, the realized rate has to differ
 * before the rate is reset along with the bounds.
 **/
const RATE_DEVIATION_PERCENT = 10;

/** A fixed-rate window feed found in a feed tree, with its on-chain name. */
export interface FixedRateWindowFeed {
  address: Address;
  description: string;
}

/**
 * The rate `feed`'s price realized over at least `lookbackSeconds`, as a
 * simple annual decimal fraction, or `null` when its history does not
 * qualify for one.
 **/
export type RealizedRateSource = (
  feed: Address,
  lookbackSeconds: number,
) => Promise<number | null>;

/** Chain state every fixed-rate window feed of one batch is read against. */
export interface RateWindowContext {
  blockNumber: bigint;
  /** Timestamp of {@link blockNumber}. */
  now: bigint;
  realizedRate: RealizedRateSource;
}

/** Of the feed tree nodes, the ones that are fixed-rate window feeds. */
export function getFixedRateWindowFeeds(
  trees: PriceFeedTreeNode[],
): FixedRateWindowFeed[] {
  const feeds = new Map<Address, string>();
  for (const node of trees) {
    if (bytes32ToString(node.baseParams.contractType) === FIXED_RATE_WINDOW) {
      feeds.set(
        node.baseParams.addr.toLowerCase() as Address,
        node.description,
      );
    }
  }
  return Array.from(feeds, ([address, description]) => ({
    address,
    description,
  }));
}

/** Pins the batch to the latest block. */
export async function rateWindowContext(
  client: PublicClient,
  realizedRate: RealizedRateSource,
): Promise<RateWindowContext> {
  const block = await client.getBlock();
  return {
    blockNumber: block.number,
    now: block.timestamp,
    realizedRate,
  };
}

/**
 * Moves a fixed-rate window feed's lower bound back under its underlying
 * price, by the same rule LP feeds follow. When the bound moves, the growth
 * rate is reset too if the rate the price realized differs from it by more
 * than {@link RATE_DEVIATION_PERCENT}. Returns nothing when the bound still
 * fits.
 *
 * The realized rate is measured on the window feed's own history rather than
 * the underlying's: only the store's feeds are indexed, which the underlying
 * usually is not, and inside the window the two prices are the same.
 **/
export async function updateRateAndBounds(
  client: PublicClient,
  address: Address,
  context: RateWindowContext,
): Promise<RawTx[]> {
  const { results } = await simulateMulticall(client, {
    contracts: [
      { address, abi: fixedRateWindowPriceFeedAbi, functionName: "priceFeed" },
      {
        address,
        abi: fixedRateWindowPriceFeedAbi,
        functionName: "stalenessPeriod",
      },
      { address, abi: fixedRateWindowPriceFeedAbi, functionName: "growthRate" },
      {
        address,
        abi: fixedRateWindowPriceFeedAbi,
        functionName: "lowerBoundBase",
      },
      {
        address,
        abi: fixedRateWindowPriceFeedAbi,
        functionName: "timestampLU",
      },
      {
        address,
        abi: fixedRateWindowPriceFeedAbi,
        functionName: "maxGrowthRate",
      },
    ],
    allowFailure: false,
    blockNumber: context.blockNumber,
  });
  const [
    underlying,
    stalenessPeriod,
    growthRate,
    lowerBoundBase,
    timestampLU,
    maxGrowthRate,
  ] = results;

  const [, value] = await client.readContract({
    abi: iPriceFeedAbi,
    address: underlying,
    functionName: "latestRoundData",
    blockNumber: context.blockNumber,
  });
  const next = nextLowerBound(
    value,
    currentLowerBound(lowerBoundBase, growthRate, timestampLU, context.now),
  );
  if (!next) {
    return [];
  }

  let rate = growthRate;
  let rateNote: string;
  try {
    const realized = await context.realizedRate(
      address,
      Math.max(MIN_RATE_LOOKBACK, stalenessPeriod),
    );
    if (realized === null) {
      rateNote = "realized rate unavailable, rate kept";
    } else {
      const realizedBps = Math.round(realized * Number(PERCENTAGE_FACTOR));
      rate = nextRate(growthRate, realizedBps, maxGrowthRate);
      rateNote = `realized rate: ${realizedBps} bps`;
    }
  } catch (error) {
    rateNote = `realized rate unavailable (${
      error instanceof Error ? error.message : String(error)
    }), rate kept`;
  }

  return [
    createRawTx(
      address,
      {
        abi: fixedRateWindowPriceFeedAbi,
        functionName: "setRateAndBounds",
        args: [rate, next.lowerBound],
      },
      `[${address}].setRateAndBounds(${rate}, ${next.lowerBound}); // deviationFromValue: ${(
        100 * next.deviationFromValue
      ).toFixed(2)}%, ${rateNote}`,
    ),
  ];
}

/** The lower bound the feed enforces at `now`, grown the way the contract grows it. */
function currentLowerBound(
  lowerBoundBase: bigint,
  growthRate: number,
  timestampLU: bigint,
  now: bigint,
): bigint {
  const growth =
    (BigInt(growthRate) * (now - timestampLU)) / BigInt(SECONDS_PER_YEAR);
  return (lowerBoundBase * (PERCENTAGE_FACTOR + growth)) / PERCENTAGE_FACTOR;
}

/**
 * The realized rate, clamped into what the feed accepts, when it differs from
 * the current one by more than {@link RATE_DEVIATION_PERCENT}; the current
 * rate otherwise.
 **/
function nextRate(current: number, realized: number, max: number): number {
  const candidate = Math.min(Math.max(realized, 0), max);
  return Math.abs(candidate - current) * 100 > current * RATE_DEVIATION_PERCENT
    ? candidate
    : current;
}
