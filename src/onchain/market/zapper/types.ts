import type { Address, Hex } from "viem";
import type { IBaseContract } from "../../base/index.js";
import type { RawTx } from "../../types/index.js";
import type { ZapperData } from "../types.js";

/**
 * Deposit decoded from a zapper call
 */
export interface ParsedZapperDeposit {
  operation: "Deposit";
  /** Destination pool the zapper deposits into. */
  pool: Address;
  /** Zapper contract the call is sent to. */
  zapper: Address;
  receiver: Address;
  /** Amount of `tokenIn` supplied to the zapper. */
  assets: bigint;
  /** Underlying token of the destination pool. */
  underlying: Address;
  /** Referral code, present only for `depositWithReferral(...)` calls. */
  referralCode?: bigint;
}

/**
 * Redeem decoded from a zapper call. The zapper burns pool shares and returns
 * `token` to the receiver.
 */
export interface ParsedZapperRedeem {
  operation: "Redeem";
  /** Source pool the zapper redeems from. */
  pool: Address;
  /** Zapper contract the call is sent to. */
  zapper: Address;
  receiver: Address;
  /**
   * Amount of the zapper's `tokenOut` burned. This is the pool's diesel token
   * only when the zapper's `tokenOut` is the pool itself; for farmed/staked
   * wrappers it's denominated in the wrapper token.
   */
  shares: bigint;
  /** Underlying token of the source pool. */
  underlying: Address;
}

export type ParsedZapperOperation = ParsedZapperDeposit | ParsedZapperRedeem;

/**
 * Public interface for any Gearbox zapper contract wrapper.
 *
 * Based on contracts/interfaces/zappers/IZapper.sol in intergrations-v3 repo
 */
export interface IZapperContract extends IBaseContract, ZapperData {
  /**
   * Decodes zapper calldata into a {@link ParsedZapperOperation}.
   * @param calldata - Raw ABI-encoded calldata sent to the zapper.
   * @param value - Transaction `msg.value`, used for native-token deposits.
   */
  parseOperation(calldata: Hex, value?: bigint): ParsedZapperOperation;

  /**
   * Redeems pool shares (diesel tokens) for the underlying asset via this zapper.
   */
  redeem(tokenInAmount: bigint, receiver: Address): RawTx;

  /**
   * Redeems pool shares via this zapper with an EIP-2612 permit signature,
   * skipping a separate approve transaction.
   */
  redeemWithPermit(
    tokenInAmount: bigint,
    receiver: Address,
    deadline: bigint,
    v: number,
    r: Hex,
    s: Hex,
  ): RawTx;
}
