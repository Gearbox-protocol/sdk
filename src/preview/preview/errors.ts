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
