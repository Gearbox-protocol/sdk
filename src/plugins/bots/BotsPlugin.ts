import { encodeAbiParameters, stringToHex } from "viem";
import { iBytecodeRepositoryAbi } from "../../abi/310/iBytecodeRepository.js";
import type { IGearboxSDKPlugin } from "../../sdk/index.js";
import {
  AddressMap,
  AP_BYTECODE_REPOSITORY,
  AP_TREASURY,
  BasePlugin,
  chains as CHAINS,
  hexEq,
} from "../../sdk/index.js";
import { iPartialLiquidationBotV310Abi } from "./abi/iPartialLiquidationBotV310.js";
import {
  LEGACY_MIGRATION_BOT,
  PARTIAL_LIQUIDATION_BOT_CONFIGS,
  PARTIAL_LIQUIDATION_BOT_DEPLOYER,
  PARTIAL_LIQUIDATION_BOT_SALT,
} from "./config.js";
import { PartialLiquidationBotV310Contract } from "./PartialLiquidationBotV310Contract.js";
import {
  BOT_PARAMS_ABI,
  BOT_PARTIAL_LIQUIDATION,
  type BotParameters,
  type BotsPluginState,
  type BotsPluginStateHuman,
  type MigrationBotState,
} from "./types.js";

export class BotsPlugin
  extends BasePlugin<BotsPluginState>
  implements IGearboxSDKPlugin<BotsPluginState>
{
  #bots?: AddressMap<PartialLiquidationBotV310Contract>;

  public get loaded(): boolean {
    return !!this.#bots;
  }

  public get bots(): PartialLiquidationBotV310Contract[] {
    return this.#bots?.values() ?? [];
  }

  public async load(force?: boolean): Promise<BotsPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }
    const treasury = this.sdk.addressProvider.getAddress(AP_TREASURY);
    const bcr = this.sdk.addressProvider.getAddress(AP_BYTECODE_REPOSITORY);
    const configs = PARTIAL_LIQUIDATION_BOT_CONFIGS[this.sdk.networkType] ?? [];
    this.#bots = new AddressMap<PartialLiquidationBotV310Contract>();
    if (!configs.length) {
      return this.state;
    }
    const deployedBots = await this.client.multicall({
      contracts: configs.map(
        config =>
          ({
            address: bcr,
            abi: iBytecodeRepositoryAbi,
            functionName: "computeAddress",
            args: [
              stringToHex(BOT_PARTIAL_LIQUIDATION, { size: 32 }),
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
      batchSize: 0,
    });

    const expectedBots = new AddressMap<BotParameters>();
    for (let i = 0; i < configs.length; i++) {
      const b = deployedBots[i];
      const { minHealthFactor, maxHealthFactor } = configs[i];
      if (b.status === "success") {
        expectedBots.upsert(b.result, { ...configs[i], treasury });
        this.logger?.debug(
          `expected bot [${minHealthFactor}, ${maxHealthFactor}] at ${b.result}`,
        );
      } else {
        this.logger?.error(
          `failed compute address for bot [${minHealthFactor}, ${maxHealthFactor}]`,
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
      batchSize: 0,
    });

    for (let i = 0; i < botAddrs.length; i++) {
      const serialized = serializedBots[i];
      const expected = expectedBots.mustGet(botAddrs[i]);
      if (serialized.status === "success") {
        const bot = new PartialLiquidationBotV310Contract(this.sdk, {
          addr: botAddrs[i],
          version: BigInt(310),
          contractType: BOT_PARTIAL_LIQUIDATION,
          serializedParams: serialized.result,
        });
        if (
          !hexEq(treasury, expected.treasury) ||
          bot.minHealthFactor !== expected.minHealthFactor ||
          bot.maxHealthFactor !== expected.maxHealthFactor ||
          bot.premiumScaleFactor !== expected.premiumScaleFactor ||
          bot.feeScaleFactor !== expected.feeScaleFactor
        ) {
          this.logger?.error(
            `serialized bot ${botAddrs[i]} does not match expected bot`,
            serialized.error,
          );
        } else {
          this.#bots.upsert(botAddrs[i], bot);
        }
      }
    }
    return this.state;
  }

  public stateHuman(raw?: boolean): BotsPluginStateHuman {
    return {
      bots: this.#bots?.values().map(bot => bot.stateHuman(raw)) ?? [],
    };
  }

  public get state(): BotsPluginState {
    return {
      bots: this.#bots?.values().map(bot => bot.state) ?? [],
    };
  }

  public hydrate(state: BotsPluginState): void {
    this.#bots = new AddressMap();
    for (const botState of state.bots) {
      this.#bots.upsert(
        botState.addr,
        new PartialLiquidationBotV310Contract(this.sdk, botState),
      );
    }
  }

  public static getMigrationBotData(
    chainId: number,
  ): MigrationBotState | undefined {
    return chainId === CHAINS.Mainnet.id ? LEGACY_MIGRATION_BOT : undefined;
  }
}
