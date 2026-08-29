import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom, encodeFunctionData, parseEther } from "viem";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import type {
  AccountMetrics,
  CreditOperationMarket,
  EstimatedProjection,
  TokenAmount,
} from "../../model/index.js";
import { CreditAccountOperationsService } from "../../onchain/accounts/intents/index.js";
import type { OpenStrategyState } from "../../onchain/accounts/intents/open-strategy.js";
import type {
  OperationState,
  StartIntent,
} from "../../onchain/accounts/intents/types.js";
import { toCreditAccountSlice } from "../../onchain/accounts/intents/utils/credit-account-slice.js";
import {
  type Asset,
  type CreditAccountData,
  DUST_THRESHOLD,
  json_parse,
  MAX_UINT256,
  OnchainSDK,
} from "../../onchain/index.js";
import { previewOperation } from "./previewOperation.js";

// The two halves of the SDK's account story, checked against each other.
// `prepare` goes forward — a request becomes facade calls plus the state they
// are expected to leave behind — and this module goes back — calldata becomes
// the state it would leave behind. They share the market and the price oracle
// and nothing else: one walks a plan through a running ledger, the other
// decodes calls and replays them over the account. Two implementations of the
// same arithmetic, so a caller that shows one and sends the other needs them
// to agree, and only a test that runs both can say whether they do.
//
// The fixtures are the ones the hand-written preview cases use: a scoped
// snapshot of the KPK WETH market and the pre-state of an account in it
// holding ~44 cbETH against 40 WETH of debt, both offline.
//
// Offline is what shapes the coverage. A swap leg is a pathfinder call and the
// pathfinder is on-chain, so the flows reachable here are the ones that do not
// route — either because they only move collateral and debt (`REPAY`,
// `ADD_COLLATERAL`, `WITHDRAW_ASSET`), or because their conversion is between a
// token and itself, which `realize` short-circuits rather than quotes. The
// latter is what `underlyingOnly` is for: an account whose collateral *is* the
// underlying still borrows, deleverages, withdraws and exits through the same
// planner and the same guards, with the swap replaced by nothing. That covers
// every intent `prepare` starts, plus opening, which needs a stub for the one
// call it cannot make (see `openRoundTrip`).
//
// The one thing the two sides are allowed to differ on is dust: the preview
// drops balances at or below `DUST_THRESHOLD` and the projection keeps them,
// and the cbETH account carries a wei of WETH under that line.
const STATE_FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25475508-adjust-credit-account.json",
);
const ACCOUNT_FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25475508-adjust-credit-account-data.json",
);

// KPK WETH strategy, the same account all the preview cases target
const FACADE: Address = "0x9515AB9BB73A9642F1a93Ba7C2790e9d08227f9a";
const CREDIT_MANAGER: Address = "0x79C6C1ce5B12abCC3E407ce8C160eE1160250921";
const CREDIT_ACCOUNT: Address = "0xE22cEd1808c22455747F366Cf94d45B3201302d3";
const OWNER: Address = "0xC32FEB4DBd127a1993478Ad6E5250710f838b908";

const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CBETH: Address = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";

/** WETH's collateral mask on this credit manager: the underlying is token 0. */
const WETH_MASK = 1n;

/** The wei of WETH the cbETH account holds below the dust line. */
const DUST_VALUE = 1n;

/** No balance under the dust line, so nothing for the two sides to differ on. */
const NO_DUST = 0n;

/** Router slippage in `PERCENTAGE_FACTOR` units; unused while nothing routes. */
const SLIPPAGE = 50;

let sdk: OnchainSDK;
let creditAccount: CreditAccountData;

beforeAll(() => {
  sdk = new OnchainSDK("Mainnet", {
    transport: custom({
      request: async () => {
        throw new Error("offline: preview test must not hit RPC");
      },
    }),
  });
  sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
  creditAccount = json_parse(readFileSync(ACCOUNT_FIXTURE, "utf-8"));
});

/**
 * The same market and the same borrower, holding the underlying itself.
 *
 * 40 WETH against 20 of principal: twice levered, twice the facade's `minDebt`,
 * so there is room to move in either direction without leaving the band. What
 * this buys is the flows that convert — a deposit, a leverage change, a
 * withdrawal, an exit — because a conversion into the token already held is not
 * a swap and needs no pathfinder.
 *
 * Only the fields both halves read are set: balances, masks and the principal.
 * The aggregates the fixture carries below them (the USD sums, `healthFactor`)
 * stay as they were and are stale, which nothing notices — each side prices the
 * account itself, off the market snapshot.
 */
function underlyingOnly(): CreditAccountData {
  return {
    ...creditAccount,
    enabledTokensMask: WETH_MASK,
    debt: parseEther("20"),
    tokens: [
      {
        token: WETH,
        mask: WETH_MASK,
        balance: parseEther("40"),
        quota: 0n,
        success: true,
      },
    ],
  };
}

/**
 * Runs an intent through the engine, then the calls it produced back through
 * the preview: the round trip whose two ends the assertions compare.
 */
async function roundTrip(
  intent: StartIntent,
  over?: { account?: CreditAccountData; value?: bigint },
) {
  const account = over?.account ?? creditAccount;
  const value = over?.value ?? 0n;

  const result = await new CreditAccountOperationsService(sdk).startIntent({
    intent,
    creditAccount: toCreditAccountSlice(account),
    sdk,
    slippage: SLIPPAGE,
    quotaReserve: undefined,
  });
  if (!result.ok)
    throw new Error(`prepare refused the intent: ${result.reason}`);

  const calldata = encodeFunctionData({
    abi: iCreditFacadeV310Abi,
    functionName: "multicall",
    args: [CREDIT_ACCOUNT, result.calls],
  });

  const preview = await previewOperation(
    { sdk, to: FACADE, calldata, sender: OWNER, value },
    { creditAccount: account },
  );

  return { projected: result.state, preview };
}

/**
 * Opening, with the one call this setting cannot make stood in for.
 *
 * `buildOpenStrategyState` always asks the pathfinder, even when the answer is
 * "nothing to do": there is no account yet, so there are no balances to notice
 * the target is already what the collateral is. The stub is that answer —
 * every balance handed over comes back untouched, no calls, no slippage — which
 * is what the router does return for a position in the underlying, and leaves
 * the rest of the flow (the debt from the leverage, the quotas, the guards, the
 * projection, and `openCA`'s assembly of it all) running for real.
 */
async function openRoundTrip(margin: bigint, leverage: bigint) {
  const identity = {
    findOpenStrategyPath: async ({
      expectedBalances,
    }: {
      expectedBalances: Asset[];
    }) => {
      const balances = Object.fromEntries(
        expectedBalances.map(a => [a.token, a.balance] as const),
      );
      const amount = expectedBalances.reduce((sum, a) => sum + a.balance, 0n);
      return {
        amount,
        minAmount: amount,
        calls: [],
        balances,
        minBalances: balances,
      };
    },
  };
  const routerFor = vi
    .spyOn(sdk, "routerFor")
    .mockReturnValue(identity as never);

  let projected: OpenStrategyState;
  try {
    const result = await new CreditAccountOperationsService(
      sdk,
    ).openStrategyIntent({
      sdk,
      creditManager: CREDIT_MANAGER,
      collateral: [{ token: WETH, balance: margin }],
      targetToken: WETH,
      leverage,
      slippage: SLIPPAGE,
      quotaReserve: undefined,
    });
    if (!result.ok)
      throw new Error(`prepare refused the opening: ${result.reason}`);
    projected = result.state;
  } finally {
    routerFor.mockRestore();
  }

  // The caller's own next step, run for real: the numbers above are handed to
  // `openCA`, which is what decides the order the facade sees them in.
  const tx = await sdk.accounts.openCA({
    ethAmount: 0n,
    creditManager: CREDIT_MANAGER,
    collateral: [{ token: WETH, balance: margin }],
    permits: {},
    debt: projected.totalDebt.value,
    referralCode: 0n,
    to: OWNER,
    calls: projected.calls,
    minQuota: projected.minQuota,
    averageQuota: projected.averageQuota,
  });

  const preview = await previewOperation({
    sdk,
    to: tx.to,
    calldata: tx.callData,
    sender: OWNER,
    value: BigInt(tx.value),
  });

  return { projected, preview };
}

/**
 * Balances keyed by token, dust and zeroes dropped. Both sides now answer in
 * the same shape, so all this still has to reconcile is the order each built
 * its list in and the fact that only one of them filters dust.
 */
function byToken(assets: TokenAmount[]): Record<string, bigint> {
  const out: Record<string, bigint> = {};
  for (const { token, value } of assets) {
    if (value > DUST_THRESHOLD) out[token.address.toLowerCase()] = value;
  }
  return out;
}

/** The same, for the bare token/amount pairs `openCA` is handed. */
function byAsset(assets: Asset[]): Record<string, bigint> {
  const out: Record<string, bigint> = {};
  for (const { token, balance } of assets) {
    if (balance > DUST_THRESHOLD) out[token.toLowerCase()] = balance;
  }
  return out;
}

/**
 * Every metric of an {@link AccountMetrics}, against the name the preview knows
 * it by. Spelled out rather than iterated off a live object: a metric added to
 * the shared type fails to compile here until it is named, and is therefore
 * compared from the day it exists.
 *
 * The `est` names are the same numbers off a floor-branch snapshot. Holding them
 * equal is only legitimate because nothing here routes — with no swap, the floor
 * *is* the expected outcome. A routed flow would differ by the slippage the
 * router allowed for, and this test would be wrong to demand otherwise.
 */
const METRICS: {
  [K in keyof AccountMetrics]: keyof EstimatedProjection;
} = {
  healthFactor: "estHealthFactor",
  safeHealthFactor: "estSafeHealthFactor",
  borrowRate: "estBorrowRate",
  timeToLiquidation: "estTimeToLiquidation",
  liquidationPrice: "estLiquidationPrice",
  leverage: "estLeverage",
};

/**
 * What follows from the account, as opposed to what it holds. Both sides read
 * these off one builder, so the claim being tested is not that the formulas
 * match — it is that the snapshots each assembled to feed them do, dust and all.
 */
function expectMetrics(
  preview: EstimatedProjection,
  projected: AccountMetrics,
): void {
  for (const [metric, asPreviewed] of Object.entries(METRICS) as Array<
    [keyof AccountMetrics, keyof EstimatedProjection]
  >) {
    expect(preview[asPreviewed], `metric ${metric}`).toEqual(projected[metric]);
  }
}

/**
 * Which market this happened in, in the words both sides use for it — every
 * result carries a {@link CreditOperationMarket}, including the ones that carry
 * no projection at all.
 *
 * The credit manager is compared case-blind: each side carries through the
 * casing it was handed — checksummed off the parsed calldata on the preview
 * side, lowercased off the account slice on the other — and neither normalises
 * it. The curator comes off the market both read the same suite for, so it is
 * compared as given.
 */
function expectSameMarket(
  preview: CreditOperationMarket,
  projected: CreditOperationMarket,
): void {
  expect(preview.creditManager.toLowerCase()).toBe(
    projected.creditManager.toLowerCase(),
  );
  expect(preview.name).toBe(projected.name);
  expect(preview.curator).toEqual(projected.curator);
  expect(preview.liquidationDiscount).toBe(projected.liquidationDiscount);
  // Not vacuously: a side that stopped carrying the market half would otherwise
  // agree with the other's `undefined`.
  expect(preview.curator.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  expect(preview.liquidationDiscount).toBeGreaterThan(0);
}

/** Asserts everything the two sides say about the account after the operation. */
function expectAgreement(
  preview: EstimatedProjection & { error?: unknown },
  projected: OperationState,
  dust: bigint,
): void {
  // A preview that hit something it could not replay still answers, with the
  // fields it could not derive filled in best-effort. Agreement reached that way
  // would not be agreement, so it is checked for first.
  expect(preview.error).toBeUndefined();

  expectSameMarket(preview, projected);

  // What it holds. The dust is the one licensed disagreement, and it lands on
  // the two sums that are taken over the balances.
  expect(preview.totalDebt).toEqual(projected.totalDebt);
  expect(byToken(preview.estAssets)).toEqual(byToken(projected.assets));
  expect(byToken(preview.quotas)).toEqual(byToken(projected.quotas));
  expect(preview.estTotalValue.value).toBe(projected.totalValue.value - dust);
  expect(preview.estNetValue.value).toBe(projected.netValue.value - dust);

  expectMetrics(preview, projected);
}

describe("the preview of what prepare built agrees with what prepare projected", () => {
  it("repaying part of the debt: the loan shrinks by the payment, the position stays", async () => {
    const { projected, preview } = await roundTrip({
      type: "REPAY",
      token: WETH,
      amount: parseEther("5"),
    });
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, DUST_VALUE);
    // the payment is what the wallet parts with, and the preview reads it back
    // out of the addCollateral call rather than being told
    expect(preview.collateralAdded).toMatchObject([
      {
        token: expect.objectContaining({ address: WETH }),
        value: parseEther("5"),
      },
    ]);
    // the whole payment goes into the loan, interest and fees first
    expect(preview.totalDebtChange.value).toBe(-parseEther("5"));
    // it lands and leaves again, so the position is all that is left standing
    expect(preview.assetsChange).toEqual([]);
  });

  it("adding position collateral: both put the same balance and quota on the account", async () => {
    const { projected, preview } = await roundTrip({
      type: "ADD_COLLATERAL",
      token: CBETH,
      amount: parseEther("1"),
    });
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, DUST_VALUE);
    expect(preview.collateralAdded).toMatchObject([
      {
        token: expect.objectContaining({ address: CBETH }),
        value: parseEther("1"),
      },
    ]);
    expect(preview.assetsChange).toMatchObject([
      {
        token: expect.objectContaining({ address: CBETH }),
        value: parseEther("1"),
      },
    ]);
    expect(preview.totalDebtChange.value).toBe(0n);
    // the standing quota already covers the grown balance, so the plan writes
    // no quota update and the preview finds none to replay
    expect(preview.quotasChange).toEqual([]);
  });

  it("taking position collateral out: the balance and the quota fall together", async () => {
    const { projected, preview } = await roundTrip({
      type: "WITHDRAW_ASSET",
      token: CBETH,
      amount: parseEther("1"),
      to: OWNER,
    });
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, DUST_VALUE);
    expect(preview.collateralWithdrawn).toMatchObject([
      {
        token: expect.objectContaining({ address: CBETH }),
        value: parseEther("1"),
      },
    ]);
    expect(preview.totalDebtChange.value).toBe(0n);
    // the quota is resized down to the balance that is left
    expect(preview.quotasChange[0]?.value).toBeLessThan(0n);
  });

  it("settling the loan: the preview reads back the debt the projection cleared", async () => {
    const { projected, preview } = await roundTrip({
      type: "REPAY",
      token: WETH,
      amount: MAX_UINT256,
    });
    // a multicall that takes the debt to zero reads as a repayment rather than
    // an adjustment, so the two shapes differ and the debt is what they share
    if (preview.operation !== "RepayCreditAccount") {
      throw new Error(`expected a repayment, got ${preview.operation}`);
    }

    expectSameMarket(preview, projected);
    expect(projected.totalDebt.value).toBe(0n);
    expect(preview.debtRepaid.value).toBe(
      toCreditAccountSlice(creditAccount).totalDebt,
    );
    // the account stays open, and the position stays on it
    expect(preview.permanent).toBe(false);
    expect(preview.collateralWithdrawn).toEqual([]);
    // the wallet is charged the debt plus the margin the interest may grow by
    expect(preview.collateralAdded[0]?.token.address).toBe(WETH);
    expect(preview.collateralAdded[0]?.value).toBeGreaterThan(
      preview.debtRepaid.value,
    );
  });

  it("paying with the native coin: the value is collateral to both sides", async () => {
    const amount = parseEther("1");
    const { projected, preview } = await roundTrip(
      { type: "ADD_COLLATERAL", token: WETH, amount, value: amount },
      { account: underlyingOnly(), value: amount },
    );
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, NO_DUST);
    // the wrapping is the facade's, so the account grows in WETH either way —
    // only the wallet's side of it is native, which is where the preview shows
    // the coin rather than the token
    expect(preview.collateralAdded).toMatchObject([
      { value: amount, token: expect.objectContaining({ symbol: "ETH" }) },
    ]);
    expect(preview.assetsChange).toMatchObject([
      { token: expect.objectContaining({ address: WETH }), value: amount },
    ]);
  });

  it("depositing at fixed leverage: debt grows with the collateral", async () => {
    const account = underlyingOnly();
    const { projected, preview } = await roundTrip(
      {
        type: "DEPOSIT",
        token: WETH,
        amount: parseEther("2"),
        positionToken: WETH,
      },
      { account },
    );
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, NO_DUST);
    expect(preview.collateralAdded).toMatchObject([
      {
        token: expect.objectContaining({ address: WETH }),
        value: parseEther("2"),
      },
    ]);
    // 2x levered, so 2 of collateral draws ~2 of debt and the position grows by
    // both — the proportion is what the preview has to arrive at independently
    expect(preview.totalDebtChange.value).toBeGreaterThan(parseEther("1.9"));
    expect(preview.assetsChange[0]?.value).toBe(
      parseEther("2") + preview.totalDebtChange.value,
    );
  });

  it("depositing into a higher leverage: the debt is the target's, not the ratio's", async () => {
    const { projected, preview } = await roundTrip(
      {
        type: "DEPOSIT",
        token: WETH,
        amount: parseEther("2"),
        positionToken: WETH,
        // 2.5x on the collateral the deposit leaves behind
        targetLeverage: 250n,
      },
      { account: underlyingOnly() },
    );
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, NO_DUST);
    // the whole point of the variant: more debt than the proportional draw
    expect(preview.totalDebtChange.value).toBeGreaterThan(parseEther("10"));
    expect(preview.estLeverage).toBeCloseTo(2.5, 2);
  });

  it("levering up: the borrow lands on the account and nothing leaves it", async () => {
    const { projected, preview } = await roundTrip(
      { type: "ADJUST_LEVERAGE", targetLeverage: 250n, token: WETH },
      { account: underlyingOnly() },
    );
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, NO_DUST);
    expect(preview.collateralAdded).toEqual([]);
    expect(preview.collateralWithdrawn).toEqual([]);
    // net value is the invariant of the flow, and the borrow is what buys the
    // leverage: the position grows by exactly the debt
    expect(preview.totalDebtChange.value).toBeGreaterThan(0n);
    expect(preview.assetsChange[0]?.value).toBe(preview.totalDebtChange.value);
    expect(preview.estLeverage).toBeCloseTo(2.5, 2);
  });

  it("levering down: the repayment is funded from the position, not the wallet", async () => {
    const { projected, preview } = await roundTrip(
      { type: "ADJUST_LEVERAGE", targetLeverage: 160n, token: WETH },
      { account: underlyingOnly() },
    );
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, NO_DUST);
    expect(preview.collateralAdded).toEqual([]);
    // the sale a levered-down account would make is a conversion into the token
    // it already holds, so what is left of it is the repayment itself
    expect(preview.totalDebtChange.value).toBeLessThan(0n);
    expect(preview.assetsChange[0]?.value).toBe(preview.totalDebtChange.value);
    expect(preview.estLeverage).toBeCloseTo(1.6, 2);
  });

  it("withdrawing at fixed leverage: the payout and the repayment come out of the position", async () => {
    const { projected, preview } = await roundTrip(
      {
        type: "WITHDRAW",
        amount: parseEther("2"),
        to: OWNER,
        tokenOut: WETH,
        sourceToken: WETH,
      },
      { account: underlyingOnly() },
    );
    if (preview.operation !== "AdjustCreditAccount") {
      throw new Error(`expected an adjustment, got ${preview.operation}`);
    }

    expectAgreement(preview, projected, NO_DUST);
    expect(preview.collateralWithdrawn).toMatchObject([
      {
        token: expect.objectContaining({ address: WETH }),
        value: parseEther("2"),
      },
    ]);
    // 2x levered: 2 out of the wallet's share costs the position 2 more in debt
    expect(preview.totalDebtChange.value).toBeLessThan(-parseEther("1.9"));
    // leverage is what the flow holds fixed, and it is the metric the two sides
    // arrive at from opposite ends
    expect(preview.estLeverage).toBeCloseTo(2, 2);
  });

  it("exiting: the loan is settled out of the position and the rest is swept", async () => {
    const account = underlyingOnly();
    const before = toCreditAccountSlice(account);
    const { projected, preview } = await roundTrip(
      { type: "WITHDRAW", amount: MAX_UINT256, to: OWNER },
      { account },
    );
    // nothing is left owing and nothing is left standing, which reads as a
    // close rather than an adjustment — so, as with the settling repayment, the
    // shapes differ and what they share is the debt and what came back
    if (preview.operation !== "CloseCreditAccount") {
      throw new Error(`expected a close, got ${preview.operation}`);
    }

    expect(preview.error).toBeUndefined();
    expectSameMarket(preview, projected);
    expect(projected.totalDebt.value).toBe(0n);
    expect(byToken(projected.assets)).toEqual({});
    // the account is emptied but not closed: the facade's own entry point is
    // never called, so it survives the sweep
    expect(preview.permanent).toBe(false);
    // what the wallet gets is the position less the loan — no route stands
    // between them here, so the figure is exact on both sides of the trip
    expect(preview.receivedAmount.value).toBe(
      parseEther("40") - before.totalDebt,
    );
  });

  it("opening: the debt, the position and the metrics are the same on both sides", async () => {
    const margin = parseEther("10");
    const { projected, preview } = await openRoundTrip(margin, 300n);
    if (preview.operation !== "OpenCreditAccount") {
      throw new Error(`expected an opening, got ${preview.operation}`);
    }

    expect(preview.error).toBeUndefined();
    expectSameMarket(preview, projected);

    // 3x on 10 of margin: 20 borrowed, 30 held, and with the route standing
    // still the floor branch is the expected one
    expect(preview.totalDebt.value).toBe(parseEther("20"));
    expect(preview.totalDebt).toEqual(projected.totalDebt);
    expect(byToken(preview.estAssets)).toEqual(
      byToken(projected.averageAssets),
    );
    expect(byToken(preview.estAssets)).toEqual(byToken(projected.minAssets));
    expect(preview.estTotalValue.value).toBe(projected.totalValue.value);
    expect(preview.estNetValue.value).toBe(projected.netValue.value);
    expect(preview.estNetValue.value).toBe(margin);

    // the underlying takes no quota, so a position in it buys none — the empty
    // agreement is still worth pinning, since it is what `openCA` was handed
    expect(byToken(preview.quotas)).toEqual(byAsset(projected.averageQuota));
    expect(projected.averageQuota).toEqual([]);
    // and with nothing quoted there is no token to call the strategy's own
    expect(preview.targetCollateral).toBeUndefined();

    expectMetrics(preview, projected);
    expect(preview.collateralAdded).toMatchObject([
      { token: expect.objectContaining({ address: WETH }), value: margin },
    ]);
  });
});
