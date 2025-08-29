import type {
  Address,
  GetContractReturnType,
  PublicClient,
  WalletClient,
} from "viem";

import type { accountMigratorPreviewerV310Abi } from "../../abi/migration.js";
import type { PrepareUpdateQuotasProps } from "../accounts/types.js";
import type { SDKConstruct } from "../base/SDKConstruct.js";
import type { Asset, RouterCASlice } from "../router/index.js";

export interface MigrateCreditAccountProps {
  /**
   * accountMigratorBot Address
   */
  accountMigratorBot: Address;
  /**
   * Credit manager to migrate liquidity to
   */
  targetCreditManager: Address;
  /**
   * signer instance
   */
  signer: WalletClient;
  /**
   * migration preview result
   */
  preview: PreviewMigrationResult;
  /**
   * wallet address
   */
  account: Address;
  /**
   * Expected quota after migration
   */
  expectedTargetQuota: Array<Asset>;
}

export interface PreviewCreditAccountMigrationProps {
  /**
   * accountMigratorPreviewer Address
   */
  previewerAddress: Address;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Credit manager to migrate liquidity to
   */
  targetCreditManager: Address;
  /**
   * Expected quota after migration
   */
  expectedTargetQuota: Array<Asset>;
}

export type PreviewMigrationResult = Awaited<
  ReturnType<
    GetContractReturnType<
      typeof accountMigratorPreviewerV310Abi,
      PublicClient
    >["simulate"]["previewMigration"]
  >
>["result"];

export interface IMigrateCreditAccountsService extends SDKConstruct {
  /**
   * Preview delayed withdrawal for a given credit account
   * @param props - {@link PreviewCreditAccountMigrationProps}
   * @returns - {@link PreviewMigrationResult}
   */
  previewCreditAccountMigration(
    props: PreviewCreditAccountMigrationProps,
  ): Promise<PreviewMigrationResult>;

  /**
   * Migrates credit account with a given preview result
   * @param props - {@link MigrateCreditAccountProps}
   * @returns
   */
  migrateCreditAccount(props: MigrateCreditAccountProps): Promise<Address>;
}
