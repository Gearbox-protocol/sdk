import {
  GipSimulationError,
  type GipSimulationOptions,
  type GipSimulationOutcome,
  type GipSimulationTarget,
} from "../simulation/GipSimulationError.js";
import type { GipAnvilForkOptions } from "./forkConnection.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";

/**
 * The Anvil node of a fork SDK. A chain SDK has no node of its own to execute
 * on, so it cannot simulate.
 **/
export function requireFork(runtime: GipSdkRuntime): GipAnvilForkOptions {
  if (!runtime.fork) {
    throw new GipSimulationError(
      "Simulation requires an SDK created in fork mode: CuratorSession.create({ fork: { rpcUrl }, marketConfigurator })",
      { phase: "setup" },
    );
  }
  return runtime.fork;
}

/** Executes a scope's payload on the SDK's own Anvil node. **/
export async function simulateOnFork(args: {
  fork: GipAnvilForkOptions;
  target: GipSimulationTarget;
  options: GipSimulationOptions;
}): Promise<GipSimulationOutcome> {
  // Keep the Node-only Anvil client out of the SDK's eager import graph.
  const { simulateOnAnvil } = await import("../simulation/simulateOnAnvil.js");
  return simulateOnAnvil(
    // The projection was read from this node, so the node must not have moved.
    { ...args.options, ...args.fork, sourceIsNodeHead: true },
    args.target,
  );
}
