import type { Address } from "viem";
import { iLiquidationCompressorV313Abi } from "../../../abi/ILiquidationCompressorV313.js";
import type { CreditAccountData } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import { ADDRESS_0X0, WAD } from "../../constants/index.js";
import {
  MidasLiquidatorContract,
  RWA_LIQUIDATOR_MIDAS,
} from "../../market/rwa/midas/index.js";
import {
  RWA_LIQUIDATOR_SECURITIZE,
  SecuritizeLiquidatorContract,
} from "../../market/rwa/securitize/index.js";
import type { RawTx } from "../../types/index.js";
import { AddressSet, bytes32ToString, hexEq } from "../../utils/index.js";
import { LIQUIDATION_COMPRESSOR_V313_ADDRESS } from "./constants.js";
import type { OnchainLiquidationData, RWALiquidatorInfo } from "./helpers.js";
import {
  calcEstimatedProfit,
  calcRepaymentAmount,
  DUST_THRESHOLD,
  liquidationCallToRawTx,
  pickMainAsset,
  toLiquidationApproval,
  toLiquidatorWithdrawals,
  toReceivedAssets,
} from "./helpers.js";
import type {
  BuildLiquidationTxProps,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidatorWithdrawalsProps,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidatorWithdrawal,
} from "./types.js";

/**
 * Service for discovering liquidatable credit accounts and previewing manual
 * liquidations.
 **/
export class LiquidationsService extends SDKConstruct {
  /**
   * Returns all liquidatable credit accounts: accounts with health factor
   * below 1 plus accounts of expired credit managers with outstanding debt.
   * Accounts whose collateral computation failed are excluded.
   *
   * @param props - Optional filters, see {@link GetLiquidatableAccountsProps}
   **/
  public async getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps,
  ): Promise<LiquidatableAccount[]> {
    await this.sdk.withdrawalCompressor?.loadWithdrawableAssets();

    const accounts = await this.sdk.accounts.getCreditAccounts({
      maxHealthFactor: WAD - 1n,
      includeZeroDebt: false,
    });
    const seen = new AddressSet(accounts.map(ca => ca.creditAccount));
    for (const ca of await this.#getExpiredCreditAccounts()) {
      if (!seen.has(ca.creditAccount)) {
        seen.add(ca.creditAccount);
        accounts.push(ca);
      }
    }

    const rows: LiquidatableAccount[] = [];
    for (const ca of accounts) {
      // collateral computation reverted (e.g. dead price feed) — amounts
      // cannot be computed, such accounts are excluded from the list
      if (!ca.success) {
        continue;
      }
      rows.push(this.#buildAccount(ca));
    }

    const allowedAssets = props?.assets?.length
      ? new AddressSet(props.assets)
      : undefined;
    return rows.filter(row => {
      if (props?.delayed !== undefined && row.isDelayed !== props.delayed) {
        return false;
      }
      if (allowedAssets && !allowedAssets.has(row.asset)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Returns detailed information about a liquidatable credit account,
   * including the full list of assets the liquidator receives.
   *
   * @param props - See {@link GetLiquidationDetailsProps}
   * @throws When the account is not found or its collateral computation fails.
   **/
  public async getLiquidationDetails(
    props: GetLiquidationDetailsProps,
  ): Promise<LiquidationDetails> {
    const { creditAccount, liquidator, ignoreReservePrices } = props;
    const ca = await this.#getCreditAccountData(creditAccount);

    await this.sdk.withdrawalCompressor?.loadWithdrawableAssets();
    const account = this.#buildAccount(ca);
    const data = await this.#getLiquidationData(
      ca,
      liquidator,
      ignoreReservePrices,
    );
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    return {
      ...account,
      // the compressor reports the exact amounts of the liquidation path it
      // selected, which supersede the estimates of the list row
      repaymentAmount: {
        // paths that need no capital from the liquidator report a zero token
        token: hexEq(data.requiredToken, ADDRESS_0X0)
          ? account.totalValue.token
          : data.requiredToken,
        balance: data.requiredAmount,
      },
      isDelayed: data.expectedOutputs.some(o => o.delayed),
      receivedAssets: toReceivedAssets(data.expectedOutputs),
      isLiquidatorEligible: data.isLiquidatorEligible,
      isCreditAccountFrozen: data.isCreditAccountFrozen,
      kycProtocol: data.kycProtocol || undefined,
      kycToken: hexEq(data.kycToken, ADDRESS_0X0) ? undefined : data.kycToken,
      approve: toLiquidationApproval({
        target: data.liquidationCall.target,
        creditFacade: suite.creditFacade.address,
        creditManager: ca.creditManager,
        token: data.requiredToken,
        amount: data.requiredAmount,
      }),
    };
  }

  /**
   * Builds the transaction that fully liquidates a credit account, repaying
   * the debt from own funds and receiving the collateral from the credit account.
   *
   * @param props - See {@link BuildLiquidationTxProps}
   **/
  public async buildLiquidationTx(
    props: BuildLiquidationTxProps,
  ): Promise<RawTx> {
    const { creditAccount, liquidator, ignoreReservePrices } = props;
    const ca = await this.#getCreditAccountData(creditAccount);
    const data = await this.#getLiquidationData(
      ca,
      liquidator,
      ignoreReservePrices,
    );
    return liquidationCallToRawTx(
      data.liquidationCall,
      `liquidate credit account ${this.labelAddress(creditAccount)} to ${this.labelAddress(liquidator)}`,
    );
  }

  /**
   * Returns the status of delayed-withdrawal positions (redemption receipts)
   * owned by a liquidator wallet: what is receivable, how much, and when it
   * becomes claimable.
   *
   * @param props - See {@link GetLiquidatorWithdrawalsProps}
   **/
  public async getLiquidatorWithdrawals(
    props: GetLiquidatorWithdrawalsProps,
  ): Promise<LiquidatorWithdrawal[]> {
    const compressor = this.sdk.withdrawalCompressor;
    if (!compressor) {
      return [];
    }
    await compressor.loadWithdrawableAssets();
    // the same phantom token can be configured in several credit managers;
    // duplicates would double-count redeemers in the compressor's loop
    const phantomTokens = new AddressSet(
      compressor.getWithdrawableAssets().map(a => a.withdrawalPhantomToken),
    );
    const current = await compressor.getExternalAccountCurrentWithdrawals(
      props.liquidator,
      ...phantomTokens.asArray(),
    );

    return toLiquidatorWithdrawals(
      current,
      this.sdk.networkType,
      this.sdk.chainId,
    );
  }

  /**
   * Discovers the dedicated RWA liquidator contracts (Securitize, Midas)
   * deployed for the markets of the chain and registers them in the SDK
   * contracts register.
   **/
  public async loadRWALiquidators(): Promise<void> {
    const configurators = this.sdk.marketRegister.marketConfigurators;
    if (configurators.length === 0) {
      return;
    }
    const resp = await this.client.multicall({
      contracts: configurators.map(
        mc =>
          ({
            address: LIQUIDATION_COMPRESSOR_V313_ADDRESS,
            abi: iLiquidationCompressorV313Abi,
            functionName: "getRWALiquidators",
            args: [mc.address],
          }) as const,
      ),
      allowFailure: false,
      batchSize: 0,
    });
    for (const info of resp.flat()) {
      this.#createRWALiquidator(info);
    }
  }

  /**
   * Instantiates the liquidator contract, which registers it and labels its
   * address (see `BaseContract`).
   *
   * @param info - Liquidator discovered by the compressor. The same gateway
   * can be configured in several credit managers, so duplicates are expected
   * and skipped.
   **/
  #createRWALiquidator(info: RWALiquidatorInfo): void {
    const liquidator = info.liquidatorAddress;
    const existing = this.sdk.getContract(liquidator);
    if (existing) {
      return;
    }
    switch (bytes32ToString(info.contractType)) {
      case RWA_LIQUIDATOR_SECURITIZE:
        new SecuritizeLiquidatorContract(this.sdk, liquidator);
        this.logger?.debug(`registered Securitize liquidator ${liquidator}`);
        return;
      case RWA_LIQUIDATOR_MIDAS:
        new MidasLiquidatorContract(this.sdk, liquidator);
        this.logger?.debug(`registered Midas liquidator ${liquidator}`);
        return;
    }
  }

  async #getCreditAccountData(
    creditAccount: Address,
  ): Promise<CreditAccountData> {
    const ca = await this.sdk.accounts.getCreditAccountData(creditAccount);
    if (!ca) {
      throw new Error(`credit account ${creditAccount} not found`);
    }
    if (!ca.success) {
      throw new Error(
        `cannot compute liquidation details for ${creditAccount}: collateral computation failed`,
      );
    }
    return ca;
  }

  /**
   * Previews the liquidation via the liquidation compressor.
   *
   * @param ca - Credit account to liquidate
   * @param liquidator - Liquidator wallet, zero address when not known: it only
   * affects the KYC eligibility fields and the receiver encoded into the calls
   * @param ignoreReservePrices - Exclude reserve price feeds from the updates
   **/
  async #getLiquidationData(
    ca: CreditAccountData,
    liquidator: Address = ADDRESS_0X0,
    ignoreReservePrices?: boolean,
  ): Promise<OnchainLiquidationData> {
    const priceUpdates = await this.sdk.accounts.getOnDemandPriceUpdates(
      ca,
      ignoreReservePrices,
    );
    const { result } = await this.client.simulateContract({
      address: LIQUIDATION_COMPRESSOR_V313_ADDRESS,
      abi: iLiquidationCompressorV313Abi,
      functionName: "getLiquidationData",
      args: [liquidator, ca.creditAccount, priceUpdates],
    });
    return result;
  }

  /**
   * Accounts of expired credit managers with outstanding debt are liquidatable
   * regardless of their health factor.
   **/
  async #getExpiredCreditAccounts(): Promise<CreditAccountData[]> {
    const expiredCMs: Address[] = [];
    for (const market of this.sdk.marketRegister.markets) {
      // nothing borrowed === no accounts
      if (market.pool.pool.totalBorrowed === 0n) {
        continue;
      }
      for (const cm of market.creditManagers) {
        const borrowed =
          market.pool.pool.creditManagerDebtParams.get(cm.creditManager.address)
            ?.borrowed ?? 0n;
        if (cm.isExpired && borrowed > 0n) {
          expiredCMs.push(cm.creditManager.address);
        }
      }
    }
    if (expiredCMs.length === 0) {
      return [];
    }
    this.logger?.debug(
      `getting credit accounts of ${expiredCMs.length} expired credit managers`,
    );
    const result: CreditAccountData[] = [];
    for (const creditManager of expiredCMs) {
      const accounts = await this.sdk.accounts.getCreditAccounts({
        creditManager,
        includeZeroDebt: false,
      });
      result.push(...accounts);
    }
    return result;
  }

  /**
   * Requires the compressor's withdrawable assets cache to be loaded
   * (see `loadWithdrawableAssets`) so that phantom token lookups are sync.
   **/
  #buildAccount(ca: CreditAccountData): LiquidatableAccount {
    const compressor = this.sdk.withdrawalCompressor;
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const market = suite.market;

    // for RWA markets, values are denominated in the unwrapped asset
    // (e.g. USDC instead of dcUSDC); the wrapped underlying converts 1:1
    const meta = this.sdk.tokensMeta.get(suite.underlying);
    const unwrappedUnderlying =
      meta && this.sdk.tokensMeta.isRWAUnderlying(meta)
        ? meta.asset
        : suite.underlying;

    const liquidationDiscount = suite.isExpired
      ? suite.creditManager.liquidationDiscountExpired
      : suite.creditManager.liquidationDiscount;

    let asset = pickMainAsset(ca, (token, balance) => {
      try {
        return market.priceOracle.convert(token, market.underlying, balance);
      } catch {
        return 0n;
      }
    });
    // withdrawal phantom tokens are reported as their source asset;
    // accounts with only underlying or dust fall back to the underlying
    if (asset) {
      asset = compressor?.getWithdrawalSourceToken(asset) ?? asset;
    } else {
      asset = unwrappedUnderlying;
    }

    return {
      creditAccount: ca.creditAccount,
      creditManager: ca.creditManager,
      network: this.sdk.networkType,
      asset,
      totalValue: {
        token: unwrappedUnderlying,
        balance: ca.totalValue,
      },
      totalValueUSD: ca.totalValueUSD,
      repaymentAmount: {
        token: unwrappedUnderlying,
        balance: calcRepaymentAmount(ca.totalValue, liquidationDiscount),
      },
      estimatedProfit: {
        token: unwrappedUnderlying,
        balance: calcEstimatedProfit(ca.totalValue, liquidationDiscount),
      },
      isDelayed: ca.tokens.some(
        t =>
          t.balance > DUST_THRESHOLD &&
          !!compressor?.getWithdrawalSourceToken(t.token),
      ),
      paused: suite.creditFacade.isPaused,
    };
  }
}
