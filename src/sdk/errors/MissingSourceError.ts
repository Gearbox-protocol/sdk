import { BaseError } from "viem";
import type { DataSource } from "../../model/index.js";
import type { Mode } from "../types.js";

/**
 * Thrown at construction when a {@link GearboxSDK} was not given a source its
 * {@link Mode} reads from.
 **/
export class MissingSourceError extends BaseError {
  override name = "MissingSourceError";

  /**
   * Mode the SDK was built in.
   **/
  public readonly mode: Mode;
  /**
   * Source that mode needs and did not get.
   **/
  public readonly source: DataSource;

  constructor(mode: Mode, source: DataSource) {
    super(`A GearboxSDK in ${mode} mode needs an ${source} source.`);
    this.mode = mode;
    this.source = source;
  }
}
