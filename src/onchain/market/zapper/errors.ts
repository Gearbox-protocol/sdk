import type { Address } from "viem";

/**
 * Thrown when a zapper call uses a function other than a known
 * `deposit`/`redeem` variant.
 */
export class UnsupportedZapperFunctionError extends Error {
  readonly zapper: Address;
  readonly functionName: string;

  constructor(zapper: Address, functionName: string) {
    super(`unsupported zapper function "${functionName}" on ${zapper}`);
    this.name = "UnsupportedZapperFunctionError";
    this.zapper = zapper;
    this.functionName = functionName;
  }
}
