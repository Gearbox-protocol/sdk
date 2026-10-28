import type { Address, Hex } from "viem";
import { http } from "viem";
import { createAnvilClient } from "../../dev/createAnvilClient.js";
import { waitForAnvilReceipt } from "../../permissionless/curator/simulation/waitForAnvilReceipt.js";
import {
  CuratorSession,
  formatMarketStateDiff,
  type GipPlan,
  type GipSimulationOptions,
  type GipSimulationOutcome,
} from "../../permissionless/index.js";
import { GAS_LIMIT } from "../constants.js";
import type { GipReproduction, PriceUpdate } from "./types.js";

/** Anvil's first dev account, funded and unlocked on every fork. **/
const ANVIL_SENDER: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

/** Reason the state diff gives a leaf one side of the comparison cannot know. **/
const UNKNOWN_ON_ONE_SIDE = "not known on one side";

/** One scope's simulation. **/
export interface GipSimulation {
  /** `market <pool>` or `configurator`. **/
  label: string;
  outcome: GipSimulationOutcome;
}

export interface GipReproductionResult {
  /** TimeLock hashes of the built payload calls, in execution order. **/
  builtHashes: Hex[];
  /** One builder per scope the GIP touches. **/
  builderCount: number;
  simulations: GipSimulation[];
}

/**
 * How fixture generation runs a reproduction. Anvil drops what it fetched
 * after an `evm_snapshot` from its cache when it reverts, so a simulation
 * isolated by a snapshot leaves its reads out of the flushed fixture. The
 * generator simulates one builder per Anvil run with isolation off instead:
 * each simulation of the test starts from the same state, so the reads match.
 **/
export interface ReproduceOptions {
  /** Simulates only the builder at this index. **/
  builderIndex?: number;
  isolation?: GipSimulationOptions["isolation"];
}

/**
 * Assembles an executed GIP on the fork at `rpcUrl`, builds it with the
 * executed author and eta, and simulates each scope.
 *
 * The fork must be at the block before the execution. The prices the
 * execution pushed are pushed first, at their block's timestamp: a call that
 * validates a pull-oracle price feed reverts on stale prices otherwise.
 **/
export async function reproduceExecutedGip(
  reproduction: GipReproduction,
  rpcUrl: string,
  options: ReproduceOptions = {},
): Promise<GipReproductionResult> {
  const { gip } = reproduction;
  await pushPrices(rpcUrl, gip.priceUpdates ?? []);

  const session = await CuratorSession.create({
    fork: { rpcUrl },
    marketConfigurator: gip.marketConfigurator,
  });
  const builders = reproduction.assemble(session);

  const plans: GipPlan[] = [];
  for (const builder of builders) {
    plans.push(await builder.build({ author: gip.author, eta: gip.eta }));
  }

  const simulations: GipSimulation[] = [];
  for (const [index, builder] of builders.entries()) {
    if (options.builderIndex !== undefined && index !== options.builderIndex) {
      continue;
    }
    const plan = plans[index];
    simulations.push({
      label:
        plan.scope === "market"
          ? `market ${plan.after.address}`
          : "configurator",
      outcome: await builder.simulate({
        eta: plan.eta,
        ...(options.isolation ? { isolation: options.isolation } : {}),
      }),
    });
  }

  return {
    builtHashes: plans.flatMap(plan => [...plan.payloadCallHashes]),
    builderCount: builders.length,
    simulations,
  };
}

/**
 * Whether a simulation matched the projection. An `incomplete` verdict counts
 * when it only lacks what a projection cannot know before execution — the
 * address an adapter is deployed at, say — and everything compared matched.
 **/
export function simulationMatches(outcome: GipSimulationOutcome): boolean {
  if (outcome.verdict === "match") return true;
  if (outcome.verdict !== "incomplete") return false;
  if ((outcome.incompleteReasons ?? []).length > 0) return false;
  if (outcome.configurator?.readError) return false;
  if (outcome.configurator?.diff && !outcome.configurator.diff.isEqual) {
    return false;
  }
  return outcome.markets.every(
    ({ readError, diff }) =>
      !readError &&
      diff !== undefined &&
      diff.changes.length === 0 &&
      diff.conflicts.length === 0 &&
      diff.diagnostics.length === 0 &&
      diff.skipped.every(({ reason }) => reason === UNKNOWN_ON_ONE_SIDE),
  );
}

/** What a simulation found, for an assertion message. **/
export function describeSimulation(outcome: GipSimulationOutcome): string {
  const lines = [
    `verdict ${outcome.verdict}, ${outcome.receipts.length} calls executed`,
  ];
  if (outcome.executionError) {
    lines.push(
      `call ${outcome.executionError.index}: ${outcome.executionError.reason}`,
    );
  }
  lines.push(...(outcome.incompleteReasons ?? []));
  for (const market of outcome.markets) {
    if (market.readError) {
      lines.push(`read ${market.address}: ${market.readError}`);
    }
    if (market.diff && !market.diff.equal) {
      lines.push(formatMarketStateDiff(market.diff));
    }
  }
  if (outcome.configurator?.readError) {
    lines.push(`read configurator: ${outcome.configurator.readError}`);
  }
  if (outcome.configurator?.diff && !outcome.configurator.diff.isEqual) {
    lines.push(JSON.stringify(outcome.configurator.diff.differences));
  }
  for (const failure of outcome.failures) {
    lines.push(`${failure.phase}: ${failure.reason}`);
  }
  return lines.join("\n");
}

/** Sends `updates` from the dev account, each in a block at its timestamp. **/
async function pushPrices(
  rpcUrl: string,
  updates: readonly PriceUpdate[],
): Promise<void> {
  if (updates.length === 0) return;
  const anvil = createAnvilClient({
    transport: http(rpcUrl, { timeout: 120_000 }),
  });
  let latest = (await anvil.getBlock()).timestamp;
  for (const { target, callData, timestamp } of updates) {
    if (BigInt(timestamp) > latest) {
      await anvil.setNextBlockTimestamp({ timestamp: BigInt(timestamp) });
    }
    const hash = await anvil.sendTransaction({
      account: ANVIL_SENDER,
      to: target,
      data: callData,
      gas: GAS_LIMIT,
      chain: null,
    });
    const receipt = await waitForAnvilReceipt(anvil, hash);
    if (receipt.status !== "success") {
      throw new Error(`Pushing the price update to ${target} reverted`);
    }
    latest = (await anvil.getBlock({ blockNumber: receipt.blockNumber }))
      .timestamp;
  }
}
