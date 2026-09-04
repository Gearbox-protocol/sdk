import { BaseError } from "viem";
import type { ChainId, DataSource } from "../../model/index.js";
import type { NetworkType } from "../../onchain/index.js";

/**
 * How a source names the chains it covers: by label or by id, depending on which
 * of the two it was configured with.
 **/
export type ChainRef = NetworkType | ChainId;

/**
 * Thrown at construction when a source covers anything other than exactly the
 * chains a {@link GearboxSDK} was built for, see
 * {@link GearboxSDKOptions.networks}.
 **/
export class SourceChainMismatchError extends BaseError {
  override name = "SourceChainMismatchError";

  /**
   * Source whose coverage does not match.
   **/
  public readonly source: DataSource;
  /**
   * Chains the SDK covers.
   **/
  public readonly expected: readonly ChainRef[];
  /**
   * Chains the source covers.
   **/
  public readonly covered: readonly ChainRef[];

  constructor(
    source: DataSource,
    expected: readonly ChainRef[],
    covered: readonly ChainRef[],
  ) {
    super(
      `The ${source} source does not cover the chains this GearboxSDK was built for.`,
      {
        metaMessages: [
          `Expected: ${named(expected)}`,
          `Covered: ${named(covered)}`,
        ],
      },
    );
    this.source = source;
    this.expected = [...expected];
    this.covered = [...covered];
  }
}

function named(chains: readonly ChainRef[]): string {
  return chains.join(", ") || "no chain";
}
