import type { Address } from "viem";
import type { PoolSunsetError } from "../../../model/index.js";
import { poolSunset } from "../../../model/index.js";

export interface PoolSunsetArgs {
  isSunset: boolean;
  isDeposit: boolean;
  pool: Address;
}

/** A pool winding down still serves withdrawals, so only what puts money in is refused. */
export function checkPoolSunset(args: PoolSunsetArgs): PoolSunsetError[] {
  return args.isSunset && args.isDeposit ? [poolSunset(args.pool)] : [];
}
