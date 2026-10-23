import type { Chain, PublicClient, Transport } from "viem";

/**
 * Actions whose results depend on the chain head and that therefore have to be
 * pinned to the SDK's source block for a coherent snapshot.
 **/
const PINNED_CALL_ACTIONS = [
  "readContract",
  "multicall",
  "call",
  "getCode",
  "getStorageAt",
  "getBalance",
  "getProof",
  "simulateContract",
  "estimateGas",
  "getBlock",
] as const;

type PinnedCallAction = (typeof PINNED_CALL_ACTIONS)[number];

function isPinnedCallAction(key: string | symbol): key is PinnedCallAction {
  return (
    typeof key === "string" &&
    (PINNED_CALL_ACTIONS as readonly string[]).includes(key)
  );
}

/**
 * A read client whose state-dependent calls default to `blockNumber`.
 *
 * The new SDK threads this client into every initial read, projection dependency
 * and transaction dependency so that a plan describes one block. Explicit
 * `blockNumber`/`blockTag` arguments still win, and the legacy helpers keep the
 * unpinned client they were always given.
 *
 * `getBlockNumber()` reports the pinned block, so helpers that stamp
 * provenance (e.g. `getTimelockTransactions`' `createdAtBlock`) record the
 * source block rather than whatever the chain head drifted to.
 **/
export function createPinnedReadClient<
  TClient extends PublicClient<Transport, Chain>,
>(client: TClient, blockNumber: bigint, chain?: Chain): TClient {
  return new Proxy(client, {
    get(target, key, receiver) {
      // A standard viem chain lacks Gearbox's `network` metadata. Supplying the
      // canonical Gearbox chain lets OnchainSDK reuse this exact client instead
      // of reconstructing one from a transport URL.
      if (key === "chain" && chain) return chain;
      if (key === "getBlockNumber") {
        return async () => blockNumber;
      }
      if (isPinnedCallAction(key)) {
        const action = Reflect.get(target, key, receiver);
        if (typeof action !== "function") return action;
        return (
          args: Record<string, unknown> | undefined,
          ...rest: unknown[]
        ) => {
          const callArgs = key === "getBlock" && args === undefined ? {} : args;
          if (
            callArgs &&
            typeof callArgs === "object" &&
            callArgs.blockNumber === undefined &&
            callArgs.blockTag === undefined &&
            callArgs.blockHash === undefined
          ) {
            return (action as (...a: unknown[]) => unknown).call(
              target,
              { ...callArgs, blockNumber },
              ...rest,
            );
          }
          return (action as (...a: unknown[]) => unknown).call(
            target,
            callArgs,
            ...rest,
          );
        };
      }
      return Reflect.get(target, key, receiver);
    },
  }) as TClient;
}
