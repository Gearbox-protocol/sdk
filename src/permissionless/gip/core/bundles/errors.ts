export type GipBuilderErrorCode =
  | "NO_NON_ZERO_LT_ASSETS"
  | "CREATE_CREDIT_SUITE_ACTION_NOT_FOUND"
  | "CREDIT_SUITE_NOT_FOUND";

export class GipBuilderError extends Error {
  constructor(
    public readonly code: GipBuilderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GipBuilderError";
  }
}
