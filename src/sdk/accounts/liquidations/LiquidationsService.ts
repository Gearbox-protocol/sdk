import type { Address } from "viem";
import type { CreditAccountData } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import { WAD } from "../../constants/index.js";
import { AddressSet } from "../../utils/index.js";
import {
  calcEstimatedProfit,
  calcRepaymentAmount,
  DUST_THRESHOLD,
  pickMainAsset,
} from "./helpers.js";
import type {
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  ILiquidationsService,
  LiquidatableAccount,
  LiquidationDetails,
  ReceivedAsset,
} from "./types.js";

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
    if (props?.networks && !props.networks.includes(this.sdk.networkType)) {
      return [];
    }

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
    const { network, creditAccount } = props;
    if (network !== this.sdk.networkType) {
      throw new Error(
        `network mismatch: this SDK is attached to ${this.sdk.networkType}, requested ${network}`,
      );
    }
    const ca = await this.sdk.accounts.getCreditAccountData(creditAccount);
    if (!ca) {
      throw new Error(`credit account ${creditAccount} not found`);
    }
    if (!ca.success) {
      throw new Error(
        `cannot compute liquidation details for ${creditAccount}: collateral computation failed`,
      );
    }

    const compressor = this.sdk.withdrawalCompressor;
    await compressor?.loadWithdrawableAssets();
    const account = this.#buildAccount(ca);

    const receivedAssets: ReceivedAsset[] = [];
    for (const t of ca.tokens) {
      if (
        t.balance > DUST_THRESHOLD &&
        !compressor?.getWithdrawalSourceToken(t.token)
      ) {
        receivedAssets.push({
          isDelayed: false,
          token: t.token,
          amount: t.balance,
        });
      }
    }

    if (account.isDelayed && compressor) {
      const { claimable, pending } =
        await compressor.getCurrentWithdrawals(creditAccount);
      for (const w of claimable) {
        for (const o of w.outputs) {
          receivedAssets.push({
            isDelayed: true,
            token: o.token,
            amount: o.amount,
            sourceToken: w.token,
          });
        }
      }
      for (const w of pending) {
        for (const o of w.expectedOutputs) {
          receivedAssets.push({
            isDelayed: true,
            token: o.token,
            amount: o.amount,
            sourceToken: w.token,
            claimableAt: w.claimableAt,
          });
        }
      }
    }

    return { ...account, receivedAssets };
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
