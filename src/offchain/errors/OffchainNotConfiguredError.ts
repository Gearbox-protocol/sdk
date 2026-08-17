import { BaseError } from "viem";

/**
 * Thrown when a read is issued against a client that was never told where the
 * backend is.
 **/
export class OffchainNotConfiguredError extends BaseError {
  override name = "OffchainNotConfiguredError";

  /**
   * Path that was read, below the base URL that is missing.
   **/
  public readonly path: string;

  constructor(path: string) {
    super("No baseUrl was configured for the Gearbox backend.", {
      metaMessages: [`Path: ${path}`],
    });
    this.path = path;
  }
}
