import { describe, expect, it } from "vitest";
import type { ExecutionConstraintReport } from "../../onchain/accounts/intents/execution-constraints.js";
import { POS } from "../../onchain/accounts/intents/testing/market.js";
import {
  IntentPreviewError,
  refuse,
} from "../../onchain/validation/refusal.js";
import { toRefusalError } from "./errors.js";

const report: ExecutionConstraintReport = {
  checkCollateral: true,
  useSafePrices: undefined,
  revertOnForbiddenTokens: undefined,
  minHealthFactor: 10_000,
  constraints: [{ id: "callPricing", status: "unresolved" }],
};

describe("execution refusals at the prepare boundary", () => {
  it("preserves unknown-call detail and the report through error and refusal wrappers", () => {
    const thrown = new IntentPreviewError(
      "executionRequirementsUnavailable",
      {
        callIndex: 2,
        target: POS,
        selector: "0x12345678",
        message: "Unknown adapter call",
      },
      undefined,
      report,
    );
    const error = toRefusalError(
      refuse(thrown.reason, thrown.detail, thrown.executionConstraints),
    );
    expect(error).toMatchObject({
      code: "executionRequirementsUnavailable",
      callIndex: 2,
      target: POS,
      selector: "0x12345678",
      message: "Unknown adapter call",
    });
    expect(error.executionConstraints).toBe(report);
  });

  it("reports unavailable reserve separately from insufficient collateral", () => {
    const error = toRefusalError(
      refuse("invalidPriceFeed", { token: POS, feed: "reserve" }, report),
    );
    expect(error).toMatchObject({
      code: "invalidPriceFeed",
      token: POS,
      feed: "reserve",
      executionConstraints: report,
    });
  });
});
