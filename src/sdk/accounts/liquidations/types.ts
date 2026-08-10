import type { Address } from "viem";
import type { Asset } from "../../base/index.js";
import type { NetworkType } from "../../chain/index.js";
import type {
  MultichainNetworkProps,
  MultichainNetworksProps,
  RawTx,
  WithMultichain,
} from "../../types/index.js";

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
 * Props for {@link LiquidationsService.getLiquidatableAccounts}.
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
   * {@link estimatedProfit} in USD (8 decimals): the same share of
   * {@link totalValueUSD} that it is of {@link totalValue}.
   **/
  estimatedProfitUSD: bigint;
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
 * Props for {@link LiquidationsService.getLiquidationDetails}.
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
 * Props for {@link LiquidationsService.buildLiquidationTx}.
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
 * Chain-independent part of {@link GetLiquidationPositionsProps}.
 **/
export interface GetLiquidationPositionsPropsBase {
  /**
   * Liquidator wallet that owns the redemption receipts (redeemer contracts
   * received as a result of liquidations).
   **/
  liquidator: Address;
}

/**
 * Props for {@link LiquidationsService.getLiquidationPositions}.
 **/
export type GetLiquidationPositionsProps<Multichain extends boolean = false> =
  GetLiquidationPositionsPropsBase &
    WithMultichain<Multichain, MultichainNetworksProps>;

/**
 * Props for {@link MultichainLiquidationsService.loadRWALiquidators}. The
 * per-chain {@link LiquidationsService.loadRWALiquidators} takes no props.
 **/
export type LoadRWALiquidatorsProps<Multichain extends boolean = false> =
  WithMultichain<Multichain, MultichainNetworksProps>;

/**
 * A single delayed-withdrawal position owned by the liquidator.
 **/
export interface LiquidationPosition {
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
