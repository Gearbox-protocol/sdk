import type { Address, Hex } from "viem";
import type { Asset, PluginsMap } from "../../sdk/index.js";
import type { PoolOperationType, SdkWithAdapters } from "../parse/index.js";

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
  operation: "OpenCreditAccount" | "SecuritizeOpenCreditAccount";
  /**
   * Target token of strategy: the first quoted token, with its balance taken
   * from `assets`. Undefined when nothing is quoted.
   */
  target?: Asset;
  /**
   * Tokens that were added as collateral during account opening
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

/**
 * Result of previewing a raw operation calldata: currently pool operations and
 * credit account opening are supported.
 */
export type OperationPreview = PoolOperationPreview | OpenCreditAccountPreview;
