import type { DataResponse } from "../../model/index.js";

/**
 * Whether a merge could have been given nothing at all, i.e. both sides are
 * typed as possibly absent. One definite side already answers this `false`.
 **/
type BothMayBeMissing<Onchain, Offchain> = undefined extends Onchain & Offchain
  ? true
  : false;

/**
 * What merging two lists answers with: an envelope unless both sides could
 * still be missing, since a list merge serves whichever side did arrive.
 *
 * @typeParam Onchain - What the on-chain side was given as.
 * @typeParam Offchain - What the backend side was given as.
 * @typeParam T - Payload type of the read.
 **/
export type MergeListResult<Onchain, Offchain, T> =
  BothMayBeMissing<Onchain, Offchain> extends true
    ? DataResponse<T> | undefined
    : DataResponse<T>;

/**
 * What narrowing an already-read list answers with: `undefined` only where the
 * read itself was still in flight.
 *
 * @typeParam R - What the response was given as.
 * @typeParam T - Row type.
 **/
// a naked type parameter, so a `DataResponse<T[]> | undefined` argument
// distributes into both branches on its own
export type FilterResult<R, T> = R extends undefined
  ? undefined
  : DataResponse<T[]>;

/**
 * How a list read combines what the two sources returned. A side still in
 * flight is `undefined`; the merge answers with an envelope as soon as either
 * one has arrived, see {@link MergeListResult}.
 *
 * @typeParam T - Payload type of the read.
 **/
export type ListMerger<T> = <
  Onchain extends DataResponse<T> | undefined,
  Offchain extends DataResponse<T> | undefined,
>(
  onchain: Onchain,
  offchain: Offchain,
) => MergeListResult<Onchain, Offchain, T>;

/**
 * How a single-entity read combines what the two sources returned. Unlike
 * {@link ListMerger} this stays optional whatever it was given: neither source
 * may have served the entity, and there is nothing to answer with then.
 *
 * @typeParam T - Payload type of the read.
 **/
export type EntityMerger<T> = (
  onchain: DataResponse<T> | undefined,
  offchain: DataResponse<T> | undefined,
) => DataResponse<T> | undefined;
