import type { RawTx } from "../../../onchain/index.js";
import {
  GipSimulationError,
  type GipSimulationOptions,
  type GipSimulationOutcome,
  type GipSimulationTarget,
} from "../simulation/GipSimulationError.js";
import type { ForkExecutionCall } from "../simulation/simulateGipOnFork.js";
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

/**
 * Executes a payload on the SDK's own Anvil node and compares the result with
 * the projected states.
 **/
export async function simulateOnFork(args: {
  runtime: GipSdkRuntime;
  fork: GipAnvilForkOptions;
  options: GipSimulationOptions;
  eta: number;
  payloadCalls: readonly RawTx[];
  expected: Pick<
    GipSimulationTarget,
    "expectedMarkets" | "expectedConfigurator"
  >;
}): Promise<GipSimulationOutcome> {
  const { source, registry } = args.runtime;
  // Keep the Node-only Anvil client out of the SDK's eager import graph.
  const { simulateOnAnvil } = await import("../simulation/simulateOnAnvil.js");
  return simulateOnAnvil(
    // The projection was read from this node, so the node must not have moved.
    { ...args.options, ...args.fork, sourceIsNodeHead: true },
    {
      chainId: source.chainId,
      marketConfigurator: source.marketConfigurator,
      sourceBlockNumber: source.blockNumber,
      sourceBlockHash: source.blockHash,
      eta: args.eta,
      calls: args.payloadCalls.map(toForkCall),
      ...args.expected,
      registry,
    },
  );
}

function toForkCall(tx: RawTx): ForkExecutionCall {
  return {
    to: tx.to,
    callData: tx.callData,
    value: tx.value,
    description: tx.description,
  };
}
