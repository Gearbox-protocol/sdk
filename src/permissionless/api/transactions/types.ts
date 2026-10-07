import type { Address } from "viem";
import type { InstanceTxs } from "../../utils/governance/types.js";

/**
 * What every batch of {@link InstanceOwnerTransactions} names.
 *
 * The chain must be among the ones the client was constructed with, see
 * {@link GearboxPermissionlessOptions.chains}: a batch is built off the chain
 * it will be executed on.
 **/
export interface InstanceTxsArgs {
  chainId: number;
  /**
   * Whose rows the batch is built from, and who it records as its author.
   *
   * Required: unlike the backend routes this replaced, nothing here carries
   * an identity of its own, so the caller names the curator whose private
   * feeds and connections the batch applies.
   **/
  owner: Address;
}

/** Args of {@link InstanceOwnerTransactions.changeNames}. */
export interface ChangeNamesArgs extends InstanceTxsArgs {
  /** The new name of each feed, keyed by the feed's address. */
  names: Record<Address, string>;
}

/** Args of {@link InstanceOwnerTransactions.changeStalenessPeriods}. */
export interface ChangeStalenessPeriodsArgs extends InstanceTxsArgs {
  /** The new staleness period in seconds, keyed by the feed's address. */
  periods: Record<Address, number>;
}

/** Args of {@link InstanceOwnerTransactions.forbidFeeds}. */
export interface ForbidFeedsArgs extends InstanceTxsArgs {
  /** The feeds to forbid, keyed by the asset they were allowed for. */
  tokens: Record<Address, Address[]>;
}

/**
 * What a batch would look like on IPFS, without putting it there.
 **/
export interface InstanceTxsPreview {
  /** The CID the batch would get, derived the way the pinning service does. */
  cid: string;
  /** Whether the gateway already serves it. */
  isUploaded: boolean;
  uploadedAt?: string;
  /** Size of the serialised batch, in bytes. */
  size: number;
}

/** Args of {@link InstanceOwnerTransactions.preview} and `upload`. */
export interface InstanceTxsBodyArgs {
  instanceTxs: InstanceTxs;
}
