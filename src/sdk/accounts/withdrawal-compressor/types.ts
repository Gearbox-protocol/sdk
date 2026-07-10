import type { Address } from "viem";
import type { IBaseContract } from "../../base/index.js";
import type { MultiCall } from "../../types/index.js";
import type { DelayedIntent } from "./intent.js";

/**
 * Delayed intent decoded from `extraData`, enriched with data known at read time.
 **/
export type DelayedIntentExtended = DelayedIntent & {
  /**
   * Credit manager of the credit account the withdrawal belongs to
   **/
  creditManager: Address;
};

/**
 * A single output of a (delayed) withdrawal.
 **/
export interface WithdrawalOutput {
  token: Address;
  isDelayed: boolean;
  amount: bigint;
}

/**
 * An asset that can be withdrawn from a credit manager via delayed withdrawal.
 **/
export interface WithdrawableAsset {
  /**
   * Credit manager the asset is withdrawable from
   **/
  creditManager: Address;
  /**
   * Source token (e.g. rstETH)
   **/
  token: Address;
  /**
   * Withdrawal phantom token (e.g. wdwstETH)
   **/
  withdrawalPhantomToken: Address;
  /**
   * Target token (e.g. wstETH)
   **/
  underlying: Address;
  withdrawalLength: bigint;
  /**
   * Not available on v310 compressors
   **/
  maxWithdrawals?: bigint;
}

/**
 * A single delayed withdrawal that is ready to be claimed.
 **/
export interface ClaimableWithdrawal {
  token: Address;
  withdrawalPhantomToken: Address;
  withdrawalTokenSpent: bigint;
  outputs: WithdrawalOutput[];
  claimCalls: MultiCall[];
  /**
   * Delayed intent decoded from the withdrawal's `extraData`, enriched with
   * the credit manager of the credit account. `undefined` on compressor
   * versions below 313, and on v313+ when the withdrawal was requested
   * without an intent (empty `extraData`).
   **/
  intent?: DelayedIntentExtended;
}

/**
 * A single pending delayed withdrawal that is not yet claimable.
 **/
export interface PendingWithdrawal {
  token: Address;
  withdrawalPhantomToken: Address;
  expectedOutputs: WithdrawalOutput[];
  claimableAt: bigint;
}

/**
 * Result of previewing a delayed withdrawal request.
 **/
export interface RequestableWithdrawal {
  token: Address;
  amountIn: bigint;
  outputs: WithdrawalOutput[];
  requestCalls: MultiCall[];
  claimableAt: bigint;
}

/**
 * Delayed withdrawals of a credit account, split into immediately claimable
 * and still-pending entries.
 **/
export interface CurrentWithdrawals {
  claimable: ClaimableWithdrawal[];
  /**
   * Sorted by claimableAt in ascending order
   **/
  pending: PendingWithdrawal[];
}

/**
 * Version-agnostic interface of the WithdrawalCompressor contract.
 **/
export interface IWithdrawalCompressorContract extends IBaseContract {
  /**
   * Returns assets that can be withdrawn from the given credit manager via delayed withdrawal.
   **/
  getWithdrawableAssets(creditManager: Address): Promise<WithdrawableAsset[]>;
  /**
   * Same as {@link getWithdrawableAssets}, but for multiple credit managers in a single multicall.
   * Defaults to all credit managers known to the SDK's market register.
   * Failed per-manager calls are logged and skipped.
   **/
  getWithdrawableAssetsBatch(
    creditManagers?: Address[],
  ): Promise<WithdrawableAsset[]>;
  /**
   * Returns claimable and pending delayed withdrawals of the given credit account.
   **/
  getCurrentWithdrawals(creditAccount: Address): Promise<CurrentWithdrawals>;
  /**
   * Previews a delayed withdrawal request.
   *
   * When `intent` is provided, it is abi-encoded and passed as `extraData` to
   * the contract on v313+ compressors. On older versions, passing an intent
   * throws if `sdk.strictContractTypes` is `true`, otherwise a warning is
   * logged and the intent is ignored.
   **/
  getWithdrawalRequestResult(
    creditAccount: Address,
    token: Address,
    amount: bigint,
    intent?: DelayedIntent,
  ): Promise<RequestableWithdrawal>;
}
