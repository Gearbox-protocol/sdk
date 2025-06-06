import type { Address } from "viem";

import { iPeripheryCompressorAbi } from "../../abi/compressors.js";
import type { IGearboxSDKPlugin } from "../../sdk/index.js";
import {
  AddressMap,
  AP_PERIPHERY_COMPRESSOR,
  BasePlugin,
  isV300,
  isV310,
  TypedObjectUtils,
  VERSION_RANGE_310,
} from "../../sdk/index.js";
import { PartialLiquidationBotV300Contract } from "./PartialLiquidationBotV300Contract.js";
import { PartialLiquidationBotV310Contract } from "./PartialLiquidationBotV310Contract.js";
import {
  BOT_TYPES,
  type BotsPluginState,
  type BotsPluginStateHuman,
  type BotState,
} from "./types.js";

export class UnsupportedBotVersionError extends Error {
  public readonly state: BotState;

  constructor(state: BotState) {
    super(
      `unsupported bot version ${state.baseParams.version} for bot at ${state.baseParams.addr}`,
    );
    this.state = state;
  }
}

export type PartialLiquidationBotContract =
  | PartialLiquidationBotV300Contract
  | PartialLiquidationBotV310Contract;

export class BotsPlugin
  extends BasePlugin<BotsPluginState>
  implements IGearboxSDKPlugin<BotsPluginState>
{
  #botsByMarket?: AddressMap<PartialLiquidationBotContract[]>;

  public get loaded(): boolean {
    return !!this.#botsByMarket;
  }

  public async load(force?: boolean): Promise<BotsPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }

    this.#botsByMarket = new AddressMap();
    const [pcAddr] = this.sdk.addressProvider.mustGetLatest(
      AP_PERIPHERY_COMPRESSOR,
      VERSION_RANGE_310,
    );
    this.logger?.debug(`loading bots with periphery compressor ${pcAddr}`);
    const mcs = this.sdk.marketRegister.marketConfigurators.map(
      mc => mc.address,
    );

    const botsData = await this.client.multicall({
      contracts: mcs.map(
        mc =>
          ({
            address: pcAddr,
            abi: iPeripheryCompressorAbi,
            functionName: "getBots",
            args: [mc],
          }) as const,
      ),
      allowFailure: false,
    });
    for (let i = 0; i < mcs.length; i++) {
      const mc = mcs[i];
      const marketBotData = botsData[i];
      this.#loadStateMarketState(mc, marketBotData);
    }
    return this.state;
  }

  #loadStateMarketState(mc: Address, state: readonly BotState[]): void {
    // for v300, assume that each market configurator has exactly 4 bots
    // sort them by minHealthFactor and assign type based on index
    const bots = state
      .map(state => this.#createBot(mc, state))
      .sort((a, b) => a.minHealthFactor - b.minHealthFactor);
    if (bots.length && isV300(Number(bots[0].version))) {
      if (bots.length !== 4) {
        throw new Error(`expected 4 bots v300 for market configurator ${mc}`);
      }
      for (let i = 0; i < bots.length; i++) {
        (bots[i] as PartialLiquidationBotV300Contract).botType = BOT_TYPES[i];
      }
    }
    this.botsByMarket.upsert(mc, bots);
  }

  public stateHuman(raw?: boolean): BotsPluginStateHuman {
    return {
      bots: Object.fromEntries(
        this.botsByMarket
          .entries()
          .map(([mc, bots]) => [
            this.labelAddress(mc),
            bots.map(b => b.stateHuman(raw)),
          ]),
      ),
    };
  }

  public get botsByMarket(): AddressMap<PartialLiquidationBotContract[]> {
    if (!this.#botsByMarket) {
      throw new Error("bots plugin not loaded");
    }
    return this.#botsByMarket;
  }

  public botsByMarketConfigurator(
    mc: Address,
  ): PartialLiquidationBotContract[] {
    return this.botsByMarket.get(mc) ?? [];
  }

  public get allBots(): PartialLiquidationBotContract[] {
    return this.botsByMarket.values().flat();
  }

  public get state(): BotsPluginState {
    return {
      bots: TypedObjectUtils.fromEntries(
        this.botsByMarket
          .entries()
          .map(([mc, bots]) => [mc, bots.map(b => b.state)]),
      ),
    };
  }

  public hydrate(state: BotsPluginState): void {
    this.#botsByMarket = new AddressMap();
    for (const [mc, botStates] of TypedObjectUtils.entries(state.bots)) {
      this.#loadStateMarketState(mc, botStates);
    }
  }

  #createBot(
    marketConfigurator: Address,
    data: BotState,
  ): PartialLiquidationBotContract {
    const v = Number(data.baseParams.version);
    if (isV300(v)) {
      return new PartialLiquidationBotV300Contract(
        this.sdk,
        data,
        marketConfigurator,
      );
    } else if (isV310(v)) {
      return new PartialLiquidationBotV310Contract(
        this.sdk,
        data,
        marketConfigurator,
      );
    } else {
      throw new Error(`unsupported bot version: ${v}`);
    }
  }
}
