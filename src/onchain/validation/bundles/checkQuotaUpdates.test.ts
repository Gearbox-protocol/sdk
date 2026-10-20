import { describe, expect, it } from "vitest";
import type { TokenAmount } from "../../../model/index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { TOK, UND, WETH } from "../testing/tokens.js";
import type { CreditOperationPreview } from "./checkCreditOperation.js";
import { checkQuotaUpdates } from "./checkQuotaUpdates.js";

const MAX_DEBT = 1_000n;

const amount = (value: bigint, token = TOK): TokenAmount => ({
  token,
  value,
  valueUsd: null,
});

const suite = (forbidden = false) =>
  ({
    creditFacade: { minDebt: 100n, maxDebt: MAX_DEBT },
    isForbidden: () => forbidden,
  }) as unknown as CreditSuite;

interface AdjustArgs {
  change: bigint;
  after: bigint;
  debt?: bigint;
}

const adjust = ({ change, after, debt = 500n }: AdjustArgs) =>
  ({
    operation: "AdjustCreditAccount",
    quotasChange: [amount(change)],
    quotas: after > 0n ? [amount(after)] : [],
    totalDebt: amount(debt, UND),
  }) as unknown as CreditOperationPreview;

describe("checkQuotaUpdates", () => {
  it("passes a change within the max quota on a debted account", () => {
    expect(
      checkQuotaUpdates(suite(), adjust({ change: 500n, after: 2_000n }), UND),
    ).toEqual([]);
  });

  it("weighs nothing when no quota moves", () => {
    expect(
      checkQuotaUpdates(
        suite(true),
        adjust({ change: 0n, after: 3_000n, debt: 0n }),
        UND,
      ),
    ).toEqual([]);
  });

  it("refuses an increase on a forbidden token", () => {
    expect(
      checkQuotaUpdates(
        suite(true),
        adjust({ change: 500n, after: 500n }),
        UND,
      ),
    ).toMatchObject([{ code: "forbiddenToken", token: TOK }]);
  });

  it("lets a forbidden token's quota decrease", () => {
    expect(
      checkQuotaUpdates(suite(true), adjust({ change: -500n, after: 0n }), UND),
    ).toEqual([]);
  });

  it("refuses an increase on an account that ends with zero debt", () => {
    expect(
      checkQuotaUpdates(
        suite(),
        adjust({ change: 500n, after: 500n, debt: 0n }),
        UND,
      ),
    ).toMatchObject([
      {
        code: "debtOutOfRange",
        requested: { token: UND, value: 0n },
        minDebt: { value: 100n },
        maxDebt: { value: MAX_DEBT },
      },
    ]);
  });

  it("lets a zero debt account decrease a quota", () => {
    expect(
      checkQuotaUpdates(
        suite(),
        adjust({ change: -500n, after: 0n, debt: 0n }),
        UND,
      ),
    ).toEqual([]);
  });

  it("refuses a resulting quota above twice the max debt", () => {
    expect(
      checkQuotaUpdates(suite(), adjust({ change: 1n, after: 2_001n }), UND),
    ).toMatchObject([
      {
        code: "quotaAboveMax",
        token: TOK,
        requested: { token: UND, value: 2_001n },
        maxQuota: { token: UND, value: 2_000n },
      },
    ]);
  });

  it("reads quotas on open and leaves zero debt to checkDebtLimits", () => {
    expect(
      checkQuotaUpdates(
        suite(true),
        {
          operation: "OpenCreditAccount",
          quotas: [amount(2_001n), amount(1n, WETH)],
          totalDebt: amount(0n, UND),
        } as unknown as CreditOperationPreview,
        UND,
      ),
    ).toMatchObject([
      { code: "forbiddenToken", token: TOK },
      { code: "forbiddenToken", token: WETH },
      { code: "quotaAboveMax", token: TOK },
    ]);
  });
});
