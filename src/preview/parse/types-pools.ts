import type { Address } from "viem";

import type { TokenTransfer } from "./types-adapters.js";

/**
 * ERC4626 `deposit` into a Gearbox pool.
 * Token metadata (symbol/decimals) is intentionally omitted: consumers resolve
 * it from `sdk.tokensMeta` using the token addresses below.
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
  /**
   * ERC-20 transfers involving the wallet, recovered by simulating the call.
   * Empty for the calldata-only parse; populated by the simulation stage.
   */
  transfers: TokenTransfer[];
}

/**
 * ERC4626 `redeem` from a Gearbox pool.
 * Token metadata (symbol/decimals) is intentionally omitted: consumers resolve
 * it from `sdk.tokensMeta` using the token addresses below.
 */
export interface PoolRedeemOperation {
  operation: "Redeem";
  pool: Address;
  receiver: Address;
  owner: Address;
  /** Pool shares (diesel) burned. */
  shares: bigint;
  underlying: Address;
  /**
   * ERC-20 transfers involving the wallet, recovered by simulating the call.
   * Empty for the calldata-only parse; populated by the simulation stage.
   */
  transfers: TokenTransfer[];
}

export type PoolOperation = PoolDepositOperation | PoolRedeemOperation;
