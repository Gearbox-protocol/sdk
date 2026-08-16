import type { ChainId } from "../../model/index.js";

/**
 * The failure of a chain no source served. It is reported in that chain's
 * metadata entry rather than thrown: the other chains of the same read may
 * still have been served.
 **/
export class NoSourceServedError extends AggregateError {
  /**
   * Chain no source served.
   **/
  public readonly chainId: ChainId;

  constructor(chainId: ChainId, reasons: unknown[]) {
    super(reasons, `no source could serve chain ${chainId}`);
    this.name = "NoSourceServedError";
    this.chainId = chainId;
  }
}
