import type { Address } from "viem";

/**
 * ERC4626 `deposit` into a Gearbox pool.
 *
 * A deposit can reach the pool directly (an ERC4626 call sent straight to the
 * pool contract) or through a zapper (e.g. RWA-default pools and classic zapper
 * pools). When routed through a zapper, `zapper` is the call target and
 * `tokenIn` is the zapper's input token rather than the pool underlying.
 */
export interface PoolDepositOperation {
  /** ERC4626 operation kind. */
  operation: "Deposit";
  /** Destination pool the assets are deposited into. */
  pool: Address;
  /** Address credited with the minted pool shares. */
  receiver: Address;
  /** Amount of underlying assets supplied to the pool. */
  assets: bigint;
  /** Underlying token of the destination pool. */
  underlying: Address;
  /**
   * Token actually supplied by the caller: the pool underlying for direct
   * deposits, or the zapper's input token for zapper-routed deposits.
   */
  tokenIn: Address;
  /**
   * Token minted to the receiver: the pool's diesel token for direct
   * deposits, or the zapper's output token (e.g. a farmed/staked diesel
   * wrapper) for zapper-routed deposits.
   */
  tokenOut: Address;
  /** Zapper contract the call is sent to; `undefined` for direct deposits. */
  zapper?: Address;
  /** Referral code, present only for `depositWithReferral` calls. */
  referralCode?: bigint;
}

/**
 * ERC4626 `mint` into a Gearbox pool. Unlike `deposit`, the caller specifies the
 * amount of shares to mint; the assets pulled are resolved by the pool.
 */
export interface PoolMintOperation {
  /** ERC4626 operation kind. */
  operation: "Mint";
  /** Destination pool the shares are minted from. */
  pool: Address;
  /** Address credited with the minted pool shares. */
  receiver: Address;
  /** Pool shares (diesel) minted to the receiver. */
  shares: bigint;
  /** Underlying token of the destination pool. */
  underlying: Address;
  /**
   * Token actually supplied by the caller: the pool underlying for direct
   * mints, or the zapper's input token for zapper-routed mints.
   */
  tokenIn: Address;
  /**
   * Token minted to the receiver: the pool's diesel token for direct mints,
   * or the zapper's output token for zapper-routed mints.
   */
  tokenOut: Address;
  /** Zapper contract the call is sent to; `undefined` for direct mints. */
  zapper?: Address;
  /** Referral code, present only for `mintWithReferral` calls. */
  referralCode?: bigint;
}

/**
 * ERC4626 `withdraw` from a Gearbox pool. Unlike `redeem`, the caller specifies
 * the amount of underlying assets to withdraw; the shares burned are resolved by
 * the pool.
 */
export interface PoolWithdrawOperation {
  /** ERC4626 operation kind. */
  operation: "Withdraw";
  /** Source pool the assets are withdrawn from. */
  pool: Address;
  /** Address that receives the withdrawn tokens. */
  receiver: Address;
  /** Address whose pool shares are burned. */
  owner: Address;
  /** Underlying assets withdrawn to the receiver. */
  assets: bigint;
  /** Underlying token of the source pool. */
  underlying: Address;
  /**
   * Token burned from `owner`: the pool's diesel token for direct
   * withdrawals, or the zapper's share-side token for zapper-routed
   * withdrawals.
   */
  tokenIn: Address;
  /**
   * Token actually returned to the receiver: the pool underlying for direct
   * withdrawals, or the zapper's output token for zapper-routed withdrawals.
   */
  tokenOut: Address;
  /** Zapper contract the call is sent to; `undefined` for direct withdrawals. */
  zapper?: Address;
}

/**
 * ERC4626 `redeem` from a Gearbox pool.
 *
 * A redeem can reach the pool directly or through a zapper. When routed through
 * a zapper, `zapper` is the call target and `tokenOut` is the zapper's output
 * token rather than the pool underlying.
 */
export interface PoolRedeemOperation {
  /** ERC4626 operation kind. */
  operation: "Redeem";
  /** Source pool the shares are redeemed from. */
  pool: Address;
  /** Address that receives the redeemed tokens. */
  receiver: Address;
  /** Address whose pool shares are burned. */
  owner: Address;
  /**
   * Amount of {@link PoolRedeemOperation.tokenIn} burned: pool shares
   * (diesel) for direct redeems, or the zapper's share-side token amount for
   * zapper-routed redeems.
   */
  shares: bigint;
  /** Underlying token of the source pool. */
  underlying: Address;
  /**
   * Token burned from `owner`: the pool's diesel token for direct redeems, or
   * the zapper's share-side token (e.g. a farmed/staked diesel wrapper) for
   * zapper-routed redeems.
   */
  tokenIn: Address;
  /**
   * Token actually returned to the receiver: the pool underlying for direct
   * redeems, or the zapper's output token for zapper-routed redeems.
   */
  tokenOut: Address;
  /** Zapper contract the call is sent to; `undefined` for direct redeems. */
  zapper?: Address;
}

/**
 * ERC4626 pool operations. Each operation may be sent directly to the pool
 * contract or routed through a zapper (indicated by the optional `zapper`
 * field).
 */
export type PoolOperation =
  | PoolDepositOperation
  | PoolMintOperation
  | PoolWithdrawOperation
  | PoolRedeemOperation;

export type PoolOperationType = PoolOperation["operation"];
