import type { Address, Hex } from "viem";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { AddPeripheryContractAction } from "../actions/addPeripheryContractActionData.js";
import type { DeployContractAction } from "../actions/deployContractActionData.js";
import type {
  GipSimulationOptions,
  GipSimulationOutcome,
  GipSimulationTarget,
} from "../simulation/GipSimulationError.js";
import {
  type ForkExecutionCall,
  simulateGipPayloadOnFork,
} from "../simulation/simulateGipOnFork.js";
import type { AnvilSimulationOptions } from "../simulation/simulateOnAnvil.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import type { MarketState } from "../state/market/types.js";
import {
  CM,
  CONFIGURATOR,
  configuratorState,
  createStubClient,
  createTestSdk,
  marketState,
  POOL,
  SOURCE_BLOCK,
  SOURCE_TIMESTAMP,
  TIMELOCK,
  TREASURY,
  USDC,
  WETH,
} from "../testing/sdkHarness.js";
import { type ForkNode, startForkNode } from "../testing/startForkNode.js";
import { parseMarketScopedAction } from "./actionScope.js";
import type { CuratorSession } from "./CuratorSession.js";

const AUTHOR: Address = "0x000000000000000000000000000000000000dEaD";
const ETA = SOURCE_TIMESTAMP + 7 * 24 * 60 * 60;
const ANVIL_MODULE = "../simulation/simulateOnAnvil.js";

/**
 * The runner's targets as these tests pass them: without a source block hash,
 * which the runner reports as a caveat rather than rejecting.
 **/
type TargetWithoutHash = Omit<GipSimulationTarget, "sourceBlockHash">;
const anvilTarget = (target: TargetWithoutHash): GipSimulationTarget =>
  target as GipSimulationTarget;

interface ForkReads {
  marketState?: (address: Address) => MarketState;
  configuratorState?: (address: Address) => ConfiguratorState;
  revertAt?: number;
}

interface FakeFork {
  executed: ForkExecutionCall[];
  runs: { options: AnvilSimulationOptions; target: GipSimulationTarget }[];
  readonly closed: number;
  run(
    options: AnvilSimulationOptions,
    target: GipSimulationTarget,
  ): Promise<GipSimulationOutcome>;
}

/**
 * Stands in for the Anvil node: it runs the real payload engine against
 * in-memory reads, so the builder → engine → verdict wiring is exercised
 * rather than re-implemented.
 **/
function fakeFork(reads: ForkReads = {}): FakeFork {
  const executed: ForkExecutionCall[] = [];
  const runs: FakeFork["runs"] = [];
  let closed = 0;
  return {
    executed,
    runs,
    get closed() {
      return closed;
    },
    async run(options, target) {
      runs.push({ options, target });
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
        },
        {
          getChainId: async () => target.chainId,
          prepareCalls: async () => {},
          execute: async (call, index) => {
            executed.push(call);
            return {
              hash: `0x${String(index + 1).padStart(64, "0")}`,
              status: reads.revertAt === index ? "reverted" : "success",
              blockNumber: SOURCE_BLOCK + BigInt(index) + 1n,
              blockTimestamp: SOURCE_TIMESTAMP + 12,
            };
          },
          readMarketState: async address => {
            if (!reads.marketState) throw new Error(`no reader for ${address}`);
            return reads.marketState(address);
          },
          readConfiguratorState: async address => {
            if (!reads.configuratorState) {
              throw new Error(`no reader for ${address}`);
            }
            return reads.configuratorState(address);
          },
          close: async () => {
            closed += 1;
          },
        },
      );
      return { ...result, setupChanges: [], failures: [] };
    },
  };
}

describe("builder simulation on the SDK's fork", () => {
  let node: ForkNode;
  beforeAll(async () => {
    node = await startForkNode();
  });
  beforeEach(() => node.reset());
  afterEach(() => vi.doUnmock(ANVIL_MODULE));
  afterAll(() => node.close());

  /**
   * An SDK in fork mode whose simulations run on `fork` instead of a real Anvil
   * node. Everything up to the node itself is the real code path.
   **/
  async function forkSdk(fork: FakeFork): Promise<CuratorSession> {
    vi.resetModules();
    vi.doMock(ANVIL_MODULE, () => ({
      simulateOnAnvil: (
        options: AnvilSimulationOptions,
        target: GipSimulationTarget,
      ) => fork.run(options, target),
    }));
    const { CuratorSession } = await import("./CuratorSession.js");
    return CuratorSession.create({
      fork: { rpcUrl: node.url, timeoutMs: 1000 },
      marketConfigurator: CONFIGURATOR,
    });
  }

  const marketBuilder = (sdk: CuratorSession) =>
    sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 2_000 } })
      .addAction({
        type: "POOL::setTokenLimit",
        params: { token: WETH, limit: 42 },
      });

  const emergencyAdminBuilder = (sdk: CuratorSession) =>
    sdk.configurator({ initialState: configuratorState() }).addAction({
      type: "CONFIGURATOR::setEmergencyAdmin",
      params: { emergencyAdmin: CM },
    });

  it("matches when the fork reads back the projected state", async () => {
    let after!: MarketState;
    const fork = fakeFork({ marketState: () => structuredClone(after) });
    const market = marketBuilder(await forkSdk(fork));
    ({ after } = await market.preview());
    const result = await market.simulate();

    expect(result.verdict).toBe("match");
    expect(result.calls).toHaveLength(2);
    expect(fork.executed).toHaveLength(2);
    expect(fork.closed).toBe(1);
    expect(fork.runs[0].target.eta).toBe(SOURCE_TIMESTAMP);
  });

  it("uses the same ETA for preview and the simulation target", async () => {
    let after!: MarketState;
    const fork = fakeFork({ marketState: () => structuredClone(after) });
    const market = marketBuilder(await forkSdk(fork));
    const preview = await market.preview({ eta: ETA });
    after = preview.after;
    const result = await market.simulate({ eta: ETA });

    expect(preview.eta).toBe(ETA);
    expect(fork.runs[0].target.eta).toBe(ETA);
    expect(fork.runs[0].target.expectedMarkets?.[0].after).toEqual(after);
    expect(result.verdict).toBe("match");
  });

  it("reports a mismatch when the fork disagrees", async () => {
    let after!: MarketState;
    const fork = fakeFork({
      marketState: () => ({ ...structuredClone(after), totalDebtLimit: 999 }),
    });
    const market = marketBuilder(await forkSdk(fork));
    ({ after } = await market.preview());
    const result = await market.simulate();

    expect(result.verdict).toBe("mismatch");
    expect(result.markets[0].diff?.changes.length).toBeGreaterThan(0);
  });

  it("reports incomplete when the fork cannot be read", async () => {
    const fork = fakeFork({
      marketState: () => {
        throw new Error("pool is not deployed on the fork");
      },
    });
    const result = await marketBuilder(await forkSdk(fork)).simulate();

    expect(result.verdict).toBe("incomplete");
    expect(result.markets[0].readError).toMatch(/not deployed/);
    expect(fork.closed).toBe(1);
  });

  it("reports execution_failed and still closes the fork", async () => {
    const fork = fakeFork({ revertAt: 1 });
    const result = await marketBuilder(await forkSdk(fork)).simulate();

    expect(result.verdict).toBe("execution_failed");
    expect(result.executionError).toEqual({
      index: 1,
      reason: "Transaction reverted",
    });
    expect(result.receipts).toHaveLength(2);
    expect(fork.closed).toBe(1);
  });

  it("simulates the configurator payload independently of any market", async () => {
    let after!: ConfiguratorState;
    const fork = fakeFork({ configuratorState: () => structuredClone(after) });
    const config = emergencyAdminBuilder(await forkSdk(fork));
    const preview = await config.preview();
    after = preview.after;
    expect(preview.scope).toBe("configurator");
    expect(preview.eta).toBe(SOURCE_TIMESTAMP);
    expect(after.emergencyAdmin.toLowerCase()).toBe(CM);

    const result = await config.simulate();
    expect(result.verdict).toBe("match");
    expect(result.markets).toEqual([]);
    expect(result.configurator?.diff?.isEqual).toBe(true);
  });

  it("reports a configurator mismatch", async () => {
    const fork = fakeFork({ configuratorState: () => configuratorState() });
    const result = await emergencyAdminBuilder(await forkSdk(fork)).simulate();
    expect(result.verdict).toBe("mismatch");
  });

  it("simulates treasury distribution in the configurator scope", async () => {
    const withBalance = (available: number) =>
      configuratorState({
        treasury: {
          ...configuratorState().treasury,
          balances: { [USDC]: { available, insuranceAmount: 1 } },
        },
      });
    const sdk = await forkSdk(
      fakeFork({ configuratorState: () => withBalance(0) }),
    );
    const result = await sdk
      .configurator({ initialState: withBalance(5) })
      .addAction({
        type: "TREASURY_SPLITTER::distribute",
        params: { token: USDC },
      })
      .simulate();
    expect(result.verdict).toBe("match");
    expect(result.configurator?.diff?.isEqual).toBe(true);
  });

  it("runs every scope on the SDK's node, whatever options are passed", async () => {
    const fork = fakeFork();
    const sdk = await forkSdk(fork);
    // `rpcUrl` is not a simulation option; an untyped caller can still pass it.
    const options = {
      isolation: "none",
      gas: 1_000_000n,
      rpcUrl: "http://elsewhere.invalid",
    } as GipSimulationOptions;
    await marketBuilder(sdk).simulate(options);
    await emergencyAdminBuilder(sdk).simulate();

    expect(fork.runs[0].options).toEqual({
      isolation: "none",
      gas: 1_000_000n,
      rpcUrl: node.url,
      timeoutMs: 1000,
      // The projection was read from this node, so it must not have moved.
      sourceIsNodeHead: true,
    });
    expect(fork.runs[0].target.expectedMarkets?.[0].after.totalDebtLimit).toBe(
      2_000,
    );
    expect(fork.runs[1].options.rpcUrl).toBe(node.url);
    expect(fork.runs[1].target.expectedConfigurator?.emergencyAdmin).toBe(CM);
  });

  it("simulates the intent recorded when simulate() was called", async () => {
    const fork = fakeFork();
    const config = emergencyAdminBuilder(await forkSdk(fork));
    const pending = config.simulate();
    config.addAction({
      type: "CONFIGURATOR::setEmergencyAdmin",
      params: { emergencyAdmin: TREASURY },
    });
    await pending;

    expect(fork.runs[0].target.calls).toHaveLength(1);
    expect(fork.runs[0].target.expectedConfigurator?.emergencyAdmin).toBe(CM);
  });
});

describe("configurator scope", () => {
  it("merges configurator actions that configure the same thing", async () => {
    const { sdk } = await createTestSdk();
    const preview = await sdk
      .configurator({ initialState: configuratorState() })
      .addAction({
        type: "CONFIGURATOR::setEmergencyAdmin",
        params: { emergencyAdmin: CM },
      })
      .addAction({
        type: "CONFIGURATOR::setEmergencyAdmin",
        params: { emergencyAdmin: POOL },
      })
      .preview();

    expect(preview.resolvedActions).toEqual([
      {
        type: "CONFIGURATOR::setEmergencyAdmin",
        params: { emergencyAdmin: POOL },
      },
    ]);
    expect(preview.after.emergencyAdmin.toLowerCase()).toBe(POOL);
  });

  it("builds a delayed fetched-state plan from the intent recorded at call time", async () => {
    let enteredResolve!: () => void;
    const entered = new Promise<void>(resolve => {
      enteredResolve = resolve;
    });
    let releaseRead!: (version: bigint) => void;
    const delayedVersion = new Promise<bigint>(resolve => {
      releaseRead = resolve;
    });
    const client = createStubClient({
      readContract: ({ functionName }) => {
        if (functionName !== "version") return undefined;
        enteredResolve();
        return delayedVersion;
      },
    });
    const { sdk } = await createTestSdk({ client });
    const config = sdk.configurator().addAction({
      type: "CONFIGURATOR::setEmergencyAdmin",
      params: { emergencyAdmin: CM },
    });

    const pending = config.build({ author: AUTHOR, eta: ETA });
    await entered;
    config.addAction({
      type: "CONFIGURATOR::setEmergencyAdmin",
      params: { emergencyAdmin: POOL },
    });
    releaseRead(310n);
    const plan = await pending;

    expect(plan.resolvedActions).toHaveLength(1);
    expect(plan.payloadCalls).toHaveLength(1);
    expect(plan.after.emergencyAdmin.toLowerCase()).toBe(CM);
  });

  it("builds a configurator plan with queue and execute wrappers", async () => {
    const { sdk } = await createTestSdk();
    const plan = await sdk
      .configurator({ initialState: configuratorState() })
      .addAction({
        type: "CONFIGURATOR::setEmergencyAdmin",
        params: { emergencyAdmin: CM },
      })
      .build({ author: AUTHOR, eta: ETA });
    expect(plan.scope).toBe("configurator");
    expect(plan.payloadCalls).toHaveLength(1);
    expect(plan.timelockTxs.queueBatches).toHaveLength(1);
    expect(plan.executeBatchTxs).toHaveLength(1);
    expect(plan.before.emergencyAdmin).not.toBe(plan.after.emergencyAdmin);
    // There is no per-action gas table for configurator actions, so the plan
    // says so instead of reporting zero as an estimate.
    expect(plan.gas.model).toBe("unavailable");
    expect(plan.gas.isActualMeasurement).toBe(false);
  });

  it("rejects a configurator state from another configurator", async () => {
    const { sdk } = await createTestSdk();
    await expect(
      sdk
        .configurator({ initialState: configuratorState({ address: POOL }) })
        .preview(),
    ).rejects.toThrow(/scoped to/);
  });
});

describe("periphery deployment", () => {
  const ZAPPER: Address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
  const deployment: DeployContractAction = {
    type: "BCR::deployContract",
    params: {
      contractType: "ZAPPER::ERC4626_UNDERLYING",
      version: 310,
      constructorParams: "0x",
      salt: `0x${"00".repeat(32)}`,
      expectedAddress: ZAPPER,
    },
  };
  const registration: AddPeripheryContractAction = {
    type: "MARKET::addPeripheryContract",
    params: {
      peripheryContract: ZAPPER,
      domain: "ZAPPER",
      type: "ZAPPER::ERC4626_UNDERLYING",
    },
  };
  const sdkWith = ({ deployed }: { deployed: boolean }) =>
    createTestSdk({
      stub: {
        readContract: ({ functionName }) =>
          functionName === "computeAddress" ? ZAPPER : undefined,
        client: { getCode: async () => (deployed ? "0x60" : "0x") },
      },
    });

  it("deploys in the market scope and records the contract as deployed", async () => {
    const { sdk } = await sdkWith({ deployed: false });
    const market = sdk
      .market({ initialState: marketState() })
      .addAction(deployment);
    const preview = await market.preview();
    expect(preview.scope).toBe("market");
    expect(preview.blockedAt).toBeUndefined();
    expect(preview.after.periphery).toEqual([
      {
        address: ZAPPER,
        domain: "ZAPPER",
        type: "ZAPPER::ERC4626_UNDERLYING",
        version: 310,
        status: "deployed",
      },
    ]);
    expect(preview.predictedDeployments).toEqual([
      expect.objectContaining({
        address: ZAPPER,
        actionType: "BCR::deployContract",
      }),
    ]);

    const plan = await market.build({ author: AUTHOR, eta: ETA });
    expect(plan.scope).toBe("market");
    expect(plan.payloadCalls).toHaveLength(1);
  });

  it("registers a deployed contract, deploying it first whatever the recording order", async () => {
    const { sdk } = await sdkWith({ deployed: false });
    const preview = await sdk
      .market({ initialState: marketState() })
      .addAction(registration)
      .addAction(deployment)
      .preview();
    expect(preview.resolvedActions.map(({ type }) => type)).toEqual([
      "BCR::deployContract",
      "MARKET::addPeripheryContract",
    ]);
    expect(preview.after.periphery).toEqual([
      expect.objectContaining({
        address: ZAPPER,
        status: "registered",
        version: 310,
      }),
    ]);
  });

  it("refuses to deploy over existing code", async () => {
    const { sdk } = await sdkWith({ deployed: true });
    const preview = await sdk
      .market({ initialState: marketState() })
      .addAction(deployment)
      .preview();
    expect(preview.blockedAt).toBe(0);
    expect(preview.actionDiagnostics[0]).toMatchObject({
      code: "ALREADY_DEPLOYED",
    });
  });

  it("only deploys periphery contract types", () => {
    expect(() =>
      parseMarketScopedAction({
        ...deployment,
        params: { ...deployment.params, contractType: "IRM::LINEAR" },
      }),
    ).toThrow(/periphery/);
  });
});

describe("anvil simulation lifecycle", () => {
  const nodeInfo = {
    forkConfig: {
      forkUrl: "http://upstream",
      forkBlockNumber: String(SOURCE_BLOCK),
    },
  };

  interface AnvilStubOverrides {
    nodeInfo?: typeof nodeInfo;
    blockHash?: Hex;
    revertResult?: boolean;
    client?: { getChainId?: () => Promise<number> };
  }

  function anvilStub(overrides: AnvilStubOverrides = {}) {
    const log: string[] = [];
    return {
      log,
      getChainId: async () => 1,
      anvilNodeInfo: async () => overrides.nodeInfo ?? nodeInfo,
      getBlock: async () => ({
        hash: overrides.blockHash ?? `0x${"ab".repeat(32)}`,
        timestamp: BigInt(SOURCE_TIMESTAMP),
      }),
      snapshot: async (): Promise<Hex> => {
        log.push("snapshot");
        return "0x1";
      },
      // The runner reverts through the raw request so it can read
      // `evm_revert`'s boolean answer, which viem's helper discards.
      request: async ({
        method,
        params,
      }: {
        method: string;
        params: readonly Hex[];
      }) => {
        if (method !== "evm_revert") {
          throw new Error(`unexpected request ${method}`);
        }
        log.push(`revert:${params[0]}`);
        return overrides.revertResult ?? true;
      },
      readContract: async ({ functionName }: { functionName: string }) => {
        if (functionName === "admin") return TIMELOCK;
        throw new Error(`unexpected read ${functionName}`);
      },
      getCode: async () => "0xfeed",
      setBlockTimestampInterval: async () => log.push("interval"),
      setNextBlockTimestamp: async ({ timestamp }: { timestamp: bigint }) =>
        log.push(`timestamp:${timestamp}`),
      removeBlockTimestampInterval: async () => log.push("interval-removed"),
      setCode: async ({ bytecode }: { bytecode: Hex }) =>
        log.push(`setCode:${bytecode}`),
      setBalance: async () => log.push("balance"),
      impersonateAccount: async () => log.push("impersonate"),
      stopImpersonatingAccount: async () => log.push("stop-impersonate"),
      ...overrides.client,
    };
  }

  async function loadRunner(stub: ReturnType<typeof anvilStub>) {
    vi.resetModules();
    vi.doUnmock(ANVIL_MODULE);
    vi.doMock("../../../dev/createAnvilClient.js", () => ({
      createAnvilClient: () => stub,
    }));
    vi.doMock("../../../dev/mint/factory.js", () => ({
      createMinter: () => ({ mint: async () => {} }),
    }));
    return import("../simulation/simulateOnAnvil.js");
  }

  it("snapshots, reports setup changes, and reverts after a failed execution", async () => {
    const stub = anvilStub();
    const { simulateOnAnvil } = await loadRunner(stub);
    const result = await simulateOnAnvil(
      { rpcUrl: "http://anvil.invalid" },
      anvilTarget({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        sourceBlockNumber: SOURCE_BLOCK,
        // A call to the TimeLock cannot be executed while its code is disabled,
        // which is exactly what a payload simulation cannot do.
        calls: [{ to: TIMELOCK, callData: "0x12345678", value: "0" }],
        expectedMarkets: [{ address: POOL, after: marketState() }],
      }),
    );

    expect(result.verdict).toBe("execution_failed");
    expect(result.executionError?.reason).toMatch(
      /needs a governance simulation/,
    );
    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ phase: "execute", callIndex: 0 }),
      ]),
    );
    expect(result.setupChanges.join("\n")).toMatch(/code disabled/);
    // Setup happened, the TimeLock was restored, and the node was reverted.
    expect(stub.log[0]).toBe("snapshot");
    expect(stub.log).toContain("setCode:0x");
    expect(stub.log).toContain("setCode:0xfeed");
    expect(stub.log).toContain("stop-impersonate");
    expect(stub.log).toContain("interval-removed");
    expect(stub.log.at(-1)).toBe("revert:0x1");
  });

  it.each([SOURCE_TIMESTAMP - 100, SOURCE_TIMESTAMP + 100])(
    "pins Anvil execution to the later of ETA %s and the fork head",
    async eta => {
      const stub = anvilStub();
      const { simulateOnAnvil } = await loadRunner(stub);
      const result = await simulateOnAnvil(
        { rpcUrl: "http://anvil.invalid" },
        anvilTarget({
          chainId: 1,
          marketConfigurator: CONFIGURATOR,
          sourceBlockNumber: SOURCE_BLOCK,
          eta,
          calls: [{ to: TIMELOCK, callData: "0x12345678", value: "0" }],
        }),
      );
      expect(stub.log).toContain(
        `timestamp:${Math.max(eta, SOURCE_TIMESTAMP)}`,
      );
      // Reaching execution confirms ETA did not fail during setup.
      expect(result.failures[0].phase).toBe("execute");
      expect(stub.log.at(-1)).toBe("revert:0x1");
    },
  );

  it("skips snapshot isolation when it is disabled", async () => {
    const stub = anvilStub();
    const { simulateOnAnvil } = await loadRunner(stub);
    const result = await simulateOnAnvil(
      {
        rpcUrl: "http://anvil.invalid",
        isolation: "none",
      },
      anvilTarget({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        sourceBlockNumber: SOURCE_BLOCK,
        calls: [{ to: TIMELOCK, callData: "0x12345678", value: "0" }],
        expectedMarkets: [{ address: POOL, after: marketState() }],
      }),
    );
    expect(result.setupChanges[0]).toMatch(/isolation disabled/);
    expect(stub.log).not.toContain("snapshot");
    expect(stub.log.some(entry => entry.startsWith("revert"))).toBe(false);
  });

  it("downgrades a verdict when the fork branched from another block", async () => {
    const stub = anvilStub({
      nodeInfo: {
        forkConfig: { forkUrl: "http://upstream", forkBlockNumber: "123" },
      },
    });
    const { simulateOnAnvil } = await loadRunner(stub);
    const result = await simulateOnAnvil(
      { rpcUrl: "http://anvil.invalid" },
      anvilTarget({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        sourceBlockNumber: SOURCE_BLOCK,
        calls: [{ to: TIMELOCK, callData: "0x12345678", value: "0" }],
      }),
    );
    expect(result.incompleteReasons?.join(" ")).toMatch(
      /fork branched from block 123/,
    );
  });

  it("refuses a fork on the wrong chain before touching it", async () => {
    const stub = anvilStub({ client: { getChainId: async () => 10 } });
    const { simulateOnAnvil } = await loadRunner(stub);
    await expect(
      simulateOnAnvil(
        { rpcUrl: "http://anvil.invalid" },
        anvilTarget({
          chainId: 1,
          marketConfigurator: CONFIGURATOR,
          sourceBlockNumber: SOURCE_BLOCK,
          calls: [{ to: CONFIGURATOR, callData: "0x12345678", value: "0" }],
        }),
      ),
    ).rejects.toThrow(/does not match the GIP chain/);
    expect(stub.log).toEqual([]);
  });

  it("serializes complete runs that share a normalized RPC URL", async () => {
    const stub = anvilStub();
    let snapshotCount = 0;
    let firstSnapshotEntered!: () => void;
    const entered = new Promise<void>(resolve => {
      firstSnapshotEntered = resolve;
    });
    let releaseFirst!: () => void;
    const holdFirst = new Promise<void>(resolve => {
      releaseFirst = resolve;
    });
    stub.snapshot = async () => {
      snapshotCount += 1;
      stub.log.push(`snapshot:${snapshotCount}`);
      if (snapshotCount === 1) {
        firstSnapshotEntered();
        await holdFirst;
      }
      return `0x${snapshotCount}`;
    };
    const { simulateOnAnvil } = await loadRunner(stub);
    const first = simulateOnAnvil(
      { rpcUrl: "http://ANVIL.invalid/" },
      anvilTarget({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        sourceBlockNumber: SOURCE_BLOCK,
        calls: [{ to: TIMELOCK, callData: "0x12345678", value: "0" }],
      }),
    );
    await entered;
    const second = simulateOnAnvil(
      { rpcUrl: "http://anvil.invalid" },
      anvilTarget({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        sourceBlockNumber: SOURCE_BLOCK,
        calls: [{ to: TIMELOCK, callData: "0x12345678", value: "0" }],
      }),
    );
    await Promise.resolve();
    expect(snapshotCount).toBe(1);
    releaseFirst();
    await Promise.all([first, second]);

    expect(stub.log.indexOf("revert:0x1")).toBeLessThan(
      stub.log.indexOf("snapshot:2"),
    );
  });

  it("reports a false evm_revert as a cleanup failure instead of a restored node", async () => {
    const stub = anvilStub({ revertResult: false });
    const { simulateOnAnvil } = await loadRunner(stub);
    const options = { rpcUrl: "http://anvil-revert.invalid" };
    const target = anvilTarget({
      chainId: 1,
      marketConfigurator: CONFIGURATOR,
      sourceBlockNumber: SOURCE_BLOCK,
      calls: [{ to: TIMELOCK, callData: "0x12345678", value: "0" }],
    });
    const result = await simulateOnAnvil(options, target);

    expect(stub.log).toContain("revert:0x1");
    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "cleanup",
          reason: expect.stringMatching(/returned false/),
        }),
      ]),
    );
    // The node was NOT restored, and nothing claims it was.
    expect(result.setupChanges.join("\n")).not.toMatch(/restored the node/);
    expect(result.setupChanges.join("\n")).toMatch(
      /restoration was not confirmed/,
    );
    // The per-node lock is still released, so the node stays usable.
    await expect(simulateOnAnvil(options, target)).resolves.toBeDefined();
  });

  it("releases the per-node run lock after setup failure", async () => {
    const stub = anvilStub();
    let snapshotCount = 0;
    stub.snapshot = async () => {
      snapshotCount += 1;
      if (snapshotCount === 1) throw new Error("snapshot unavailable once");
      stub.log.push("snapshot:recovered");
      return "0x2";
    };
    const { simulateOnAnvil } = await loadRunner(stub);
    const options = { rpcUrl: "http://anvil.invalid" };
    const target = anvilTarget({
      chainId: 1,
      marketConfigurator: CONFIGURATOR,
      sourceBlockNumber: SOURCE_BLOCK,
      calls: [{ to: TIMELOCK, callData: "0x12345678", value: "0" }],
    });
    const [failed, recovered] = await Promise.allSettled([
      simulateOnAnvil(options, target),
      simulateOnAnvil(options, target),
    ]);

    expect(failed.status).toBe("rejected");
    expect(recovered.status).toBe("fulfilled");
    expect(snapshotCount).toBe(2);
    expect(stub.log).toContain("revert:0x2");
  });
});
