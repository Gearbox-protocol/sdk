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
import { isV310 } from "../constants/versions.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { PriceUpdateV310 } from "../market/index.js";
import type { Asset } from "../router/types.js";
import type {
  CreditAccountData_Legacy,
  CreditManagerData_Legacy,
} from "../sdk-legacy/index.js";
import type {
  MigrateCreditAccountProps,
  PreviewCreditAccountMigrationProps,
  PreviewMigrationResult,
} from "./types.js";

export abstract class AbstractMigrateCreditAccountsService extends SDKConstruct {
  #version: number;
  #service: ICreditAccountsService;

  // TODO: HARDCODED
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
    this.logger?.debug(
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
    expectedTargetQuota,
  }: PreviewCreditAccountMigrationProps): Promise<PreviewMigrationResult> {
    const updates = await this.getPriceUpdatesForMigration(
      targetCreditManager,
      expectedTargetQuota,
    );

    const contract = getContract({
      address: previewerAddress,
      abi: accountMigratorPreviewerV310Abi,
      client: {
        public: this.sdk.client,
      },
    });

    const { result } = await contract.simulate.previewMigration([
      creditAccount.creditAccount,
      targetCreditManager,
      updates,
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
    targetCreditManager,
    signer,
    preview,
    expectedTargetQuota,
    account,
  }: MigrateCreditAccountProps): Promise<Address> {
    const updates = await this.getPriceUpdatesForMigration(
      targetCreditManager,
      expectedTargetQuota,
    );

    const contract = getContract({
      address: accountMigratorBot,
      abi: accountMigratorBotV310Abi,
      client: signer,
    });

    const tx = await contract.write.migrateCreditAccount(
      [preview.migrationParams, updates],
      { account: account, chain: signer.chain },
    );

    return tx;
  }

  private async getPriceUpdatesForMigration(
    targetCreditManager: Address,
    expectedTargetQuota: Array<Asset>,
  ) {
    const updatesPayload = await this.#service.getOnDemandPriceUpdates({
      creditManager: targetCreditManager,
      desiredQuotas: expectedTargetQuota,
    });

    const market =
      this.sdk.marketRegister.findByCreditManager(targetCreditManager);
    const updates =
      updatesPayload.raw.length === 0
        ? (updatesPayload.raw as Array<PriceUpdateV310>)
        : "priceFeed" in updatesPayload.raw[0]
          ? (updatesPayload.raw as Array<PriceUpdateV310>)
          : undefined;

    if (!isV310(market.priceOracle.version) || !updates)
      throw new Error("Unsupported Price Feed");

    return updates;
  }

  public static getV310TargetTokenAddress(
    source: Address,
    chainId: number,
  ): Address {
    return (
      AbstractMigrateCreditAccountsService.V300_TO_V310_TOKENS_OVERRIDES[
        chainId
      ]?.[source] ?? source
    );
  }

  public static getTokensToMigrate(creditAccount: CreditAccountData_Legacy) {
    const sourceTokensToMigrate = Object.values(creditAccount.tokens).filter(
      t => creditAccount.isTokenEnabled(t.token) && t.balance > 1n,
    );
    const targetTokensToMigrate =
      AbstractMigrateCreditAccountsService.getTokensAfterMigration(
        sourceTokensToMigrate,
        creditAccount.chainId,
      );

    return { sourceTokensToMigrate, targetTokensToMigrate };
  }
  public static getTokensAfterMigration<T extends Asset>(
    balances: Array<T> | Record<Address, T>,
    chainId: number,
  ): Array<T> {
    const list = Array.isArray(balances) ? balances : Object.values(balances);

    const res = list.map(a => ({
      ...a,
      token: AbstractMigrateCreditAccountsService.getV310TargetTokenAddress(
        a.token,
        chainId,
      ),
    }));

    return res;
  }
  public static checkSourceCreditManager(
    sourceCreditManager: Address,
    migrationBot: Address,
    sdk: GearboxSDK,
  ): boolean {
    const cmData = sdk.marketRegister.findCreditManager(sourceCreditManager);

    // sourceHasNoMigratorBotAdapter
    const botLc = migrationBot.toLowerCase();
    const adapter = cmData.creditManager.adapters.values().find(a => {
      return a.targetContract.toLowerCase() === botLc;
    });

    return !!adapter;
  }
  public static isSourceMigratableToTargetCM(
    targetTokensToMigrate: Array<Asset>,
    source: CreditAccountData_Legacy,
    target: CreditManagerData_Legacy,
    delayedPhantoms: Record<Address, boolean>,
    sdk: GearboxSDK,
  ) {
    // sourceUnderlyingIsNotCollateral
    const sourceUnderlying = source.underlying;
    if (!target.supportedTokens[sourceUnderlying]) {
      return false;
    }

    const tryConvert = () => {
      try {
        const market = sdk.marketRegister.findByCreditManager(target.address);
        return market.priceOracle.convert(
          sourceUnderlying,
          target.underlyingToken,
          source.borrowedAmountPlusInterestAndFees,
        );
      } catch {
        return 0n;
      }
    };
    const debt =
      source.underlying !== target.underlyingToken
        ? tryConvert()
        : source.borrowedAmountPlusInterestAndFees;
    // newTargetDebtOutOfLimit
    if (debt === 0n || debt > target.maxDebt || debt < target.minDebt) {
      return false;
    }

    // migrationCollateralDoesntExistInTarget
    const collateralsCheckPassed = targetTokensToMigrate.every(a => {
      const tokenToMigrate =
        AbstractMigrateCreditAccountsService.getV310TargetTokenAddress(
          a.token,
          target.chainId,
        );
      // always allow underlying token as collateral
      if (tokenToMigrate === target.underlyingToken) return true;

      // duplicates client logic
      const zeroLt = target.liquidationThresholds[a.token] === 0n;
      const quotaNotActive = target.quotas[a.token]?.isActive === false;
      const supportedToken = !!target.supportedTokens[a.token];
      const forbidden = !!target.forbiddenTokens[a.token];

      const cmCheckPassed =
        supportedToken &&
        !zeroLt &&
        !quotaNotActive &&
        !forbidden &&
        !delayedPhantoms[a.token];

      return cmCheckPassed;
    });

    return collateralsCheckPassed;
  }
}
