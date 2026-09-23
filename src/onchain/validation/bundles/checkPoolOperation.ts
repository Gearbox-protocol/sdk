import type { Address } from "viem";
import type {
  InsufficientPoolLiquidityError,
  PoolPausedError,
  PoolSunsetError,
  TokenAmount,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import {
  checkPoolLiquidity,
  checkPoolPaused,
  checkPoolSunset,
} from "../checks/index.js";

/** {@inheritDoc checkPoolOperation} */
export type PoolOperationError =
  | PoolPausedError
  | PoolSunsetError
  | InsufficientPoolLiquidityError;

export interface PoolOperationArgs {
  sdk: OnchainSDK;
  /** Pool the liquidity moves through. */
  pool: Address;
  /** Whether the operation puts liquidity in rather than taking it out. */
  isDeposit: boolean;
  /**
   * What the wallet receives. Weighed against the pool's liquidity on a
   * withdrawal, where it is the underlying leaving the pool; on a deposit it
   * is the shares the pool mints and nothing weighs it.
   */
  tokenOut: TokenAmount;
}

/** What the pool's own state stops, whichever side of it the wallet is on. */
export function checkPoolOperation(
  args: PoolOperationArgs,
): PoolOperationError[] {
  const { sdk, pool, isDeposit, tokenOut } = args;
  const market = sdk.marketRegister.findByPool(pool);
  return [
    ...checkPoolPaused({ isPaused: market.pool.pool.isPaused, pool }),
    ...checkPoolSunset({ isSunset: market.sunset, isDeposit, pool }),
    // A withdrawal is served out of what the pool actually holds.
    ...(isDeposit
      ? []
      : checkPoolLiquidity({
          requested: tokenOut.value,
          available: sdk.pools.withdrawableLiquidity(pool).value,
          underlying: tokenOut.token,
        })),
  ];
}
