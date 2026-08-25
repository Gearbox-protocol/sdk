import type { ResponseMetadata } from "../../model/index.js";

/**
 * Thrown when a read had sources to ask and none of them served a single chain.
 **/
export class AllSourcesFailedError extends AggregateError {
  constructor(
    action: string,
    sourceErrors: unknown[],
    meta?: ResponseMetadata,
  ) {
    // a source that threw its whole leg said nothing about any chain, so the
    // reasons it gave are the report, rather than an entry fabricated per chain
    const causes = [...sourceErrors, ...chainErrors(meta)].filter(
      reason => reason !== undefined,
    );
    super(
      causes,
      `cannot ${action}, every source failed (${causes.join("; ")})`,
    );
    this.name = "AllSourcesFailedError";
  }
}

/**
 * Why each chain a merged envelope did report failed.
 **/
function chainErrors(meta: ResponseMetadata | undefined): unknown[] {
  return (meta?.chains ?? []).map(chain =>
    chain.status === "error" ? chain.error : undefined,
  );
}
