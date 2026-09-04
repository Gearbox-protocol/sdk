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
  blockNumber: bigint;
  /**
   * Unix seconds of {@link blockNumber}.
   **/
  timestamp: bigint;
}

/**
 * Where the block a request is read at comes from: the SDK's loaded snapshot,
 * or a freshly fetched head.
 **/
export type ChainBlockSource = "state" | "latest";

/**
 * {@link ChainBlockSource}, or an explicit height. Only single-chain requests
 * accept a height.
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
   **/
  chainIds?: ChainId[];
  /**
   * Action description used in warnings, e.g. `"get liquidatable accounts"`.
   **/
  label: string;
  /**
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
 * What one chain of a fan-out returned, and the block it returned it from.
 **/
interface ChainRead<T> {
  data: T;
  at: ChainBlock;
}

/**
 * @internal
 * Base class for services that fan out over the chains of a
 * {@link MultichainSDK}, the cross-chain counterpart of {@link SDKConstruct}.
 *
 * A fan-out soft-fails: a chain that rejects is logged as a warning and
 * contributes no payload, while the remaining chains still return their rows.
 * A single-chain request throws instead.
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
   * Throws when the chain is not configured, not attached, or rejects the read.
   **/
  protected async queryChain<T>({
    network,
    block = "state",
    run,
  }: ChainQueryOneProps<T, Plugins>): Promise<DataResponse<T>> {
    const sdk = this.sdk.chain(network);
    const at = await this.#resolveBlock(sdk, block);
    const data = await run(sdk, at);
    return { data, meta: { chains: [succeeded(sdk.chainId, at)] } };
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
    // naming a chain narrows the fan-out, it does not extend it: an id this SDK
    // has no chain for is dropped, and a chain named twice is queried once
    const wanted = chainIds && new Set(chainIds);
    const requested: [NetworkType, OnchainSDK<Plugins>][] = [];
    for (const [network, sdk] of this.sdk.chains) {
      if (!wanted || wanted.has(sdk.chainId)) {
        requested.push([network, sdk]);
      }
    }

    const settled = await Promise.allSettled(
      requested.map(async ([, sdk]): Promise<ChainRead<T>> => {
        // resolved before the read so that one block both pins it and is what
        // its metadata reports
        const at = await this.#resolveBlock(sdk, block);
        return { data: await run(sdk, at), at };
      }),
    );

    const values: T[] = [];
    const chains: ChainMetadata[] = [];
    for (let i = 0; i < settled.length; i++) {
      const [network, sdk] = requested[i];
      const result = settled[i];
      if (result.status === "fulfilled") {
        values.push(result.value.data);
        chains.push(succeeded(sdk.chainId, result.value.at));
        continue;
      }
      const logger = sdk.logger ?? this.sdk.logger;
      logger?.warn(result.reason, `failed to ${label} on ${network}`);
      chains.push({
        chainId: sdk.chainId,
        status: "error",
        source: "onchain",
        error: result.reason,
      });
    }
    return { values, chains };
  }

  /**
   * Block a chain's read is pinned to and reported at.
   **/
  async #resolveBlock(
    sdk: OnchainSDK<Plugins>,
    source: ChainBlockPin,
  ): Promise<ChainBlock> {
    // a chain that is not attached throws here, which is the same error the
    // read itself would raise, and is reported as that chain's failure
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
