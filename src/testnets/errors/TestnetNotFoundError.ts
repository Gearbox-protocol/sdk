import { TestnetStatusError } from "./TestnetStatusError.js";

/**
 * Thrown when anvil-manager answered 404: there is no testnet with that
 * execution id.
 **/
export class TestnetNotFoundError extends TestnetStatusError {
  override name = "TestnetNotFoundError";

  declare public readonly status: 404;

  constructor(url: string, details?: string) {
    super(url, 404, details);
  }
}
