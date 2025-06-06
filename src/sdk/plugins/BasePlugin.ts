import type { Address, PublicClient } from "viem";

import type { NetworkType, Provider } from "../chain/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { ILogger } from "../index.js";

export abstract class BasePlugin<
  TState extends Record<keyof TState, unknown> = {},
> {
  #sdk?: GearboxSDK<any>;

  protected logger?: ILogger;

  public readonly version: number = 1;
  public readonly loadOnAttach: boolean;

  constructor(loadOnAttach = false) {
    this.loadOnAttach = loadOnAttach;
  }

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

  public async attach(): Promise<void> {
    if (this.loadOnAttach) {
      await this.load(true);
    }
  }

  public async syncState(): Promise<void> {
    await this.load(false);
  }

  abstract load(force?: boolean): Promise<TState>;

  public get provider(): Provider {
    return this.sdk.provider;
  }

  public get network(): NetworkType {
    return this.provider.networkType;
  }

  public get client(): PublicClient {
    return this.provider.publicClient;
  }

  protected labelAddress(address: Address): string {
    return this.provider.addressLabels.get(address);
  }
}
