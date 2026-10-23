import {
  type Address,
  type Chain,
  createWalletClient,
  decodeErrorResult,
  type Hex,
  http,
  type PublicClient,
  parseEther,
  type Transport,
} from "viem";
import { errorAbis } from "../../../abi/errors.js";
import {
  type AnvilClient,
  createAnvilClient,
} from "../../../dev/createAnvilClient.js";
import { getChain, type OnchainSDK } from "../../../onchain/index.js";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { POOL_CREATION_DEPOSIT } from "../constants.js";
import {
  DEFAULT_FORK_TIMEOUT_MS,
  normalizeRpcUrl,
} from "../session/forkConnection.js";
import { getConfiguratorState } from "../state/configurator/getConfiguratorState.js";
import { getMarketState } from "../state/market/getMarketState.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { errorMessage } from "../utils/errorMessage.js";
import { attachForkSdk, readFailures } from "./forkReads.js";
import {
  GipSimulationError,
  type GipSimulationFailure,
  type GipSimulationOptions,
  type GipSimulationOutcome,
  type GipSimulationTarget,
} from "./GipSimulationError.js";
import { seedPoolCreationDeposit } from "./seedPoolCreationDeposit.js";
import {
  type ForkExecutionCall,
  type GipForkSimulationResult,
  type GipPayloadForkSession,
  simulateGipPayloadOnFork,
} from "./simulateGipOnFork.js";

/** Gas limit of a payload transaction unless the caller sets one. **/
const DEFAULT_CALL_GAS = 15_000_000n;

export interface AnvilSimulationOptions extends GipSimulationOptions {
  /** JSON-RPC URL of an Anvil node that already forks the target chain. **/
  rpcUrl: string;
  /** RPC timeout in milliseconds. **/
  timeoutMs?: number;
  /**
   * Set when the projected states were read from this very node at its current
   * head, as an SDK created in fork mode does. The node must then still be at
   * the source block. Otherwise the source block is expected to be the upstream
   * block the node forked from.
   **/
  sourceIsNodeHead?: boolean;
}

const setupError = (reason: string) =>
  new GipSimulationError(reason, { phase: "setup" });

/** Process-local tails for nodes whose state can be mutated by a simulation. **/
const anvilRunTails = new Map<string, Promise<void>>();

/**
 * A snapshot only isolates sequential work. Without this queue two callers can
 * interleave snapshot/setup/execute/revert and one revert can erase the other
 * run. Serialize the whole mutation lifecycle for each normalized RPC URL.
 **/
async function withAnvilRunLock<T>(
  rpcUrl: string,
  run: () => Promise<T>,
): Promise<T> {
  const key = normalizeRpcUrl(rpcUrl);
  const previous = anvilRunTails.get(key) ?? Promise.resolve();
  let release!: () => void;
  const tail = new Promise<void>(resolve => {
    release = resolve;
  });
  anvilRunTails.set(key, tail);
  await previous;
  try {
    return await run();
  } finally {
    release();
    if (anvilRunTails.get(key) === tail) anvilRunTails.delete(key);
  }
}

const isSameHash = (a: Hex | null | undefined, b: Hex): boolean =>
  !!a && a.toLowerCase() === b.toLowerCase();

/**
 * Keeps a `match` verdict from over-claiming.
 *
 * When the fork cannot be proven to have branched from the source block,
 * matching states are reported as `incomplete` with the reason attached rather
 * than as a guaranteed exact match.
 **/
function downgradeUnverifiedVerdict<T extends GipForkSimulationResult>(
  result: T,
  reasons: readonly string[],
): T {
  if (reasons.length === 0) return result;
  return {
    ...result,
    verdict: result.verdict === "match" ? "incomplete" : result.verdict,
    incompleteReasons: [...(result.incompleteReasons ?? []), ...reasons],
  };
}

/** A node the projection was read from must still be where it was read. **/
async function assertForkUnchanged(
  anvil: AnvilClient,
  target: GipSimulationTarget,
): Promise<void> {
  const head = await anvil.getBlock();
  if (
    head.number !== target.sourceBlockNumber ||
    !isSameHash(head.hash, target.sourceBlockHash)
  ) {
    throw setupError(
      "The fork changed since SDK creation; create a new SDK from its current state before simulating",
    );
  }
}

/**
 * Why the node's state cannot be tied to the plan's source block, if it cannot.
 * Any caveat turns a `match` into `incomplete` instead of over-claiming.
 **/
async function sourceCaveats(
  anvil: AnvilClient,
  target: GipSimulationTarget,
  sourceIsNodeHead: boolean,
): Promise<string[]> {
  try {
    const info = await anvil.anvilNodeInfo();
    const forkBlock = info.forkConfig?.forkBlockNumber;
    if (
      !info.forkConfig?.forkUrl ||
      forkBlock === null ||
      forkBlock === undefined
    ) {
      return [
        "the node is not forking an upstream chain, so its state cannot be matched to the plan's source block",
      ];
    }
    // A node that is its own source was already checked against its head.
    if (!sourceIsNodeHead && BigInt(forkBlock) !== target.sourceBlockNumber) {
      return [
        `fork branched from block ${BigInt(forkBlock)}, the projected states were computed at block ${target.sourceBlockNumber}`,
      ];
    }
    if (!target.sourceBlockHash) {
      return [
        "the simulation target did not include a canonical source block hash",
      ];
    }
    const sourceBlock = await anvil.getBlock({
      blockNumber: target.sourceBlockNumber,
    });
    return isSameHash(sourceBlock.hash, target.sourceBlockHash)
      ? []
      : [
          `fork block ${target.sourceBlockNumber} has hash ${sourceBlock.hash ?? "unknown"}, expected ${target.sourceBlockHash}`,
        ];
  } catch (error) {
    return [
      `could not confirm the fork's source block (anvil_nodeInfo failed: ${errorMessage(error)})`,
    ];
  }
}

/** Takes the isolation snapshot, unless isolation is switched off. **/
async function takeSnapshot(
  anvil: AnvilClient,
  options: AnvilSimulationOptions,
  setupChanges: string[],
): Promise<Hex | undefined> {
  if ((options.isolation ?? "snapshot") !== "snapshot") {
    setupChanges.push(
      "isolation disabled: the executed state is left on the node",
    );
    return undefined;
  }
  try {
    const snapshotId = await anvil.snapshot();
    setupChanges.push(`evm_snapshot ${snapshotId} taken for isolation`);
    return snapshotId;
  } catch (error) {
    throw setupError(
      `Could not take an isolation snapshot: ${errorMessage(error)}`,
    );
  }
}

/**
 * Reverts to `snapshotId` and reports whether the node confirmed it.
 *
 * `evm_revert` answers with a boolean and returns `false` for an unknown or
 * already-consumed snapshot. viem's `revert` action is typed `Promise<void>`
 * and drops that answer, so the raw request is used: a dropped `false` would be
 * reported as a restored node. Anything other than an explicit `true` is
 * treated as "not restored".
 **/
async function restoreSnapshot(
  anvil: AnvilClient,
  snapshotId: Hex,
  setupChanges: string[],
  failures: GipSimulationFailure[],
): Promise<void> {
  try {
    const answer = (await anvil.request({
      method: "evm_revert",
      params: [snapshotId],
    })) as unknown;
    if (answer === true) {
      setupChanges.push(`evm_revert to ${snapshotId} restored the node`);
      return;
    }
    setupChanges.push(
      `evm_revert to ${snapshotId} returned false: restoration was not confirmed and the node may still hold the executed state`,
    );
    failures.push({
      phase: "cleanup",
      reason: `evm_revert to ${snapshotId} returned false, so restoration was not confirmed and the node may still hold this run's state`,
    });
  } catch (error) {
    failures.push({
      phase: "cleanup",
      reason: `evm_revert to ${snapshotId} failed: ${errorMessage(error)}`,
    });
  }
}

/**
 * Runs GIP payload calls on an already-running Anvil fork and compares the
 * resulting state with the projection.
 *
 * Isolation: a snapshot is taken before any setup and reverted after the state
 * comparison, so an existing shared node is left exactly as it was found. Every
 * fork mutation is reported in {@link GipSimulationOutcome.setupChanges}, and
 * cleanup runs even when execution or the comparison throws.
 *
 * This is a payload simulation, not a governance one: the TimeLock's code is
 * disabled and `MarketConfigurator.admin()` is impersonated to send the calls,
 * so the governor queue, the eta delay and queue/execute authorization are NOT
 * exercised. The node must already be forked at the right block; it is verified
 * but never re-forked.
 **/
export async function simulateOnAnvil(
  options: AnvilSimulationOptions,
  target: GipSimulationTarget,
): Promise<GipSimulationOutcome> {
  const rpcUrl = normalizeRpcUrl(options.rpcUrl);
  return withAnvilRunLock(rpcUrl, async () => {
    const timeout = options.timeoutMs ?? DEFAULT_FORK_TIMEOUT_MS;
    const transport = http(rpcUrl, { timeout });
    const chainId = await createAnvilClient({ transport }).getChainId();
    const chain = getChain(chainId);
    const anvil = createAnvilClient({ transport, chain });
    const sourceIsNodeHead = options.sourceIsNodeHead ?? false;
    const setupChanges: string[] = [];
    const failures: GipSimulationFailure[] = [];

    if (chainId !== target.chainId) {
      throw setupError(
        `Fork chain ${chainId} does not match the GIP chain ${target.chainId}`,
      );
    }
    if (sourceIsNodeHead) await assertForkUnchanged(anvil, target);
    const caveats = await sourceCaveats(anvil, target, sourceIsNodeHead);
    const snapshotId = await takeSnapshot(anvil, options, setupChanges);

    const session = createSession({
      anvil,
      chain,
      rpcUrl,
      target,
      options,
      setupChanges,
      failures,
      timeout,
    });

    try {
      const result = await simulateGipPayloadOnFork(
        {
          chainId: target.chainId,
          marketConfigurator: target.marketConfigurator,
          calls: target.calls,
          ...(target.expectedMarkets
            ? { expectedMarkets: target.expectedMarkets }
            : {}),
          ...(target.expectedConfigurator
            ? { expectedConfigurator: target.expectedConfigurator }
            : {}),
          ...(target.registry ? { registry: target.registry } : {}),
        },
        session,
      );
      failures.push(...readFailures(result, target.marketConfigurator));
      if (result.executionError) {
        failures.push({
          phase: "execute",
          reason: result.executionError.reason,
          ...(result.executionError.index !== null
            ? { callIndex: result.executionError.index }
            : {}),
        });
      }
      return {
        ...downgradeUnverifiedVerdict(result, caveats),
        setupChanges,
        failures,
      };
    } finally {
      if (snapshotId !== undefined) {
        await restoreSnapshot(anvil, snapshotId, setupChanges, failures);
      }
    }
  });
}

/** Raw units of each underlying the payload's `createMarket` calls consume. **/
function poolCreationDeposits(
  mc: MarketConfiguratorContract,
  calls: readonly ForkExecutionCall[],
): Map<Address, bigint> {
  const deposits = new Map<Address, bigint>();
  for (const call of calls) {
    if (!isSameAddress(call.to, mc.address)) continue;
    let parsed: ReturnType<typeof mc.parseFunctionData>;
    try {
      parsed = mc.parseFunctionData(call.callData);
    } catch {
      continue;
    }
    if (parsed.functionName !== "createMarket") continue;
    const underlying = lowerAddress(
      (parsed.args as { underlying: Address }).underlying,
    );
    deposits.set(
      underlying,
      (deposits.get(underlying) ?? 0n) + POOL_CREATION_DEPOSIT,
    );
  }
  return deposits;
}

/**
 * Why `call` reverts, found by replaying it as an `eth_call` on the state the
 * reverted transaction left unchanged.
 **/
async function revertReason(
  call: ForkExecutionCall,
  account: Address,
  anvil: AnvilClient,
): Promise<string> {
  try {
    await anvil.call({
      account,
      to: call.to,
      data: call.callData,
      value: BigInt(call.value),
    });
    return "the replayed call succeeds; the revert depended on the block";
  } catch (error) {
    return describeRevert(error);
  }
}

/** A revert as the Gearbox error it is, or viem's short message. **/
function describeRevert(error: unknown): string {
  // @dev duck-typed: the SDK's Anvil client may bring its own copy of viem,
  // so `instanceof BaseError` does not hold
  const viemError = error as {
    shortMessage?: string;
    message?: string;
    walk?: (fn: (cause: unknown) => boolean) => unknown;
  };
  const withData = viemError.walk?.(
    cause => typeof (cause as { data?: unknown }).data === "string",
  ) as { data?: Hex } | null | undefined;
  const data =
    withData?.data ??
    (/custom error (0x[0-9a-fA-F]+)/.exec(viemError.message ?? "")?.[1] as
      | Hex
      | undefined);
  if (data && data !== "0x") {
    try {
      const decoded = decodeErrorResult({ abi: errorAbis, data });
      return `${decoded.errorName}(${(decoded.args ?? []).join(", ")})`;
    } catch {
      // not a Gearbox error
    }
  }
  return viemError.shortMessage ?? errorMessage(error);
}

function createSession(args: {
  anvil: AnvilClient;
  chain: Chain;
  /** Normalized RPC URL of the node. **/
  rpcUrl: string;
  target: GipSimulationTarget;
  options: AnvilSimulationOptions;
  setupChanges: string[];
  failures: GipSimulationFailure[];
  timeout: number;
}): GipPayloadForkSession {
  const { anvil, chain, target, options, setupChanges, failures } = args;
  const marketConfigurator = target.marketConfigurator;
  // The Anvil client is a public client plus test actions.
  const client = anvil as unknown as PublicClient<Transport, Chain>;
  const mc = new MarketConfiguratorContract(marketConfigurator, client);
  let timelock: Address | undefined;
  let timelockCode: Hex | undefined;
  let impersonating = false;
  let codeOverridden = false;
  let intervalSet = false;
  let observedSdk: Promise<OnchainSDK> | undefined;

  const wallet = createWalletClient({
    account: undefined,
    chain,
    transport: http(args.rpcUrl, { timeout: args.timeout }),
    pollingInterval: 50,
  });

  async function restoreTimelock(): Promise<void> {
    if (timelock && impersonating) {
      await anvil.stopImpersonatingAccount({ address: timelock });
      impersonating = false;
    }
    if (timelock && timelockCode && codeOverridden) {
      await anvil.setCode({ address: timelock, bytecode: timelockCode });
      codeOverridden = false;
    }
  }

  /**
   * Governance executes every payload call from the TimeLock, so that is the
   * sender for every target. The one target it cannot be is the TimeLock itself
   * while its code is disabled, which is reported instead of silently sent.
   **/
  function resolveSender(to: Address): Address {
    const executeError = (reason: string) =>
      new GipSimulationError(reason, { phase: "execute", target: to });
    if (!timelock || !impersonating) {
      throw executeError("Fork session is not prepared");
    }
    if (codeOverridden && isSameAddress(to, timelock)) {
      throw executeError(
        "Cannot execute a call to the TimeLock while its code is disabled; this payload needs a governance simulation, which is not supported",
      );
    }
    return timelock;
  }

  /** Fresh SDK attached at the post-execution state of the fork. **/
  const attachObservedSdk = () =>
    attachForkSdk({
      client,
      chainId: chain.id,
      marketConfigurator,
      addressProvider: options.addressProvider,
    });

  return {
    getChainId: () => anvil.getChainId(),
    async prepareCalls(calls) {
      const deposits = poolCreationDeposits(mc, calls);
      const seedSdk = deposits.size > 0 ? await attachObservedSdk() : undefined;

      timelock = await mc.contract.read.admin();
      timelockCode = await anvil.getCode({ address: timelock });
      await anvil.setBlockTimestampInterval({ interval: 0 });
      intervalSet = true;
      setupChanges.push("block timestamp interval pinned to 0");
      await anvil.setCode({ address: timelock, bytecode: "0x" });
      codeOverridden = true;
      setupChanges.push(
        `TimeLock ${timelock} code disabled so its calls can be impersonated (no queue or eta delay is exercised)`,
      );
      await anvil.setBalance({ address: timelock, value: parseEther("100") });
      setupChanges.push(`TimeLock ${timelock} funded with 100 native tokens`);
      await anvil.impersonateAccount({ address: timelock });
      impersonating = true;
      setupChanges.push(`impersonating TimeLock ${timelock}`);

      if (seedSdk) {
        for (const [underlying, amount] of deposits) {
          await seedPoolCreationDeposit({
            sdk: seedSdk,
            anvil,
            admin: timelock,
            marketConfigurator,
            underlying,
            amount,
          });
          setupChanges.push(
            `seeded ${amount} raw units of ${underlying} to ${marketConfigurator} for pool creation`,
          );
        }
      }
    },
    async execute(call) {
      const account = resolveSender(call.to);
      const hash = await wallet.sendTransaction({
        account,
        to: call.to,
        data: call.callData,
        value: BigInt(call.value),
        gas: options.gas ?? DEFAULT_CALL_GAS,
      });
      const receipt = await anvil.waitForTransactionReceipt({
        hash,
        retryCount: 15,
      });
      const block = await anvil.getBlock({ blockNumber: receipt.blockNumber });
      return {
        hash,
        status: receipt.status,
        ...(receipt.status === "reverted"
          ? { revertReason: await revertReason(call, account, anvil) }
          : {}),
        blockNumber: receipt.blockNumber,
        blockTimestamp: Number(block.timestamp),
        // Real gas from the real receipt: this is what the README means by
        // "run a simulation for real gas".
        ...(receipt.gasUsed !== undefined
          ? { gasUsed: BigInt(receipt.gasUsed) }
          : {}),
      };
    },
    async readMarketState(address, options) {
      await restoreTimelock();
      observedSdk ??= attachObservedSdk();
      const sdk = await observedSdk;
      return getMarketState(sdk, marketConfigurator, address, {
        client,
        timestamp: Number(sdk.timestamp),
        ...(target.registry ? { registry: target.registry } : {}),
        ...(options?.knownDeployments
          ? { knownDeployments: options.knownDeployments }
          : {}),
      });
    },
    async readConfiguratorState(address) {
      await restoreTimelock();
      return getConfiguratorState(client, address);
    },
    async close() {
      try {
        await restoreTimelock();
      } catch (error) {
        failures.push({ phase: "cleanup", reason: errorMessage(error) });
      } finally {
        if (intervalSet) {
          try {
            await anvil.removeBlockTimestampInterval();
            intervalSet = false;
          } catch (error) {
            failures.push({ phase: "cleanup", reason: errorMessage(error) });
          }
        }
      }
    },
  };
}
