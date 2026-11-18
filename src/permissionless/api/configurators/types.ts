import type { Address, Hex } from "viem";

/**
 * Where a contract the backend indexes is in its life. `orphan` is a row whose
 * creation event a reorg dropped, so it has no blocks to report.
 **/
export type PermissionlessLifecycle =
  | { status: "orphan"; createBlock: null; shutdownBlock: null }
  | { status: "active"; createBlock: number; shutdownBlock: null }
  | { status: "shutdown"; createBlock: number; shutdownBlock: number };

/**
 * A market configurator as the backend has indexed it.
 *
 * `admin` is the TimeLock that executes the configurator's governance
 * transactions; `owner` is the account that owns the governor in front of it,
 * the Safe a curator signs with. Without a governor `owner` is `admin` itself
 * and `governor` is false.
 **/
export type PermissionlessConfigurator = PermissionlessLifecycle & {
  chainId: number;
  address: Address;
  name: string;
  admin: Address;
  treasury: Address;
  owner: Address;
  governor: boolean;
  /**
   * Whether the configurator is listed. A hidden one is still served by
   * {@link PermissionlessConfigurators.details}.
   **/
  public: boolean;
  marketsQty: number;
};

/**
 * A market of a configurator, with the pool's own token metadata.
 **/
export type PermissionlessConfiguratorMarket = PermissionlessLifecycle & {
  chainId: number;
  address: Address;
  marketConfigurator: Address;
  underlyingToken: Address;
  name: string;
  symbol: string;
  decimals: number;
};

/**
 * Timelock event names, as the TimeLock emits them.
 **/
export type PermissionlessTimelockEventStatus =
  | "QueueTransaction"
  | "ExecuteTransaction"
  | "CancelTransaction";

/**
 * The latest event of one timelock transaction, identified by the hash the
 * TimeLock derives from its target, value, signature, data and eta.
 **/
export interface PermissionlessTimelockEvent {
  chainId: number;
  marketConfigurator: Address;
  txHash: Hex;
  status: PermissionlessTimelockEventStatus;
  blockNumber: number;
  logId: number;
  eta: number;
}

/**
 * Who holds each role of a configurator, read off the chain.
 **/
export interface PermissionlessConfiguratorRoles {
  admin: Address;
  emergencyAdmin: Address;
  treasury: Address;
  pausableAdmins: Address[];
  unpausableAdmins: Address[];
  lossLiquidators: Address[];
  emergencyLiquidators: Address[];
}

/**
 * The TimeLock of a configurator and the two windows that bound a queued
 * transaction, in seconds: it may be queued no later than `eta − delay`, and
 * executed no later than `eta + gracePeriod`.
 **/
export interface PermissionlessConfiguratorTimelock {
  address: Address;
  delay: number;
  gracePeriod: number;
}

/**
 * Arguments naming one configurator.
 **/
export interface ConfiguratorArgs {
  chainId: number;
  address: Address;
}

/**
 * Arguments of {@link PermissionlessConfigurators.list}.
 **/
export interface ListConfiguratorsArgs {
  /**
   * Only this chain's configurators; every chain when omitted.
   **/
  chainId?: number;
}

/**
 * Arguments of {@link PermissionlessConfigurators.timelockEvents}.
 **/
export interface TimelockEventsArgs {
  chainId: number;
  txHashes: readonly Hex[];
}
