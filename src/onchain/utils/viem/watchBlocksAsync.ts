import type { Chain, Client, Transport } from "viem";
import { type GetBlockReturnType, getBlock } from "viem/actions";
import { getAction } from "viem/utils";

type Block<chain extends Chain | undefined = Chain> = GetBlockReturnType<chain>;

/**
 * Parameters for {@link watchBlocksAsync}.
 *
 * @typeParam chain - The chain type, derived from the client.
 */
export interface WatchBlocksAsyncParameters<
  chain extends Chain | undefined = Chain,
> {
  /**
   * Async callback invoked when a new block is received.
   * If the handler is still running when the next block arrives, the new block
   * is silently dropped and {@link WatchBlocksAsyncParameters.onDrop | onDrop}
   * is called instead.
   */
  onBlock: (
    block: Block<chain>,
    prevBlock: Block<chain> | undefined,
  ) => Promise<void>;
  /** Callback invoked when `getBlock` or `onBlock` throws. */
  onError?: ((error: Error) => void) | undefined;
  /**
   * Synchronous callback invoked when a new block is dropped because the
   * previous {@link WatchBlocksAsyncParameters.onBlock | onBlock} handler has
   * not yet resolved.
   */
  onDrop?: ((block: Block<chain>) => void) | undefined;
  /**
   * Polling frequency in milliseconds.
   * @defaultValue `client.pollingInterval`
   */
  pollingInterval?: number | undefined;
}

/** Unwatch function returned by {@link watchBlocksAsync}. */
export type WatchBlocksAsyncReturnType = () => void;

/**
 * Polls for new blocks over HTTP and invokes an **async** `onBlock` handler.
 *
 * Unlike viem's built-in `watchBlocks`, the handler is awaited. If a new block
 * arrives while the previous handler is still running, the block is silently
 * dropped and the optional `onDrop` callback is invoked synchronously.
 *
 * Only HTTP transports are supported (no WebSocket / IPC).
 *
 * @param client - A viem {@link Client} configured with an HTTP transport.
 * @param parameters - {@link WatchBlocksAsyncParameters}
 * @returns A function that stops polling when called. {@link WatchBlocksAsyncReturnType}
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from "viem";
 * import { mainnet } from "viem/chains";
 * import { watchBlocksAsync } from "./watchBlocksAsync.js";
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * });
 *
 * const unwatch = watchBlocksAsync(client, {
 *   onBlock: async (block, prevBlock) => {
 *     console.log("new block", block.number);
 *   },
 *   onDrop: (block) => {
 *     console.log("dropped block", block.number);
 *   },
 *   onError: (err) => {
 *     console.error(err);
 *   },
 * });
 *
 * // later
 * unwatch();
 * ```
 */
export function watchBlocksAsync<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: WatchBlocksAsyncParameters<chain>,
): WatchBlocksAsyncReturnType {
  const {
    onBlock,
    onError,
    onDrop,
    pollingInterval = client.pollingInterval,
  } = parameters;

  let active = true;
  let busy = false;
  let prevBlock: Block<chain> | undefined;

  const poll = async () => {
    if (!active) return;

    let block: Block<chain>;
    try {
      block = (await getAction(
        client,
        getBlock,
        "getBlock",
      )({})) as Block<chain>;
    } catch (err) {
      onError?.(err as Error);
      return;
    }

    if (!active) return;

    if (
      block.number !== null &&
      prevBlock?.number != null &&
      block.number <= prevBlock.number
    ) {
      return;
    }

    if (busy) {
      onDrop?.(block);
      return;
    }

    busy = true;
    try {
      await onBlock(block, prevBlock);
      prevBlock = block;
    } catch (err) {
      onError?.(err as Error);
    } finally {
      busy = false;
    }
  };

  const timer = setInterval(poll, pollingInterval);

  return () => {
    active = false;
    clearInterval(timer);
  };
}
