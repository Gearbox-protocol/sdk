import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom, encodeFunctionData, parseEther } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import { AdaptersPlugin } from "../../plugins/adapters/index.js";
import { CreditAccountOperationsService } from "../../sdk/accounts/intents/index.js";
import type {
  OperationState,
  StartIntent,
} from "../../sdk/accounts/intents/types.js";
import { toCreditAccountSlice } from "../../sdk/accounts/intents/utils/credit-account-slice.js";
import {
  type Asset,
  type CreditAccountData,
  DUST_THRESHOLD,
  json_parse,
  MAX_UINT256,
  OnchainSDK,
} from "../../sdk/index.js";
import { previewOperation } from "./previewOperation.js";
import type { AdjustCreditAccountPreview } from "./types.js";

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
// holding ~44 cbETH against 40 WETH of debt, both offline. That leaves out the
// flows that route, since a swap leg needs the pathfinder and the pathfinder is
// an on-chain call; what remains is every flow that only moves collateral and
// debt.
//
// The one thing they are allowed to differ on is dust: the preview drops
// balances at or below `DUST_THRESHOLD` and the projection keeps them, and this
// account carries a wei of WETH under that line.
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
const CREDIT_ACCOUNT: Address = "0xE22cEd1808c22455747F366Cf94d45B3201302d3";
const OWNER: Address = "0xC32FEB4DBd127a1993478Ad6E5250710f838b908";

const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CBETH: Address = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";

/** The wei of WETH the account holds below the dust line. */
const DUST_VALUE = 1n;

/** Router slippage in `PERCENTAGE_FACTOR` units; unused while nothing routes. */
const SLIPPAGE = 50;

let sdk: OnchainSDK<{ adapters: AdaptersPlugin }>;
let creditAccount: CreditAccountData;

beforeAll(() => {
  sdk = new OnchainSDK(
    "Mainnet",
    {
      transport: custom({
        request: async () => {
          throw new Error("offline: preview test must not hit RPC");
        },
      }),
    },
    { plugins: { adapters: new AdaptersPlugin(true) } },
  );
  sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
  creditAccount = json_parse(readFileSync(ACCOUNT_FIXTURE, "utf-8"));
});

/**
 * Runs an intent through the engine, then the calls it produced back through
 * the preview: the round trip whose two ends the assertions compare.
 */
async function roundTrip(intent: StartIntent) {
  const result = await new CreditAccountOperationsService(sdk).startIntent({
    intent,
    creditAccount: toCreditAccountSlice(creditAccount),
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
    { sdk, to: FACADE, calldata, sender: OWNER, value: 0n },
    { creditAccount },
  );

  return { projected: result.preview, preview };
}

/**
 * Balances keyed by token, dust and zeroes dropped: the two sides answer with a
 * list and a map, each in whatever order it built, and only one of them filters.
 */
function byToken(
  assets: Asset[] | Record<Address, Asset>,
): Record<string, bigint> {
  const list = Array.isArray(assets) ? assets : Object.values(assets);
  const out: Record<string, bigint> = {};
  for (const { token, balance } of list) {
    if (balance > DUST_THRESHOLD) out[token.toLowerCase()] = balance;
  }
  return out;
}

/**
 * A borrow rate with its per-quota keys cased alike: the projection lowercases
 * every address it handles, the preview spells them as the market does.
 */
function sameCase<R extends { quotas: Record<string, unknown> }>(rate: R): R {
  const quotas: Record<string, unknown> = {};
  for (const [token, perQuota] of Object.entries(rate.quotas)) {
    quotas[token.toLowerCase()] = perQuota;
  }
  return { ...rate, quotas };
}

/** Asserts everything the two sides say about the account after the operation. */
function expectAgreement(
  preview: AdjustCreditAccountPreview,
  projected: OperationState,
): void {
  expect(preview.debt).toBe(projected.accountDebt);
  expect(byToken(preview.assets)).toEqual(byToken(projected.assets));
  expect(byToken(preview.quotas)).toEqual(byToken(projected.quotas));
  expect(preview.totalValue).toBe(projected.totalValue - DUST_VALUE);
  // Agreeing on the state above is most of the claim, since the metrics are
  // the same functions — but only most of it: each side assembles the snapshot
  // it feeds them on its own.
  expect(preview.healthFactor).toBe(projected.healthFactor);
  expect(sameCase(preview.borrowRate)).toEqual(sameCase(projected.borrowRate));
  expect(preview.timeToLiquidation).toBe(projected.timeToLiquidation);
  expect(preview.liquidationPrice).toBe(projected.liquidationPrice);
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

    expectAgreement(preview, projected);
    // the payment is what the wallet parts with, and the preview reads it back
    // out of the addCollateral call rather than being told
    expect(preview.collateralAdded).toEqual([
      { token: WETH, balance: parseEther("5") },
    ]);
    // the whole payment goes into the loan, interest and fees first
    expect(preview.debtChange).toBe(-parseEther("5"));
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

    expectAgreement(preview, projected);
    expect(preview.collateralAdded).toEqual([
      { token: CBETH, balance: parseEther("1") },
    ]);
    expect(preview.assetsChange).toEqual([
      { token: CBETH, balance: parseEther("1") },
    ]);
    expect(preview.debtChange).toBe(0n);
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

    expectAgreement(preview, projected);
    expect(preview.collateralWithdrawn).toEqual([
      { token: CBETH, balance: parseEther("1") },
    ]);
    expect(preview.debtChange).toBe(0n);
    // the quota is resized down to the balance that is left
    expect(preview.quotasChange[0]?.balance).toBeLessThan(0n);
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

    expect(projected.accountDebt).toBe(0n);
    expect(preview.debtRepaid).toBe(
      toCreditAccountSlice(creditAccount).accountDebt,
    );
    // the account stays open, and the position stays on it
    expect(preview.permanent).toBe(false);
    expect(preview.collateralWithdrawn).toEqual([]);
    // the wallet is charged the debt plus the margin the interest may grow by
    expect(preview.collateralAdded[0]?.token).toBe(WETH);
    expect(preview.collateralAdded[0]?.balance).toBeGreaterThan(
      preview.debtRepaid,
    );
  });
});
