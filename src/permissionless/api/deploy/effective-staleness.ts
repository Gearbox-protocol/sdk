import { type Address, type PublicClient, parseAbi } from "viem";

const abi = parseAbi([
  "function stalenessPeriod() view returns (uint32)",
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
]);

/**
 * Bound for a leg that recomputes its answer on every read and stamps it with
 * the current block (exchange-rate adapters, NAV feeds, Pendle oracles,
 * constant feeds). One second is the tightest value that still satisfies
 * `block.timestamp < updatedAt + stalenessPeriod`.
 **/
const CURRENT_BLOCK_STALENESS = 1;

/**
 * The staleness a deployed price feed enforces on the price it reports.
 *
 * This is deliberately not the value the feed is registered with in the
 * PriceFeedStore — derived feeds must be registered with 0 there, and the store
 * rejects anything else for them with `IncorrectParameterException()`. It is
 * the value a parent feed needs when it re-checks the leg's `updatedAt`
 * itself.
 *
 * Returns `null` when it cannot be determined. Callers must surface that
 * rather than substitute a bound: a leg constructed with a staleness its
 * underlying oracle can never satisfy produces a feed that reverts on every
 * read and can never be added to the store.
 **/
export async function deriveEffectiveStalenessPeriod(
  client: PublicClient,
  address: Address,
): Promise<number | null> {
  // Wrappers that carry an explicit bound (BOUNDED and friends) expose it, and
  // because they pass their underlying's timestamp through unchanged it is also
  // the correct bound for their own output.
  try {
    const own = await client.readContract({
      address,
      abi,
      functionName: "stalenessPeriod",
    });
    if (Number(own) > 0) {
      return Number(own);
    }
  } catch {
    // no such getter - fall through to the timestamp probe
  }

  // Otherwise the feed either stamps the current block, or passes through an
  // oracle timestamp we cannot attribute to a heartbeat.
  try {
    const [block, round] = await Promise.all([
      client.getBlock(),
      client.readContract({ address, abi, functionName: "latestRoundData" }),
    ]);
    const updatedAt = Number(round[3]);
    if (updatedAt > 0 && updatedAt >= Number(block.timestamp)) {
      return CURRENT_BLOCK_STALENESS;
    }
  } catch {
    // feed does not read right now - nothing to derive
  }

  return null;
}
