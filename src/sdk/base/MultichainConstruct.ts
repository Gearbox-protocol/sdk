import type { NetworkType } from "../chain/chains.js";
import { ChainNotConfiguredError } from "../core/errors.js";
import type { MultichainSDK } from "../MultichainSDK.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { PluginsMap } from "../plugins/index.js";
import type {
  MultichainNetworkMeta,
  MultichainResult,
} from "../types/index.js";

/**
 * Describes a request that is sent to every queried chain.
 *
 * @typeParam T - Payload returned by a single chain.
 * @typeParam Plugins - Map of attached plugin types.
 **/
export interface ChainQueryProps<T, Plugins extends PluginsMap = {}> {
  /**
   * Networks to query. All configured chains when omitted.
   **/
  networks?: NetworkType[];
  /**
   * Action description used in warnings, e.g. `"get liquidatable accounts"`.
   **/
  label: string;
  /**
   * Request sent to a single chain.
   **/
  run: (sdk: OnchainSDK<Plugins>) => Promise<T>;
}

/**
 * Per-chain payloads of the chains that responded successfully, plus the
 * outcome of every queried chain.
 **/
interface SettledChains<T> {
  values: T[];
  meta: MultichainNetworkMeta[];
}

/**
 * @internal
 * Base class for services that fan out over the chains of a
 * {@link MultichainSDK}, the cross-chain counterpart of {@link SDKConstruct}.
 *
 * Requests are soft-failing: a chain that rejects (including a chain that is
 * not configured in the SDK) is logged as a warning and contributes no payload,
 * while the remaining chains still return their results. Every queried chain is
 * reported in {@link MultichainResult.meta}.
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
  ): Promise<MultichainResult<T[]>> {
    const { values, meta } = await this.#settle(props);
    return { result: values.flat(), meta };
  }

  /**
   * Fans out a request with no payload, reporting the outcome of every queried
   * chain in {@link MultichainResult.meta}.
   **/
  protected async runChains(
    props: ChainQueryProps<void, Plugins>,
  ): Promise<MultichainResult<void>> {
    const { meta } = await this.#settle(props);
    return { result: undefined, meta };
  }

  /**
   * Runs the request on all queried chains in parallel. Duplicate networks are
   * queried once, and {@link SettledChains.meta} follows the requested order.
   **/
  async #settle<T>({
    networks,
    label,
    run,
  }: ChainQueryProps<T, Plugins>): Promise<SettledChains<T>> {
    const requested = networks
      ? [...new Set(networks)]
      : [...this.sdk.chains.keys()];

    const settled = await Promise.allSettled(
      requested.map(async network => {
        const chainSdk = this.sdk.chains.get(network);
        if (!chainSdk) {
          throw new ChainNotConfiguredError(network);
        }
        return run(chainSdk);
      }),
    );

    const values: T[] = [];
    const meta: MultichainNetworkMeta[] = [];
    settled.forEach((result, i) => {
      const network = requested[i];
      if (result.status === "fulfilled") {
        values.push(result.value);
        meta.push({ network, status: "success" });
        return;
      }
      const logger = this.sdk.chains.get(network)?.logger ?? this.sdk.logger;
      logger?.warn(result.reason, `failed to ${label} on ${network}`);
      meta.push({ network, status: "error", error: result.reason });
    });
    return { values, meta };
  }
}
