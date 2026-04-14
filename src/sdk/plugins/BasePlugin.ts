import type { Address, PublicClient } from "viem";

import type { NetworkType } from "../chain/index.js";
import { SdkAlreadyAttachedError, SdkNotAttachedError } from "../core/index.js";
import type { ILogger } from "../index.js";
import type { OnchainSDK } from "../OnchainSDK.js";

/**
 * Convenience base class for {@link IOnchainSDKPlugin} implementations.
 *
 * Handles the SDK attachment lifecycle, logger setup, and provides
 * common accessors (`network`, `client`). Subclasses only need to
 * implement {@link load} to supply their domain-specific state.
 *
 * @typeParam TState - Plugin-specific state shape.
 **/
export abstract class BasePlugin<
  TState extends Record<keyof TState, unknown> = {},
> {
  #sdk?: OnchainSDK<any>;

  protected logger?: ILogger;

  /**
   * Plugin state version for hydration compatibility checks.
   * @default 1
   **/
  public readonly version: number = 1;

  /**
   * When `true`, state is fetched eagerly during the `attach` phase
   * rather than waiting for an explicit `load` call.
   **/
  public readonly loadOnAttach: boolean;

  constructor(loadOnAttach = false) {
    this.loadOnAttach = loadOnAttach;
  }

  /**
   * Reference to the parent SDK instance.
   * @throws Error if the SDK has not been attached yet.
   **/
  public get sdk(): OnchainSDK<any> {
    if (!this.#sdk) {
      throw new SdkNotAttachedError();
    }
    return this.#sdk;
  }

  /**
   * @internal
   * Set the SDK instance. Called by the SDK constructor.
   * @param sdk - The SDK instance.
   * @throws Error if the SDK is already attached.
   */
  public set sdk(sdk: OnchainSDK<any>) {
    if (this.#sdk) {
      throw new SdkAlreadyAttachedError();
    }
    this.#sdk = sdk;
    this.logger =
      sdk.logger?.child?.({ name: this.constructor.name }) ?? sdk.logger;
  }

  /**
   * {@inheritDoc IOnchainSDKPlugin.attach}
   **/
  public async attach(): Promise<void> {
    if (this.loadOnAttach) {
      await this.load(true);
    }
  }

  /**
   * {@inheritDoc IOnchainSDKPlugin.syncState}
   **/
  public async syncState(): Promise<void> {
    await this.load(false);
  }

  /**
   * Loads or refreshes the plugin state.
   *
   * @param force - When `true`, re-fetch even if state is already loaded.
   * @returns The loaded plugin state.
   **/
  abstract load(force?: boolean): Promise<TState>;

  /**
   * Network type of the connected chain (e.g. `"Mainnet"`, `"Arbitrum"`).
   **/
  public get network(): NetworkType {
    return this.sdk.networkType;
  }

  /**
   * Viem public client for read-only chain interactions.
   **/
  public get client(): PublicClient {
    return this.sdk.client;
  }

  protected labelAddress(address: Address): string {
    return this.sdk.labelAddress(address);
  }
}
