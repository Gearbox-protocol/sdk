import { describe, expect, it } from "vitest";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import type { GipMarketAction } from "../actions/types.js";
import {
  CONFIGURATOR,
  createStubClient,
  FEED_USDC,
  FEED_WETH,
  marketState,
  SOURCE_TIMESTAMP,
  USDC,
  WETH,
} from "../testing/sdkHarness.js";
import { MarketExecutor } from "./MarketExecutor.js";

const setReserveFeed = (token: `0x${string}`, priceFeed: `0x${string}`) =>
  ({
    type: "ORACLE::setReservePriceFeed",
    params: { token, priceFeed },
  }) as GipMarketAction;

/** An executor on a stub chain whose reads take a moment, and how many overlap. **/
function setup(checkActions: boolean) {
  let inFlight = 0;
  let maxInFlight = 0;
  let reads = 0;
  const base = createStubClient();
  const delayed =
    <A extends unknown[], R>(f: (...args: A) => Promise<R>) =>
    async (...args: A): Promise<R> => {
      reads++;
      maxInFlight = Math.max(maxInFlight, ++inFlight);
      await new Promise(resolve => setTimeout(resolve, 5));
      try {
        return await f(...args);
      } finally {
        inFlight--;
      }
    };
  const client = createStubClient({
    client: {
      readContract: delayed(base.readContract),
      getCode: delayed(async () => "0x60"),
    },
  });
  const executor = new MarketExecutor(
    {
      client,
      marketConfigurator: new MarketConfiguratorContract(CONFIGURATOR, client),
      tokens: { decimals: () => 6 },
    },
    { timestamp: SOURCE_TIMESTAMP, checkActions },
  );
  return {
    executor,
    stats: () => ({ reads, maxInFlight }),
  };
}

const actions = [
  setReserveFeed(WETH, FEED_WETH),
  setReserveFeed(USDC, FEED_USDC),
  setReserveFeed(WETH, FEED_USDC),
];

describe("resolve scheduling", () => {
  it("reads nothing an unchecked replay would only check, and encodes the same calls", async () => {
    const unchecked = setup(false);
    const replay = await unchecked.executor.execute(marketState(), actions);
    expect(unchecked.stats().reads).toBe(0);

    const checked = setup(true);
    const preview = await checked.executor.execute(marketState(), [actions[0]]);
    expect(checked.stats().reads).toBeGreaterThan(0);
    expect(replay.txs[0].tx).toEqual(preview.txs[0].tx);
  });

  it("starts the reads of every action at once", async () => {
    const { executor, stats } = setup(true);
    await executor.execute(marketState(), actions);
    // @dev one price feed check reads six things at once; three overlap
    expect(stats().maxInFlight).toBeGreaterThan(6);
  });
});
