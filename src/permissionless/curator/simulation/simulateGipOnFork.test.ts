import { type Address, encodeFunctionData, toFunctionSelector } from "viem";
import { describe, expect, it } from "vitest";
import { iCreditConfigureActionsAbi } from "../../../abi/310/configure/iCreditConfigureActions.js";
import { iMarketConfiguratorV310Abi } from "../../../abi/310/generated.js";
import type { SafeTx } from "../../bindings/governance/types.js";
import type { TimelockTxs } from "../../utils/governance/types.js";
import type {
  ConfiguratorState,
  TwoAdminProposal,
} from "../state/configurator/types.js";
import type {
  MarketCreditManagerState,
  MarketState,
} from "../state/market/types.js";
import { marketStateFixtures } from "../testing/marketStateFixtures.js";
import {
  compareGipForkState,
  type ForkExecutionCall,
  type GipForkSession,
  type GipSimulationPlan,
  type RampStartRequest,
  simulateGipOnFork,
} from "./simulateGipOnFork.js";

const configurator: Address = "0x3333333333333333333333333333333333333333";
const otherTarget: Address = "0x4444444444444444444444444444444444444444";
const marketState = marketStateFixtures()[0].state;
const configuratorState: ConfiguratorState = {
  address: configurator,
  version: 1,
  admin: otherTarget,
  emergencyAdmin: otherTarget,
  pausableAdmins: [],
  unpausableAdmins: [],
  lossLiquidators: [otherTarget],
  emergencyLiquidators: [],
  governor: {
    address: otherTarget,
    queueAdmins: [],
    executionAdmins: [],
    vetoAdmin: otherTarget,
  },
  treasury: {
    address: otherTarget,
    defaultSplit: { recievers: [], proportions: [] },
    activeProposals: [],
  },
  shutdown: false,
};

function plan(): GipSimulationPlan {
  return {
    // Only the fields the timelock execution reads.
    timelockTxs: {
      chainId: 1,
      marketConfigurator: configurator,
      queueBatches: [
        [
          { to: otherTarget, contractMethod: { name: "startBatch" } },
          {
            contractMethod: { name: "queueTransaction" },
            contractInputsValues: {
              target: otherTarget,
              signature: "foo()",
              data: "0x",
              value: "0",
            },
          },
          {
            contractMethod: { name: "queueTransaction" },
            contractInputsValues: {
              target: configurator,
              signature: "bar()",
              data: "0x",
              value: "1",
            },
          },
        ],
      ],
    } as unknown as TimelockTxs,
    expectedMarkets: [{ address: marketState.address, after: marketState }],
  };
}

type TestForkSession = GipForkSession & {
  calls: ForkExecutionCall[];
  readonly closed: boolean;
};

function fork(overrides: Partial<GipForkSession> = {}): TestForkSession {
  const calls: ForkExecutionCall[] = [];
  let closed = false;
  return {
    calls,
    get closed() {
      return closed;
    },
    getChainId: async () => 1,
    prepare: async () => {},
    execute: async call => {
      calls.push(call);
      return {
        hash: `0x${String(calls.length).padStart(64, "0")}`,
        status: "success",
      };
    },
    readMarketState: async () => structuredClone(marketState),
    readConfiguratorState: async () => {
      throw Error("Unexpected configurator read");
    },
    close: async () => {
      closed = true;
    },
    ...overrides,
  };
}

describe("simulateGipOnFork", () => {
  it("executes every generated target and matches observed market state", async () => {
    const expected = { ...marketState, creditManagers: {} };
    const session = fork({
      readMarketState: async () => structuredClone(expected),
    });
    const input = plan();
    input.expectedMarkets = [{ address: expected.address, after: expected }];
    const result = await simulateGipOnFork(input, session);
    expect(result.verdict).toBe("match");
    expect(result.receipts).toHaveLength(2);
    expect(session.calls.map(call => call.to)).toEqual([
      otherTarget,
      configurator,
    ]);
    expect(session.calls[0].callData).toBe(toFunctionSelector("foo()"));
    expect(result.markets[0].diff?.equal).toBe(true);
    expect(session.closed).toBe(true);
  });

  it("reports a state mismatch after successful execution", async () => {
    const observed = { ...marketState, paused: !marketState.paused };
    const result = await simulateGipOnFork(
      plan(),
      fork({
        readMarketState: async () => observed,
      }),
    );
    expect(result.verdict).toBe("mismatch");
    expect(result.markets[0].diff?.changes).toContainEqual({
      op: "set",
      path: ["paused"],
      before: marketState.paused,
      after: observed.paused,
    });
  });

  it("stops at a reverted transaction and closes the session", async () => {
    const session = fork({
      execute: async () => ({
        hash: `0x${"1".repeat(64)}`,
        status: "reverted",
      }),
      readMarketState: async () => {
        throw Error("State must not be read");
      },
    });
    const result = await simulateGipOnFork(plan(), session);
    expect(result.verdict).toBe("execution_failed");
    expect(result.executionError).toEqual({
      index: 0,
      reason: "Transaction reverted",
    });
    expect(result.receipts).toHaveLength(1);
    expect(session.closed).toBe(true);
  });

  it("reports why a transaction reverted when the session found out", async () => {
    const result = await simulateGipOnFork(
      plan(),
      fork({
        execute: async () => ({
          hash: `0x${"1".repeat(64)}`,
          status: "reverted",
          revertReason: "StalePriceException()",
        }),
      }),
    );
    expect(result.executionError).toEqual({
      index: 0,
      reason: "Transaction reverted: StalePriceException()",
    });
  });

  it("reports unreadable state without declaring a match", async () => {
    const result = await simulateGipOnFork(
      plan(),
      fork({
        readMarketState: async () => {
          throw Error("RPC unavailable");
        },
      }),
    );
    expect(result.verdict).toBe("incomplete");
    expect(result.markets[0].readError).toBe("RPC unavailable");
  });

  it("reports an invalid chain value as incomplete", async () => {
    const result = await compareGipForkState(
      {
        marketConfigurator: configurator,
        expectedMarkets: [{ address: marketState.address, after: marketState }],
      },
      fork({
        readMarketState: async () =>
          ({ ...marketState, paused: "unknown" }) as unknown as MarketState,
      }),
    );
    expect(result.verdict).toBe("incomplete");
    expect(result.markets[0].diff?.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "invalid-value",
        path: ["paused"],
      }),
    );
  });

  it("rejects a fork on a different chain before preparing it", async () => {
    const session = fork({ getChainId: async () => 10 });
    await expect(simulateGipOnFork(plan(), session)).rejects.toThrow(
      "does not match",
    );
    expect(session.calls).toHaveLength(0);
  });

  it("detects liquidator role differences in configurator state", async () => {
    const result = await compareGipForkState(
      {
        marketConfigurator: configurator,
        expectedMarkets: [],
        expectedConfigurator: configuratorState,
      },
      fork({
        readConfiguratorState: async () => ({
          ...configuratorState,
          lossLiquidators: [],
        }),
      }),
    );
    expect(result.verdict).toBe("mismatch");
    expect(result.configurator?.diff?.differences.lossLiquidators).toEqual({
      added: [],
      removed: [otherTarget.toLowerCase()],
    });
  });

  it("detects changes to treasury proposal approvals", async () => {
    const proposal: TwoAdminProposal = {
      callData: "0x1234",
      data: { functionName: "setDefaultSplit", recievers: [], proportions: [] },
      conirmedByTreasuryProxy: false,
      confirmedByAdmin: false,
    };
    const expected: ConfiguratorState = {
      ...configuratorState,
      treasury: { ...configuratorState.treasury, activeProposals: [proposal] },
    };
    const result = await compareGipForkState(
      {
        marketConfigurator: configurator,
        expectedMarkets: [],
        expectedConfigurator: expected,
      },
      fork({
        readConfiguratorState: async () => ({
          ...expected,
          treasury: {
            ...expected.treasury,
            activeProposals: [{ ...proposal, confirmedByAdmin: true }],
          },
        }),
      }),
    );
    expect(result.verdict).toBe("mismatch");
    expect(
      result.configurator?.diff?.differences.treasury?.activeProposals,
    ).toEqual({
      added: [{ ...proposal, confirmedByAdmin: true }],
      removed: [proposal],
    });
  });

  it("compares gauge rates like any other state", async () => {
    const expected: MarketState = {
      ...marketState,
      rateKeeper: {
        type: "GAUGE",
        rates: { [otherTarget]: { minRate: 1, maxRate: 2 } },
      },
    };
    const compare = (observed: MarketState) =>
      compareGipForkState(
        {
          marketConfigurator: configurator,
          expectedMarkets: [{ address: expected.address, after: expected }],
        },
        fork({ readMarketState: async () => observed }),
      );

    const same = await compare(structuredClone(expected));
    expect(same.verdict).toBe("match");

    const other = await compare({
      ...expected,
      rateKeeper: {
        type: "GAUGE",
        rates: { [otherTarget]: { minRate: 1, maxRate: 3 } },
      },
    });
    expect(other.verdict).toBe("mismatch");
    expect(other.markets[0].diff?.changes).toContainEqual({
      op: "set",
      path: ["rateKeeper", "rates", otherTarget.toLowerCase(), "maxRate"],
      before: 2,
      after: 3,
    });
  });

  it("compares ramp parameters without skipping them", async () => {
    const result = await compareGipForkState(
      {
        marketConfigurator: configurator,
        expectedMarkets: [{ address: marketState.address, after: marketState }],
      },
      fork(),
    );
    expect(result.verdict).toBe("match");
    expect(result.markets[0].diff?.skipped).toHaveLength(0);
  });

  it("resolves an immediate ramp start from its execution block", async () => {
    const expected = structuredClone(marketState);
    const [cmAddress, cm] = Object.entries(expected.creditManagers)[0] as [
      Address,
      MarketCreditManagerState,
    ];
    const tokenAddress = Object.keys(cm.collateralTokens).find(
      token => token.toLowerCase() !== expected.underlyingAsset.toLowerCase(),
    ) as Address;
    cm.collateralTokens[tokenAddress] = {
      ...cm.collateralTokens[tokenAddress],
      liquidationThresholdFinal: 60,
      rampStart: 0,
      rampDuration: 172_800,
    };
    const inner = encodeFunctionData({
      abi: iCreditConfigureActionsAbi,
      functionName: "rampLiquidationThreshold",
      args: [tokenAddress, 6000, 0, 172_800],
    });
    const outer = encodeFunctionData({
      abi: iMarketConfiguratorV310Abi,
      functionName: "configureCreditSuite",
      args: [cmAddress, inner],
    });
    const input = plan();
    // Only the fields the timelock execution reads.
    input.timelockTxs.queueBatches[0][1] = {
      contractMethod: { name: "queueTransaction" },
      contractInputsValues: {
        target: configurator,
        signature: "configureCreditSuite(address,bytes)",
        data: `0x${outer.slice(10)}`,
        value: "0",
      },
    } as unknown as SafeTx;
    input.expectedMarkets = [{ address: expected.address, after: expected }];
    const observed = structuredClone(expected);
    observed.creditManagers[cmAddress].collateralTokens[
      tokenAddress
    ].rampStart = 1_800_000_100;
    const session = fork({
      execute: async () => ({
        hash: `0x${"1".repeat(64)}`,
        status: "success",
        blockTimestamp: 1_800_000_100,
      }),
      readMarketState: async () => observed,
    });

    const result = await simulateGipOnFork(input, session);
    expect(result.verdict).toBe("match");
    expect(
      result.markets[0].expected.creditManagers[cmAddress].collateralTokens[
        tokenAddress
      ].rampStart,
    ).toBe(1_800_000_100);
    expect(
      expected.creditManagers[cmAddress].collateralTokens[tokenAddress]
        .rampStart,
    ).toBe(0);

    const withoutTimestamp = await simulateGipOnFork(
      input,
      fork({
        readMarketState: async () => observed,
      }),
    );
    expect(withoutTimestamp.verdict).toBe("incomplete");
    expect(withoutTimestamp.markets[0].diff?.skipped).toContainEqual(
      expect.objectContaining({
        reason: "ramp start depends on execution block timestamp",
      }),
    );
  });

  it("marks a clamped ramp start as unverified when execution timestamps are unavailable", async () => {
    const expected = structuredClone(marketState);
    const [cmAddress, cm] = Object.entries(expected.creditManagers)[0] as [
      Address,
      MarketCreditManagerState,
    ];
    const tokenAddress = Object.keys(cm.collateralTokens).find(
      token => token.toLowerCase() !== expected.underlyingAsset.toLowerCase(),
    ) as Address;
    const params: RampStartRequest = {
      creditManager: cmAddress,
      token: tokenAddress,
      liquidationThresholdFinal: 60,
      rampStart: 0,
      rampDuration: 172_800,
    };
    cm.collateralTokens[tokenAddress] = {
      ...cm.collateralTokens[tokenAddress],
      liquidationThresholdFinal: params.liquidationThresholdFinal,
      rampStart: params.rampStart,
      rampDuration: params.rampDuration,
    };
    const observed = structuredClone(expected);
    observed.creditManagers[cmAddress].collateralTokens[
      tokenAddress
    ].rampStart = 1_800_000_100;
    const result = await compareGipForkState(
      {
        marketConfigurator: configurator,
        expectedMarkets: [{ address: expected.address, after: expected }],
        rampStartRequests: [params],
      },
      fork({ readMarketState: async () => observed }),
    );
    expect(result.verdict).toBe("incomplete");
    expect(result.markets[0].diff?.skipped).toContainEqual({
      path: [
        "creditManagers",
        cmAddress.toLowerCase(),
        "collateralTokens",
        tokenAddress.toLowerCase(),
        "rampStart",
      ],
      reason: "ramp start depends on execution block timestamp",
    });
  });
});
