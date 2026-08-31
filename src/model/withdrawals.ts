import type { Address } from "viem";
import type { DelayedIntent } from "./delayed-intents.js";
import type { Timestamp, Token, TokenAmount, TxCall } from "./primitives.js";

/**
 * One token amount a delayed withdrawal produces, and when.
 **/
export interface WithdrawalOutputAmount extends TokenAmount {
  /**
   * `false` when the amount lands on the credit account as the withdrawal is
   * requested or claimed. `true` when it does not: the token is then the
   * withdrawal phantom standing for a part that has not matured, and another
   * claim is needed for it.
   *
   * A withdrawal that produces both at once is a legacy Mellow multivault: it
   * serves whatever its subvaults hold liquid and queues the remainder.
   **/
  isDelayed: boolean;
}

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
   * What the claim credits the account with. Everything a venue that answers
   * whole produces lands at once; one that pays in instalments credits part of
   * it as a fresh withdrawal position, see
   * {@link WithdrawalOutputAmount.isDelayed}.
   **/
  outputs: WithdrawalOutputAmount[];
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
   * matures and is claimed, see {@link WithdrawalOutputAmount.isDelayed} for
   * the ones a single claim will not bring.
   **/
  expectedOutputs: WithdrawalOutputAmount[];
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
