import { z } from "zod/v4";
import { TestnetsError } from "./TestnetsError.js";

/**
 * Thrown when anvil-manager answered, but with a payload the testnet schemas
 * do not describe, i.e. the two are of different versions.
 **/
export class TestnetValidationError extends TestnetsError {
  override name = "TestnetValidationError";

  /**
   * The zod failure itself, e.g. for `z.treeifyError(error.zodError)`.
   **/
  public readonly zodError: z.core.$ZodError;

  constructor(url: string, zodError: z.core.$ZodError) {
    // not passed as `cause`: a zod error's own `message` is the JSON dump of
    // every failed check, which is what viem would then report as the details
    super("The anvil-manager response does not match the testnet schemas.", {
      url,
      metaMessages: z.prettifyError(zodError).split("\n"),
    });
    this.zodError = zodError;
  }
}
