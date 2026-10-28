import type { Address } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import type { SafeTx } from "../../bindings/governance/types.js";
import { convertQueueBatchToExecuteTx } from "../../utils/governance/timelock-txs.js";
import { getRawTxHash } from "../transactions/getRawTxHash.js";
import { getTimelockTransactions } from "../transactions/getTimelockTransactions.js";
import type { BatchTxs } from "../types.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import type { GipPlanBase } from "./types.js";

/** `incompleteChecks` comes from the compilation's preview, not from here. **/
export type GipPlanTransactions = Omit<
  GipPlanBase,
  "planVersion" | "scope" | "source" | "incompleteChecks"
>;

/**
 * Turns batched payload calls into everything a plan publishes: the payload
 * calls themselves, the governor queue wrappers, the matching `executeBatch`
 * wrappers, feed dependencies and heuristic gas.
 *
 * Payload calls and governor wrappers stay separate on purpose: the payload is
 * what the TimeLock eventually executes, the wrappers are what a signer sends.
 **/
export async function buildPlanTransactions(args: {
  runtime: GipSdkRuntime;
  batches: readonly BatchTxs[];
  payloadCalls: readonly RawTx[];
  author: Address;
  eta: number;
  /** `unavailable` when the scope has no per-action gas table. **/
  gasModel?: GipPlanBase["gas"]["model"];
}): Promise<GipPlanTransactions> {
  const { runtime, batches, payloadCalls, author, eta } = args;
  if (payloadCalls.length === 0) {
    throw new Error("A GIP plan needs at least one payload call");
  }

  const timelockTxs = await getTimelockTransactions({
    client: runtime.readClient,
    marketConfigurator: runtime.source.marketConfigurator,
    batches: [...batches],
    eta,
    author,
    sdk: await runtime.addressProviderSdk(),
  });

  const governor = await runtime.governor();
  const executeBatchSafeTxs: SafeTx[] = [];
  const executeBatchTxs: RawTx[] = [];
  for (const queueBatch of timelockTxs.queueBatches) {
    executeBatchSafeTxs.push(convertQueueBatchToExecuteTx(queueBatch));
    executeBatchTxs.push(governor.createExecuteBatchTx({ txs: queueBatch }));
  }

  const perBatchFeeds = batches.map(({ touchedFeeds }) => [...touchedFeeds]);
  const perBatchGas = batches.map(({ estimatedGas }) => estimatedGas);

  return {
    author,
    eta,
    payloadCalls: [...payloadCalls],
    payloadCallHashes: payloadCalls.map(tx => getRawTxHash(tx, eta)),
    batches: batches.map(batch => ({
      txs: [...batch.txs],
      estimatedGas: batch.estimatedGas,
      touchedFeeds: [...batch.touchedFeeds],
    })),
    timelockTxs,
    executeBatchSafeTxs,
    executeBatchTxs,
    feedDependencies: {
      perBatch: perBatchFeeds,
      updatablePerBatch: (timelockTxs.updatableFeeds ?? []).map(feeds => [
        ...feeds,
      ]),
      all: [...new Set(perBatchFeeds.flat())],
    },
    gas: {
      model: args.gasModel ?? "heuristic-action-table",
      isActualMeasurement: false,
      perBatch: perBatchGas,
      total: perBatchGas.reduce((sum, gas) => sum + gas, 0),
    },
  };
}
