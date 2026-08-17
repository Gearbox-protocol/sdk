import { describe, expect, it, vi } from "vitest";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_ACCOUNT,
  caToken,
  POS,
  UND,
  WALLET,
} from "../../sdk/accounts/intents/testing/market.js";
import type {
  MultichainSDK,
  OnchainSDK,
  PreviewErrorReason,
} from "../../sdk/index.js";
import { CreditAccountOperationsService } from "../../sdk/index.js";
import { SourceUnavailableError } from "../errors/index.js";
import { onchainOnly, SimulateApi } from "./SimulateApi.js";
import type { PositionInput } from "./types.js";

const CHAIN_ID = 1;
const BLOCK = 20_000_000n;
const TIMESTAMP = 1_719_792_000;

function fakeMultichain(chain?: OnchainSDK): MultichainSDK {
  return {
    chain: vi.fn(() => chain ?? { currentBlock: BLOCK, timestamp: TIMESTAMP }),
  } as unknown as MultichainSDK;
}

describe("onchainOnly", () => {
  it("wraps a successful read in the envelope, naming the block it ran on", async () => {
    const run = onchainOnly(fakeMultichain());

    const response = await run("simulate", CHAIN_ID, async () => 42);

    expect(response).toEqual({
      data: 42,
      meta: {
        chains: [
          {
            chainId: CHAIN_ID,
            status: "success",
            source: "onchain",
            blockNumber: Number(BLOCK),
            timestamp: TIMESTAMP,
          },
        ],
      },
    });
  });

  it("resolves a throwing chain as that chain's error entry rather than rejecting", async () => {
    const boom = new Error("rpc down");
    const warn = vi.fn();
    const run = onchainOnly(fakeMultichain(), {
      warn,
      debug: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    } as never);

    const response = await run("simulate", CHAIN_ID, async () => {
      throw boom;
    });

    expect(response.meta.chains).toEqual([
      { chainId: CHAIN_ID, status: "error", source: "onchain", error: boom },
    ]);
    expect(response.data).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("throws when the SDK has no onchain source at all", async () => {
    const run = onchainOnly(undefined);

    await expect(run("simulate", CHAIN_ID, async () => 1)).rejects.toThrow(
      SourceUnavailableError,
    );
  });
});

// ---------------------------------------------------------------------------
// Account flows on the mock market: the API reads the account itself through
// `accounts.getCreditAccountData`, so a test hands it a key, never a slice.
// ---------------------------------------------------------------------------

/** 2000 UND of TVL against 1000 UND of debt: 1000 of collateral at 2x. */
const TVL = 200000000000n;
const DEBT = 100000000000n;
const COLLATERAL = TVL - DEBT;
const MIN_DEBT = 10000000000n;

const POSITION: PositionInput = {
  chainId: CHAIN_ID,
  creditAccount: CREDIT_ACCOUNT,
};

function harness(args?: {
  minDebt?: bigint;
  tokens?: ReturnType<typeof caToken>[];
}) {
  const account = buildFixtureCreditAccount({
    accountDebt: DEBT,
    tokens: args?.tokens ?? [caToken(UND, TVL)],
  });
  const chain = {
    ...buildMarketSdk({
      minDebt: args?.minDebt ?? MIN_DEBT,
      creditAccounts: [account],
    }),
    currentBlock: BLOCK,
    timestamp: TIMESTAMP,
    // the LP simulations delegate to PoolService; the mock market has none
    pools: { simulateDeposit: vi.fn(), simulateWithdraw: vi.fn() },
  } as unknown as OnchainSDK;
  const simulate = new SimulateApi(
    onchainOnly(fakeMultichain(chain)),
    () => chain,
  );
  return { simulate, chain };
}

describe("maxWithdraw", () => {
  it("is the largest partial withdrawal the debt band allows", async () => {
    const { simulate } = harness();

    const max = await simulate.maxWithdraw(POSITION);
    expect(max.meta.chains[0]?.status).toBe("success");

    // one unit inside: viable, debt lands on `minDebt` up to the rounding of
    // `proportionalDebt` (floor of D0·W/C0)
    const inside = await simulate.withdrawStrategy(POSITION, {
      amount: max.data,
      to: WALLET,
    });
    expect(inside.data.ok).toBe(true);
    if (!inside.data.ok || inside.data.preview.kind !== "adjust") {
      throw new Error("expected an adjust preview");
    }
    const debtAfter = inside.data.preview.accountDebt;
    const ceilStep = (DEBT + COLLATERAL - 1n) / COLLATERAL;
    expect(debtAfter).toBeGreaterThanOrEqual(MIN_DEBT);
    expect(debtAfter).toBeLessThan(MIN_DEBT + ceilStep);

    // one repayment step past it: the debt drops below the band
    const overshoot = (COLLATERAL + DEBT - 1n) / DEBT;
    const outside = await simulate.withdrawStrategy(POSITION, {
      amount: max.data + overshoot,
      to: WALLET,
    });
    expect(outside.data).toEqual({ ok: false, reason: "debtOutOfRange" });
  });
});

describe("every PreviewErrorReason is produced by the engine, not fabricated", () => {
  const cases: Record<
    PreviewErrorReason,
    (simulate: SimulateApi) => Promise<{ ok: boolean; reason?: string }>
  > = {
    // math.ts `assertLeverageAtLeastOne`
    leverageOutOfRange: async simulate =>
      (
        await simulate.adjustLeverage(POSITION, {
          targetLeverage: 50n,
          token: UND,
        })
      ).data,
    // math.ts `assertDebtInBand`, via planAdjustLeverage: 500x on 1000 UND of
    // collateral asks for more than the facade's maxDebt
    debtOutOfRange: async simulate =>
      (
        await simulate.adjustLeverage(POSITION, {
          targetLeverage: 50000n,
          token: UND,
        })
      ).data,
    // realize.ts `assertHolds`: the account holds no POS to withdraw
    insufficientSourceBalance: async simulate =>
      (
        await simulate.withdrawCollateral(POSITION, {
          token: POS,
          amount: 1n,
          to: WALLET,
        })
      ).data,
    // plan.ts `planDeposit`: only the underlying (or the RWA asset) can be
    // deposited
    unsupportedCollateralToken: async simulate =>
      (
        await simulate.depositStrategy(POSITION, {
          token: POS,
          amount: 1n,
        })
      ).data,
  };

  it.each(Object.entries(cases))("%s", async (reason, run) => {
    const { simulate } = harness();
    expect(await run(simulate)).toEqual({ ok: false, reason });
  });
});

// ---------------------------------------------------------------------------
// Each method maps its public params onto exactly one engine call
// ---------------------------------------------------------------------------

describe("every method maps its params onto the engine's call", () => {
  const OK_PREVIEW = {
    ok: true as const,
    instant: { operations: [], preview: { min: {} as never }, calls: [] },
    instantError: undefined,
    delayedBranch: undefined,
    delayedError: undefined,
  };
  const OPTIONS = { slippage: 50, quotaReserve: 100 };

  const accountCases = [
    {
      method: "depositStrategy",
      params: {
        token: UND,
        amount: 10n,
        positionToken: POS,
        targetLeverage: 300n,
        ...OPTIONS,
      },
      intent: {
        type: "DEPOSIT",
        token: UND,
        amount: 10n,
        value: undefined,
        positionToken: POS,
        targetLeverage: 300n,
      },
    },
    {
      method: "withdrawStrategy",
      params: {
        amount: 10n,
        to: WALLET,
        tokenOut: UND,
        sourceToken: POS,
        ...OPTIONS,
      },
      intent: {
        type: "WITHDRAW",
        amount: 10n,
        to: WALLET,
        tokenOut: UND,
        sourceToken: POS,
      },
    },
    {
      method: "adjustLeverage",
      params: { targetLeverage: 300n, token: POS, ...OPTIONS },
      intent: { type: "ADJUST_LEVERAGE", targetLeverage: 300n, token: POS },
    },
    {
      method: "addCollateral",
      params: { token: UND, amount: 10n, value: 1n, ...OPTIONS },
      intent: { type: "ADD_COLLATERAL", token: UND, amount: 10n, value: 1n },
    },
    {
      method: "withdrawCollateral",
      params: { token: POS, amount: 10n, to: WALLET, ...OPTIONS },
      intent: { type: "WITHDRAW_ASSET", token: POS, amount: 10n, to: WALLET },
    },
  ] as const;

  it.each(accountCases)(
    "$method → startIntent with the intent, the read account slice and the options",
    async ({ method, params, intent }) => {
      const { simulate } = harness();
      const startIntent = vi
        .spyOn(CreditAccountOperationsService.prototype, "startIntent")
        .mockResolvedValue(OK_PREVIEW as never);

      await (simulate[method] as (p: unknown, a: unknown) => Promise<unknown>)(
        POSITION,
        params,
      );

      expect(startIntent).toHaveBeenCalledTimes(1);
      expect(startIntent.mock.calls[0]?.[0]).toMatchObject({
        intent,
        creditAccount: { creditAccount: CREDIT_ACCOUNT },
        slippage: 50,
        quotaReserve: 100,
      });
      startIntent.mockRestore();
    },
  );

  it("openNewStrategy → openStrategyIntent, target defaulting to the opportunity's collateral", async () => {
    const { simulate } = harness();
    const open = vi
      .spyOn(CreditAccountOperationsService.prototype, "openStrategyIntent")
      .mockResolvedValue({ ok: true, preview: {} as never });

    await simulate.openNewStrategy(
      { chainId: CHAIN_ID, creditManager: POS, targetCollateral: POS },
      { collateral: [{ token: UND, balance: 5n }], leverage: 200n, ...OPTIONS },
    );

    expect(open.mock.calls[0]?.[0]).toMatchObject({
      creditManager: POS,
      collateral: [{ token: UND, balance: 5n }],
      targetToken: POS,
      leverage: 200n,
      slippage: 50,
      quotaReserve: 100,
    });
    open.mockRestore();
  });

  it.each(["deposit", "withdraw"] as const)(
    "%s → the pool service's simulation on the chain, synchronously",
    method => {
      const { simulate, chain } = harness();
      const spy = vi
        .spyOn(
          chain.pools,
          method === "deposit" ? "simulateDeposit" : "simulateWithdraw",
        )
        .mockReturnValue({} as never);

      simulate[method](
        { chainId: CHAIN_ID, pool: POS },
        { amount: 7n, tokenIn: UND },
      );

      expect(spy).toHaveBeenCalledWith({
        pool: POS,
        amount: 7n,
        tokenIn: UND,
        tokenOut: undefined,
      });
    },
  );

  it("a preview without an instant branch is a bug, not a result", async () => {
    const { simulate } = harness();
    const startIntent = vi
      .spyOn(CreditAccountOperationsService.prototype, "startIntent")
      .mockResolvedValue({
        ...OK_PREVIEW,
        instant: undefined,
        instantError: "pathNotFound",
      } as never);

    const response = await simulate.addCollateral(POSITION, {
      token: UND,
      amount: 1n,
    });

    // `onchainOnly` turns the throw into the chain's error entry
    expect(response.meta.chains[0]).toMatchObject({ status: "error" });
    startIntent.mockRestore();
  });
});
