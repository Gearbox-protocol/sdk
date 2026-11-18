import { BaseError } from "viem";
export type GipBuilderErrorCode =
  | "NO_NON_ZERO_LT_ASSETS"
  | "CREATE_CREDIT_SUITE_ACTION_NOT_FOUND"
  | "CREDIT_SUITE_NOT_FOUND";

/** Thrown when a bundle cannot be customized for the market it is applied to. **/
export class GipBuilderError extends BaseError {
  override name = "GipBuilderError";

  constructor(
    public readonly code: GipBuilderErrorCode,
    message: string,
  ) {
    super(message);
  }
}
