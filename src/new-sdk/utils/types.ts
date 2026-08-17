import type { DataResponse } from "../../model/index.js";

/**
 * How one read combines what the two sources returned.
 *
 * @typeParam T - Payload type of the read.
 **/
export type SourceMerger<T> = (
  onchain: DataResponse<T> | undefined,
  offchain: DataResponse<T> | undefined,
) => DataResponse<T> | undefined;
