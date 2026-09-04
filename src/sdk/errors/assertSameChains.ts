import type { DataSource } from "../../model/index.js";
import type { ChainRef } from "./SourceChainMismatchError.js";
import { SourceChainMismatchError } from "./SourceChainMismatchError.js";

/**
 * Rejects a source covering anything other than exactly the chains the SDK was
 * built for. A source is not narrowed to them: it has to name them.
 **/
export function assertSameChains<T extends ChainRef>(
  source: DataSource,
  expected: readonly T[],
  covered: readonly T[],
): void {
  if (
    covered.length !== expected.length ||
    covered.some(chain => !expected.includes(chain))
  ) {
    throw new SourceChainMismatchError(source, expected, covered);
  }
}
