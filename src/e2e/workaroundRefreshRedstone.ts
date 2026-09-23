import { type Address, pad, toHex } from "viem";

import type { AnvilClient } from "../dev/createAnvilClient.js";
import {
  type NetworkType,
  OnchainSDK,
  type RedstonePriceFeedContract,
} from "../onchain/index.js";
import { ANVIL_URL } from "./constants.js";

export interface WorkaroundRefreshRedstoneOptions {
  client: AnvilClient;
  network: NetworkType;
  block: bigint;
}

/**
 * Fixtures recorded while the SDK still pushed Redstone updates. A full attach
 * fits their RPC caches. Other fixtures (for example create-market-sync) were
 * recorded for one market configurator and have no Redstone feeds to refresh;
 * attaching everything there misses the cache.
 */
const STALE_REDSTONE_BLOCKS = new Set([24_728_000n, 24_736_900n]);

const SLOT = toHex(1);
/** Low 16 bytes of slot 1. */
const PRICE_MASK = (1n << 128n) - 1n;
/** The 5 bytes packed above `lastPrice`. */
const TIMESTAMP_MASK = (1n << 40n) - 1n;

/**
 * TEMPORARY WORKAROUND, to be deleted once the e2e fixtures are regenerated.
 *
 * The SDK no longer pushes Redstone price updates, but the pinned e2e fixtures
 * (block 24_728_000) still price some collaterals through Redstone pull feeds
 * that are days stale at that block. Without this, collateral is unpriced and
 * opens revert or simulate as insufficientCollateral.
 *
 * Only blocks 24_728_000 and 24_736_900 are patched. Their caches cover a full
 * attach; narrower fixtures are left unchanged.
 *
 * Regenerate the fixtures at a block where the tested markets have no Redstone
 * feeds, then delete this file and its call in useFixture.
 */
export async function workaroundRefreshRedstone(
  options: WorkaroundRefreshRedstoneOptions,
): Promise<void> {
  const { client, network, block } = options;
  if (!STALE_REDSTONE_BLOCKS.has(block)) {
    return;
  }

  const sdk = new OnchainSDK(network, {
    rpcURLs: [ANVIL_URL],
    timeout: 120_000,
  });
  await sdk.attach({
    blockNumber: block,
    ignoreUpdateablePrices: true,
  });

  const feeds = sdk.priceFeeds.feeds.filter(
    (feed): feed is RedstonePriceFeedContract =>
      feed.contractType === "PRICE_FEED::REDSTONE",
  );
  if (feeds.length === 0) {
    console.log(
      `[workaroundRefreshRedstone] no Redstone price feeds at block ${block}`,
    );
    return;
  }

  const { timestamp } = await client.getBlock({ blockNumber: block });

  for (const feed of feeds) {
    const slot = await readSlot(client, feed.address);
    assertSlotLayout(feed, slot);
    const value = feed.lastPrice | (timestamp << 128n);
    // Anvil matches setStorageAt addresses case-sensitively against the
    // lower-case form.
    await client.setStorageAt({
      address: feed.address.toLowerCase() as Address,
      index: SLOT,
      value: pad(toHex(value), { size: 32 }),
    });
  }

  console.log(
    `[workaroundRefreshRedstone] refreshed ${feeds.length} Redstone price feeds at block ${block}`,
  );
}

async function readSlot(
  client: AnvilClient,
  address: Address,
): Promise<bigint> {
  const raw = await client.getStorageAt({ address, slot: SLOT });
  if (!raw) {
    throw new Error(
      `Redstone feed ${address}: slot 1 is empty. The storage layout assumption is broken.`,
    );
  }
  return BigInt(raw);
}

function assertSlotLayout(feed: RedstonePriceFeedContract, slot: bigint): void {
  const price = slot & PRICE_MASK;
  const updatedAt = (slot >> 128n) & TIMESTAMP_MASK;
  if (
    price !== feed.lastPrice ||
    updatedAt !== BigInt(feed.lastPayloadTimestamp)
  ) {
    throw new Error(
      `Redstone feed ${feed.address}: slot 1 does not hold lastPrice and lastPayloadTimestamp. The storage layout assumption is broken.`,
    );
  }
}
