import type { Address } from "viem";

import { iPeripheryCompressorAbi } from "../abi/compressors.js";
import type { GearboxSDK, IGearboxSDKPlugin, ILogger } from "../sdk/index.js";
import {
  AddressMap,
  AP_PERIPHERY_COMPRESSOR,
  SDKConstruct,
  TypedObjectUtils,
} from "../sdk/index.js";
import { iPartialLiquidationBotV300Abi } from "./abi/index.js";
import { PartialLiquidationBotV300Contract } from "./PartialLiquidationBotV300Contract.js";
import type { BotParameters, BotsPluginStateHuman, BotState } from "./types.js";
import { BOT_TYPES } from "./types.js";

export class UnsupportedBotVersionError extends Error {
  public readonly state: BotState;

  constructor(state: BotState) {
    super(
      `unsupported bot version ${state.baseParams.version} for bot at ${state.baseParams.addr}`,
    );
    this.state = state;
  }
}

export class BotsPlugin extends SDKConstruct implements IGearboxSDKPlugin {
  #logger?: ILogger;

  readonly #botsByMarket: AddressMap<PartialLiquidationBotV300Contract[]> =
    new AddressMap();

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#logger = sdk.logger?.child?.({ name: "BotsPlugin" }) ?? sdk.logger;
  }

  public async attach(): Promise<void> {
    await this.#load();
  }

  public async syncState(): Promise<void> {
    await this.#load();
  }

  public botsByMarketConfigurator(
    mc: Address,
  ): PartialLiquidationBotV300Contract[] {
    return this.#botsByMarket.get(mc) ?? [];
  }

  public get allBots(): PartialLiquidationBotV300Contract[] {
    return this.#botsByMarket.values().flat();
  }

  async #load(): Promise<void> {
    this.#botsByMarket.clear();
    const pcAddr = this.sdk.addressProvider.getAddress(
      AP_PERIPHERY_COMPRESSOR,
      3_10,
    );
    this.#logger?.debug(`loading bots with periphery compressor ${pcAddr}`);
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
    const botsByMcV300: Record<Address, BotState[]> = {};

    for (let i = 0; i < mcs.length; i++) {
      const mc = mcs[i];
      const marketBotData = botsData[i];
      const marketBots: BotState[] = [];

      for (const bot of marketBotData) {
        if (bot.baseParams.version === 300n) {
          marketBots.push(bot);
        } else {
          this.#logger?.warn(new UnsupportedBotVersionError(bot));
          // create and push new bot of other version
        }
      }
      if (marketBots.length === 4) {
        botsByMcV300[mc] = marketBots;
      } else {
        this.#logger?.warn(
          `each market configurator should have 4 v3.00 bots, but ${mc} has ${marketBots.length}`,
        );
      }
    }

    const botAddrsV300 = Object.values(botsByMcV300).flatMap(b =>
      b.map(b => b.baseParams.addr),
    );
    this.#logger?.debug(`loaded ${botAddrsV300.length} v3.00 bots`);
    const params = await this.#getBotsV300Parameters(botAddrsV300);

    for (const [mc, botStates] of TypedObjectUtils.entries(botsByMcV300)) {
      this.#botsByMarket.upsert(
        mc,
        botStates.map(
          (state, i) =>
            new PartialLiquidationBotV300Contract(
              this.sdk,
              state,
              params[state.baseParams.addr],
              BOT_TYPES[i],
            ),
        ),
      );
    }
  }

  async #getBotsV300Parameters(
    addresses: Address[],
  ): Promise<Record<Address, BotParameters>> {
    const BOT_INFO_LENGTH = 4;
    const resp = await this.provider.publicClient.multicall({
      allowFailure: false,
      contracts: addresses
        .map(
          address =>
            [
              {
                address,
                abi: iPartialLiquidationBotV300Abi,
                functionName: "minHealthFactor",
                args: [],
              },
              {
                address,
                abi: iPartialLiquidationBotV300Abi,
                functionName: "maxHealthFactor",
                args: [],
              },
              {
                address,
                abi: iPartialLiquidationBotV300Abi,
                functionName: "premiumScaleFactor",
                args: [],
              },
              {
                address,
                abi: iPartialLiquidationBotV300Abi,
                functionName: "feeScaleFactor",
                args: [],
              },
            ] as const,
        )
        .flat(1),
    });

    return addresses.reduce<Record<Address, BotParameters>>(
      (acc, address, index) => {
        const from = index * BOT_INFO_LENGTH;
        const to = (index + 1) * BOT_INFO_LENGTH;

        const [
          minHealthFactor,
          maxHealthFactor,
          premiumScaleFactor,
          feeScaleFactor,
        ] = resp.slice(from, to);

        acc[address] = {
          minHealthFactor,
          maxHealthFactor,
          premiumScaleFactor,
          feeScaleFactor,
        };

        return acc;
      },
      {},
    );
  }

  public stateHuman(raw?: boolean): BotsPluginStateHuman {
    return {
      bots: Object.fromEntries(
        this.#botsByMarket
          .entries()
          .map(([mc, bots]) => [
            this.labelAddress(mc),
            bots.map(b => b.stateHuman(raw)),
          ]),
      ),
    };
  }
}
