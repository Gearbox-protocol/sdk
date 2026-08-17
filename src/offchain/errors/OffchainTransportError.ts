import { BaseError } from "viem";
import { errorCause } from "./errorCause.js";

/**
 * What every transport failure of a backend read names, see
 * {@link OffchainTransportError}.
 **/
export interface OffchainTransportErrorParams {
  /**
   * URL that was requested, query included.
   **/
  url: string;
  /**
   * Status the backend answered with, absent when the request never completed.
   **/
  status?: number;
  /**
   * Value that was caught, normalised by {@link errorCause}.
   **/
  cause?: unknown;
  /**
   * What the backend itself said. Used only when there is no {@link cause},
   * whose message viem reports instead.
   **/
  details?: string;
}

/**
 * Thrown when the backend could not be reached, or answered with something
 * other than a JSON body in the 2xx range. Its subclasses say which of the
 * three it was; catch this one to catch all of them.
 **/
export abstract class OffchainTransportError extends BaseError {
  /**
   * URL that was requested, query included.
   **/
  public readonly url: string;
  /**
   * Status the backend answered with, absent when the request never completed.
   **/
  public readonly status?: number;

  protected constructor(
    shortMessage: string,
    params: OffchainTransportErrorParams,
  ) {
    const caught = errorCause(params.cause);
    super(shortMessage, {
      cause: caught.cause,
      details: caught.details ?? params.details,
      metaMessages: [
        `URL: ${params.url}`,
        ...(params.status === undefined ? [] : [`Status: ${params.status}`]),
      ],
    });
    this.url = params.url;
    this.status = params.status;
  }
}
