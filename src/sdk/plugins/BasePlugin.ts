import type { Address, PublicClient } from "viem";

import type { NetworkType } from "../chain/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { ILogger } from "../index.js";

/**
 * Convenience base class for {@link IGearboxSDKPlugin} implementations.
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
  #sdk?: GearboxSDK<any>;

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
  public get sdk(): GearboxSDK<any> {
    if (!this.#sdk) {
      throw new Error("SDK is not attached");
    }
    return this.#sdk;
  }

  public set sdk(sdk: GearboxSDK<any>) {
    if (this.#sdk) {
      throw new Error("SDK is already attached");
    }
    this.#sdk = sdk;
    this.logger =
      sdk.logger?.child?.({ name: this.constructor.name }) ?? sdk.logger;
  }

  /**
   * {@inheritDoc IGearboxSDKPlugin.attach}
   **/
  public async attach(): Promise<void> {
    if (this.loadOnAttach) {
      await this.load(true);
    }
  }

  /**
   * {@inheritDoc IGearboxSDKPlugin.syncState}
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
