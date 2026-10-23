import type { Address, Hex } from "viem";
import { decodeFunctionData, isAddress, isHex } from "viem";
import { iCreditConfigureActionsAbi } from "../../../abi/310/configure/iCreditConfigureActions.js";
import { iMarketConfiguratorV310Abi } from "../../../abi/310/generated.js";
import type { RawTx } from "../../../onchain/index.js";
import type { TimelockTxs } from "../../utils/governance/types.js";
import { deployedPeriphery } from "../actions/deployContractActionData.js";
import type { GipRegistry } from "../GipRegistry.js";
import {
  type ConfiguratorStateDiff,
  compareConfiguratorStates,
} from "../state/configurator/compareConfiguratorStates.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import type { StateDiff } from "../state/diff/diffStates.js";
import { diffMarketStates } from "../state/market/marketStateComparison.js";
import type { MarketState } from "../state/market/types.js";
import { getTimelockTransactionsForExecution } from "../transactions/getTimelockTransactions.js";
import { isSameAddress } from "../utils/addressUtils.js";
import { errorMessage } from "../utils/errorMessage.js";

export type ForkExecutionCall = Omit<
  RawTx,
  "signature" | "contractMethod" | "contractInputsValues"
>;

export interface GipSimulationPlan {
  timelockTxs: TimelockTxs;
  expectedMarkets: ReadonlyArray<{ address: Address; after: MarketState }>;
  expectedConfigurator?: ConfiguratorState;
  /** Adapter plugins describing the markets' adapters; built-in by default. **/
  registry?: GipRegistry;
}

export type GipExpectedState = Pick<
  GipSimulationPlan,
  "expectedMarkets" | "expectedConfigurator" | "registry"
> & {
  marketConfigurator: Address;
  /** Ramp actions whose start may be clamped by the execution block. **/
  rampStartRequests?: ReadonlyArray<RampStartRequest>;
};

export interface RampStartRequest {
  creditManager: Address;
  token: Address;
  liquidationThresholdFinal: number;
  rampStart: number;
  rampDuration: number;
}

export interface ForkExecutionReceipt {
  hash: Hex;
  status: "success" | "reverted";
  blockNumber?: bigint;
  /** Required to resolve ramp starts that the contract clamps to block.timestamp. **/
  blockTimestamp?: number;
  /**
   * Gas the execution actually consumed, when a receipt is observed.
   * Unlike {@link GipPlanGas} this is a measurement, not a heuristic; a fork
   * session that cannot observe a receipt omits it.
   **/
  gasUsed?: bigint;
  /** Why a reverted call reverted, when the session could find out. **/
  revertReason?: string;
}

/** Fork lifecycle and reads belong to the caller, not the builder package. **/
export interface GipForkSession {
  getChainId(): Promise<number>;
  prepare?(
    calls: readonly ForkExecutionCall[],
    plan: GipSimulationPlan,
  ): Promise<void>;
  execute(
    call: ForkExecutionCall,
    index: number,
  ): Promise<ForkExecutionReceipt>;
  /**
   * Reads a market after execution. `knownDeployments` are the periphery
   * contracts the GIP deploys without registering them: the reader reports
   * each one that holds code as `deployed`.
   **/
  readMarketState(
    address: Address,
    options?: MarketReadOptions,
  ): Promise<MarketState>;
  readConfiguratorState(address: Address): Promise<ConfiguratorState>;
  /** Release impersonation and other temporary fork setup. Keeps executed state. **/
  close?(): Promise<void>;
}

/** What a fork session's market read may be told about the GIP. **/
export interface MarketReadOptions {
  knownDeployments?: readonly Address[];
}

export interface MarketSimulationComparison {
  address: Address;
  expected: MarketState;
  observed?: MarketState;
  diff?: StateDiff;
  readError?: string;
}

export interface ConfiguratorSimulationComparison {
  expected: ConfiguratorState;
  observed?: ConfiguratorState;
  diff?: ConfiguratorStateDiff;
  readError?: string;
}

export type ComparisonVerdict = "match" | "mismatch" | "incomplete";

export interface GipSimulationComparison {
  verdict: ComparisonVerdict;
  markets: MarketSimulationComparison[];
  configurator?: ConfiguratorSimulationComparison;
}

export type GipForkSimulationResult = Omit<
  GipSimulationComparison,
  "verdict"
> & {
  verdict: ComparisonVerdict | "execution_failed";
  calls: ForkExecutionCall[];
  receipts: ForkExecutionReceipt[];
  executionError?: { index: number | null; reason: string };
  /** Why a verdict is `incomplete` beyond what the state diffs already say. **/
  incompleteReasons?: readonly string[];
};

/** Liquidation thresholds are percentages with two decimals; compare loosely. **/
const THRESHOLD_TOLERANCE = 0.000001;

/** Same ramp apart from when it starts. **/
function isSameRampTarget(
  token: { liquidationThresholdFinal: number; rampDuration: number },
  request: RampStartRequest,
): boolean {
  return (
    token.rampDuration === request.rampDuration &&
    !(
      Math.abs(
        token.liquidationThresholdFinal - request.liquidationThresholdFinal,
      ) > THRESHOLD_TOLERANCE
    )
  );
}

/** Entry of an address-keyed record, whatever the letter case of its key. **/
function findByAddress<T>(
  record: Record<string, T>,
  address: string,
): [key: string, value: T] | undefined {
  return Object.entries(record).find(([key]) => isSameAddress(key, address));
}

const rampKey = (creditManager: string, token: string): string =>
  `${creditManager.toLowerCase()}:${token.toLowerCase()}`;

/** The ramp a payload call requests, when it is a `rampLiquidationThreshold`. **/
function decodeRampCall(
  call: ForkExecutionCall,
  marketConfigurator: Address,
): RampStartRequest | undefined {
  if (!isSameAddress(call.to, marketConfigurator)) return;
  try {
    const outer = decodeFunctionData({
      abi: iMarketConfiguratorV310Abi,
      data: call.callData,
    });
    if (outer.functionName !== "configureCreditSuite") return;
    const inner = decodeFunctionData({
      abi: iCreditConfigureActionsAbi,
      data: outer.args[1],
    });
    if (inner.functionName !== "rampLiquidationThreshold") return;
    return {
      creditManager: outer.args[0],
      token: inner.args[0],
      liquidationThresholdFinal: inner.args[1] / 100,
      rampStart: inner.args[2],
      rampDuration: inner.args[3],
    };
  } catch {
    return;
  }
}

/**
 * The contract clamps a ramp start in the past to `block.timestamp`.
 *
 * With a receipt the clamped start is known, so the projection is corrected.
 * Without one the request is returned as `unresolved` and the comparison
 * tolerates a later on-chain start instead (see {@link clampedRampStarts}).
 **/
function resolveRampStarts(
  markets: GipSimulationPlan["expectedMarkets"],
  calls: readonly ForkExecutionCall[],
  receipts: readonly ForkExecutionReceipt[],
  marketConfigurator: Address,
): {
  markets: GipSimulationPlan["expectedMarkets"];
  unresolved: RampStartRequest[];
} {
  const starts = new Map<string, RampStartRequest & { actualStart: number }>();
  const unresolved: RampStartRequest[] = [];
  for (const [index, call] of calls.entries()) {
    const ramp = decodeRampCall(call, marketConfigurator);
    if (!ramp) continue;
    const timestamp = receipts[index]?.blockTimestamp;
    if (timestamp === undefined) {
      unresolved.push(ramp);
      continue;
    }
    starts.set(rampKey(ramp.creditManager, ramp.token), {
      ...ramp,
      actualStart: Math.max(ramp.rampStart, timestamp),
    });
  }
  const resolvedMarkets = markets.map(({ address, after }) => {
    let creditManagers = after.creditManagers;
    for (const [managerAddress, manager] of Object.entries(
      after.creditManagers,
    )) {
      let collateralTokens = manager.collateralTokens;
      for (const [tokenAddress, token] of Object.entries(
        manager.collateralTokens,
      )) {
        const ramp = starts.get(rampKey(managerAddress, tokenAddress));
        if (
          !ramp ||
          token.rampStart !== ramp.rampStart ||
          !isSameRampTarget(token, ramp) ||
          ramp.actualStart === ramp.rampStart
        )
          continue;
        collateralTokens = {
          ...collateralTokens,
          [tokenAddress]: { ...token, rampStart: ramp.actualStart },
        };
      }
      if (collateralTokens !== manager.collateralTokens) {
        creditManagers = {
          ...creditManagers,
          [managerAddress]: { ...manager, collateralTokens },
        };
      }
    }
    return {
      address,
      after:
        creditManagers === after.creditManagers
          ? after
          : { ...after, creditManagers },
    };
  });
  return { markets: resolvedMarkets, unresolved };
}

/**
 * Diff suppressions for ramps whose start was clamped by the execution block.
 *
 * A ramp start is tolerated only when the projection is exactly what was
 * requested and the chain holds the same ramp starting later.
 **/
function clampedRampStarts(
  expected: MarketState,
  observed: MarketState,
  requests: readonly RampStartRequest[],
) {
  const suppress = [];
  for (const request of requests) {
    const managerEntry = findByAddress(
      expected.creditManagers,
      request.creditManager,
    );
    if (!managerEntry) continue;
    const [managerAddress, managerState] = managerEntry;
    const tokenEntry = findByAddress(
      managerState.collateralTokens,
      request.token,
    );
    if (!tokenEntry) continue;
    const [tokenAddress, projected] = tokenEntry;
    const observedManager = Object.values(observed.creditManagers).find(
      manager => isSameAddress(manager.address, managerAddress),
    );
    const onChain = findByAddress(
      observedManager?.collateralTokens ?? {},
      tokenAddress,
    )?.[1];
    if (
      projected.rampStart !== request.rampStart ||
      !isSameRampTarget(projected, request) ||
      !onChain ||
      onChain.rampStart <= request.rampStart ||
      !isSameRampTarget(onChain, request)
    )
      continue;
    suppress.push({
      pattern: [
        "creditManagers",
        managerAddress.toLowerCase(),
        "collateralTokens",
        tokenAddress.toLowerCase(),
        "rampStart",
      ],
      reason: "ramp start depends on execution block timestamp",
    });
  }
  return suppress;
}

function validatePlan(plan: GipSimulationPlan): ForkExecutionCall[] {
  if (plan.expectedMarkets.length === 0 && !plan.expectedConfigurator) {
    throw new Error("GIP simulation needs at least one expected state");
  }
  if (
    plan.expectedConfigurator &&
    !isSameAddress(
      plan.expectedConfigurator.address,
      plan.timelockTxs.marketConfigurator,
    )
  ) {
    throw new Error(
      "Expected configurator address does not match the transactions",
    );
  }
  const seen = new Set<string>();
  for (const { address, after } of plan.expectedMarkets) {
    const key = address.toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate expected market: ${address}`);
    seen.add(key);
    if (after.address.toLowerCase() !== key) {
      throw new Error(`Expected market address does not match: ${address}`);
    }
  }
  if (plan.timelockTxs.queueBatches.length === 0) {
    throw new Error("GIP simulation has no transaction batches");
  }
  return validateForkExecutionCalls(
    getTimelockTransactionsForExecution(plan.timelockTxs),
  );
}

async function compareMarket(
  address: Address,
  expected: MarketState,
  rampStartRequests: readonly RampStartRequest[],
  fork: Pick<GipForkSession, "readMarketState">,
  registry: GipRegistry | undefined,
): Promise<MarketSimulationComparison> {
  try {
    const observed = await fork.readMarketState(address, {
      knownDeployments: deployedPeriphery(expected),
    });
    const suppress = clampedRampStarts(expected, observed, rampStartRequests);
    const diff = diffMarketStates(expected, observed, { suppress, registry });
    return { address, expected, observed, diff };
  } catch (error) {
    return { address, expected, readError: errorMessage(error) };
  }
}

async function compareConfigurator(
  expected: ConfiguratorState,
  marketConfigurator: Address,
  fork: Pick<GipForkSession, "readConfiguratorState">,
): Promise<ConfiguratorSimulationComparison> {
  try {
    const observed = await fork.readConfiguratorState(marketConfigurator);
    return {
      expected,
      observed,
      diff: compareConfiguratorStates(expected, observed),
    };
  } catch (error) {
    return { expected, readError: errorMessage(error) };
  }
}

/** Compare projected state with independent reads from an executed fork. **/
export async function compareGipForkState(
  expectedStates: GipExpectedState,
  fork: Pick<GipForkSession, "readMarketState" | "readConfiguratorState">,
): Promise<GipSimulationComparison> {
  const markets: MarketSimulationComparison[] = [];
  for (const { address, after: expected } of expectedStates.expectedMarkets) {
    markets.push(
      await compareMarket(
        address,
        expected,
        expectedStates.rampStartRequests ?? [],
        fork,
        expectedStates.registry,
      ),
    );
  }

  const configurator = expectedStates.expectedConfigurator
    ? await compareConfigurator(
        expectedStates.expectedConfigurator,
        expectedStates.marketConfigurator,
        fork,
      )
    : undefined;

  const mismatch =
    markets.some(
      market =>
        market.diff &&
        (market.diff.changes.length > 0 || market.diff.conflicts.length > 0),
    ) ||
    (configurator?.diff !== undefined && !configurator.diff.isEqual);
  const incomplete =
    markets.some(
      market =>
        market.readError !== undefined ||
        (market.diff?.skipped.length ?? 0) > 0 ||
        (market.diff?.diagnostics.length ?? 0) > 0,
    ) || configurator?.readError !== undefined;

  return {
    verdict: mismatch ? "mismatch" : incomplete ? "incomplete" : "match",
    markets,
    configurator,
  };
}

/**
 * A fork that can execute raw payload calls. Unlike {@link GipForkSession} it
 * needs no `TimelockTxs`, so payload simulation works without an author or eta.
 **/
export interface GipPayloadForkSession {
  getChainId(): Promise<number>;
  /** Impersonation, balances and other temporary fork setup. **/
  prepareCalls?(
    calls: readonly ForkExecutionCall[],
    context: GipPayloadSimulationRequest,
  ): Promise<void>;
  execute(
    call: ForkExecutionCall,
    index: number,
  ): Promise<ForkExecutionReceipt>;
  /**
   * Reads a market after execution. `knownDeployments` are the periphery
   * contracts the GIP deploys without registering them: the reader reports
   * each one that holds code as `deployed`.
   **/
  readMarketState(
    address: Address,
    options?: MarketReadOptions,
  ): Promise<MarketState>;
  readConfiguratorState(address: Address): Promise<ConfiguratorState>;
  /** Release impersonation and other temporary fork setup. **/
  close?(): Promise<void>;
}

/** Payload calls plus the states they are expected to produce. **/
export interface GipPayloadSimulationRequest {
  chainId: number;
  marketConfigurator: Address;
  calls: readonly ForkExecutionCall[];
  /** May be empty: a scope with no projected state still executes. **/
  expectedMarkets?: ReadonlyArray<{ address: Address; after: MarketState }>;
  expectedConfigurator?: ConfiguratorState;
  /** Adapter plugins describing the markets' adapters; built-in by default. **/
  registry?: GipRegistry;
}

/** Rejects payload calls that an EVM could not accept. **/
export function validateForkExecutionCalls(
  calls: readonly ForkExecutionCall[],
): ForkExecutionCall[] {
  if (calls.length === 0) {
    throw new Error("GIP simulation has no execution calls");
  }
  for (const call of calls) {
    if (!isAddress(call.to) || !isHex(call.callData)) {
      throw new Error("GIP simulation contains an invalid execution call");
    }
    try {
      if (BigInt(call.value) < 0n)
        throw new Error("Negative transaction value");
    } catch {
      throw new Error("GIP simulation contains an invalid transaction value");
    }
  }
  return [...calls];
}

/**
 * Executes payload calls on an existing fork and compares the projected states
 * with independent reads.
 *
 * This is the engine {@link simulateGipOnFork} runs on; it is exposed separately
 * because payload simulation needs neither an author nor an eta, and because a
 * scope can legitimately have no projected state at all (then the verdict is
 * `incomplete`, never `match`).
 **/
export async function simulateGipPayloadOnFork(
  request: GipPayloadSimulationRequest,
  fork: GipPayloadForkSession,
): Promise<GipForkSimulationResult> {
  const calls = validateForkExecutionCalls(request.calls);
  const expectedMarkets = request.expectedMarkets ?? [];
  const chainId = await fork.getChainId();
  if (chainId !== request.chainId) {
    throw new Error(
      `Fork chain ${chainId} does not match GIP chain ${request.chainId}`,
    );
  }

  const receipts: ForkExecutionReceipt[] = [];
  let index: number | null = null;
  try {
    await fork.prepareCalls?.(calls, request);
    for (const [i, call] of calls.entries()) {
      index = i;
      const receipt = await fork.execute(call, i);
      receipts.push(receipt);
      if (receipt.status !== "success") {
        return {
          verdict: "execution_failed",
          calls,
          receipts,
          markets: [],
          executionError: {
            index: i,
            reason: receipt.revertReason
              ? `Transaction reverted: ${receipt.revertReason}`
              : "Transaction reverted",
          },
        };
      }
    }
    const rampStarts = resolveRampStarts(
      expectedMarkets,
      calls,
      receipts,
      request.marketConfigurator,
    );
    const comparison = await compareGipForkState(
      {
        marketConfigurator: request.marketConfigurator,
        expectedMarkets: rampStarts.markets,
        rampStartRequests: rampStarts.unresolved,
        expectedConfigurator: request.expectedConfigurator,
        registry: request.registry,
      },
      fork,
    );
    const incompleteReasons: string[] = [];
    let verdict = comparison.verdict;
    if (expectedMarkets.length === 0 && !request.expectedConfigurator) {
      verdict = "incomplete";
      incompleteReasons.push(
        "no projected state was supplied, so execution succeeded but nothing was compared",
      );
    }
    return {
      ...comparison,
      verdict,
      calls,
      receipts,
      ...(incompleteReasons.length > 0 ? { incompleteReasons } : {}),
    };
  } catch (error) {
    return {
      verdict: "execution_failed",
      calls,
      receipts,
      markets: [],
      executionError: { index, reason: errorMessage(error) },
    };
  } finally {
    await fork.close?.();
  }
}

/** Executes the generated timelock payloads on an existing fork, then compares state. **/
export async function simulateGipOnFork(
  plan: GipSimulationPlan,
  fork: GipForkSession,
): Promise<GipForkSimulationResult> {
  const calls = validatePlan(plan);
  return simulateGipPayloadOnFork(
    {
      chainId: plan.timelockTxs.chainId,
      marketConfigurator: plan.timelockTxs.marketConfigurator,
      calls,
      expectedMarkets: plan.expectedMarkets,
      expectedConfigurator: plan.expectedConfigurator,
      registry: plan.registry,
    },
    {
      getChainId: () => fork.getChainId(),
      prepareCalls: fork.prepare
        ? forkCalls => fork.prepare!(forkCalls, plan)
        : undefined,
      execute: (call, index) => fork.execute(call, index),
      readMarketState: (address, options) =>
        fork.readMarketState(address, options),
      readConfiguratorState: address => fork.readConfiguratorState(address),
      close: fork.close ? () => fork.close!() : undefined,
    },
  );
}
