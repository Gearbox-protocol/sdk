import type { DataResponse } from "../../model/index.js";

/**
 * How one read combines what the two sources returned.
 *
 * Either side may be absent, and that is not the same as a side that failed: a
 * source which was not asked, or has not answered yet, contributes nothing and
 * lets the other one through, while a source that failed says so per chain in
 * its own metadata.
 *
 * The result is `undefined` only when neither side could contribute anything,
 * which is what lets a consumer keep a read pending until one of them does.
 *
 * @typeParam T - Payload type of the read.
 **/
export type SourceMerger<T> = (
  onchain: DataResponse<T> | undefined,
  offchain: DataResponse<T> | undefined,
) => DataResponse<T> | undefined;
