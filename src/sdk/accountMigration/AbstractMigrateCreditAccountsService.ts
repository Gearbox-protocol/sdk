import type { Address } from "viem";
import { getContract } from "viem";

import {
  accountMigratorBotV310Abi,
  accountMigratorPreviewerV310Abi,
} from "../../abi/migration.js";
import { createCreditAccountService } from "../accounts/createCreditAccountService.js";
import type { ICreditAccountsService } from "../accounts/types.js";
import { SDKConstruct } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { ILogger } from "../types/index.js";
import { childLogger } from "../utils/index.js";
import type {
  MigrateCreditAccountProps,
  PreviewCreditAccountMigrationProps,
  PreviewMigrationResult,
} from "./types.js";

export abstract class AbstractMigrateCreditAccountsService extends SDKConstruct {
  #logger?: ILogger;
  #version: number;
  #service: ICreditAccountsService;

  constructor(sdk: GearboxSDK, version: number) {
    super(sdk);

    this.#version = version;
    this.#service = createCreditAccountService(this.sdk, version);
    this.#logger = childLogger("CreditAccountsService", sdk.logger);
    this.#logger?.debug(
      `Created MigrateCreditAccountsService with version: ${this.#version}`,
    );
  }

  /**
   * Preview delayed withdrawal for a given credit account
   * @param props - {@link PreviewCreditAccountMigrationProps}
   * @returns
   */
  public async previewCreditAccountMigration({
    previewerAddress,
    creditAccount,
    targetCreditManager,
    averageQuota,
  }: PreviewCreditAccountMigrationProps): Promise<PreviewMigrationResult> {
    const priceUpdatesCalls = await this.#service.getPriceUpdatesForFacade(
      targetCreditManager,
      creditAccount,
      averageQuota,
    );

    const contract = getContract({
      address: previewerAddress,
      abi: accountMigratorPreviewerV310Abi,
      client: {
        public: this.sdk.provider.publicClient,
      },
    });

    const { result } = await contract.simulate.previewMigration([
      creditAccount.creditAccount,
      targetCreditManager,
      priceUpdatesCalls.map(mc => ({
        priceFeed: mc.target,
        data: mc.callData,
      })),
    ]);

    return result;
  }

  /**
   * Migrates credit account with a given preview result
   * @param props - {@link MigrateCreditAccountProps}
   * @returns
   */
  public async migrateCreditAccount({
    accountMigratorBot,
    creditAccount,
    targetCreditManager,
    signer,
    preview,
    averageQuota,
    account,
  }: MigrateCreditAccountProps): Promise<Address> {
    const priceUpdatesCalls = await this.#service.getPriceUpdatesForFacade(
      targetCreditManager,
      creditAccount,
      averageQuota,
    );

    const contract = getContract({
      address: accountMigratorBot,
      abi: accountMigratorBotV310Abi,
      client: signer,
    });

    const tx = await contract.write.migrateCreditAccount(
      [
        preview.migrationParams,
        priceUpdatesCalls.map(mc => ({
          priceFeed: mc.target,
          data: mc.callData,
        })),
      ] as const,
      { account: account, chain: signer.chain },
    );

    return tx;
  }
}
