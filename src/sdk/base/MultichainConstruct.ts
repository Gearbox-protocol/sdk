import type {
  ChainId,
  ChainMetadata,
  DataResponse,
} from "../../model/index.js";
import type { NetworkType } from "../chain/chains.js";
import type { MultichainSDK } from "../MultichainSDK.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { PluginsMap } from "../plugins/index.js";

/**
 * Block one chain's data was read at, and is reported at.
 **/
export interface ChainBlock {
  /**
   * Block the read was pinned to.
   **/
  blockNumber: bigint;
  /**
   * Unix seconds of {@link blockNumber}.
   **/
  timestamp: bigint;
}

/**
 * Where the block a request is read at, and reported at, comes from.
 *
 * - `"state"` — the SDK's loaded snapshot ({@link OnchainSDK.currentBlock} and
 *   {@link OnchainSDK.timestamp}), no extra call. Correct only for reads that
 *   walk loaded state; a live read left on this default reports a stale block,
 *   and so biases a freshness merge towards the backend.
 * - `"latest"` — one `getBlock` per chain before the read, so a live read is
 *   pinned to a single known block and reports that block.
 **/
export type ChainBlockSource = "state" | "latest";

/**
 * {@link ChainBlockSource}, or an explicit height the caller already pinned the
 * read to. The height's timestamp is fetched so that metadata reports the block
 * the data actually reflects.
 *
 * Only single-chain requests accept a height: one number is not a shared moment
 * across the networks of a fan-out.
 **/
export type ChainBlockPin = ChainBlockSource | bigint;

/**
 * Describes a request that is sent to every queried chain.
 *
 * @typeParam T - Payload returned by a single chain.
 * @typeParam Plugins - Map of attached plugin types.
 **/
export interface ChainQueryProps<T, Plugins extends PluginsMap = {}> {
  /**
   * Chains to query. All configured chains when omitted.
   *
   * A chain this SDK is not configured for is dropped: naming it narrows the
   * read, it does not extend it. Callers who think in network labels convert
   * with {@link toChainIds}.
   **/
  chainIds?: ChainId[];
  /**
   * Action description used in warnings, e.g. `"get liquidatable accounts"`.
   **/
  label: string;
  /**
   * Where the reported block comes from, see {@link ChainBlockSource}.
   *
   * @defaultValue `"state"`
   **/
  block?: ChainBlockSource;
  /**
   * Request sent to a single chain, at the resolved block of that chain.
   **/
  run: (sdk: OnchainSDK<Plugins>, block: ChainBlock) => Promise<T>;
}

/**
 * Describes a request that is sent to exactly one chain.
 *
 * @typeParam T - Payload returned by the chain.
 * @typeParam Plugins - Map of attached plugin types.
 **/
export interface ChainQueryOneProps<T, Plugins extends PluginsMap = {}> {
  /**
   * Chain to query, as a network label or a chain id.
   **/
  network: NetworkType | ChainId;
  /**
   * {@inheritDoc ChainQueryProps.label}
   **/
  label: string;
  /**
   * Where the reported block comes from, see {@link ChainBlockPin}.
   *
   * @defaultValue `"state"`
   **/
  block?: ChainBlockPin;
  /**
   * Request sent to the chain, at its resolved block.
   **/
  run: (sdk: OnchainSDK<Plugins>, block: ChainBlock) => Promise<T>;
}

/**
 * Per-chain payloads of the chains that responded successfully, plus the
 * outcome of every queried chain.
 **/
interface SettledChains<T> {
  values: T[];
  chains: ChainMetadata[];
}

/**
 * One chain of a fan-out: the SDK that answers it, plus both ways it is named
 * — the key of {@link MultichainSDK.chains} and the id metadata reports.
 **/
interface RequestedChain<Plugins extends PluginsMap> {
  network: NetworkType;
  chainId: ChainId;
  sdk: OnchainSDK<Plugins>;
}

/**
 * @internal
 * Base class for services that fan out over the chains of a
 * {@link MultichainSDK}, the cross-chain counterpart of {@link SDKConstruct}.
 *
 * List requests are soft-failing: a chain that rejects is logged as a warning
 * and contributes no payload, while the remaining chains still return their
 * rows. Every queried chain is reported in `meta.chains`.
 *
 * Detail requests cannot do that — there is no partial stand-in for one entity
 * — so {@link MultichainConstruct.queryChain} wraps successes only and lets a
 * failure through to the caller.
 *
 * @typeParam Plugins - Map of attached plugin types.
 **/
export abstract class MultichainConstruct<
  const Plugins extends PluginsMap = {},
> {
  protected readonly sdk: MultichainSDK<Plugins>;

  constructor(sdk: MultichainSDK<Plugins>) {
    this.sdk = sdk;
  }

  /**
   * Fans out a request that returns a list, concatenating the lists of all
   * chains that responded successfully.
   **/
  protected async queryChains<T>(
    props: ChainQueryProps<T[], Plugins>,
  ): Promise<DataResponse<T[]>> {
    const { values, chains } = await this.#settle(props);
    return { data: values.flat(), meta: { chains } };
  }

  /**
   * Fans out a request with no payload, reporting the outcome of every queried
   * chain in `meta.chains`.
   **/
  protected async runChains(
    props: ChainQueryProps<void, Plugins>,
  ): Promise<DataResponse<void>> {
    const { chains } = await this.#settle(props);
    return { data: undefined, meta: { chains } };
  }

  /**
   * Runs a request against one chain and reports the block it was read at.
   *
   * Unlike {@link MultichainConstruct.queryChains} this does not soft-fail: an
   * unconfigured chain, one that is not attached, and a rejected read all throw,
   * because an entity the caller asked for by key has no empty stand-in. Only a
   * caller with a second source can turn that into metadata.
   **/
  protected async queryChain<T>({
    network,
    label,
    block = "state",
    run,
  }: ChainQueryOneProps<T, Plugins>): Promise<DataResponse<T>> {
    const chainSdk = this.sdk.chain(network);
    try {
      const at = await resolveBlock(chainSdk, block);
      const data = await run(chainSdk, at);
      return { data, meta: { chains: [succeeded(chainSdk.chainId, at)] } };
    } catch (error) {
      chainSdk.logger?.warn(error, `failed to ${label} on ${network}`);
      throw error;
    }
  }

  /**
   * Runs the request on every queried chain in parallel.
   **/
  async #settle<T>({
    chainIds,
    label,
    block = "state",
    run,
  }: ChainQueryProps<T, Plugins>): Promise<SettledChains<T>> {
    const requested = this.#requested(chainIds);

    const settled = await Promise.allSettled(
      requested.map(async ({ sdk }) => {
        // resolved before the read so that one block both pins it and is what
        // its metadata reports
        const at = await resolveBlock(sdk, block);
        return { value: await run(sdk, at), at };
      }),
    );

    const values: T[] = [];
    const chains: ChainMetadata[] = [];
    settled.forEach((result, i) => {
      const { network, chainId, sdk } = requested[i];
      if (result.status === "fulfilled") {
        values.push(result.value.value);
        chains.push(succeeded(chainId, result.value.at));
        return;
      }
      const logger = sdk.logger ?? this.sdk.logger;
      logger?.warn(result.reason, `failed to ${label} on ${network}`);
      chains.push({
        chainId,
        status: "error",
        source: "onchain",
        error: result.reason,
      });
    });
    return { values, chains };
  }

  /**
   * Chains one fan-out covers: those the SDK is configured for, narrowed by
   * the requested ids when there are any.
   *
   * A chain named twice is queried once, and one the SDK does not have is
   * dropped, see {@link ChainQueryProps.chainIds}.
   **/
  #requested(chainIds?: ChainId[]): RequestedChain<Plugins>[] {
    const wanted = chainIds && new Set(chainIds);
    return [...this.sdk.chains]
      .map(([network, sdk]) => ({ network, chainId: sdk.chainId, sdk }))
      .filter(({ chainId }) => !wanted || wanted.has(chainId));
  }
}

/**
 * Block a chain's read is pinned to and reported at.
 *
 * In `"state"` mode a chain that is not attached yet throws
 * {@link SdkNotAttachedError} here, which is the same error the read itself
 * would raise, and is reported as that chain's failure.
 **/
async function resolveBlock<Plugins extends PluginsMap>(
  sdk: OnchainSDK<Plugins>,
  source: ChainBlockPin,
): Promise<ChainBlock> {
  if (source === "state") {
    return { blockNumber: sdk.currentBlock, timestamp: sdk.timestamp };
  }
  if (typeof source === "bigint") {
    const block = await sdk.client.getBlock({ blockNumber: source });
    return { blockNumber: source, timestamp: block.timestamp };
  }
  const block = await sdk.client.getBlock({ blockTag: "latest" });
  return { blockNumber: block.number, timestamp: block.timestamp };
}

function succeeded(chainId: ChainId, at: ChainBlock): ChainMetadata {
  return {
    chainId,
    status: "success",
    source: "onchain",
    blockNumber: Number(at.blockNumber),
    timestamp: Number(at.timestamp),
  };
}
