import { encodeFunctionData, type Hex } from "viem";
import { describe, expect, it, vi } from "vitest";
import { iCreditFacadeMulticallV310Abi } from "../../../abi/310/generated.js";
import { MIN_INT96 } from "../../constants/math.js";
import { iUniswapV3AdapterAbi } from "../../market/adapters/abi/adapters/iUniswapV3Adapter.js";
import type { AccountSnapshot } from "../../positions/types.js";
import type { MultiCall } from "../../types/transactions.js";
import {
  type ExecutionConstraint,
  evaluateExecutionConstraints,
  inspectMulticall,
} from "./execution-constraints.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  caToken,
  POS,
  POS2,
  UND,
} from "./testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_ROUTER_CALL,
  MOCK_RWA_WRAP_CALL,
} from "./testing/sdk-mock.js";
import type { CreditAccountSlice } from "./types.js";

const unit = 10n ** 8n;
const ca = buildFixtureCreditAccount({
  totalDebt: 50n * unit,
  tokens: [caToken(POS, 100n * unit, 1000n * unit)],
});
const facade = (callData: Hex): MultiCall => ({
  target: CREDIT_FACADE,
  callData,
});
const quota = (change: bigint) =>
  facade(
    encodeFunctionData({
      abi: iCreditFacadeMulticallV310Abi,
      functionName: "updateQuota",
      args: [POS, change, 0n],
    }),
  );
const fullCheck = (minHealthFactor: number, hints: bigint[] = []) =>
  facade(
    encodeFunctionData({
      abi: iCreditFacadeMulticallV310Abi,
      functionName: "setFullCheckParams",
      args: [hints, minHealthFactor],
    }),
  );
const diff: MultiCall = {
  target: MOCK_ROUTER_CALL.target,
  callData: encodeFunctionData({
    abi: iUniswapV3AdapterAbi,
    functionName: "exactDiffInputSingle",
    args: [
      {
        tokenIn: POS,
        tokenOut: UND,
        fee: 3000,
        deadline: 100n,
        leftoverAmount: 100n * unit,
        rateMinRAY: 1n,
        sqrtPriceLimitX96: 0n,
      },
    ],
  }),
};
function snapshot(account: CreditAccountSlice = ca): AccountSnapshot {
  return {
    creditManager: account.creditManager,
    assets: account.tokens.map(({ token, balance }) => ({ token, balance })),
    quotas: account.tokens.map(({ token, quota: balance }) => ({
      token,
      balance,
    })),
    totalDebt: account.totalDebt,
    totalValue: 100n * unit,
  };
}

function expectConstraint(
  constraints: ExecutionConstraint[],
  expected: Pick<ExecutionConstraint, "id" | "status"> & {
    issue?: { reason?: string; detail?: object };
  },
) {
  expect(
    constraints.find(c => c.id === expected.id && c.status === expected.status),
  ).toMatchObject(expected);
}

function fixture(extras?: Parameters<typeof buildMarketSdk>[0], account = ca) {
  const sdk = buildMarketSdk(extras);
  return {
    sdk,
    oracle:
      sdk.marketRegister.findCreditManager(CREDIT_MANAGER).market.priceOracle,
    creditAccount: account,
    snapshot: snapshot(account),
    calls: [MOCK_ROUTER_CALL],
  };
}

describe("execution call requirements", () => {
  it.each([
    [[MOCK_ROUTER_CALL], true, true],
    [[MOCK_RWA_WRAP_CALL], false, false],
    [[MOCK_ROUTER_CALL, MOCK_RWA_WRAP_CALL], true, true],
    [[CA_OP_CALLS.increaseDebt], false, true],
  ] as const)(
    "accumulates safe/forbidden flags for %j",
    (calls, useSafePrices, revertOnForbiddenTokens) => {
      expect(inspectMulticall({ ...fixture(), calls })).toMatchObject({
        useSafePrices,
        revertOnForbiddenTokens,
      });
    },
  );

  it("resolves a diff no-op at equality but keeps post-external balances unknown", () => {
    const props = fixture();
    expect(inspectMulticall({ ...props, calls: [diff] }).useSafePrices).toBe(
      false,
    );
    expect(
      inspectMulticall({ ...props, calls: [MOCK_RWA_WRAP_CALL, diff] }),
    ).toMatchObject({
      useSafePrices: undefined,
      revertOnForbiddenTokens: undefined,
    });
    const dominated = inspectMulticall({
      ...props,
      calls: [MOCK_RWA_WRAP_CALL, diff, MOCK_ROUTER_CALL],
    });
    expect(dominated.useSafePrices).toBe(true);
    expectConstraint(dominated.constraints, {
      id: "callPricing",
      status: "passed",
    });
  });

  it("reports an unsupported call even after safe prices are already required", () => {
    const report = inspectMulticall({
      sdk: buildMarketSdk(),
      creditAccount: ca,
      calls: [
        MOCK_ROUTER_CALL,
        { ...MOCK_ROUTER_CALL, callData: "0xdeadbeef" },
      ],
    });
    expectConstraint(report.constraints, {
      id: "callPricing",
      status: "unresolved",
      issue: {
        reason: "executionRequirementsUnavailable",
        detail: {
          callIndex: 1,
          selector: "0xdeadbeef",
        },
      },
    });
  });
});

describe("final enabled forbidden tokens", () => {
  const sdk = () => buildMarketSdk({ forbiddenTokens: [POS] });

  it("forces safe prices for retained non-growing collateral and names balance growth separately", () => {
    const props = {
      ...fixture({ forbiddenTokens: [POS] }),
      calls: [],
    };
    expect(evaluateExecutionConstraints(props)).toMatchObject({
      useSafePrices: true,
      revertOnForbiddenTokens: false,
    });
    expectConstraint(evaluateExecutionConstraints(props).constraints, {
      id: "forbiddenTokens",
      status: "passed",
    });
    const grown = {
      ...snapshot(),
      assets: [{ token: POS, balance: 101n * unit }],
    };
    expectConstraint(
      evaluateExecutionConstraints({
        ...props,
        calls: [
          facade(
            encodeFunctionData({
              abi: iCreditFacadeMulticallV310Abi,
              functionName: "addCollateral",
              args: [POS, unit],
            }),
          ),
        ],
        snapshot: grown,
      }).constraints,
      {
        id: "forbiddenTokens",
        status: "failed",
        issue: {
          detail: { violation: "balanceIncrease" },
        },
      },
    );
  });

  it("rejects enabled forbidden zero/dust after a safe trigger, including zero-debt multicalls", () => {
    for (const balance of [0n, 1n]) {
      const account = buildFixtureCreditAccount({
        totalDebt: 0n,
        tokens: [caToken(POS, balance, unit)],
      });
      const report = evaluateExecutionConstraints({
        sdk: sdk(),
        creditAccount: account,
        calls: [MOCK_ROUTER_CALL],
        snapshot: snapshot(account),
      });
      expectConstraint(report.constraints, {
        id: "forbiddenTokens",
        status: "failed",
        issue: {
          detail: { violation: "enabled" },
        },
      });
    }
  });

  it("permits disabling forbidden quota before the final check", () => {
    const account = { ...ca, totalDebt: 0n };
    const report = evaluateExecutionConstraints({
      sdk: sdk(),
      creditAccount: account,
      calls: [MOCK_ROUTER_CALL, quota(MIN_INT96)],
      snapshot: { ...snapshot(account), quotas: [] },
    });
    expectConstraint(report.constraints, {
      id: "forbiddenTokens",
      status: "passed",
    });
  });

  it("distinguishes actual close from multicall but still rejects immediate forbidden quota growth", () => {
    const props = {
      ...fixture({ forbiddenTokens: [POS] }),
    };
    const closed = evaluateExecutionConstraints({
      ...props,
      entryPoint: "closeCreditAccount",
    });
    expectConstraint(closed.constraints, {
      id: "collateral",
      status: "notApplicable",
    });
    expect(
      closed.constraints.some(
        c => c.id === "forbiddenTokens" && c.status === "failed",
      ),
    ).toBe(false);
    const illegal = evaluateExecutionConstraints({
      ...props,
      calls: [quota(1n)],
      entryPoint: "closeCreditAccount",
    });
    expectConstraint(illegal.constraints, {
      id: "forbiddenTokens",
      status: "failed",
      issue: {
        detail: { violation: "quotaIncrease" },
      },
    });
  });

  it("starts opening from the underlying mask and accounts for encoded quota increases", () => {
    const props = {
      sdk: sdk(),
      creditAccount: ca,
      entryPoint: "openCreditAccount" as const,
      snapshot: snapshot(),
    };
    const empty = inspectMulticall({ ...props, calls: [] });
    expect(empty.enabledTokensMask).toBe(1n);
    const report = evaluateExecutionConstraints({
      ...props,
      calls: [CA_OP_CALLS.increaseDebt, quota(unit)],
    });
    expectConstraint(report.constraints, {
      id: "forbiddenTokens",
      status: "failed",
      issue: {
        detail: { violation: "quotaIncrease" },
      },
    });
  });
});

describe("strict collateral valuation", () => {
  it("treats absent reserves as zero without reading a bad main collateral answer", () => {
    const props = fixture({ reservePrices: {} });
    const { oracle } = props;
    const main = oracle.mainPrice.bind(oracle);
    const read = vi.spyOn(oracle, "mainPrice").mockImplementation(token => {
      if (token === POS) throw new Error("stale");
      return main(token);
    });
    const report = evaluateExecutionConstraints(props);
    expectConstraint(report.constraints, {
      id: "collateral",
      status: "failed",
      issue: { reason: "insufficientCollateral" },
    });
    expect(read).not.toHaveBeenCalledWith(POS);
  });

  it("reports a configured invalid reserve instead of presenting it as zero collateral", () => {
    const props = fixture();
    const { oracle } = props;
    vi.spyOn(oracle, "reservePrice").mockImplementation(() => {
      throw new Error("stale");
    });
    const report = evaluateExecutionConstraints(props);
    expectConstraint(report.constraints, {
      id: "collateral",
      status: "failed",
      issue: {
        reason: "invalidPriceFeed",
        detail: { token: POS, feed: "reserve" },
      },
    });
  });

  it("uses main pricing for underlying even with no reserve", () => {
    const account = buildFixtureCreditAccount({
      totalDebt: 50n * unit,
      tokens: [caToken(UND, 100n * unit)],
    });
    const props = fixture({ reservePrices: {} }, account);
    const { oracle } = props;
    const read = vi.spyOn(oracle, "reservePrice");
    expectConstraint(evaluateExecutionConstraints(props).constraints, {
      id: "collateral",
      status: "passed",
    });
    expect(read).not.toHaveBeenCalled();
  });

  it("honors a raised full-check HF rather than the default facade threshold", () => {
    const props = fixture();
    expectConstraint(
      evaluateExecutionConstraints({ ...props, calls: [] }).constraints,
      { id: "collateral", status: "passed" },
    );
    const report = evaluateExecutionConstraints({
      ...props,
      calls: [fullCheck(20000)],
    });
    expect(report.minHealthFactor).toBe(20000);
    expectConstraint(report.constraints, {
      id: "collateral",
      status: "failed",
      issue: {
        detail: { required: 20000 },
      },
    });
  });

  it("does not read later invalid feeds once earlier collateral meets the target", () => {
    const account = buildFixtureCreditAccount({
      totalDebt: 50n * unit,
      tokens: [...ca.tokens, caToken(POS2, 100n * unit, 1000n * unit)],
    });
    const props = fixture(undefined, account);
    const { oracle } = props;
    const reserve = oracle.reservePrice.bind(oracle);
    const read = vi.spyOn(oracle, "reservePrice").mockImplementation(token => {
      if (token === POS2) throw new Error("stale");
      return reserve(token);
    });
    expectConstraint(
      evaluateExecutionConstraints({ ...props, calls: [MOCK_ROUTER_CALL] })
        .constraints,
      { id: "collateral", status: "passed" },
    );
    expect(read).not.toHaveBeenCalledWith(POS2);
    const pos2Mask = caToken(POS2, 0n).mask;
    expectConstraint(
      evaluateExecutionConstraints({
        ...props,
        calls: [MOCK_ROUTER_CALL, fullCheck(10000, [pos2Mask])],
      }).constraints,
      {
        id: "collateral",
        status: "failed",
        issue: {
          reason: "invalidPriceFeed",
          detail: { token: POS2, feed: "reserve" },
        },
      },
    );
  });

  it("does not read any feed for zero debt", () => {
    const props = fixture(undefined, { ...ca, totalDebt: 0n });
    const { oracle } = props;
    const read = vi.spyOn(oracle, "mainPrice").mockImplementation(() => {
      throw new Error("stale");
    });
    expectConstraint(evaluateExecutionConstraints(props).constraints, {
      id: "collateral",
      status: "passed",
    });
    expect(read).not.toHaveBeenCalled();
  });

  it("leaves forbidden balance growth unresolved after a non-safe external call", () => {
    const report = evaluateExecutionConstraints({
      sdk: buildMarketSdk({ forbiddenTokens: [POS] }),
      creditAccount: ca,
      snapshot: snapshot(),
      calls: [MOCK_RWA_WRAP_CALL],
    });
    expectConstraint(report.constraints, {
      id: "forbiddenTokens",
      status: "unresolved",
      issue: {
        reason: "executionRequirementsUnavailable",
      },
    });
    expect(report.useSafePrices).toBe(true);
  });
});
