import type { Address } from "viem";
import type { DelayedIntent } from "./delayed-intents.js";
import type { Timestamp, Token, TokenAmount, TxCall } from "./primitives.js";

/**
 * A delayed withdrawal of a strategy position that has matured and can be claimed.
 **/
export interface PositionClaimableWithdrawal {
  /**
   * Source token the withdrawal was requested from.
   **/
  sourceToken: Token;
  /**
   * Withdrawal phantom token that represents this position, and the amount
   * that will be burned when the withdrawal is claimed.
   **/
  withdrawalPhantomToken: TokenAmount;
  /**
   * Tokens received by the credit account upon claiming.
   **/
  outputs: TokenAmount[];
  /**
   * Adapter call that executes the claim. Subcompressors always report exactly
   * one call; it is wrapped into a facade multicall by `assembleClaimDelayedCalls`.
   **/
  claimCall: TxCall;
  /**
   * Redeemer contract the withdrawal is claimed from. `undefined` on
   * compressor versions below 313, which do not report it.
   **/
  redeemer?: Address;
  /**
   * Delayed intent decoded from the withdrawal's `extraData`. `undefined` on
   * compressor versions below 313, and on v313+ when the withdrawal was
   * requested without an intent (empty `extraData`).
   **/
  intent?: DelayedIntent;
}

/**
 * A delayed withdrawal of a strategy position that is not yet claimable.
 **/
export interface PositionPendingWithdrawal {
  /**
   * Source token the withdrawal was requested from.
   **/
  sourceToken: Token;
  /**
   * Withdrawal phantom token that represents this position.
   **/
  withdrawalPhantomToken: Token;
  /**
   * Estimated tokens the position will receive once the withdrawal
   * matures and is claimed.
   **/
  expectedOutputs: TokenAmount[];
  /**
   * Unix timestamp (in seconds) when the withdrawal becomes claimable.
   **/
  claimableAt: Timestamp;
  /**
   * Redeemer contract the withdrawal will be claimed from. `undefined` on
   * compressor versions below 313, which do not report it.
   **/
  redeemer?: Address;
  /**
   * Delayed intent decoded from the withdrawal's `extraData`. `undefined` on
   * compressor versions below 313, and on v313+ when the withdrawal was
   * requested without an intent (empty `extraData`).
   **/
  intent?: DelayedIntent;
}

/**
 * Delayed withdrawals of a strategy position, split into immediately claimable
 * and still-pending entries.
 **/
export interface PositionWithdrawals {
  /**
   * Withdrawals that have matured and can be claimed now.
   **/
  claimable: PositionClaimableWithdrawal[];
  /**
   * Withdrawals that are still maturing.
   **/
  pending: PositionPendingWithdrawal[];
}
