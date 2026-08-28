import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type {
  DelayedIntent,
  PositionClaimableWithdrawal,
  TokenAmount,
} from "../../model/index.js";
import type { MarketSdkExtras } from "../../onchain/accounts/intents/testing/market.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_ACCOUNT,
  CREDIT_MANAGER,
  caToken,
  POS,
  POS2,
  UND,
} from "../../onchain/accounts/intents/testing/market.js";
import { MAX_UINT256 } from "../../onchain/constants/math.js";
import type { MultichainSDK } from "../../onchain/index.js";
import type { PoolSimulation } from "../../onchain/pools/types.js";
import { PrepareApi } from "./PrepareApi.js";

const CHAIN_ID = 1;
const POOL = "0x1000000000000000000000000000000000000001" as Address;
const UNDERLYING = "0x2000000000000000000000000000000000000002" as Address;
const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

/** A priced amount, which is what a `PoolSimulation` reports. */
const amount = (address: Address, value: bigint): TokenAmount => ({
  token: {
    chainId: 1,
    address,
    symbol: "TKN",
    name: "Token",
    decimals: 18,
  },
  value,
  valueUsd: null,
});

function buildApi() {
  const pools = {
    getWithdrawalTokensOut: vi.fn(() => [UNDERLYING]),
    getWithdrawalMetadata: vi.fn(() => ({})),
    simulateWithdraw: vi.fn(
      (props: { amount: bigint; tokenIn?: Address }): PoolSimulation => ({
        tokenIn: amount(props.tokenIn ?? POOL, 100n),
        tokenOut: amount(UNDERLYING, props.amount),
      }),
    ),
    simulateRedeem: vi.fn(
      (props: { amount: bigint; tokenIn?: Address }): PoolSimulation => ({
        tokenIn: amount(props.tokenIn ?? POOL, props.amount),
        tokenOut: amount(UNDERLYING, props.amount),
      }),
    ),
    removeLiquidity: vi.fn(() => ({ calls: [], tx: {} })),
  };
  const api = new PrepareApi({
    chain: () => ({
      pools,
      marketRegister: {
        findByPool: () => ({ pool: { underlying: UNDERLYING } }),
      },
    }),
  } as unknown as MultichainSDK);
  return { api, pools };
}

describe("PrepareApi.withdraw", () => {
  it("passes the tokenOut amount through to simulateWithdraw", () => {
    const { api, pools } = buildApi();

    const result = api.withdraw(
      { chainId: CHAIN_ID, pool: POOL },
      { amount: 110n, wallet: WALLET, tokenOut: UNDERLYING },
    );

    expect(result).toMatchObject({ ok: true });
    expect(pools.simulateWithdraw).toHaveBeenCalledWith({
      pool: POOL,
      amount: 110n,
      tokenIn: POOL,
      tokenOut: UNDERLYING,
    });
    expect(pools.removeLiquidity).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 110n, mode: "withdraw" }),
    );
  });
});

/**
 * The strategy half of the API, driven end to end against the intent engine's
 * fixture market: 1000 UND of position against 500 of debt, at 2x.
 *
 * What is under test here is only the mapping — that each public method reaches
 * the engine with the intent its name promises, and that the answer comes back
 * wrapped in the multichain envelope. The arithmetic behind it belongs to the
 * intent specs.
 */
const TVL = 100000000000n;
const DEBT = 50000000000n;
const QUOTA = (TVL * 9200n) / 10000n;
/** 100 UND, so the largest partial withdrawal leaves a real position behind. */
const MIN_DEBT = 10000000000n;

function buildStrategyApi(extras?: MarketSdkExtras) {
  const sdk = buildMarketSdk({
    minDebt: MIN_DEBT,
    creditAccounts: [
      buildFixtureCreditAccount({
        totalDebt: DEBT,
        tokens: [caToken(POS, TVL, QUOTA)],
      }),
    ],
    ...extras,
  });
  const api = new PrepareApi({
    chain: () => sdk,
  } as unknown as MultichainSDK);
  return {
    api,
    position: { chainId: CHAIN_ID, creditAccount: CREDIT_ACCOUNT },
    strategy: {
      chainId: CHAIN_ID,
      creditManager: CREDIT_MANAGER,
    },
  };
}

describe("PrepareApi — strategy flows reach the engine", () => {
  it("openNewStrategy leverages the wallet's margin into the target", async () => {
    const { api, strategy } = buildStrategyApi();

    const { data, meta } = await api.openNewStrategy(strategy, {
      collateral: [{ token: UND, balance: 20000000000n }],
      leverage: 300n,
    });

    expect(meta.chains[0]?.status).toBe("success");
    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    // the credit manager's strategyTargetCollateral stands in for an unnamed target token
    expect(data.state.totalDebt.value).toBe(40000000000n);
    expect(
      data.state.averageAssets.map(a => ({
        token: a.token.address,
        balance: a.value,
      })),
    ).toEqual([{ token: POS, balance: 60000000000n }]);
  });

  it("depositStrategy keeps leverage while the position grows", async () => {
    const { api, position } = buildStrategyApi();

    const { data } = await api.depositStrategy(position, {
      token: UND,
      amount: 10000000000n,
    });

    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    // 100 UND of margin at the account's 2x borrows another 100
    expect(data.state.totalDebt.value).toBe(DEBT + 10000000000n);
  });

  it("repayStrategy pays the debt down with wallet funds", async () => {
    const { api, position } = buildStrategyApi();

    const { data, meta } = await api.repayStrategy(position, {
      token: UND,
      amount: 20000000000n,
    });

    expect(meta.chains[0]?.status).toBe("success");
    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    expect(data.state.totalDebt.value).toBe(DEBT - 20000000000n);
    expect(data.operations.map(op => op.type)).toEqual([
      "addCollateral",
      "decreaseDebt",
    ]);
  });

  it("maxRepay answers with the debt as it stands", async () => {
    const { api, position } = buildStrategyApi();

    await expect(api.maxRepay(position)).resolves.toMatchObject({ data: DEBT });
  });

  it("maxWithdrawCollateral answers in the token, and withdrawCollateral takes it", async () => {
    const { api, position } = buildStrategyApi();

    const { data: max } = await api.maxWithdrawCollateral(position, POS);
    expect(max).toBeGreaterThan(0n);
    // the ceiling is the account's, not the whole balance it happens to hold
    expect(max).toBeLessThan(TVL);

    const { data } = await api.withdrawCollateral(position, {
      token: POS,
      amount: max,
      to: WALLET,
    });
    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
  });

  it("maxWithdraw answers in underlying, and withdrawStrategy takes it", async () => {
    const { api, position } = buildStrategyApi();

    const { data: max } = await api.maxWithdraw(position);
    expect(max).toBeGreaterThan(0n);

    const { data } = await api.withdrawStrategy(position, {
      amount: max,
      to: WALLET,
    });
    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    // this market has no redemption venue, so only the instant route answers
    expect(data.instant).toBeDefined();
    expect(data.refused.delayed).toBe("noDelayedRoute");
  });

  it("withdrawStrategy past the net value exits the account", async () => {
    const { api, position } = buildStrategyApi();

    const { data } = await api.withdrawStrategy(position, {
      amount: TVL,
      to: WALLET,
    });
    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    expect(data.instant?.state.totalDebt.value).toBe(0n);
    expect(data.instant?.state.assets).toEqual([]);
  });

  it("withdrawStrategy with MAX_UINT256 sells the position and empties the account", async () => {
    const { api, position } = buildStrategyApi();

    const { data } = await api.withdrawStrategy(position, {
      amount: MAX_UINT256,
      to: WALLET,
    });
    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    const exit = data.instant;
    if (!exit) throw new Error("expected the instant route");

    expect(exit.operations.map(op => op.type)).toEqual([
      "changeQuota",
      "swap",
      "decreaseDebt",
      "withdrawCollateral",
    ]);
    // the whole position goes into one route, and its proceeds pay the wallet
    expect(exit.operations.find(op => op.type === "swap")?.from).toEqual([
      { token: POS, balance: TVL },
    ]);
    expect(
      exit.operations.find(op => op.type === "withdrawCollateral"),
    ).toMatchObject({ token: UND, amount: TVL - DEBT, to: WALLET });
    expect(exit.state.totalDebt.value).toBe(0n);
    expect(exit.state.assets).toEqual([]);
    expect(exit.state.quotas).toEqual([]);
    // an exit is the router's business; the issuer cannot serve one
    expect(data.refused.delayed).toBe("noDelayedRoute");
  });

  it("repayStrategy with MAX_UINT256 settles the debt and drops the quotas", async () => {
    const { api, position } = buildStrategyApi();

    const { data } = await api.repayStrategy(position, {
      token: UND,
      amount: MAX_UINT256,
    });
    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);

    expect(data.operations.map(op => op.type)).toEqual([
      "addCollateral",
      "changeQuota",
      "decreaseDebt",
    ]);
    expect(
      data.operations.find(op => op.type === "decreaseDebt"),
    ).toMatchObject({ amount: DEBT, full: true });
    expect(data.state.totalDebt.value).toBe(0n);
    expect(data.state.quotas).toEqual([]);
  });

  it("adjustLeverage retargets the debt and quotes both routes", async () => {
    const { api, position } = buildStrategyApi();

    const { data } = await api.adjustLeverage(position, {
      targetLeverage: 300n,
      token: POS,
    });
    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    // collateral is the invariant: 500 of it at 3x is 1000 of debt
    expect(data.instant?.state.totalDebt.value).toBe(TVL);
  });

  it("addCollateral and withdrawCollateral leave the debt where it was", async () => {
    const { api, position } = buildStrategyApi();

    const added = await api.addCollateral(position, {
      token: POS,
      amount: 10000000000n,
    });
    const taken = await api.withdrawCollateral(position, {
      token: POS,
      amount: 10000000000n,
      to: WALLET,
    });

    if (!added.data.ok || !taken.data.ok) {
      throw new Error("prepare refused a flow that leaves debt alone");
    }
    expect(added.data.state.totalDebt.value).toBe(DEBT);
    expect(taken.data.state.totalDebt.value).toBe(DEBT);
    expect(added.data.state.totalValue.value).toBe(TVL + 10000000000n);
    expect(taken.data.state.totalValue.value).toBe(TVL - 10000000000n);
  });

  it("reports the market's refusal rather than throwing it", async () => {
    const sdk = buildMarketSdk({
      facadePaused: true,
      creditAccounts: [
        buildFixtureCreditAccount({
          totalDebt: DEBT,
          tokens: [caToken(POS, TVL, QUOTA)],
        }),
      ],
    });
    const api = new PrepareApi({
      chain: () => sdk,
    } as unknown as MultichainSDK);

    const { data } = await api.repayStrategy(
      { chainId: CHAIN_ID, creditAccount: CREDIT_ACCOUNT },
      { token: UND, amount: 20000000000n },
    );

    expect(data).toEqual({
      ok: false,
      reason: "marketPaused",
      detail: { creditManager: CREDIT_MANAGER },
    });
  });
});

describe("PrepareApi — the two-transaction route", () => {
  /** The fixture market with a redemption venue for the position token. */
  const venue: MarketSdkExtras = {
    delayed: { [POS]: [{ withdrawalPhantomToken: POS2, claimableAt: 1n }] },
  };

  /** A matured redemption of `POS`, carrying the intent it was requested for. */
  const claimableOf = (
    intent: DelayedIntent | undefined,
  ): PositionClaimableWithdrawal => ({
    sourceToken: amount(POS, 0n).token,
    withdrawalPhantomToken: amount(POS2, 10000000000n),
    outputs: [amount(UND, 10000000000n)],
    claimCall: { to: POS, callData: "0x" },
    intent,
  });

  it("withdrawStrategy requests the redemption and records the tail", async () => {
    const { api, position } = buildStrategyApi(venue);

    const { data } = await api.withdrawStrategy(position, {
      amount: 10000000000n,
      to: WALLET,
    });

    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    const start = data.delayed;
    if (!start) throw new Error(`no delayed route: ${data.refused.delayed}`);

    expect(start.delayed).toMatchObject({
      record: {
        type: "WITHDRAW_COLLATERAL",
        to: WALLET,
        sourceToken: POS,
        withdrawToken: UND,
        withdrawAmount: 10000000000n,
      },
      claimableAt: 1n,
    });
    // the transaction on offer settles nothing, so the debt stands where it was
    expect(start.delayed.afterRequest.totalDebt.value).toBe(DEBT);
    // the state is where the withdrawal ends: dD repaid out of the claim
    expect(start.state.totalDebt.value).toBe(DEBT - 10000000000n);
  });

  it("adjustLeverage takes the same route down", async () => {
    const { api, position } = buildStrategyApi(venue);

    const { data } = await api.adjustLeverage(position, {
      targetLeverage: 150n,
    });

    if (!data.ok) throw new Error(`prepare refused: ${data.reason}`);
    expect(data.delayed?.delayed.record).toEqual({ type: "DECREASE_LEVERAGE" });
  });

  it("finalize refuses a claim that names nothing to resume", async () => {
    const { api, position } = buildStrategyApi(venue);

    const { data } = await api.finalize(position, {
      // A withdrawal requested without an intent, or read through a compressor
      // too old to report one: nothing says what it was part of.
      claimable: claimableOf(undefined),
    });

    expect(data).toEqual({
      ok: false,
      reason: "noRecordedIntent",
      detail: undefined,
    });
  });

  it("finalize completes an exit from the claim it recorded", async () => {
    const { api, position } = buildStrategyApi(venue);

    const { data } = await api.finalize(position, {
      claimable: claimableOf({ type: "CLOSE_ACCOUNT", to: WALLET }),
    });

    if (!data.ok) throw new Error(`finalize refused: ${data.reason}`);
    // Everything left is sold, the loan is settled and the rest handed over.
    expect(data.state.totalDebt.value).toBe(0n);
    expect(data.state.totalValue.value).toBe(0n);
    expect(data.state.assets).toEqual([]);
    expect(data.operations.map(o => o.type)).toEqual([
      "claimDelayedWithdrawal",
      "changeQuota",
      "swap",
      "decreaseDebt",
      "withdrawCollateral",
    ]);
  });
});

describe("PrepareApi.redeem", () => {
  it("passes the share amount through to simulateRedeem", () => {
    const { api, pools } = buildApi();

    const result = api.redeem(
      { chainId: CHAIN_ID, pool: POOL },
      { amount: 100n, wallet: WALLET, tokenOut: UNDERLYING },
    );

    expect(result).toMatchObject({ ok: true });
    expect(pools.simulateRedeem).toHaveBeenCalledWith({
      pool: POOL,
      amount: 100n,
      tokenIn: POOL,
      tokenOut: UNDERLYING,
    });
    expect(pools.removeLiquidity).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 100n, mode: "redeem" }),
    );
  });
});
