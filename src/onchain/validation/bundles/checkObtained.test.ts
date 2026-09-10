import { describe, expect, it } from "vitest";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { TOK } from "../testing/tokens.js";
import type { CreditOperationPreview } from "./checkCreditOperation.js";
import { checkObtained } from "./checkObtained.js";

const amount = (value: bigint) => ({
  token: TOK,
  value,
  valueUsd: null,
});

const suite = (forbidden: boolean) =>
  ({
    isForbidden: () => forbidden,
  }) as unknown as CreditSuite;

describe("checkObtained", () => {
  it("weighs only a growing balance", () => {
    const forbidden = suite(true);

    expect(
      checkObtained(forbidden, {
        operation: "AdjustCreditAccount",
        assetsChange: [amount(1n)],
      } as unknown as CreditOperationPreview),
    ).toMatchObject([{ code: "forbiddenToken", token: TOK }]);

    expect(
      checkObtained(forbidden, {
        operation: "AdjustCreditAccount",
        assetsChange: [amount(0n)],
      } as unknown as CreditOperationPreview),
    ).toEqual([]);
  });

  it("reads estAssets on open and assetsChange on adjust", () => {
    const forbidden = suite(true);

    expect(
      checkObtained(forbidden, {
        operation: "OpenCreditAccount",
        estAssets: [amount(1n)],
      } as unknown as CreditOperationPreview),
    ).toMatchObject([{ code: "forbiddenToken" }]);

    expect(
      checkObtained(forbidden, {
        operation: "AdjustCreditAccount",
        assetsChange: [amount(1n)],
        estAssets: [amount(0n)],
      } as unknown as CreditOperationPreview),
    ).toMatchObject([{ code: "forbiddenToken" }]);

    expect(
      checkObtained(forbidden, {
        operation: "AdjustCreditAccount",
        assetsChange: [amount(0n)],
        estAssets: [amount(1n)],
      } as unknown as CreditOperationPreview),
    ).toEqual([]);
  });
});
