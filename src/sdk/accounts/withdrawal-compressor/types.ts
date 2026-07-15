import type { Address } from "viem";
import type { IBaseContract } from "../../base/index.js";
import type { MultiCall } from "../../types/index.js";

/**
 * App: 1.1 Deposit and 4.1 Adjust leverage — raise leverage at fixed TVL.
 * Borrow `underlying` -> swap `underlying` into `targetToken` -> [withdraw to wallet].
 **/
export interface DelayedIncreaseLeverageIntent {
  type: "INCREASE_LEVERAGE";
  /**
   * Wallet address that receives tokens withdrawn from the credit account
   * when the flow is resumed after the claim
   **/
  to: Address;
}

/**
 * App: 1.2 Deposit — `amount > 0`, leverage = current (grow net value at same L).
 * Add collateral -> borrow `underlying` -> swap collateral and `underlying`
 * into the target token.
 **/
export interface DelayedDepositIntent {
  type: "DEPOSIT";
}

/**
 * App: 1.3 Deposit and Adjust leverage — `amount > 0`, leverage > current.
 * Add collateral -> borrow `underlying` -> swap collateral and `underlying`
 * into the target token.
 **/
export interface DelayedDepositAndIncreaseLeverageIntent {
  type: "DEPOSIT_AND_INCREASE_LEVERAGE";
}

/**
 * App: 2.1 Withdraw — withdraw selected token at fixed leverage.
 * Swap token into `underlying` -> [decrease debt with `underlying` ->
 * withdraw token to wallet].
 **/
export interface DelayedWithdrawCollateralIntent {
  type: "WITHDRAW_COLLATERAL";
  /**
   * Wallet address that receives the withdrawn token
   * when the flow is resumed after the claim
   **/
  to: Address;
  /**
   * Token to withdraw from the credit account to the wallet after the claim
   **/
  withdrawToken: Address;
  /**
   * Amount of `withdrawToken` to withdraw to the wallet after the claim
   **/
  withdrawAmount: bigint;
}

/**
 * App: 2.2 Withdraw — close account (receive leftover to wallet).
 **/
export interface DelayedCloseAccountIntent {
  type: "CLOSE_ACCOUNT";
  /**
   * Wallet address that receives leftover tokens when the account is closed
   * after the claim
   **/
  to: Address;
}

/**
 * App: 3.1 Add collateral — fixed debt.
 * Add collateral -> swap collateral into the target token.
 **/
export interface DelayedAddCollateralIntent {
  type: "ADD_COLLATERAL";
}

/**
 * App: 4.2 Adjust leverage — lower leverage at fixed TVL.
 * Swap collateral into `underlying` -> [decrease debt with `underlying`].
 **/
export interface DelayedDecreaseLeverageIntent {
  type: "DECREASE_LEVERAGE";
}

/**
 * Lean intent that is abi-encoded into `extraData` of a delayed withdrawal
 * request and decoded back when reading claimable withdrawals.
 *
 * It allows the app to resume a multi-step operation that was interrupted by
 * a delayed withdrawal: the intent records which operation was in progress
 * (and the minimal set of parameters that cannot be re-derived at claim time),
 * so that after the withdrawal is claimed, the remaining steps can be
 * previewed and executed.
 **/
export type DelayedIntent =
  | DelayedIncreaseLeverageIntent
  | DelayedDepositIntent
  | DelayedDepositAndIncreaseLeverageIntent
  | DelayedWithdrawCollateralIntent
  | DelayedCloseAccountIntent
  | DelayedAddCollateralIntent
  | DelayedDecreaseLeverageIntent;

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
 * A single output of a (delayed) withdrawal: one token amount produced by
 * requesting or claiming a withdrawal.
 **/
export interface WithdrawalOutput {
  /**
   * Output token. For a delayed output, this is the withdrawal phantom token;
   * otherwise the actual token received (usually the withdrawable asset's
   * `underlying`)
   **/
  token: Address;
  /**
   * When `false`, the amount lands on the credit account immediately.
   * When `true`, the amount is only represented by the withdrawal phantom
   * token and becomes claimable after the withdrawal delay. A request can
   * produce both kinds at once, e.g. Mellow serves the liquid part of a
   * withdrawal instantly and queues the remainder
   **/
  isDelayed: boolean;
  /**
   * Amount of `token` produced (or expected to be produced) by the withdrawal
   **/
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
   * Source token: the collateral that is spent when the
   * withdrawal is requested, e.g. a Mellow multivault share, a Securitize
   * dsToken or a Midas mToken
   **/
  token: Address;
  /**
   * Withdrawal phantom token: a non-transferable collateral
   * token that represents the in-flight withdrawal position on the credit
   * account while the withdrawal is pending
   **/
  withdrawalPhantomToken: Address;
  /**
   * Target token: the token ultimately received when the
   * withdrawal is claimed
   **/
  underlying: Address;
  /**
   * Expected delay between requesting and claiming a withdrawal, in seconds
   **/
  withdrawalLength: bigint;
  /**
   * Maximum number of simultaneously open withdrawal requests per credit
   * account.
   * Not available on v310 compressors
   **/
  maxWithdrawals?: bigint;
}

/**
 * A single delayed withdrawal that is ready to be claimed.
 **/
export interface ClaimableWithdrawal {
  /**
   * Source token the withdrawal was requested from
   **/
  token: Address;
  /**
   * Withdrawal phantom token that represents this withdrawal position
   **/
  withdrawalPhantomToken: Address;
  /**
   * Amount of the withdrawal phantom token that will be burned when the
   * withdrawal is claimed
   **/
  withdrawalTokenSpent: bigint;
  /**
   * Tokens received by the credit account upon claiming
   **/
  outputs: WithdrawalOutput[];
  /**
   * Credit facade multicall (adapter calls) that executes the claim
   **/
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
  /**
   * Source token the withdrawal was requested from
   **/
  token: Address;
  /**
   * Withdrawal phantom token that represents this withdrawal position
   **/
  withdrawalPhantomToken: Address;
  /**
   * Estimated tokens the credit account will receive once the withdrawal
   * matures and is claimed
   **/
  expectedOutputs: WithdrawalOutput[];
  /**
   * Unix timestamp (in seconds) when the withdrawal becomes claimable
   **/
  claimableAt: bigint;
  /**
   * Delayed intent decoded from the withdrawal's `extraData`, enriched with
   * the credit manager of the credit account. `undefined` on compressor
   * versions below 313, and on v313+ when the withdrawal was requested
   * without an intent (empty `extraData`).
   **/
  intent?: DelayedIntentExtended;
}

/**
 * Result of previewing a delayed withdrawal request.
 **/
export interface RequestableWithdrawal {
  /**
   * Source token that will be spent by the request
   **/
  token: Address;
  /**
   * Amount of `token` that will actually be spent; the contract caps the
   * requested amount at the credit account's balance
   **/
  amountIn: bigint;
  /**
   * Expected outputs of the request: instant outputs land on the credit
   * account in the same transaction, delayed outputs become claimable
   * at `claimableAt`
   **/
  outputs: WithdrawalOutput[];
  /**
   * Credit facade multicall (adapter calls) that submits the withdrawal request
   **/
  requestCalls: MultiCall[];
  /**
   * Estimated unix timestamp (in seconds) when the delayed outputs become
   * claimable
   **/
  claimableAt: bigint;
}

/**
 * Delayed withdrawals of a credit account, split into immediately claimable
 * and still-pending entries.
 **/
export interface CurrentWithdrawals {
  /**
   * Withdrawals that have matured and can be claimed now
   **/
  claimable: ClaimableWithdrawal[];
  /**
   * Withdrawals that are still maturing
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
   * Resolves the withdrawal phantom token for a withdrawable source token
   * (e.g. a Mellow multivault share) of the given credit manager.
   * @throws When the token is not withdrawable from the credit manager.
   **/
  getWithdrawalPhantomToken(
    creditManager: Address,
    token: Address,
  ): Promise<Address>;
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
