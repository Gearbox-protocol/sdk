import type { Address } from "viem";
import type { PoolPausedError } from "../../../model/index.js";
import { poolPaused } from "../../../model/index.js";

export interface PoolPausedArgs {
  isPaused: boolean;
  pool: Address;
}

/** A paused pool neither takes deposits nor serves withdrawals. */
export function checkPoolPaused(args: PoolPausedArgs): PoolPausedError[] {
  return args.isPaused ? [poolPaused(args.pool)] : [];
}
