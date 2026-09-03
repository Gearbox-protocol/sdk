import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { LEVERAGE_DECIMALS, MAX_UINT256 } from "../../constants/math.js";
import {
  type AccountView,
  planAdjustLeverage,
  planDeposit,
  planRepay,
  planWithdraw,
  planWithdrawAsset,
  planWithdrawDelayed,
  RAISED,
  type Step,
} from "./plan.js";

/**
 * Planners are pure: they only ever see this view, so the math is checked on
 * plain numbers with no sdk mock. Every token is priced 1:1 with the
 * underlying, so amounts stay readable.
 */
const U = "0x3333333333333333333333333333333333333333" as Address;
const T = "0x2222222222222222222222222222222222222222" as Address;
const T2 = "0x4444444444444444444444444444444444444444" as Address;
const RWA = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

const X1 = LEVERAGE_DECIMALS;
const X2 = 2n * LEVERAGE_DECIMALS;
const X3 = 3n * LEVERAGE_DECIMALS;

function view(args: {
  debt: bigint;
  balances: Partial<Record<Address, bigint>>;
  rwaAsset?: Address;
}): AccountView {
  let totalValue = 0n;
  for (const b of Object.values(args.balances)) {
    totalValue += b ?? 0n;
  }
  return {
    underlying: U,
    // The planners only inline a token into a refusal, so a registry that
    // names one by its own address is enough to read the refusal back.
    sdk: {
      chainId: 1,
      tokensMeta: { getToken: () => undefined },
    } as unknown as AccountView["sdk"],
    rwaAsset: args.rwaAsset,
    debt: args.debt,
    collateral: totalValue - args.debt,
    debtLimits: { minDebt: 1n, maxDebt: 1_000_000n },
    balanceOf: token => args.balances[token] ?? 0n,
    price: (_from, _to, amount) => amount,
    fattest: exclude => {
      const pick = Object.entries(args.balances)
        .filter(([t]) => !exclude?.some(e => e === t))
        .sort((a, b) => ((a[1] ?? 0n) > (b[1] ?? 0n) ? -1 : 1))[0];
      return pick?.[0] as Address | undefined;
    },
  };
}

/** 2x position: 1000 collateral in T against 1000 debt. */
const twoX = view({ debt: 1_000n, balances: { [T]: 2_000n } });

const kinds = (steps: Step[]) => steps.map(s => s.kind);

describe("planAdjustLeverage — collateral is the invariant", () => {
  it("[INV-4] raising 2x → 3x borrows C·(L1−1) − D0 and buys T with it", () => {
    expect(planAdjustLeverage({ targetLeverage: X3, token: T }, twoX)).toEqual([
      { kind: "borrow", amount: 1_000n },
      { kind: "convert", from: U, to: T, amount: 1_000n },
    ]);
  });

  it("[INV-4] lowering 2x → 1x sells T and repays everything", () => {
    expect(planAdjustLeverage({ targetLeverage: X1, token: T }, twoX)).toEqual([
      { kind: "convert", from: T, to: U, amount: 1_000n },
      { kind: "repay", amount: 1_000n },
    ]);
  });

  it("[INV-4] idle underlying is spent before the position token", () => {
    const v = view({ debt: 1_000n, balances: { [T]: 1_600n, [U]: 400n } });
    // 2x → 1.5x: repay 500; 400 idle covers most, only 100 of T is sold.
    expect(planAdjustLeverage({ targetLeverage: 150n, token: T }, v)).toEqual([
      { kind: "convert", from: T, to: U, amount: 100n },
      { kind: "repay", amount: 500n },
    ]);
  });

  it("[INV-4] no delta ⇒ empty plan; below 1x ⇒ leverageOutOfRange", () => {
    expect(planAdjustLeverage({ targetLeverage: X2, token: T }, twoX)).toEqual(
      [],
    );
    expect(() =>
      planAdjustLeverage({ targetLeverage: X1 - 1n, token: T }, twoX),
    ).toThrowError(expect.objectContaining({ error: expect.objectContaining({ code: "leverageOutOfRange" }) }));
  });

  it("[INV-4] falls back to the fattest non-underlying balance", () => {
    const v = view({ debt: 1_000n, balances: { [U]: 1_500n, [T]: 500n } });
    expect(kinds(planAdjustLeverage({ targetLeverage: X3 }, v))).toEqual([
      "borrow",
      "convert",
    ]);
    expect(planAdjustLeverage({ targetLeverage: X3 }, v)[1]).toMatchObject({
      to: T,
    });
  });
});

describe("planDeposit — collateral grows, debt follows", () => {
  it("[INV-2] without a target the D/C ratio is preserved: 2x stays 2x", () => {
    expect(
      planDeposit({ token: U, amount: 500n, positionToken: T }, twoX),
    ).toEqual([
      { kind: "add", token: U, amount: 500n, value: undefined },
      { kind: "convert", from: U, to: U, amount: 500n },
      { kind: "borrow", amount: 500n },
      { kind: "convert", from: U, to: T, amount: 1_000n },
    ]);
  });

  it("[INV-2] with a target: D1 = (C0 + a)(L1 − 1)", () => {
    // C1 = 1500, 3x ⇒ D1 = 3000, borrow 2000, convert 500 + 2000.
    expect(
      planDeposit(
        { token: U, amount: 500n, positionToken: T, targetLeverage: X3 },
        twoX,
      ),
    ).toEqual([
      { kind: "add", token: U, amount: 500n, value: undefined },
      { kind: "convert", from: U, to: U, amount: 500n },
      { kind: "borrow", amount: 2_000n },
      { kind: "convert", from: U, to: T, amount: 2_500n },
    ]);
  });

  it("[INV-2] a target that needs repaying is leverageOutOfRange", () => {
    expect(() =>
      planDeposit(
        { token: U, amount: 500n, positionToken: T, targetLeverage: X1 },
        twoX,
      ),
    ).toThrowError(expect.objectContaining({ error: expect.objectContaining({ code: "leverageOutOfRange" }) }));
  });

  it("[INV-6] RWA asset is wrapped into the underlying before conversion", () => {
    const v = view({ debt: 1_000n, balances: { [T]: 2_000n }, rwaAsset: RWA });
    expect(
      planDeposit({ token: RWA, amount: 500n, positionToken: T }, v),
    ).toEqual([
      { kind: "add", token: RWA, amount: 500n, value: undefined },
      { kind: "convert", from: RWA, to: U, amount: 500n },
      { kind: "borrow", amount: 500n },
      { kind: "convert", from: U, to: T, amount: 1_000n },
    ]);
  });

  it("[INV-5] depositing the position token itself only converts the borrow", () => {
    const v = view({
      debt: 1_000n,
      balances: { [RWA]: 2_000n },
      rwaAsset: RWA,
    });
    expect(
      planDeposit({ token: RWA, amount: 500n, positionToken: RWA }, v),
    ).toEqual([
      { kind: "add", token: RWA, amount: 500n, value: undefined },
      { kind: "borrow", amount: 500n },
      { kind: "convert", from: U, to: RWA, amount: 500n },
    ]);
  });

  it("only the underlying (or the RWA asset) can be deposited", () => {
    expect(() =>
      planDeposit({ token: T, amount: 500n, positionToken: T }, twoX),
    ).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "unsupportedCollateralToken" }) }),
    );
  });
});

describe("planRepay — funding in, debt down, position untouched", () => {
  it("[INV-9] funding already in U is repaid where it lands: no leg between", () => {
    expect(planRepay({ token: U, amount: 400n }, twoX)).toEqual([
      { kind: "add", token: U, amount: 400n, value: undefined },
      { kind: "repay", amount: 400n },
    ]);
  });

  it("[INV-9] a payment that clears the loan drops the quotas before it", () => {
    expect(planRepay({ token: U, amount: 1_000n }, twoX)).toEqual([
      { kind: "add", token: U, amount: 1_000n, value: undefined },
      { kind: "clearQuotas" },
      { kind: "repay", amount: 1_000n },
    ]);
  });

  it("[INV-9] the part above the debt is not repaid: it stays as collateral", () => {
    expect(kinds(planRepay({ token: U, amount: 1_500n }, twoX))).toEqual([
      "add",
      "clearQuotas",
      "repay",
    ]);
    expect(planRepay({ token: U, amount: 1_500n }, twoX)[2]).toEqual({
      kind: "repay",
      amount: 1_000n,
    });
  });

  it("[INV-9] MAX_UINT256 charges the wallet the debt plus its interest margin", () => {
    expect(planRepay({ token: U, amount: MAX_UINT256 }, twoX)).toEqual([
      // 10bps over the 1000 of debt, for the blocks between here and the
      // transaction; the facade still repays whatever it finds outstanding
      { kind: "add", token: U, amount: 1_001n, value: undefined },
      { kind: "clearQuotas" },
      { kind: "repay", amount: 1_000n },
    ]);
  });

  it("[INV-6] the underlying of an RWA market is taken as it is", () => {
    const v = view({ debt: 1_000n, balances: { [T]: 2_000n }, rwaAsset: RWA });
    expect(planRepay({ token: U, amount: 400n }, v)).toEqual([
      { kind: "add", token: U, amount: 400n, value: undefined },
      { kind: "repay", amount: 400n },
    ]);
  });

  it("[INV-6] the RWA asset is wrapped on its way into the debt", () => {
    const v = view({ debt: 1_000n, balances: { [T]: 2_000n }, rwaAsset: RWA });
    expect(planRepay({ token: RWA, amount: 400n }, v)).toEqual([
      { kind: "add", token: RWA, amount: 400n, value: undefined },
      { kind: "convert", from: RWA, to: U, amount: 400n },
      { kind: "repay", amount: 400n },
    ]);
  });

  it("[INV-6] settling in full works in the RWA asset too", () => {
    const v = view({ debt: 1_000n, balances: { [T]: 2_000n }, rwaAsset: RWA });
    expect(planRepay({ token: RWA, amount: MAX_UINT256 }, v)).toEqual([
      { kind: "add", token: RWA, amount: 1_001n, value: undefined },
      { kind: "convert", from: RWA, to: U, amount: 1_001n },
      { kind: "clearQuotas" },
      { kind: "repay", amount: 1_000n },
    ]);
  });

  it("[INV-9] leaving the debt below minDebt is unviable, as is paying nothing", () => {
    const v = view({ debt: 1_000n, balances: { [T]: 2_000n } });
    v.debtLimits.minDebt = 700n;
    expect(() => planRepay({ token: U, amount: 400n }, v)).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "debtOutOfRange" }) }),
    );
    expect(() => planRepay({ token: U, amount: 0n }, twoX)).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "insufficientBalance" }) }),
    );
  });

  it("only the underlying, or the RWA asset, can pay a loan down", () => {
    expect(() => planRepay({ token: T, amount: 400n }, twoX)).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "unsupportedCollateralToken" }) }),
    );
  });

  it("an account that owes nothing has nothing to repay", () => {
    const v = view({ debt: 0n, balances: { [T]: 2_000n } });
    expect(() => planRepay({ token: U, amount: 400n }, v)).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "debtOutOfRange" }) }),
    );
  });
});

describe("planWithdraw — payout leaves, debt shrinks in proportion", () => {
  it("[INV-3] S=U, T=U: one identity leg, repay keeps the payout aside", () => {
    const v = view({ debt: 1_000n, balances: { [U]: 2_000n } });
    expect(planWithdraw({ amount: 100n, to: WALLET }, v)).toEqual([
      { kind: "convert", from: U, to: U, amount: 200n },
      { kind: "repay", amount: 100n, keep: 100n },
      { kind: "withdraw", token: U, amount: 100n, to: WALLET },
    ]);
  });

  it("[INV-3] S=T, T=U: both flows land in U, so one leg raises W + dD", () => {
    expect(
      planWithdraw({ amount: 100n, to: WALLET, sourceToken: T }, twoX),
    ).toEqual([
      { kind: "convert", from: T, to: U, amount: 200n },
      { kind: "repay", amount: 100n, keep: 100n },
      { kind: "withdraw", token: U, amount: 100n, to: WALLET },
    ]);
  });

  it("[INV-3] S=T, T=T2: independent debt and payout legs", () => {
    expect(
      planWithdraw(
        { amount: 100n, to: WALLET, sourceToken: T, tokenOut: T2 },
        twoX,
      ),
    ).toEqual([
      { kind: "convert", from: T, to: U, amount: 100n },
      { kind: "repay", amount: 100n },
      { kind: "convert", from: T, to: T2, amount: 100n },
      { kind: "withdraw", token: T2, amount: RAISED, to: WALLET },
    ]);
  });

  it("[INV-5] S=T=payout: the payout leg is an identity", () => {
    expect(
      planWithdraw(
        { amount: 100n, to: WALLET, sourceToken: T, tokenOut: T },
        twoX,
      ),
    ).toEqual([
      { kind: "convert", from: T, to: U, amount: 100n },
      { kind: "repay", amount: 100n },
      { kind: "convert", from: T, to: T, amount: 100n },
      { kind: "withdraw", token: T, amount: RAISED, to: WALLET },
    ]);
  });

  it("[INV-3] the whole net value is an exit: sell it all, settle, hand over", () => {
    expect(
      planWithdraw({ amount: 1_000n, to: WALLET, sourceToken: T }, twoX),
    ).toEqual([
      { kind: "clearQuotas" },
      { kind: "closeAll" },
      { kind: "repay", amount: 1_000n },
      { kind: "sweep", to: WALLET },
    ]);
  });

  it("[INV-3] asking past the net value is still that exit, not a bigger one", () => {
    expect(
      kinds(
        planWithdraw({ amount: 10_000n, to: WALLET, sourceToken: T }, twoX),
      ),
    ).toEqual(["clearQuotas", "closeAll", "repay", "sweep"]);
  });

  it("[INV-3] MAX_UINT256 is the exit without a net value to read", () => {
    expect(planWithdraw({ amount: MAX_UINT256, to: WALLET }, twoX)).toEqual([
      { kind: "clearQuotas" },
      { kind: "closeAll" },
      { kind: "repay", amount: 1_000n },
      { kind: "sweep", to: WALLET },
    ]);
  });

  it("[INV-3] the exit is the same walk on an account with no debt", () => {
    const v = view({ debt: 0n, balances: { [T]: 2_000n } });
    expect(planWithdraw({ amount: MAX_UINT256, to: WALLET }, v)).toEqual([
      { kind: "clearQuotas" },
      { kind: "closeAll" },
      { kind: "sweep", to: WALLET },
    ]);
  });

  it("[INV-3] an account the debt has caught up with has nothing to hand over", () => {
    const v = view({ debt: 2_000n, balances: { [U]: 2_000n } });
    expect(() => planWithdraw({ amount: 100n, to: WALLET }, v)).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "insufficientBalance" }) }),
    );
  });

  it("[INV-3] the exit can be redeemed too: the whole source, no payout named", () => {
    expect(
      planWithdrawDelayed({ amount: 1_000n, to: WALLET, sourceToken: T }, twoX),
    ).toEqual([
      {
        kind: "request",
        token: T,
        amount: 2_000n,
        reserve: 0n,
        record: { type: "CLOSE_ACCOUNT", to: WALLET },
      },
    ]);
  });

  it("[INV-3] a source the account does not hold cannot start that exit", () => {
    expect(() =>
      planWithdrawDelayed(
        { amount: MAX_UINT256, to: WALLET, sourceToken: T2 },
        twoX,
      ),
    ).toThrowError(
      expect.objectContaining({ error: expect.objectContaining({ code: "insufficientBalance" }) }),
    );
  });
});

describe("planWithdrawAsset — one asset out, debt untouched", () => {
  it("[INV-6] underlying on an RWA market is force-unwrapped first", () => {
    const v = view({ debt: 0n, balances: { [U]: 1_000n }, rwaAsset: RWA });
    expect(
      planWithdrawAsset({ token: U, amount: 100n, to: WALLET }, v),
    ).toEqual([
      { kind: "convert", from: U, to: RWA, amount: 100n },
      { kind: "withdraw", token: RWA, amount: RAISED, to: WALLET },
    ]);
  });

  it("any other token is handed over as is", () => {
    expect(
      planWithdrawAsset({ token: T, amount: 100n, to: WALLET }, twoX),
    ).toEqual([{ kind: "withdraw", token: T, amount: 100n, to: WALLET }]);
  });
});
