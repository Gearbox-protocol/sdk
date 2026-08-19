import type {
  Address,
  ContractFunctionArgs,
  ContractFunctionParameters,
} from "viem";
import type { creditAccountCompressorAbi } from "../../../abi/compressors/creditAccountCompressor.js";
import type { IPriceUpdateTx } from "../../types/index.js";

/**
 * @internal
 * Arguments tuple for the credit account compressor's `getCreditAccounts` view method.
 **/
export type GetCreditAccountsArgs = ContractFunctionArgs<
  typeof creditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccounts"
>;

/**
 * @internal
 * Descriptor of a `getCreditAccountData` call, so that it can be batched with
 * calls to other contracts.
 **/
export type CreditAccountDataCall = ContractFunctionParameters<
  typeof creditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccountData"
>;

/**
 * @internal
 * Descriptor of a `getCreditAccounts` call, so that it can be batched with
 * calls to other contracts.
 **/
export type CreditAccountsCall = ContractFunctionParameters<
  typeof creditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccounts"
>;

/**
 * @internal
 * Filtering conditions applied to individual credit accounts when querying the compressor.
 **/
export interface CreditAccountFilter {
  /**
   * Filter by account owner address.
   **/
  owner: Address;
  /**
   * Whether to include accounts with zero outstanding debt.
   **/
  includeZeroDebt: boolean;
  /**
   * Minimum health factor threshold (inclusive).
   * 18 digits precision (10^18 = 1)
   **/
  minHealthFactor: bigint;
  /**
   * Maximum health factor threshold (inclusive).
   * 18 digits precision (10^18 = 1)
   **/
  maxHealthFactor: bigint;
  /**
   * Whether to return only accounts whose health computation reverts.
   **/
  reverting: boolean;
}

/**
 * @internal
 * Filtering conditions to select which credit managers to query.
 **/
export interface CreditManagerFilter {
  /**
   * Only include credit managers owned by these market configurators.
   **/
  configurators: readonly Address[];
  /**
   * Only include these specific credit manager addresses.
   **/
  creditManagers: readonly Address[];
  /**
   * Only include credit managers linked to these pool addresses.
   **/
  pools: readonly Address[];
  /**
   * Only include credit managers with this underlying token.
   **/
  underlying: Address;
}

/**
 * @internal
 * Credit managers a compressor query runs over: either one credit manager
 * address, or a filter matching many of them.
 **/
export type CreditAccountsTarget = Address | CreditManagerFilter;

/**
 * @internal
 * Account-level conditions of a compressor query, without `reverting`: the
 * compressor treats that flag as exclusive, so a full query has to run both
 * passes and callers do not choose one.
 **/
export type CreditAccountsQuery = Omit<CreditAccountFilter, "reverting">;

/**
 * @internal
 * Common options of a credit account compressor read.
 **/
export interface CreditAccountReadOptions {
  /**
   * Block to read at. Defaults to the latest block.
   **/
  blockNumber?: bigint;
  /**
   * Price feed update transactions to execute before the read, so that
   * accounts holding tokens with on-demand price feeds can be valued.
   **/
  priceUpdateTxs?: IPriceUpdateTx[];
}

/**
 * @internal
 * Options of a paginated credit account compressor read.
 **/
export interface CreditAccountsReadOptions extends CreditAccountReadOptions {
  /**
   * Maximum number of accounts to fetch per call. When set, accounts are
   * loaded in pages of this size until all are fetched.
   *
   * @default undefined - no limit, the compressor returns as many accounts as
   * it can per call
   **/
  batchSize?: bigint;
}

/**
 * Options for fetching credit accounts, allowing filtering by credit manager, owner, and health factor range.
 **/
export interface GetCreditAccountsOptions {
  /**
   * If set, only return accounts from this credit manager; otherwise query all attached markets.
   **/
  creditManager?: Address;
  /**
   * If set, only return accounts owned by this address.
   **/
  owner?: Address;
  /**
   * Whether to include accounts with zero outstanding debt.
   * @default false
   **/
  includeZeroDebt?: boolean;
  /**
   * Minimum health factor threshold (inclusive).
   * 18 digits precision (10^18 = 1)
   * @default 0n
   **/
  minHealthFactor?: bigint;
  /**
   * Maximum health factor threshold (inclusive).
   * 18 digits precision (10^18 = 1)
   * @default MAX_UINT256
   **/
  maxHealthFactor?: bigint;
  /**
   * If true, exclude reserve price feed updates from the query.
   **/
  ignoreReservePrices?: boolean;
}
