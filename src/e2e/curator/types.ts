import type { Address, Hex } from "viem";
import type {
  ConfiguratorBuilder,
  CuratorSession,
  MarketBuilder,
} from "../../permissionless/index.js";

/** A pull-oracle price an execution pushed before its payload. **/
export interface PriceUpdate {
  /** Price feed store, or whichever contract the multicall called. **/
  target: Address;
  /** `updatePrices(…)` calldata, as executed. **/
  callData: Hex;
  /** Timestamp of the block the execution was mined in. **/
  timestamp: number;
}

/** A GIP executed on mainnet, as the app's `gips` table and the chain record it. **/
export interface ExecutedGip {
  /** Id in the app's `gips` table. **/
  id: string;
  name: string;
  marketConfigurator: Address;
  author: Address;
  eta: number;
  /** Block of the first execution transaction; the fixture forks the one before. **/
  executedAtBlock: bigint;
  /** TimeLock hashes of the executed payload calls, in execution order. **/
  timelockTxHashes: readonly Hex[];
  /** Prices the execution pushed first, in order. **/
  priceUpdates?: readonly PriceUpdate[];
}

/** A builder of either scope, holding part of the GIP. **/
export type ScopeBuilder = MarketBuilder | ConfiguratorBuilder;

/** An executed GIP and how to assemble it with the curator. **/
export interface GipReproduction {
  gip: ExecutedGip;
  /**
   * Records the GIP in `session`. Each builder is one scope; their payload
   * calls are concatenated in the order returned.
   **/
  assemble(session: CuratorSession): ScopeBuilder[];
}
