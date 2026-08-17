import { BaseError } from "viem";

/**
 * Thrown by the endpoints that are not implemented yet.
 **/
export class OffchainNotImplementedError extends BaseError {
  override name = "OffchainNotImplementedError";

  /**
   * Endpoint that was asked for.
   **/
  public readonly endpoint: string;

  constructor(endpoint: string) {
    super("This Gearbox backend endpoint is not implemented yet.", {
      metaMessages: [`Endpoint: ${endpoint}`],
    });
    this.endpoint = endpoint;
  }
}
