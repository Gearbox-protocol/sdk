import { BaseError } from "viem";
import { z } from "zod/v4";

/**
 * Thrown when the backend answered, but with a payload the read model does not
 * describe, i.e. the two are of different versions.
 **/
export class OffchainValidationError extends BaseError {
  override name = "OffchainValidationError";

  /**
   * URL whose payload failed to validate.
   **/
  public readonly url: string;
  /**
   * The zod failure itself, e.g. for `z.treeifyError(error.zodError)`.
   **/
  public readonly zodError: z.core.$ZodError;

  constructor(url: string, zodError: z.core.$ZodError) {
    // not passed as `cause`: a zod error's own `message` is the JSON dump of
    // every issue, which is what viem would then report as the details
    super("The Gearbox backend response does not match the read model.", {
      metaMessages: [`URL: ${url}`, ...z.prettifyError(zodError).split("\n")],
    });
    this.url = url;
    this.zodError = zodError;
  }
}
