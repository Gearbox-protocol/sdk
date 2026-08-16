import { OffchainTransportError } from "./OffchainTransportError.js";

/**
 * Thrown when the backend answered in the 2xx range with a body that is not
 * JSON, so there is nothing to validate against the read model.
 **/
export class OffchainInvalidJsonError extends OffchainTransportError {
  override name = "OffchainInvalidJsonError";

  /**
   * Status the backend answered with.
   **/
  public declare readonly status: number;

  constructor(url: string, status: number, cause: unknown) {
    super("The Gearbox backend answered with a body that is not JSON.", {
      url,
      status,
      cause,
    });
  }
}
