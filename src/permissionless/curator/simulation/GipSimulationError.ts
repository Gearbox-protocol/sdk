import { type Address, BaseError, type Hex } from "viem";
import type { GipRegistry } from "../GipRegistry.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import type { MarketState } from "../state/market/types.js";
import type {
  ForkExecutionCall,
  GipForkSimulationResult,
} from "./simulateGipOnFork.js";

/** What to simulate: payload calls plus the states they should produce. **/
export interface GipSimulationTarget {
  chainId: number;
  marketConfigurator: Address;
  /** Block the projected states were computed against. **/
  sourceBlockNumber: bigint;
  /** Canonical hash of the source block. **/
  sourceBlockHash: Hex;
  calls: readonly ForkExecutionCall[];
  /** Earliest execution time; execution cannot precede the fork head. **/
  eta?: number;
  expectedMarkets?: ReadonlyArray<{ address: Address; after: MarketState }>;
  expectedConfigurator?: ConfiguratorState;
  /** Adapter plugins the fork's markets are read and diffed with. **/
  registry?: GipRegistry;
}

/** How `simulate()` treats the SDK's Anvil node. **/
export interface GipSimulationOptions {
  /** Earliest execution time; defaults to the source block timestamp. **/
  eta?: number;
  /**
   * `"snapshot"` (default) takes an `evm_snapshot` before any setup and reverts
   * to it once the comparison is done, so the node is left as it was.
   * `"none"` keeps the executed state for manual inspection.
   **/
  isolation?: "snapshot" | "none";
  /** Gas limit for each payload transaction. **/
  gas?: bigint;
  /** Address provider override, when the fork is not on a known deployment. **/
  addressProvider?: Address;
}

/** A structured failure, so callers do not have to parse messages. **/
export interface GipSimulationFailure {
  phase: "setup" | "execute" | "read" | "cleanup";
  reason: string;
  /** Index of the payload call, when the failure is tied to one. **/
  callIndex?: number;
  /** Contract the failing call or read targeted. **/
  target?: Address;
}

export interface GipSimulationOutcome extends GipForkSimulationResult {
  /** Fork mutations made so that the payload could be executed. **/
  setupChanges: readonly string[];
  /** Execution, read and cleanup failures, structured. **/
  failures: readonly GipSimulationFailure[];
}

/** Raised when a simulation cannot be started or cannot operate its fork. **/
export class GipSimulationError extends BaseError {
  override name = "GipSimulationError";
  /** Stage the simulation failed in. **/
  readonly phase?: GipSimulationFailure["phase"];
  /** Contract the failing call or read targeted. **/
  readonly target?: Address;

  constructor(
    message: string,
    context: { phase?: GipSimulationFailure["phase"]; target?: Address } = {},
  ) {
    super(message);
    if (context.phase !== undefined) this.phase = context.phase;
    if (context.target !== undefined) this.target = context.target;
  }
}
