import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type {
  DelayedIntent,
  IGearboxError,
  PositionClaimableWithdrawal,
  SDKReturn,
  TokenAmount,
} from "../../model/index.js";
import { isSDKError } from "../../model/index.js";
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

/**
 * What a preparation came to, or the refusal named as the test's failure — the
 * envelope narrowing every assertion below would otherwise have to repeat.
 */
function plan<D, E extends IGearboxError>(result: SDKReturn<D, E>): D {
  if (isSDKError(result)) {
    throw new Error(`prepare refused: ${result.error.code}`);
  }
  return result.data;
}

const CHAIN_ID = 1;
const POOL = "0x1000000000000000000000000000000000000001" as Address;
const UNDERLYING = "0x2000000000000000000000000000000000000002" as Address;
const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

/** The block state the LP fake below holds, and every result must report. */
const LP_BLOCK = 5n;
const LP_TIMESTAMP = 1_700_000_000n;
/** Pool shares the wallet holds before the operation, in the LP fake. */
const HELD_SHARES = 200n;

const CURATOR = {
  address: "0xc0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0" as Address,
  name: "Test Curator",
  url: null,
};

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
    // 200 shares held before the operation, worth one underlying each
    getShareBalance: vi.fn(async () => HELD_SHARES),
    sharesToUnderlying: vi.fn((_pool: Address, shares: bigint) =>
      amount(UNDERLYING, shares),
    ),
  };
  const api = new PrepareApi({
    chain: () => ({
      currentBlock: LP_BLOCK,
      timestamp: LP_TIMESTAMP,
      pools,
      marketRegister: {
        findByPool: () => ({
          pool: { underlying: UNDERLYING },
          curator: CURATOR,
        }),
      },
    }),
  } as unknown as MultichainSDK);
  return { api, pools };
}

describe("PrepareApi.withdraw", () => {
  it("passes the tokenOut amount through to simulateWithdraw", async () => {
    const { api, pools } = buildApi();

    const result = await api.withdraw(
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

  it("stamps the result with the block the pool state was loaded at", async () => {
    const { api } = buildApi();

    const prepared = plan(
      await api.withdraw(
        { chainId: CHAIN_ID, pool: POOL },
        { amount: 110n, wallet: WALLET, tokenOut: UNDERLYING },
      ),
    );

    expect(prepared.blockNumber).toBe(Number(LP_BLOCK));
    expect(prepared.timestamp).toBe(Number(LP_TIMESTAMP));
  });

  it("reports the position the withdrawal leaves behind, and whose market it is", async () => {
    const { api } = buildApi();

    const prepared = plan(
      await api.withdraw(
        { chainId: CHAIN_ID, pool: POOL },
        { amount: 110n, wallet: WALLET, tokenOut: UNDERLYING },
      ),
    );

    // the fake burns 100 shares for the payout, off the 200 held
    expect(prepared.state.positionAfter.value).toBe(HELD_SHARES - 100n);
    expect(prepared.state.curator).toEqual(CURATOR);
  });

  it("floors the position at nothing when more is taken out than is held", async () => {
    const { api, pools } = buildApi();
    pools.simulateWithdraw.mockReturnValueOnce({
      tokenIn: amount(POOL, HELD_SHARES + 1n),
      tokenOut: amount(UNDERLYING, 1n),
    });

    const prepared = plan(
      await api.withdraw(
        { chainId: CHAIN_ID, pool: POOL },
        { amount: 1n, wallet: WALLET, tokenOut: UNDERLYING },
      ),
    );

    expect(prepared.state.positionAfter.value).toBe(0n);
  });

  it("answers the failed read in the envelope rather than throwing it", async () => {
    const { api, pools } = buildApi();
    pools.getShareBalance.mockRejectedValueOnce(new Error("rpc is down"));

    const result = await api.withdraw(
      { chainId: CHAIN_ID, pool: POOL },
      { amount: 110n, wallet: WALLET, tokenOut: UNDERLYING },
    );

    expect(result).toMatchObject({
      ok: false,
      error: { code: "unexpectedFailure" },
    });
  });
});

/**
 * The strategy half of the API, driven end to end against the intent engine's
 * fixture market: 1000 UND of position against 500 of debt, at 2x.
 *
 * What is under test here is only the mapping — that each public method reaches
 * the engine with the intent its name promises, and that the answer comes back
 * in the `SDKReturn` envelope. The arithmetic behind it belongs to the intent
 * specs.
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
    sdk,
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

    const result = await api.openNewStrategy(strategy, {
      collateral: [{ token: UND, balance: 20000000000n }],
      leverage: 300n,
    });

    const prepared = plan(result);
    // the credit manager's strategyTargetCollateral stands in for an unnamed target token
    expect(prepared.state.totalDebt.value).toBe(40000000000n);
    expect(
      prepared.state.averageAssets.map(a => ({
        token: a.token.address,
        balance: a.value,
      })),
    ).toEqual([{ token: POS, balance: 60000000000n }]);
  });

  it("depositStrategy keeps leverage while the position grows", async () => {
    const { api, position } = buildStrategyApi();

    const result = await api.depositStrategy(position, {
      token: UND,
      amount: 10000000000n,
    });

    const prepared = plan(result);
    // 100 UND of margin at the account's 2x borrows another 100
    expect(prepared.state.totalDebt.value).toBe(DEBT + 10000000000n);
  });

  it("stamps every result with the block the market state was loaded at", async () => {
    const { api, position } = buildStrategyApi();

    // the fixture sdk reports block 1 at timestamp 0, see `buildMockSdk`
    const prepared = plan(
      await api.depositStrategy(position, {
        token: UND,
        amount: 10000000000n,
      }),
    );
    expect(prepared.blockNumber).toBe(1);
    expect(prepared.timestamp).toBe(0);

    const routes = plan(
      await api.withdrawStrategy(position, { amount: MIN_DEBT, to: WALLET }),
    );
    expect(routes.blockNumber).toBe(1);
    expect(routes.instant?.blockNumber).toBe(1);
    expect(routes.instant?.timestamp).toBe(0);
  });

  it("repayStrategy pays the debt down with wallet funds", async () => {
    const { api, position } = buildStrategyApi();

    const result = await api.repayStrategy(position, {
      token: UND,
      amount: 20000000000n,
    });

    const prepared = plan(result);
    expect(prepared.state.totalDebt.value).toBe(DEBT - 20000000000n);
    expect(prepared.operations.map(op => op.type)).toEqual([
      "addCollateral",
      "decreaseDebt",
    ]);
  });

  it("maxRepay answers with the debt as it stands, bare", async () => {
    const { api, position } = buildStrategyApi();

    await expect(api.maxRepay(position)).resolves.toBe(DEBT);
  });

  it("maxWithdrawCollateral answers in the token, and withdrawCollateral takes it", async () => {
    const { api, position } = buildStrategyApi();

    const max = await api.maxWithdrawCollateral(position, POS);
    expect(max).toBeGreaterThan(0n);
    // the ceiling is the account's, not the whole balance it happens to hold
    expect(max).toBeLessThan(TVL);

    const result = await api.withdrawCollateral(position, {
      token: POS,
      amount: max,
      to: WALLET,
    });
    // the ceiling the read answered with is one the flow accepts
    plan(result);
  });

  it("maxWithdraw answers in underlying, and withdrawStrategy takes it", async () => {
    const { api, position } = buildStrategyApi();

    const { partial } = await api.maxWithdraw(position);
    expect(partial).toBeGreaterThan(0n);

    const result = await api.withdrawStrategy(position, {
      amount: partial,
      to: WALLET,
    });
    const prepared = plan(result);
    // this market has no redemption venue, so only the instant route answers
    expect(prepared.instant).toBeDefined();
    expect(prepared.refused.delayed).toBe("noDelayedRoute");
  });

  it("maxWithdraw's exit is the net value, and it is the far side of a gap", async () => {
    const { api, position } = buildStrategyApi();

    const { partial, exit } = await api.maxWithdraw(position);
    expect(exit).toBe(TVL - DEBT);
    // the partial flow stops short of it: anything in between is refused
    expect(partial).toBeLessThan(exit);

    const between = (partial + exit) / 2n;
    const refused = await api.withdrawStrategy(position, {
      amount: between,
      to: WALLET,
    });
    expect(isSDKError(refused) && refused.error.code).toBe("debtOutOfRange");

    // at the exit itself the flow accepts, and empties the account
    const result = await api.withdrawStrategy(position, {
      amount: exit,
      to: WALLET,
    });
    expect(plan(result).instant?.state.totalDebt.value).toBe(0n);
  });

  it("withdrawStrategy past the net value exits the account", async () => {
    const { api, position } = buildStrategyApi();

    const result = await api.withdrawStrategy(position, {
      amount: TVL,
      to: WALLET,
    });
    const prepared = plan(result);
    expect(prepared.instant?.state.totalDebt.value).toBe(0n);
    expect(prepared.instant?.state.assets).toEqual([]);
  });

  it("withdrawStrategy with MAX_UINT256 sells the position and empties the account", async () => {
    const { api, position } = buildStrategyApi();

    const result = await api.withdrawStrategy(position, {
      amount: MAX_UINT256,
      to: WALLET,
    });
    const prepared = plan(result);
    const exit = prepared.instant;
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
    expect(prepared.refused.delayed).toBe("noDelayedRoute");
  });

  it("repayStrategy with MAX_UINT256 settles the debt and drops the quotas", async () => {
    const { api, position } = buildStrategyApi();

    const result = await api.repayStrategy(position, {
      token: UND,
      amount: MAX_UINT256,
    });
    const prepared = plan(result);

    expect(prepared.operations.map(op => op.type)).toEqual([
      "addCollateral",
      "changeQuota",
      "decreaseDebt",
    ]);
    expect(
      prepared.operations.find(op => op.type === "decreaseDebt"),
    ).toMatchObject({ amount: DEBT, full: true });
    expect(prepared.state.totalDebt.value).toBe(0n);
    expect(prepared.state.quotas).toEqual([]);
  });

  it("adjustLeverage retargets the debt and quotes both routes", async () => {
    const { api, position } = buildStrategyApi();

    const result = await api.adjustLeverage(position, {
      targetLeverage: 300n,
      token: POS,
    });
    const prepared = plan(result);
    // collateral is the invariant: 500 of it at 3x is 1000 of debt
    expect(prepared.instant?.state.totalDebt.value).toBe(TVL);
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

    const grown = plan(added);
    const shrunk = plan(taken);
    expect(grown.state.totalDebt.value).toBe(DEBT);
    expect(shrunk.state.totalDebt.value).toBe(DEBT);
    expect(grown.state.totalValue.value).toBe(TVL + 10000000000n);
    expect(shrunk.state.totalValue.value).toBe(TVL - 10000000000n);
  });

  it("reports a market with no target collateral rather than throwing", async () => {
    const { api, sdk, strategy } = buildStrategyApi();
    vi.spyOn(sdk.marketRegister, "findCreditManager").mockReturnValue({
      strategyTargetCollateral: undefined,
    } as unknown as ReturnType<typeof sdk.marketRegister.findCreditManager>);

    const result = await api.openNewStrategy(strategy, {
      collateral: [{ token: UND, balance: 20000000000n }],
      leverage: 300n,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "noStrategyTargetCollateral",
        message: expect.any(String),
        creditManager: CREDIT_MANAGER,
      },
    });
  });

  it("reports an account the markets do not hold rather than throwing", async () => {
    const api = new PrepareApi({
      chain: () => buildMarketSdk({ creditAccounts: [] }),
    } as unknown as MultichainSDK);

    const result = await api.repayStrategy(
      { chainId: CHAIN_ID, creditAccount: CREDIT_ACCOUNT },
      { token: UND, amount: 20000000000n },
    );

    expect(result).toEqual({
      ok: false,
      error: {
        code: "creditAccountNotFound",
        message: expect.any(String),
        creditAccount: CREDIT_ACCOUNT,
      },
    });
  });

  it("describes a read that failed instead of rejecting", async () => {
    const { api, sdk, position } = buildStrategyApi();
    const boom = new Error("rpc is down");
    vi.spyOn(sdk.accounts, "getCreditAccountData").mockRejectedValue(boom);

    const result = await api.addCollateral(position, {
      token: POS,
      amount: 10000000000n,
    });

    // the one code that is not a refusal of the request: the whole failure is
    // handed over rather than flattened into a sentence
    expect(result).toEqual({
      ok: false,
      error: {
        code: "unexpectedFailure",
        message: expect.stringContaining("rpc is down"),
        cause: boom,
      },
    });
  });

  it("describes a chain the SDK was never connected to, on the async flows", async () => {
    const api = new PrepareApi({
      chain: () => {
        throw new Error("no chain 999");
      },
    } as unknown as MultichainSDK);

    const result = await api.repayStrategy(
      { chainId: 999, creditAccount: CREDIT_ACCOUNT },
      { token: UND, amount: 1n },
    );

    if (!isSDKError(result)) throw new Error("expected a refusal");
    expect(result.error.code).toBe("unexpectedFailure");
    expect(
      result.error.code === "unexpectedFailure" && result.error.cause.message,
    ).toBe("no chain 999");
  });

  it("the LP flows describe the same chain the same way", async () => {
    const api = new PrepareApi({
      chain: () => {
        throw new Error("no chain 999");
      },
    } as unknown as MultichainSDK);

    const result = await api.withdraw(
      { chainId: 999, pool: POOL },
      { amount: 1n, wallet: WALLET },
    );

    if (!isSDKError(result)) throw new Error("expected a refusal");
    expect(result.error.code).toBe("unexpectedFailure");
  });

  it("the bare max* reads reject rather than describe", async () => {
    const { api, sdk, position } = buildStrategyApi();
    const boom = new Error("rpc is down");
    vi.spyOn(sdk.accounts, "getCreditAccountData").mockRejectedValue(boom);

    await expect(api.maxRepay(position)).rejects.toBe(boom);
  });

  it("the bare max* reads throw on an account the markets do not hold", async () => {
    const api = new PrepareApi({
      chain: () => buildMarketSdk({ creditAccounts: [] }),
    } as unknown as MultichainSDK);

    await expect(
      api.maxRepay({ chainId: CHAIN_ID, creditAccount: CREDIT_ACCOUNT }),
    ).rejects.toThrow(/not found/i);
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

    const result = await api.repayStrategy(
      { chainId: CHAIN_ID, creditAccount: CREDIT_ACCOUNT },
      { token: UND, amount: 20000000000n },
    );

    expect(result).toEqual({
      ok: false,
      error: {
        code: "marketPaused",
        message: expect.any(String),
        creditManager: CREDIT_MANAGER,
      },
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
    outputs: [{ ...amount(UND, 10000000000n), isDelayed: false }],
    claimCall: { to: POS, callData: "0x" },
    intent,
  });

  /**
   * The same redemption from a venue that pays in instalments: half of it is
   * here, half is a fresh withdrawal position.
   **/
  const halfClaimableOf = (
    intent: DelayedIntent | undefined,
  ): PositionClaimableWithdrawal => ({
    ...claimableOf(intent),
    outputs: [
      { ...amount(UND, 5000000000n), isDelayed: false },
      { ...amount(POS2, 5000000000n), isDelayed: true },
    ],
  });

  it("withdrawStrategy requests the redemption and records the tail", async () => {
    const { api, position } = buildStrategyApi(venue);

    const result = await api.withdrawStrategy(position, {
      amount: 10000000000n,
      to: WALLET,
    });

    const prepared = plan(result);
    const start = prepared.delayed;
    if (!start)
      throw new Error(`no delayed route: ${prepared.refused.delayed}`);

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

    const result = await api.adjustLeverage(position, {
      targetLeverage: 150n,
    });

    const prepared = plan(result);
    expect(prepared.delayed?.delayed.record).toEqual({
      type: "DECREASE_LEVERAGE",
    });
  });

  it("finalize refuses a claim that names nothing to resume", async () => {
    const { api, position } = buildStrategyApi(venue);

    const result = await api.finalize(position, {
      // A withdrawal requested without an intent, or read through a compressor
      // too old to report one: nothing says what it was part of.
      claimable: claimableOf(undefined),
    });

    expect(result).toEqual({
      ok: false,
      error: { code: "noRecordedIntent", message: expect.any(String) },
    });
  });

  it("finalize hands back what a claim that matured in part did not settle", async () => {
    const { api, position } = buildStrategyApi(venue);

    const result = await api.finalize(position, {
      claimable: halfClaimableOf({
        type: "WITHDRAW_COLLATERAL",
        to: WALLET,
        sourceToken: POS,
        withdrawToken: UND,
        withdrawAmount: 10000000000n,
        debtRepaid: 0n,
      }),
    });

    const prepared = plan(result);
    // Half the redemption is still in flight, so the operation is not over:
    // the caller comes back with the next claim and the intent this tail did
    // not serve.
    expect(prepared.remainder?.inFlight).toMatchObject({
      token: expect.objectContaining({ address: POS2 }),
      value: 5000000000n,
    });
    expect(prepared.remainder?.intent).toMatchObject({
      type: "WITHDRAW_COLLATERAL",
      withdrawAmount: 5000000000n,
    });
  });

  it("finalize completes an exit from the claim it recorded", async () => {
    const { api, position } = buildStrategyApi(venue);

    const result = await api.finalize(position, {
      claimable: claimableOf({ type: "CLOSE_ACCOUNT", to: WALLET }),
    });

    const prepared = plan(result);
    // Everything left is sold, the loan is settled and the rest handed over.
    expect(prepared.state.totalDebt.value).toBe(0n);
    expect(prepared.state.totalValue.value).toBe(0n);
    expect(prepared.state.assets).toEqual([]);
    expect(prepared.operations.map(o => o.type)).toEqual([
      "claimDelayedWithdrawal",
      "changeQuota",
      "swap",
      "decreaseDebt",
      "withdrawCollateral",
    ]);
  });
});

describe("PrepareApi.redeem", () => {
  it("passes the share amount through to simulateRedeem", async () => {
    const { api, pools } = buildApi();

    const result = await api.redeem(
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

  it("burns exactly the shares it was asked for, off the position", async () => {
    const { api } = buildApi();

    const prepared = plan(
      await api.redeem(
        { chainId: CHAIN_ID, pool: POOL },
        { amount: 100n, wallet: WALLET, tokenOut: UNDERLYING },
      ),
    );

    expect(prepared.state.positionAfter.value).toBe(HELD_SHARES - 100n);
  });
});
