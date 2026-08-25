import { BaseError } from "viem";
import type { DataSource } from "../../model/index.js";

/**
 * Thrown when a source branch of a namespace is read in a mode that has no such
 * source, e.g. `sdk.opportunities.onchain` in `offchain` mode.
 **/
export class SourceUnavailableError extends BaseError {
  override name = "SourceUnavailableError";

  /**
   * Namespace whose branch was read.
   **/
  public readonly namespace: string;
  /**
   * Source this mode does not read.
   **/
  public readonly source: DataSource;

  constructor(namespace: string, source: DataSource) {
    super(`The ${namespace} namespace has no ${source} source in this mode.`);
    this.namespace = namespace;
    this.source = source;
  }
}
