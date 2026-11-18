import type { RawTx } from "../../../onchain/index.js";
import {
  GipSimulationError,
  type GipSimulationOptions,
  type GipSimulationOutcome,
  type GipSimulationTarget,
} from "../simulation/GipSimulationError.js";
import type { ForkExecutionCall } from "../simulation/simulateGipOnFork.js";
import { simulateOnAnvil } from "../simulation/simulateOnAnvil.js";
import { simulateOnRpc } from "../simulation/simulateOnRpc.js";
import type { BatchTxs } from "../types.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";

export async function simulatePayload(args: {
  runtime: GipSdkRuntime;
  options: GipSimulationOptions;
  eta: number;
  batches: readonly BatchTxs[];
  expected: Pick<
    GipSimulationTarget,
    "expectedMarkets" | "expectedConfigurator"
  >;
}): Promise<GipSimulationOutcome> {
  const { source, registry } = args.runtime;
  const batches = args.batches.map(batch => batch.txs.map(toForkCall));
  const target = {
    chainId: source.chainId,
    marketConfigurator: source.marketConfigurator,
    sourceBlockNumber: source.blockNumber,
    sourceBlockHash: source.blockHash,
    eta: args.eta,
    ...args.expected,
    registry,
  };
  if (args.runtime.fork) {
    return simulateOnAnvil(
      { ...args.options, ...args.runtime.fork, sourceIsNodeHead: true },
      { ...target, calls: batches.flat() },
    );
  }
  if (args.options.isolation === "none") {
    throw new GipSimulationError(
      "RPC simulations are ephemeral. Persistent execution requires an Anvil fork.",
      { phase: "setup" },
    );
  }
  return simulateOnRpc({
    client: args.runtime.readClient,
    target,
    batches,
    sender: await args.runtime.timelockAdmin(),
    timestamp: Math.max(source.blockTimestamp + 1, args.eta),
    options: args.options,
  });
}

function toForkCall(tx: RawTx): ForkExecutionCall {
  return {
    to: tx.to,
    callData: tx.callData,
    value: tx.value,
    description: tx.description,
  };
}
