import { backendMessage } from "./backendMessage.js";
import { OffchainTransportError } from "./OffchainTransportError.js";

/**
 * Thrown when the backend answered with a status outside the 2xx range. What it
 * said about it, when it said anything, is the `details` of the error.
 **/
export class OffchainStatusError extends OffchainTransportError {
  override name = "OffchainStatusError";

  /**
   * Status the backend answered with.
   **/
  public declare readonly status: number;

  constructor(url: string, status: number, body?: string) {
    super(`The Gearbox backend answered ${status}.`, {
      url,
      status,
      details: backendMessage(body),
    });
  }
}
