import type { Address } from "viem";
import { iBotListV310Abi } from "../../../abi/310/generated.js";
import { SDKConstruct } from "../../base/index.js";
import {
  AP_PERIPHERY_COMPRESSOR,
  VERSION_RANGE_310,
} from "../../constants/index.js";
import { iBotAbi } from "./abi.js";
import { PeripheryCompressorV310Contract } from "./PeripheryCompressorV310Contract.js";
import type {
  AccountToCheck,
  BotStatusCall,
  BotsDirectResponse,
  ConnectedBotsCall,
  ConnectedBotsPerAccount,
  GetConnectedBotsResponse,
  GetConnectedBotsResult,
  GetConnectedMigrationBotsResult,
  SetBotProps,
  SetBotResult,
} from "./types.js";

/**
 * Bots of credit accounts.
 *
 * Reads which bots are connected to an account and with which permissions,
 * and builds the transactions that connect or disconnect one.
 **/
export class AccountBotsService extends SDKConstruct {
  /**
   * Reads the bots connected to each of the given credit accounts.
   *
   * All reads go out as a single multicall, split into three groups: the
   * periphery compressor's view of each account, the status of the legacy
   * migration bot on each account, and the status of every bot in
   * `additionalBots` on every account.
   *
   * @param accountsToCheck - Accounts to read, with their credit managers.
   * @param legacyMigrationBot - Legacy migration bot to check, if any.
   * @param additionalBots - Bots to check on every account.
   **/
  public async getConnectedBots(
    accountsToCheck: Array<AccountToCheck>,
    legacyMigrationBot: Address | undefined,
    additionalBots: Array<Address>,
  ): Promise<GetConnectedBotsResponse> {
    const compressor = this.#compressor;

    const compressorCalls: ConnectedBotsCall[] = accountsToCheck.map(
      ({ creditManager, creditAccount }) => {
        const { configurator } =
          this.sdk.marketRegister.findByCreditManager(creditManager);
        return compressor.connectedBotsCall(
          configurator.address,
          creditAccount,
        );
      },
    );

    const migrationCalls: BotStatusCall[] = legacyMigrationBot
      ? accountsToCheck.map(account =>
          this.#botStatusCall(account, legacyMigrationBot),
        )
      : [];

    const additionalCalls: BotStatusCall[] = accountsToCheck.flatMap(account =>
      additionalBots.map(bot => this.#botStatusCall(account, bot)),
    );

    const responses = await this.client.multicall({
      contracts: [...compressorCalls, ...migrationCalls, ...additionalCalls],
      allowFailure: true,
      batchSize: 0,
    });

    const migrationStart = compressorCalls.length;
    const additionalStart = migrationStart + migrationCalls.length;

    return {
      legacy: responses.slice(0, migrationStart) as GetConnectedBotsResult,
      legacyMigration: this.#migrationBotStatuses(
        legacyMigrationBot,
        accountsToCheck.length,
        responses.slice(migrationStart, additionalStart) as BotsDirectResponse,
      ),
      additionalBots: this.#botStatusesPerAccount(
        accountsToCheck.length,
        additionalBots.length,
        responses.slice(additionalStart) as BotsDirectResponse,
      ),
    };
  }

  /**
   * Connects or disconnects a bot, and updates prices when the bot is set on a
   * credit account.
   *
   * @param props - {@link SetBotProps}
   * @returns Everything needed to execute the operation. Setting a bot on a
   * credit manager only yields calls, since it is not a standalone transaction.
   **/
  public async setBot({
    botAddress,
    permissions: defaultPermissions,
    targetContract,
  }: SetBotProps): Promise<SetBotResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      targetContract.creditManager,
    );

    const permissions =
      defaultPermissions !== null
        ? defaultPermissions
        : await this.client.readContract({
            address: botAddress,
            abi: iBotAbi,
            functionName: "requiredPermissions",
          });
    const addBotCall = cm.creditFacade.prepareSetBotPermissions(
      botAddress,
      permissions,
    );

    if (targetContract.type !== "creditAccount") {
      return { calls: [addBotCall], creditFacade: cm.creditFacade };
    }

    const calls = await this.sdk.accounts.prependPriceUpdates(
      targetContract.creditManager,
      [addBotCall],
      targetContract,
    );

    return {
      tx: cm.multicallTx(targetContract.creditAccount, calls),
      calls,
      creditFacade: cm.creditFacade,
    };
  }

  /**
   * Descriptor of a `getBotStatus` call on the bot list of an account's
   * credit facade.
   **/
  #botStatusCall(
    { creditManager, creditAccount }: AccountToCheck,
    bot: Address,
  ): BotStatusCall {
    const { creditFacade } =
      this.sdk.marketRegister.findCreditManager(creditManager);
    return {
      abi: iBotListV310Abi,
      address: creditFacade.botList,
      functionName: "getBotStatus",
      args: [bot, creditAccount],
    };
  }

  /**
   * Regroups the flat `additionalBots` responses into one entry per account,
   * keeping the order the bots were requested in.
   **/
  #botStatusesPerAccount(
    accounts: number,
    botsPerAccount: number,
    responses: BotsDirectResponse,
  ): ConnectedBotsPerAccount[] {
    this.#checkLength(responses, accounts * botsPerAccount, "bots");

    const perAccount: ConnectedBotsPerAccount[] = [];
    for (let i = 0; i < accounts; i++) {
      perAccount.push({
        result: responses.slice(i * botsPerAccount, (i + 1) * botsPerAccount),
      });
    }
    return perAccount;
  }

  /**
   * Migration bot statuses, or `undefined` when no migration bot was queried.
   **/
  #migrationBotStatuses(
    bot: Address | undefined,
    accounts: number,
    responses: BotsDirectResponse,
  ): GetConnectedMigrationBotsResult {
    if (!bot) {
      return undefined;
    }
    this.#checkLength(responses, accounts, "migration bots");
    return { result: responses, botAddress: bot };
  }

  #checkLength(
    responses: BotsDirectResponse,
    expected: number,
    what: string,
  ): void {
    if (responses.length !== expected) {
      this.logger?.error(
        `result length mismatch for ${what}: got ${responses.length}, expected ${expected}`,
      );
    }
  }

  /**
   * Periphery compressor of the current chain.
   *
   * Resolved on every access, because the address provider is only populated
   * once the SDK is attached or hydrated; the contracts register acts as the
   * cache.
   **/
  get #compressor(): PeripheryCompressorV310Contract {
    const [address] = this.sdk.addressProvider.mustGetLatest(
      AP_PERIPHERY_COMPRESSOR,
      VERSION_RANGE_310,
    );
    const compressor =
      this.sdk.getContract<PeripheryCompressorV310Contract>(address);
    return compressor ?? new PeripheryCompressorV310Contract(this.sdk, address);
  }
}
