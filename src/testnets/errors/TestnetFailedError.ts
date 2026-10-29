import type { TestnetStatus } from "../types.js";
import { TestnetsError } from "./TestnetsError.js";

/**
 * Thrown when a testnet that was waited for can no longer become ready: its
 * deployment failed, it was terminated, or its backend sidecar failed.
 **/
export class TestnetFailedError extends TestnetsError {
  override name = "TestnetFailedError";

  /**
   * Execution id of the testnet that was waited for.
   **/
  public readonly id: string;
  /**
   * Why the testnet cannot become ready.
   **/
  public readonly reason: string;
  /**
   * The status that showed it.
   **/
  public readonly testnet: TestnetStatus;

  /**
   * @param url - Status URL that was polled.
   **/
  constructor(url: string, id: string, reason: string, testnet: TestnetStatus) {
    super(`Testnet ${id} cannot become ready.`, {
      url,
      details: reason,
      metaMessages: [`Execution id: ${id}`, `State: ${testnet.state}`],
    });
    this.id = id;
    this.reason = reason;
    this.testnet = testnet;
  }
}
