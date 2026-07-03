/**
 * Thrown when a transaction's attached native value (`msg.value`) does not fit
 * into the WETH collateral declared by the multicall: such a transaction is
 * malformed and would not execute successfully.
 */
export class InvalidTransactionValueError extends Error {
  /** Transaction `msg.value`. */
  readonly value: bigint;
  /** Amount of wrapped native token added as collateral. */
  readonly wethCollateral: bigint;

  constructor(value: bigint, wethCollateral: bigint) {
    super(
      `transaction value ${value} exceeds WETH collateral ${wethCollateral}`,
    );
    this.name = "InvalidTransactionValueError";
    this.value = value;
    this.wethCollateral = wethCollateral;
  }
}

/**
 * Thrown by `previewOperation` for parsed operations it cannot preview yet.
 * Currently only pool operations and credit account opening are supported.
 */
export class UnsupportedOperationError extends Error {
  /** The parsed operation kind (the `operation` discriminant). */
  readonly operation: string;

  constructor(operation: string) {
    super(`operation "${operation}" is not supported by previewOperation`);
    this.name = "UnsupportedOperationError";
    this.operation = operation;
  }
}
