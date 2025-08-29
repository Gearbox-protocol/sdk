import type { Address } from "viem";
import { getContract } from "viem";

import {
  accountMigratorBotV310Abi,
  accountMigratorPreviewerV310Abi,
} from "../../abi/migration.js";
import { createCreditAccountService } from "../accounts/createCreditAccountService.js";
import type { ICreditAccountsService } from "../accounts/types.js";
import { SDKConstruct } from "../base/index.js";
import { chains as CHAINS } from "../chain/chains.js";
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

  // TODO: any better way to handle this?
  private static readonly V300_TO_V310_TOKENS_OVERRIDES: Record<
    number,
    Record<Address, Address>
  > = {
    [CHAINS.Mainnet.id]: {
      // stkcvxRLUSD_USDC
      ["0x444FA0ffb033265591895b66c81c2e5fF606E097".toLowerCase() as Address]:
        "0x87FA6c0296c986D1C901d72571282D57916B964a".toLowerCase() as Address,
      // stkcvxllamathena
      ["0x72eD19788Bce2971A5ed6401662230ee57e254B7".toLowerCase() as Address]:
        "0xB5528130B1d5D24aD172bF54CeeD062232AfbFBe".toLowerCase() as Address,
      // stkUSDS
      ["0xcB5D10A57Aeb622b92784D53F730eE2210ab370E".toLowerCase() as Address]:
        "0x00F7C0d39B05089e93858A82439EA17dE7160B5a".toLowerCase() as Address,
    },
  };

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

  public static getV310TargetTokenAddress(
    source: Address,
    chainId: number,
  ): Address {
    return (
      AbstractMigrateCreditAccountsService.V300_TO_V310_TOKENS_OVERRIDES[
        chainId
      ][source] ?? source
    );
  }
}
