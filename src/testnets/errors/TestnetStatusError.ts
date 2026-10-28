import { TestnetsError } from "./TestnetsError.js";

/**
 * Thrown when anvil-manager answered with a status outside the 2xx range. What
 * it said about it, when it said anything, is the `details` of the error.
 **/
export class TestnetStatusError extends TestnetsError {
  override name = "TestnetStatusError";

  /**
   * Status anvil-manager answered with.
   **/
  declare public readonly status: number;

  constructor(url: string, status: number, details?: string) {
    super(`anvil-manager answered ${status}.`, {
      url,
      status,
      details,
    });
  }
}
