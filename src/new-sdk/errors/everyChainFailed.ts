import type { ResponseMetadata } from "../../model/index.js";

/**
 * Whether a merged envelope covered chains and lost every one of them, which is
 * what makes a read a failure rather than a partial result.
 **/
export function everyChainFailed(meta: ResponseMetadata): boolean {
  return (
    meta.chains.length > 0 &&
    meta.chains.every(chain => chain.status === "error")
  );
}
