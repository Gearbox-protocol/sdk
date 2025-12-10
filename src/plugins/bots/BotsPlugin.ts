import {
  type Address,
  decodeAbiParameters,
  encodeAbiParameters,
  stringToHex,
} from "viem";
import { iBytecodeRepositoryAbi } from "../../abi/310/iBytecodeRepository.js";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import type { IGearboxSDKPlugin } from "../../sdk/index.js";
import {
  AddressMap,
  AddressSet,
  AP_BYTECODE_REPOSITORY,
  AP_PERIPHERY_COMPRESSOR,
  AP_TREASURY,
  BasePlugin,
  hexEq,
  isV300,
  isV310,
  TypedObjectUtils,
  VERSION_RANGE_310,
} from "../../sdk/index.js";
import { iPartialLiquidationBotV310Abi } from "./abi/iPartialLiquidationBotV310.js";
import {
  PARTIAL_LIQUIDATION_BOT_CONFIGS,
  PARTIAL_LIQUIDATION_BOT_DEPLOYER,
  PARTIAL_LIQUIDATION_BOT_SALT,
} from "./config.js";
import { PartialLiquidationBotV300Contract } from "./PartialLiquidationBotV300Contract.js";
import { PartialLiquidationBotV310Contract } from "./PartialLiquidationBotV310Contract.js";
import {
  BOT_PARAMS_ABI,
  type BotParameters,
  type BotState,
  type BotsPluginState,
  type BotsPluginStateHuman,
  LIQUIDATION_BOT_TYPES,
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
            abi: peripheryCompressorAbi,
            functionName: "getBots",
            args: [mc],
          }) as const,
      ),
      allowFailure: false,
    });

    this.#botsByMarket = new AddressMap();
    for (let i = 0; i < mcs.length; i++) {
      const mc = mcs[i];
      const marketBotData = botsData[i];
      this.#loadStateMarketState(mc, marketBotData);
    }
    return this.state;
  }

  public async findDeployedPartialLiquidationBots(): Promise<
    AddressMap<BotParameters>
  > {
    const treasury = this.sdk.addressProvider.getAddress(AP_TREASURY);
    const bcr = this.sdk.addressProvider.getAddress(AP_BYTECODE_REPOSITORY);
    const configs = PARTIAL_LIQUIDATION_BOT_CONFIGS[this.sdk.networkType] ?? [];
    const result = new AddressMap<BotParameters>();
    if (!configs.length) {
      return result;
    }
    const deployedBots = await this.client.multicall({
      contracts: configs.map(
        config =>
          ({
            address: bcr,
            abi: iBytecodeRepositoryAbi,
            functionName: "computeAddress",
            args: [
              stringToHex("BOT::PARTIAL_LIQUIDATION", { size: 32 }),
              310,
              encodeAbiParameters(BOT_PARAMS_ABI, [
                treasury,
                config.minHealthFactor,
                config.maxHealthFactor,
                config.premiumScaleFactor,
                config.feeScaleFactor,
              ]),
              stringToHex(PARTIAL_LIQUIDATION_BOT_SALT, { size: 32 }), // salt
              PARTIAL_LIQUIDATION_BOT_DEPLOYER,
            ],
          }) as const,
      ),
      allowFailure: true,
      blockNumber: this.sdk.currentBlock,
    });

    const expectedBots = new AddressMap<BotParameters>();
    for (let i = 0; i < configs.length; i++) {
      const b = deployedBots[i];
      const { minHealthFactor, maxHealthFactor } = configs[i];
      if (b.status === "success") {
        expectedBots.upsert(b.result, { ...configs[i], treasury });
        this.logger?.debug(
          `found bot [${minHealthFactor}, ${maxHealthFactor}] at ${b.result}`,
        );
      } else {
        this.logger?.error(
          `failed to find bot [${minHealthFactor}, ${maxHealthFactor}]`,
          b.error,
        );
      }
    }
    const botAddrs = expectedBots.keys();
    const serializedBots = await this.client.multicall({
      contracts: botAddrs.map(
        address =>
          ({
            address,
            abi: iPartialLiquidationBotV310Abi,
            functionName: "serialize",
          }) as const,
      ),
      allowFailure: true,
      blockNumber: this.sdk.currentBlock,
    });

    for (let i = 0; i < botAddrs.length; i++) {
      const serialized = serializedBots[i];
      const expected = expectedBots.mustGet(botAddrs[i]);
      if (serialized.status === "success") {
        const [
          treasury,
          minHealthFactor,
          maxHealthFactor,
          premiumScaleFactor,
          feeScaleFactor,
        ] = decodeAbiParameters(BOT_PARAMS_ABI, serialized.result);
        if (
          !hexEq(treasury, expected.treasury) ||
          minHealthFactor !== expected.minHealthFactor ||
          maxHealthFactor !== expected.maxHealthFactor ||
          premiumScaleFactor !== expected.premiumScaleFactor ||
          feeScaleFactor !== expected.feeScaleFactor
        ) {
          this.logger?.error(
            `serialized bot ${botAddrs[i]} does not match expected bot`,
            serialized.error,
          );
        } else {
          result.upsert(botAddrs[i], expected);
        }
      }
    }
    return result;
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
        (bots[i] as PartialLiquidationBotV300Contract).botType =
          LIQUIDATION_BOT_TYPES[i];
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
