import { TestnetsError } from "./TestnetsError.js";

/**
 * Thrown when a testnet did not become ready before the wait for it ran out.
 **/
export class TestnetWaitTimeoutError extends TestnetsError {
  override name = "TestnetWaitTimeoutError";

  /**
   * Execution id of the testnet that was waited for.
   **/
  public readonly id: string;
  /**
   * How long the wait lasted, in milliseconds.
   **/
  public readonly timeout: number;

  /**
   * @param url - Status URL that was polled.
   **/
  constructor(url: string, id: string, timeout: number) {
    super(`Testnet ${id} did not become ready within ${timeout} ms.`, {
      url,
      metaMessages: [`Execution id: ${id}`, `Timeout: ${timeout} ms`],
    });
    this.id = id;
    this.timeout = timeout;
  }
}
