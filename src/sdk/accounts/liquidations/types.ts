import type { Address } from "viem";
import type { Asset } from "../../base/index.js";
import type { NetworkType } from "../../chain/index.js";

/**
 * Filters for {@link ILiquidationsService.getLiquidatableAccounts}.
 * All filters are optional and applied after liquidatable accounts are fetched.
 **/
export interface GetLiquidatableAccountsProps {
  /**
   * Networks to query. On {@link MultichainLiquidationsService} selects which
   * chains to query; a single-chain service returns an empty list when its
   * own network is excluded.
   **/
  networks?: NetworkType[];
  /**
   * Only return accounts whose main liquidated {@link LiquidatableAccount.asset}
   * is one of these tokens.
   **/
  assets?: Address[];
  /**
   * When set, only return accounts with (`true`) or without (`false`)
   * delayed (phantom-token) withdrawals.
   **/
  delayed?: boolean;
}

/**
 * A credit account that can be liquidated, with amounts precomputed for
 * manual liquidation via the frontend.
 **/
export interface LiquidatableAccount {
  /**
   * Credit account address.
   **/
  creditAccount: Address;
  /**
   * Credit manager the account is opened in.
   **/
  creditManager: Address;
  /**
   * Network the account lives on.
   **/
  network: NetworkType;
  /**
   * Main asset being liquidated: the most valuable enabled non-underlying
   * collateral token. For delayed-withdrawal phantom tokens, the source
   * asset (e.g. ACRED) is reported instead of the phantom token. Falls back
   * to the underlying when the account holds no other collateral.
   **/
  asset: Address;
  /**
   * Account total value. The token is the unwrapped asset (e.g. USDC) for
   * RWA credit managers (1:1 with the wrapped underlying), the credit
   * manager underlying otherwise.
   **/
  totalValue: Asset;
  /**
   * Account total value in USD (8 decimals).
   **/
  totalValueUSD: bigint;
  /**
   * Estimated amount the liquidator pays to fully liquidate the account:
   * `totalValue * liquidationDiscount`. Same token as {@link totalValue}.
   **/
  repaymentAmount: Asset;
  /**
   * Estimated liquidator profit: `totalValue * (1 - liquidationDiscount)`.
   * Same token as {@link totalValue}.
   **/
  estimatedProfit: Asset;
  /**
   * `true` when the account holds a delayed-withdrawal phantom token above
   * dust, i.e. the liquidation transfers withdrawal redeemers into the
   * liquidator's ownership instead of instantly receivable tokens.
   **/
  isDelayed: boolean;
}

/**
 * Props for {@link ILiquidationsService.getLiquidationDetails}.
 **/
export interface GetLiquidationDetailsProps {
  /**
   * Network the credit account lives on.
   **/
  network: NetworkType;
  /**
   * Credit account to get liquidation details for.
   **/
  creditAccount: Address;
  /**
   * Liquidator wallet address. Reserved for future RWA KYC gating;
   * accepted but not checked yet.
   **/
  liquidator?: Address;
}

/**
 * A token received directly from the credit account balance upon liquidation.
 **/
export interface InstantReceivedAsset {
  isDelayed: false;
  /**
   * Token received by the liquidator.
   **/
  token: Address;
  /**
   * Amount of `token` received.
   **/
  amount: bigint;
}

/**
 * A token produced by a delayed withdrawal whose redeemer is transferred to
 * the liquidator upon liquidation.
 **/
export interface DelayedReceivedAsset {
  isDelayed: true;
  /**
   * Receivable token (e.g. USDC).
   **/
  token: Address;
  /**
   * Amount of `token`: exact for claimable withdrawals, estimated for
   * pending ones.
   **/
  amount: bigint;
  /**
   * Source asset spent by the delayed withdrawal (e.g. ACRED).
   **/
  sourceToken: Address;
  /**
   * Estimated unix timestamp (in seconds) when a pending withdrawal becomes
   * claimable. `undefined` means the withdrawal is claimable now.
   **/
  claimableAt?: bigint;
}

/**
 * A single asset the liquidator receives when fully liquidating an account.
 **/
export type ReceivedAsset = InstantReceivedAsset | DelayedReceivedAsset;

/**
 * Props for {@link ILiquidationsService.getLiquidatorWithdrawals}.
 **/
export interface GetLiquidatorWithdrawalsProps {
  /**
   * Networks to query. On {@link MultichainLiquidationsService} selects which
   * chains to query; a single-chain service returns an empty list when its
   * own network is excluded.
   **/
  networks?: NetworkType[];
  /**
   * Liquidator wallet that owns the redemption receipts (redeemer contracts
   * received as a result of liquidations).
   **/
  liquidator: Address;
}

/**
 * A single delayed-withdrawal position owned by the liquidator.
 *
 * The redeemer contract address is not included: it is not part of the
 * on-chain withdrawal structs returned by the withdrawal compressor. It can
 * be surfaced later if the compressor structs are extended.
 **/
export interface LiquidatorWithdrawal {
  /**
   * Network the withdrawal lives on.
   **/
  network: NetworkType;
  /**
   * Source asset spent by the delayed withdrawal (e.g. ACRED).
   **/
  sourceToken: Address;
  /**
   * Receivable asset (e.g. USDC).
   **/
  token: Address;
  /**
   * Amount of `token` receivable: exact for claimable withdrawals, estimated
   * for pending ones.
   **/
  amount: bigint;
  /**
   * Estimated unix timestamp (in seconds) when a pending withdrawal becomes
   * claimable. `undefined` means the withdrawal is claimable now.
   **/
  claimableAt?: bigint;
}

/**
 * Detailed information about a liquidatable credit account, extending the
 * list row with the full breakdown of assets the liquidator receives.
 **/
export interface LiquidationDetails extends LiquidatableAccount {
  /**
   * Assets the liquidator receives upon full liquidation: direct credit
   * account balances plus outputs of delayed withdrawals (claimable and
   * pending).
   **/
  receivedAssets: ReceivedAsset[];
}

/**
 * Service for discovering liquidatable credit accounts and previewing manual
 * liquidations. Implemented per-chain by {@link LiquidationsService} and
 * across all configured chains by {@link MultichainLiquidationsService}.
 **/
export interface ILiquidationsService {
  /**
   * Returns all liquidatable credit accounts: accounts with health factor
   * below 1 plus accounts of expired credit managers with outstanding debt.
   * Accounts whose collateral computation failed are excluded.
   *
   * @param props - Optional filters, see {@link GetLiquidatableAccountsProps}
   **/
  getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps,
  ): Promise<LiquidatableAccount[]>;
  /**
   * Returns detailed information about a liquidatable credit account,
   * including the full list of assets the liquidator receives.
   *
   * @param props - See {@link GetLiquidationDetailsProps}
   * @throws When the account is not found or its collateral computation fails.
   **/
  getLiquidationDetails(
    props: GetLiquidationDetailsProps,
  ): Promise<LiquidationDetails>;
  /**
   * Returns the status of delayed-withdrawal positions (redemption receipts)
   * owned by a liquidator wallet: what is receivable, how much, and when it
   * becomes claimable.
   *
   * @param props - See {@link GetLiquidatorWithdrawalsProps}
   **/
  getLiquidatorWithdrawals(
    props: GetLiquidatorWithdrawalsProps,
  ): Promise<LiquidatorWithdrawal[]>;
}
