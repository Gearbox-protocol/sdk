import { describe, expect, it } from "vitest";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { TOK } from "../testing/tokens.js";
import { checkAccountQuotas } from "./checkAccountQuotas.js";

const quota = (value: bigint) => ({
  token: TOK,
  value,
  valueUsd: null,
});

const suite = (max: number) =>
  ({
    creditManager: { maxEnabledTokens: max },
  }) as unknown as CreditSuite;

describe("checkAccountQuotas", () => {
  it("does not count a zeroed quota", () => {
    expect(
      checkAccountQuotas(suite(1), {
        quotas: [quota(1n), quota(0n)],
      }),
    ).toEqual([]);
  });

  it("counts quoted tokens against the facade's cap", () => {
    expect(
      checkAccountQuotas(suite(1), {
        quotas: [quota(1n), quota(1n)],
      }),
    ).toMatchObject([{ code: "quotaCountExceeded", count: 2, max: 1 }]);
  });
});
