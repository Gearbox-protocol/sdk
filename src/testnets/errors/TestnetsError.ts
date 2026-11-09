import { BaseError } from "viem";

/**
 * What every failure of a testnet API call names, see {@link TestnetsError}.
 **/
export interface TestnetsErrorParams {
  /**
   * URL that was requested.
   **/
  url: string;
  /**
   * Status anvil-manager answered with, absent when the request never
   * completed.
   **/
  status?: number;
  /**
   * Value that was caught. An `Error` becomes the `cause`, anything else is
   * stringified into the details.
   **/
  cause?: unknown;
  /**
   * What anvil-manager itself said. Used only when there is no {@link cause},
   * whose message viem reports instead.
   **/
  details?: string;
  /**
   * Extra lines reported after the URL and status.
   **/
  metaMessages?: string[];
}

/**
 * Thrown by every testnet API call that fails. Its subclasses say how it
 * failed; catch this one to catch all of them.
 **/
export abstract class TestnetsError extends BaseError {
  /**
   * URL that was requested.
   **/
  public readonly url: string;
  /**
   * Status anvil-manager answered with, absent when the request never
   * completed.
   **/
  public readonly status?: number;

  protected constructor(summary: string, params: TestnetsErrorParams) {
    const { cause, details } = params;
    super(summary, {
      cause: cause instanceof Error ? cause : undefined,
      details:
        cause === undefined || cause instanceof Error ? details : String(cause),
      metaMessages: [
        `URL: ${params.url}`,
        ...(params.status === undefined ? [] : [`Status: ${params.status}`]),
        ...(params.metaMessages ?? []),
      ],
    });
    this.url = params.url;
    this.status = params.status;
  }
}
