import type { Address } from "viem";

/**
 * Thrown when the target of a transaction is neither a known Gearbox pool nor a
 * credit facade.
 */
export class UnsupportedTargetError extends Error {
  readonly target: Address;

  constructor(target: Address) {
    super(`unsupported transaction target: ${target}`);
    this.name = "UnsupportedTargetError";
    this.target = target;
  }
}

/**
 * Thrown when a pool call uses a function other than ERC4626 `deposit`/`redeem`.
 */
export class UnsupportedPoolFunctionError extends Error {
  readonly pool: Address;
  readonly functionName: string;

  constructor(pool: Address, functionName: string) {
    super(`unsupported pool function "${functionName}" on ${pool}`);
    this.name = "UnsupportedPoolFunctionError";
    this.pool = pool;
    this.functionName = functionName;
  }
}
