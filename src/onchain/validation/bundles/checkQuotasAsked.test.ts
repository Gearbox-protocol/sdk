import { describe, expect, it } from "vitest";
import type { MarketSuite } from "../../market/MarketSuite.js";
import { TOK, UND } from "../testing/tokens.js";
import type { CreditOperationPreview } from "./checkCreditOperation.js";
import { checkQuotasAsked } from "./checkQuotasAsked.js";

const quota = (value: bigint) => ({
  token: TOK,
  value,
  valueUsd: null,
});

const market = (quoted: boolean, available = 500n) =>
  ({
    pool: {
      pqk: {
        hasActiveQuota: () => quoted,
        quotaAvailable: () => available,
      },
    },
  }) as unknown as MarketSuite;

describe("checkQuotasAsked", () => {
  it("weighs only an increase", () => {
    expect(
      checkQuotasAsked(
        market(true),
        {
          operation: "AdjustCreditAccount",
          quotasChange: [quota(0n)],
        } as unknown as CreditOperationPreview,
        UND,
      ),
    ).toEqual([]);
  });

  it("forwards requested and available for a quoted token", () => {
    expect(
      checkQuotasAsked(
        market(true, 500n),
        {
          operation: "AdjustCreditAccount",
          quotasChange: [quota(500n)],
        } as unknown as CreditOperationPreview,
        UND,
      ),
    ).toEqual([]);

    expect(
      checkQuotasAsked(
        market(true, 500n),
        {
          operation: "AdjustCreditAccount",
          quotasChange: [quota(501n)],
        } as unknown as CreditOperationPreview,
        UND,
      ),
    ).toMatchObject([
      {
        code: "quotaLimitReached",
        requested: { token: UND, value: 501n, valueUsd: null },
        available: { token: UND, value: 500n, valueUsd: null },
      },
    ]);
  });

  it("forwards requested: undefined for an unquoted token", () => {
    expect(
      checkQuotasAsked(
        market(false),
        {
          operation: "AdjustCreditAccount",
          quotasChange: [quota(1n)],
        } as unknown as CreditOperationPreview,
        UND,
      ),
    ).toMatchObject([
      {
        code: "quotaLimitReached",
        requested: undefined,
        available: { token: UND, value: 0n, valueUsd: null },
      },
    ]);
  });

  it("reads quotas on open and quotasChange on adjust", () => {
    expect(
      checkQuotasAsked(
        market(false),
        {
          operation: "OpenCreditAccount",
          quotas: [quota(1n)],
        } as unknown as CreditOperationPreview,
        UND,
      ),
    ).toMatchObject([{ code: "quotaLimitReached" }]);

    expect(
      checkQuotasAsked(
        market(false),
        {
          operation: "AdjustCreditAccount",
          quotasChange: [quota(1n)],
          quotas: [],
        } as unknown as CreditOperationPreview,
        UND,
      ),
    ).toMatchObject([{ code: "quotaLimitReached" }]);

    expect(
      checkQuotasAsked(
        market(false),
        {
          operation: "AdjustCreditAccount",
          quotasChange: [quota(0n)],
          quotas: [quota(1n)],
        } as unknown as CreditOperationPreview,
        UND,
      ),
    ).toEqual([]);
  });
});
