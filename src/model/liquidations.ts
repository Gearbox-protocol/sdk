import type { Address } from "viem";
import type {
  AssetType,
  ChainId,
  Timestamp,
  Token,
  TokenAmount,
  TxCall,
} from "./primitives.js";

/**
 * Optional narrowing of a liquidatable accounts list.
 *
 * Every criterion is optional and an omitted one matches any value, so an empty
 * filter is the same as no filter at all. Criteria combine with AND.
 **/
export interface LiquidatableAccountFilter {
  /**
   * Keep only accounts on these chains.
   **/
  chainIds?: ChainId[];
  /**
   * Keep only accounts whose underlying — the token of
   * {@link LiquidatableAccount.totalValue} — is of this class.
   **/
  underlyingType?: AssetType;
  /**
   * Keep only accounts of paused credit facades, or only of unpaused ones.
   **/
  paused?: boolean;
  /**
   * Keep only accounts in markets that accept RWA collateral, or only the ones
   * outside them.
   **/
  rwa?: boolean;
  /**
   * Keep only accounts with (`true`) or without (`false`) delayed
   * (phantom-token) withdrawals.
   **/
  delayed?: boolean;
}

/**
 * A credit account that can be liquidated, with amounts precomputed for
 * manual liquidation.
 **/
export interface LiquidatableAccount {
  /**
   * Chain the account lives on.
   **/
  chainId: ChainId;
  /**
   * Credit account address.
   **/
  creditAccount: Address;
  /**
   * Credit manager the account is opened in.
   **/
  creditManager: Address;
  /**
   * Main asset being liquidated: the most valuable enabled non-underlying
   * collateral token. For delayed-withdrawal phantom tokens, the source
   * asset (e.g. ACRED) is reported instead of the phantom token. Falls back
   * to the underlying when the account holds no other collateral.
   **/
  asset: Token;
  /**
   * Account total value. The token is the unwrapped asset (e.g. USDC) for
   * RWA credit managers (1:1 with the wrapped underlying), the credit
   * manager underlying otherwise.
   **/
  totalValue: TokenAmount;
  /**
   * Estimated amount the liquidator pays to fully liquidate the account:
   * `totalValue * liquidationDiscount`. Same token as {@link totalValue}.
   **/
  repaymentAmount: TokenAmount;
  /**
   * Estimated liquidator profit: `totalValue * (1 - liquidationDiscount)`.
   * Same token as {@link totalValue}.
   **/
  estimatedProfit: TokenAmount;
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
  /**
   * Whether the account's market accepts real-world-asset collateral. Read
   * from a hardcoded per-chain list rather than from the chain.
   **/
  rwa: boolean;
}

/**
 * Whether a liquidatable account satisfies every criterion of a filter.
 *
 * This is the single definition of what each criterion means: every source
 * builds its rows first and runs them through here, so the chain and the
 * backend cannot disagree on what a filter selects.
 *
 * @param account - Row to test.
 * @param filter - Criteria to test against. An absent filter matches anything.
 **/
export function matchesLiquidatableAccountFilter(
  account: LiquidatableAccount,
  filter?: LiquidatableAccountFilter,
): boolean {
  if (!filter) {
    return true;
  }
  if (filter.chainIds && !filter.chainIds.includes(account.chainId)) {
    return false;
  }
  if (
    filter.underlyingType &&
    account.totalValue.token.assetType !== filter.underlyingType
  ) {
    return false;
  }
  if (filter.paused !== undefined && account.paused !== filter.paused) {
    return false;
  }
  if (filter.rwa !== undefined && account.rwa !== filter.rwa) {
    return false;
  }
  if (filter.delayed !== undefined && account.isDelayed !== filter.delayed) {
    return false;
  }
  return true;
}

/**
 * A token received directly from the credit account balance upon liquidation.
 **/
export interface InstantReceivedAsset extends TokenAmount {
  isDelayed: false;
}

/**
 * A token produced by a delayed withdrawal whose redeemer is transferred to
 * the liquidator upon liquidation.
 *
 * The amount is exact for claimable withdrawals, estimated for pending ones.
 **/
export interface DelayedReceivedAsset extends TokenAmount {
  isDelayed: true;
  /**
   * Redeemer contract transferred to the liquidator, from which the token
   * becomes claimable. `undefined` when the compressor does not report one.
   **/
  redeemerAddress?: Address;
  /**
   * Estimated moment a pending withdrawal becomes claimable. `undefined`
   * means the withdrawal is claimable now.
   **/
  claimableAt?: Timestamp;
}

/**
 * A single asset the liquidator receives when fully liquidating an account.
 **/
export type ReceivedAsset = InstantReceivedAsset | DelayedReceivedAsset;

/**
 * ERC-20 approval the liquidator must grant before sending the liquidation
 * transaction.
 *
 * The token is the one the compressor reports for the liquidation path it
 * selected: the credit manager underlying for standard liquidations, the
 * unwrapped stablecoin (e.g. USDC) for RWA ones. The value is what the
 * transaction pulls plus 0.5% of headroom.
 **/
export interface LiquidationApproval extends TokenAmount {
  /**
   * Address to approve
   **/
  spender: Address;
}

/**
 * A single delayed-withdrawal position owned by the liquidator.
 **/
export interface LiquidationPosition {
  /**
   * Chain the withdrawal lives on.
   **/
  chainId: ChainId;
  /**
   * Source asset spent by the delayed withdrawal (e.g. ACRED).
   **/
  sourceToken: Token;
  /**
   * Receivable asset (e.g. USDC) and its amount: exact for claimable
   * withdrawals, estimated for pending ones.
   **/
  output: TokenAmount;
  /**
   * Estimated moment a pending withdrawal becomes claimable. `undefined`
   * means the withdrawal is claimable now.
   **/
  claimableAt?: Timestamp;
  /**
   * Transaction that claims the withdrawal. `undefined` for pending
   * withdrawals and when the compressor reports no claim call.
   **/
  claimTx?: TxCall;
  /**
   * Redeemer contract the withdrawal is claimed from, owned by the liquidator.
   * `undefined` on compressor versions below 313, which do not report it.
   **/
  redeemer?: Address;
}

/**
 * Detailed information about a liquidatable credit account, including
 * the full breakdown of assets the liquidator receives.
 **/
export interface LiquidationDetails extends LiquidatableAccount {
  /**
   * Exact amount the liquidator pays for the liquidation, superseding
   * the estimate of {@link LiquidatableAccount}. The token is
   * {@link LiquidationApproval}'s, which for RWA markets is the
   * unwrapped stablecoin rather than {@link LiquidatableAccount.totalValue}'s
   * token; it falls back to the latter when nothing is pulled.
   **/
  repaymentAmount: TokenAmount;
  /**
   * Assets the liquidator receives upon full liquidation: direct credit
   * account balances plus outputs of delayed withdrawals (claimable and
   * pending).
   **/
  receivedAssets: ReceivedAsset[];
  /**
   * Whether the liquidator passes the KYC checks of the liquidated assets.
   * When the liquidator wallet was not provided, `false` only means that the
   * liquidation is KYC-gated, not that a particular wallet was rejected.
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
   * `undefined` when the liquidation is not KYC-gated, and when the token is
   * not in the SDK's token registry.
   **/
  kycToken?: Token;
  /**
   * ERC-20 approval required before sending the liquidation transaction.
   * `undefined` when the selected liquidation path needs no capital from the
   * liquidator, i.e. {@link repaymentAmount} is zero.
   **/
  approve?: LiquidationApproval;
}
