import type { Address, Hex } from "viem";
import type { Asset, CreditAccountData, PluginsMap } from "../../sdk/index.js";
import type { PoolOperationType, SdkWithAdapters } from "../parse/index.js";
import type { OperationSimulationOptions } from "../simulate/index.js";

/**
 * Input of {@link previewOperation}: the raw operation calldata plus the
 * already-attached SDK
 */
export interface PreviewOperationInput<P extends PluginsMap = PluginsMap> {
  /**
   * Already-attached SDK; chain, RPC and block are baked in at attach time.
   * Must be created with the adapters plugin (enforced at compile time) so
   * adapter contracts resolve during multicall classification.
   */
  sdk: SdkWithAdapters<P>;
  /**
   * Contract address that was called
   */
  to: Address;
  /**
   * Raw calldata of the operation
   */
  calldata: Hex;
  /**
   * Transaction sender
   */
  sender: Address;
  /**
   * Transaction `msg.value`
   **/
  value?: bigint;
}

/**
 * Options of {@link previewOperation}, extending the simulation options with
 * preview-specific inputs.
 */
export interface PreviewOperationOptions extends OperationSimulationOptions {
  /**
   * Pre-fetched state of the credit account being adjusted. When omitted,
   * multicall/botMulticall previews fetch it via
   * `sdk.accounts.getCreditAccountData` (one compressor read). Ignored by
   * other operation kinds.
   */
  creditAccount?: CreditAccountData;
}

/**
 * A token amount that may require an additional async call (e.g. an ERC4626
 * preview read) to determine. When that call fails, only the token address and
 * the error are returned.
 */
export type PreviewedAsset = Asset | { token: Address; error: Error };

export interface PoolOperationPreview {
  operation: PoolOperationType;
  /**
   * Pool address
   */
  pool: Address;
  /**
   * Token that goes from user to pool
   * In case of deposit, underlying for direct deposit, zapper input for zapper-routed deposit
   * In case of withdraw, pool shares (diesel token) for direct withdraw or zapper token out
   *
   * For mint/withdraw the amount of tokenIn cannot be determined from
   * transaction calldata alone and requires an additional async call
   * (previewMint/previewWithdraw). In case of error only the token address is
   * returned.
   */
  tokenIn: PreviewedAsset;
  /**
   * Token that goes from pool to user
   * In case of deposit, pool shares (diesel token) for direct deposit or zapper token out
   * In case of withdraw, underlying for direct withdraw or zapper token in
   *
   * For deposit/redeem the amount of tokenOut cannot be determined from
   * transaction calldata alone and requires an additional async call
   * (previewDeposit/previewRedeem). In case of error only the token address is
   * returned.
   */
  tokenOut: PreviewedAsset;
}

export interface OpenCreditAccountPreview {
  operation: "OpenCreditAccount" | "RWAOpenCreditAccount";
  /**
   * Credit manager the account is opened in
   */
  creditManager: Address;
  /**
   * Target token of strategy: the first quoted token, with its balance taken
   * from `assets`. Undefined when nothing is quoted.
   */
  target?: Asset;
  /**
   * Tokens that were added as collateral during account opening.
   *
   * When the transaction has native value attached, it is represented as a
   * `NATIVE_ADDRESS` entry, with the wrapped native token amount reduced
   * accordingly (omitted entirely when it reaches zero).
   */
  collateral: Asset[];
  /**
   * Sum of collateral tokens in underlying
   */
  collateralValue: bigint;
  /**
   * Borrowed amount in underlying
   */
  debt: bigint;
  /**
   * Desired quotas
   */
  quotas: Asset[];
  /**
   * Minimum amount of assets on credit account after it's opened,
   * as estimated by router
   */
  assets: Asset[];
}

export interface AdjustCreditAccountPreview {
  operation: "AdjustCreditAccount";
  /**
   * Credit manager the account is opened in
   */
  creditManager: Address;
  /**
   * Credit account that is being adjusted
   */
  creditAccount: Address;
  /**
   * Tokens that were added as collateral during account opening.
   *
   * When the transaction has native value attached, it is represented as a
   * `NATIVE_ADDRESS` entry, with the wrapped native token amount reduced
   * accordingly (omitted entirely when it reaches zero).
   */
  collateralAdded: Asset[];
  /**
   * Tokens that were withdrawn as collateral during account adjustment.
   */
  collateralWithdrawn: Asset[];
  /**
   * Sum of collateral tokens in underlying
   */
  totalValue: bigint;
  /**
   * Borrowed amount in underlying
   */
  debt: bigint;
  /**
   * Debt after minus debt before
   */
  debtChange: bigint;
  /**
   * Desired quotas
   */
  quotas: Asset[];
  /**
   * Quotas after minus quotas before
   */
  quotasChange: Asset[];
  /**
   * Minimum amount of assets on credit account after the operation,
   * as estimated by router
   */
  assets: Asset[];
  /**
   * Assets after minus assets before
   */
  assetsChange: Asset[];
}

export interface CloseCreditAccountPreview {
  operation: "CloseCreditAccount";
  /**
   * True when the account is closed permanently (facade `closeCreditAccount`
   * entry point), false when the debt is zeroed but the account stays open
   * (plain multicall).
   */
  permanent: boolean;
  /**
   * Credit manager the account belongs to
   */
  creditManager: Address;
  /**
   * Credit account that is being closed
   */
  creditAccount: Address;
  /**
   * Underlying withdrawn to the user: minimal guaranteed amount, from the
   * multicall replay (all collateral is swapped into underlying before
   * withdrawal)
   */
  receivedAmount: bigint;
}

export interface RepayCreditAccountPreview {
  operation: "RepayCreditAccount";
  /**
   * True when the account is closed permanently (facade `closeCreditAccount`
   * entry point), false when the debt is zeroed but the account stays open
   * (plain multicall).
   */
  permanent: boolean;
  /**
   * Credit manager the account belongs to
   */
  creditManager: Address;
  /**
   * Credit account that is being repaid
   */
  creditAccount: Address;
  /**
   * Tokens added from the wallet to cover the debt (`addCollateral` calls).
   *
   * When the transaction has native value attached, it is represented as a
   * `NATIVE_ADDRESS` entry, with the wrapped native token amount reduced
   * accordingly (omitted entirely when it reaches zero).
   */
  collateralAdded: Asset[];
  /**
   * Tokens returned to the user in-kind (`withdrawCollateral` calls, with the
   * MAX_UINT256 sentinel resolved against replayed balances)
   */
  collateralWithdrawn: Asset[];
  /**
   * Total debt repaid: principal + accrued interest + fees, in underlying
   */
  debtRepaid: bigint;
}

/**
 * Result of previewing a raw operation calldata: currently pool operations and
 * credit account opening, adjustment, closure and repayment are supported.
 */
export type OperationPreview =
  | PoolOperationPreview
  | OpenCreditAccountPreview
  | AdjustCreditAccountPreview
  | CloseCreditAccountPreview
  | RepayCreditAccountPreview;
