import type { Address } from "viem";
import type { Asset } from "../../base/index.js";
import type { NetworkType } from "../../chain/index.js";
import type { RawTx } from "../../types/index.js";

/**
 * Selects the chain for single-account methods of a multichain service.
 **/
export interface MultichainNetworkProps {
  /**
   * Network the credit account lives on.
   **/
  network: NetworkType;
}

/**
 * Restricts which chains a multichain list method queries.
 **/
export interface MultichainNetworksProps {
  /**
   * Networks to query. All chains configured in {@link MultichainSDK} when
   * omitted.
   **/
  networks?: NetworkType[];
}

/**
 * Adds chain-scoping props `T` only when the service spans multiple chains.
 **/
export type WithMultichain<
  Multichain extends boolean,
  T extends object,
> = Multichain extends true ? T : {};

/**
 * Chain-independent part of {@link GetLiquidatableAccountsProps}.
 * All filters are optional and applied after liquidatable accounts are fetched.
 **/
export interface GetLiquidatableAccountsPropsBase {
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
 * Props for {@link ILiquidationsService.getLiquidatableAccounts}.
 **/
export type GetLiquidatableAccountsProps<Multichain extends boolean = false> =
  GetLiquidatableAccountsPropsBase &
    WithMultichain<Multichain, MultichainNetworksProps>;

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
  /**
   * `true` when the credit manager's facade is paused. Liquidations of such
   * accounts only succeed for emergency liquidators approved in the market.
   **/
  paused: boolean;
}

/**
 * Chain-independent part of {@link GetLiquidationDetailsProps}.
 **/
export interface GetLiquidationDetailsPropsBase {
  /**
   * Credit account to get liquidation details for.
   **/
  creditAccount: Address;
  /**
   * Liquidator wallet address, used by the liquidation compressor to check
   * KYC eligibility. When omitted, the zero address is used: amounts and
   * received assets are unaffected, but {@link LiquidationDetails.isLiquidatorEligible}
   * then only tells whether the liquidation is KYC-gated at all
   * (see {@link LiquidationDetails.kycProtocol}).
   **/
  liquidator?: Address;
  /**
   * If true, reserve price feed updates are excluded from the price updates
   * applied by the compressor before computing amounts.
   **/
  ignoreReservePrices?: boolean;
}

/**
 * Props for {@link ILiquidationsService.getLiquidationDetails}.
 **/
export type GetLiquidationDetailsProps<Multichain extends boolean = false> =
  GetLiquidationDetailsPropsBase &
    WithMultichain<Multichain, MultichainNetworkProps>;

/**
 * Chain-independent part of {@link BuildLiquidationTxProps}.
 **/
export interface BuildLiquidationTxPropsBase {
  /**
   * Credit account to liquidate.
   **/
  creditAccount: Address;
  /**
   * Liquidator wallet address. Required: it is encoded into the transaction
   * as the receiver of the liquidated collateral.
   **/
  liquidator: Address;
  /**
   * If true, reserve price feed updates are excluded from the price updates
   * applied by the compressor before building the transaction.
   **/
  ignoreReservePrices?: boolean;
}

/**
 * Props for {@link ILiquidationsService.buildLiquidationTx}.
 **/
export type BuildLiquidationTxProps<Multichain extends boolean = false> =
  BuildLiquidationTxPropsBase &
    WithMultichain<Multichain, MultichainNetworkProps>;

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
   * Redeemer contract transferred to the liquidator, from which `token`
   * becomes claimable. `undefined` when the compressor does not report one.
   **/
  redeemerAddress?: Address;
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
 * Chain-independent part of {@link GetLiquidatorWithdrawalsProps}.
 **/
export interface GetLiquidatorWithdrawalsPropsBase {
  /**
   * Liquidator wallet that owns the redemption receipts (redeemer contracts
   * received as a result of liquidations).
   **/
  liquidator: Address;
}

/**
 * Props for {@link ILiquidationsService.getLiquidatorWithdrawals}.
 **/
export type GetLiquidatorWithdrawalsProps<Multichain extends boolean = false> =
  GetLiquidatorWithdrawalsPropsBase &
    WithMultichain<Multichain, MultichainNetworksProps>;

/**
 * Props for {@link ILiquidationsService.loadRWALiquidators}.
 **/
export type LoadRWALiquidatorsProps<Multichain extends boolean = false> =
  WithMultichain<Multichain, MultichainNetworksProps>;

/**
 * A single delayed-withdrawal position owned by the liquidator.
 **/
export interface LiquidatorWithdrawal {
  /**
   * Network the withdrawal lives on.
   **/
  network: NetworkType;
  /**
   * Chain id the withdrawal lives on.
   **/
  chainId: number;
  /**
   * Source asset spent by the delayed withdrawal (e.g. ACRED).
   **/
  sourceToken: Address;
  /**
   * Receivable asset (e.g. USDC) and its amount: exact for claimable
   * withdrawals, estimated for pending ones.
   **/
  output: Asset;
  /**
   * Estimated unix timestamp (in seconds) when a pending withdrawal becomes
   * claimable. `undefined` means the withdrawal is claimable now.
   **/
  claimableAt?: bigint;
  /**
   * Transaction that claims the withdrawal. `undefined` for pending
   * withdrawals and when the compressor reports no claim call.
   **/
  claimTx?: RawTx;
  /**
   * Redeemer contract the withdrawal is claimed from, owned by the liquidator.
   * `undefined` on compressor versions below 313, which do not report it.
   **/
  redeemer?: Address;
}

/**
 * ERC-20 approval the liquidator must grant before sending the liquidation
 * transaction.
 **/
export interface LiquidationApproval {
  /**
   * Address to approve: the credit manager when the liquidation goes directly
   * through the credit facade (the facade forwards `msg.sender` as the payer
   * and the credit manager executes the transfer), or the dedicated liquidator
   * contract (Midas / Securitize) when the liquidation goes through one, since
   * such contracts pull the token to themselves first.
   **/
  spender: Address;
  /**
   * Token pulled from the liquidator, as reported by the compressor for the
   * liquidation path it selected: the credit manager underlying for standard
   * liquidations, the unwrapped stablecoin (e.g. USDC) for RWA ones.
   **/
  token: Address;
  /**
   * Amount to approve: the amount the liquidation transaction pulls plus 0.5%
   * of headroom. The Securitize liquidator recomputes the amount on-chain, so
   * the approval must survive price movements after the preview.
   **/
  amount: bigint;
}

/**
 * Detailed information about a liquidatable credit account, including
 * the full breakdown of assets the liquidator receives.
 *
 **/
export interface LiquidationDetails extends LiquidatableAccount {
  /**
   * Exact amount the liquidator pays for the liquidation path the compressor
   * selected, superseding the estimate of {@link LiquidatableAccount}. The
   * token is {@link LiquidationApproval.token}, which for RWA markets is the
   * unwrapped stablecoin rather than {@link LiquidatableAccount.totalValue}'s
   * token; it falls back to the latter when nothing is pulled.
   **/
  repaymentAmount: Asset;
  /**
   * Assets the liquidator receives upon full liquidation: direct credit
   * account balances plus outputs of delayed withdrawals (claimable and
   * pending).
   **/
  receivedAssets: ReceivedAsset[];
  /**
   * Whether the liquidator passes the KYC checks of the liquidated assets.
   * When {@link GetLiquidationDetailsPropsBase.liquidator} was not provided,
   * `false` only means that the liquidation is KYC-gated, not that a
   * particular wallet was rejected.
   **/
  isLiquidatorEligible: boolean;
  /**
   * `true` when the credit account is frozen by the RWA factory
   * (`isFrozen`) and cannot move its RWA collateral. Always `false` for
   * non-RWA liquidation paths.
   **/
  isCreditAccountFrozen: boolean;
  /**
   * Name of the KYC protocol the liquidator must be whitelisted in
   * (e.g. `"securitize"`). `undefined` when the liquidation is not KYC-gated.
   **/
  kycProtocol?: string;
  /**
   * Token the liquidator must be whitelisted for in {@link kycProtocol}.
   * `undefined` when the liquidation is not KYC-gated.
   **/
  kycToken?: Address;
  /**
   * ERC-20 approval required before sending the liquidation transaction.
   * `undefined` when the selected liquidation path needs no capital from the
   * liquidator, i.e. {@link repaymentAmount} is zero.
   **/
  approve?: LiquidationApproval;
}

/**
 * Service for discovering liquidatable credit accounts and previewing manual
 * liquidations. Implemented per-chain by {@link LiquidationsService} and
 * across all configured chains by {@link MultichainLiquidationsService}.
 *
 * @typeParam Multichain - When `true`, props select the chain to operate on:
 * {@link MultichainNetworkProps} for single-account methods and
 * {@link MultichainNetworksProps} for list methods. A per-chain service
 * operates on the network its SDK is attached to and takes no network props.
 **/
export interface ILiquidationsService<Multichain extends boolean = false> {
  /**
   * Returns all liquidatable credit accounts: accounts with health factor
   * below 1 plus accounts of expired credit managers with outstanding debt.
   * Accounts whose collateral computation failed are excluded.
   *
   * @param props - Optional filters, see {@link GetLiquidatableAccountsProps}
   **/
  getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps<Multichain>,
  ): Promise<LiquidatableAccount[]>;
  /**
   * Returns detailed information about a liquidatable credit account,
   * including the full list of assets the liquidator receives.
   *
   * @param props - See {@link GetLiquidationDetailsProps}
   * @throws When the account is not found or its collateral computation fails.
   **/
  getLiquidationDetails(
    props: GetLiquidationDetailsProps<Multichain>,
  ): Promise<LiquidationDetails>;
  /**
   * Builds the transaction that fully liquidates a credit account, repaying
   * the debt from own funds and receiving the collateral from the credit account.
   *
   * @param props - See {@link BuildLiquidationTxProps}
   **/
  buildLiquidationTx(
    props: BuildLiquidationTxProps<Multichain>,
  ): Promise<RawTx>;
  /**
   * Returns the status of delayed-withdrawal positions (redemption receipts)
   * owned by a liquidator wallet: what is receivable, how much, and when it
   * becomes claimable.
   *
   * @param props - See {@link GetLiquidatorWithdrawalsProps}
   **/
  getLiquidatorWithdrawals(
    props: GetLiquidatorWithdrawalsProps<Multichain>,
  ): Promise<LiquidatorWithdrawal[]>;
  /**
   * Discovers the dedicated RWA liquidator contracts (Securitize, Midas)
   * deployed for the markets of the chain and registers them in the SDK
   * contracts register.
   *
   * @param props - See {@link LoadRWALiquidatorsProps}
   **/
  loadRWALiquidators(
    props?: LoadRWALiquidatorsProps<Multichain>,
  ): Promise<void>;
}
