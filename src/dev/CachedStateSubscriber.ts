import type {
  GearboxSDK,
  GearboxState,
  ILogger,
  PluginsMap,
} from "../sdk/index.js";
import { json_parse } from "../sdk/index.js";

export interface CachedStateSubscriberOptions {
  /**
   * Polling interval in milliseconds
   */
  pollInterval?: number;
  /**
   * Callback to be called when state changes
   */
  onChange?: (blockNumber: bigint) => void;
}

export class CachedStateSubscriber<const Plugins extends PluginsMap = {}> {
  #stateURL: string;
  #etag?: string;
  #currentBlock?: bigint;
  #sdk: GearboxSDK<Plugins>;

  constructor(sdk: GearboxSDK<Plugins>, stateURL: string) {
    this.#stateURL = stateURL;
    this.#sdk = sdk;
  }

  /**
   * Subscribe to sdk state changes
   * @param opts - Options
   * @returns Unsubscribe function
   */
  public subscribe(opts?: CachedStateSubscriberOptions): () => void {
    const intervalMs = opts?.pollInterval ?? 10 * 60 * 1000;

    const interval = setInterval(async () => {
      const newBlock = await this.#poll();
      if (newBlock && opts?.onChange) {
        opts.onChange(newBlock);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }

  async #poll(): Promise<bigint | undefined> {
    try {
      const head = await fetch(this.#stateURL, { method: "HEAD" });
      const etag = head.headers.get("ETag");

      if (!etag || etag === this.#etag) {
        // this.#logger?.debug(`etag ${etag} is the same as the previous one`);
        return;
      }

      // Download the full JSON only if ETag changed
      const response = await fetch(this.#stateURL);
      const txt = await response.text();
      const state = json_parse(txt) as GearboxState<Plugins>;
      if (state.currentBlock === this.#currentBlock) {
        // this.#logger?.debug(
        //   `state at block ${state.currentBlock} is the same as the previous one`,
        // );
        return;
      }

      // Update our tracking variables
      this.#etag = etag;
      this.#currentBlock = state.currentBlock;

      this.#logger?.debug(`rehydrating state at block ${state.currentBlock}`);
      this.#sdk.rehydrate(state);
      return state.currentBlock;
    } catch (e) {
      this.#logger?.error(e, "error while polling cached state");
    }
  }

  get #logger(): ILogger | undefined {
    return this.#sdk.logger;
  }
}
