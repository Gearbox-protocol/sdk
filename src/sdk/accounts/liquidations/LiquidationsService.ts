import type { Address } from "viem";
import { iLiquidationCompressorV313Abi } from "../../../abi/ILiquidationCompressorV313.js";
import { iPhantomTokenAbi } from "../../../abi/iPhantomToken.js";
import { iRWAGatewayAbi } from "../../../abi/rwa/iRWAGateway.js";
import type { CreditAccountData, PhantomTokenMeta } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import { ADDRESS_0X0, WAD } from "../../constants/index.js";
import {
  MidasLiquidatorContract,
  PHANTOM_TOKEN_MIDAS_REDEMPTION,
} from "../../market/rwa/midas/index.js";
import {
  PHANTOM_TOKEN_SECURITIZE_REDEMPTION,
  SecuritizeLiquidatorContract,
} from "../../market/rwa/securitize/index.js";
import type { RawTx } from "../../types/index.js";
import { AddressSet, hexEq } from "../../utils/index.js";
import { LIQUIDATION_COMPRESSOR_V313_ADDRESS } from "./constants.js";
import type { OnchainLiquidationData } from "./helpers.js";
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
  ILiquidationsService,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidatorWithdrawal,
} from "./types.js";

/**
 * A discovered RWA liquidator contract.
 **/
interface RWALiquidatorRef {
  /**
   * Liquidator address: the transfer master of the RWA gateway.
   **/
  liquidator: Address;
  /**
   * Contract type of the phantom token, which selects the contract class.
   **/
  contractType: string;
}

/**
 * Per-chain implementation of {@link ILiquidationsService}.
 *
 * Discovers liquidatable credit accounts (health factor below 1 plus accounts
 * of expired credit managers with outstanding debt) and previews what a
 * manual liquidation pays and receives.
 **/
export class LiquidationsService
  extends SDKConstruct
  implements ILiquidationsService
{
  /**
   * {@inheritDoc ILiquidationsService.getLiquidatableAccounts}
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
   * {@inheritDoc ILiquidationsService.getLiquidationDetails}
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
        token: account.totalValue.token,
        balance: data.requiredUnderlyingAmount,
      },
      isDelayed: data.expectedOutputs.some(o => o.delayed),
      receivedAssets: toReceivedAssets(data.expectedOutputs),
      isLiquidatorEligible: data.isLiquidatorEligible,
      kycProtocol: data.kycProtocol || undefined,
      kycToken: hexEq(data.kycToken, ADDRESS_0X0) ? undefined : data.kycToken,
      approve: toLiquidationApproval({
        target: data.liquidationCall.target,
        creditFacade: suite.creditFacade.address,
        creditManager: ca.creditManager,
        token: suite.underlying,
        amount: data.requiredUnderlyingAmount,
      }),
    };
  }

  /**
   * {@inheritDoc ILiquidationsService.buildLiquidationTx}
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
   * {@inheritDoc ILiquidationsService.getLiquidatorWithdrawals}
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
    return toLiquidatorWithdrawals(current, this.sdk.networkType);
  }

  /**
   * {@inheritDoc ILiquidationsService.loadRWALiquidators}
   **/
  public async loadRWALiquidators(): Promise<void> {
    // phantom token contract types are loaded lazily and cached by the SDK
    await this.sdk.tokensMeta.loadTokenData();
    const phantomTokens: PhantomTokenMeta[] = [];
    for (const meta of this.sdk.tokensMeta.phantomTokens.values()) {
      switch (meta.contractType) {
        case PHANTOM_TOKEN_SECURITIZE_REDEMPTION:
        case PHANTOM_TOKEN_MIDAS_REDEMPTION:
          phantomTokens.push(meta);
          break;
      }
    }
    if (phantomTokens.length === 0) {
      return;
    }

    const ptResp = await this.client.multicall({
      contracts: phantomTokens.map(
        ({ addr }) =>
          ({
            address: addr,
            abi: iPhantomTokenAbi,
            functionName: "getPhantomTokenInfo",
          }) as const,
      ),
      allowFailure: false,
      batchSize: 0,
    });
    const gateways = phantomTokens.map(({ contractType }, i) => ({
      gateway: ptResp[i][0],
      contractType,
    }));

    const gwResp = await this.client.multicall({
      contracts: gateways.map(
        ({ gateway }) =>
          ({
            address: gateway,
            abi: iRWAGatewayAbi,
            functionName: "transferMaster",
          }) as const,
      ),
      allowFailure: false,
      batchSize: 0,
    });
    const refs = gateways.map(({ contractType }, i) => ({
      liquidator: gwResp[i],
      contractType,
    }));

    for (const ref of refs) {
      this.#createRWALiquidator(ref);
    }
  }

  /**
   * Instantiates the liquidator contract, which registers it and labels its
   * address (see `BaseContract`).
   *
   * @param ref - Discovered liquidator address and its phantom token type
   **/
  #createRWALiquidator(ref: RWALiquidatorRef): void {
    const { liquidator, contractType } = ref;
    const existing = this.sdk.getContract(liquidator);
    if (existing) {
      return;
    }
    switch (contractType) {
      case PHANTOM_TOKEN_SECURITIZE_REDEMPTION:
        new SecuritizeLiquidatorContract(this.sdk, liquidator);
        return;
      case PHANTOM_TOKEN_MIDAS_REDEMPTION:
        new MidasLiquidatorContract(this.sdk, liquidator);
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
    };
  }
}
