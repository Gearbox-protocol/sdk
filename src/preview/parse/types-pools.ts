import type { Address } from "viem";

/**
 * ERC4626 `deposit` into a Gearbox pool.
 */
export interface PoolDepositOperation {
  operation: "Deposit";
  pool: Address;
  receiver: Address;
  /** Underlying assets supplied to the pool. */
  assets: bigint;
  underlying: Address;
  /** Referral code, present only for `depositWithReferral` calls. */
  referralCode?: bigint;
}

/**
 * ERC4626 `mint` into a Gearbox pool. Unlike `deposit`, the caller specifies the
 * amount of shares to mint; the assets pulled are resolved by the pool.
 */
export interface PoolMintOperation {
  operation: "Mint";
  pool: Address;
  receiver: Address;
  /** Pool shares (diesel) minted to the receiver. */
  shares: bigint;
  underlying: Address;
  /** Referral code, present only for `mintWithReferral` calls. */
  referralCode?: bigint;
}

/**
 * ERC4626 `withdraw` from a Gearbox pool. Unlike `redeem`, the caller specifies
 * the amount of underlying assets to withdraw; the shares burned are resolved by
 * the pool.
 */
export interface PoolWithdrawOperation {
  operation: "Withdraw";
  pool: Address;
  receiver: Address;
  owner: Address;
  /** Underlying assets withdrawn to the receiver. */
  assets: bigint;
  underlying: Address;
}

/**
 * ERC4626 `redeem` from a Gearbox pool.
 */
export interface PoolRedeemOperation {
  operation: "Redeem";
  pool: Address;
  receiver: Address;
  owner: Address;
  /** Pool shares (diesel) burned. */
  shares: bigint;
  underlying: Address;
}

export type PoolOperation =
  | PoolDepositOperation
  | PoolMintOperation
  | PoolWithdrawOperation
  | PoolRedeemOperation;
