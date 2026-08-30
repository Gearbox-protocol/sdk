// D1 (preview errors cleanup): the clean-surface spec of the six preview
// refusal errors. Each is an interface alone — raise sites build the literal
// (`satisfies`), nothing constructs them for callers. Payloads are pinned
// exactly (toEqual) so the answered dictionary cannot drift.
import type { Address, Hex } from "viem";
import { describe, expect, it } from "vitest";
import { isSDKError } from "../model/index.js";
import type { OnchainSDK } from "../onchain/index.js";
import * as previewBarrel from "./index.js";
import {
  isPreviewOperationError,
  previewOperation,
} from "./preview/previewOperation.js";
import { asPreviewSimulationError } from "./simulate/errors.js";

const TARGET: Address = "0x00000000000000000000000000000000000000aa";
const CALLDATA: Hex = "0x12345678";

describe("asPreviewSimulationError", () => {
  it("normalises a thrown Error into the exact literal", () => {
    const boom = new Error("AllowanceFailedException");
    expect(asPreviewSimulationError(boom, "multicall")).toEqual({
      code: "previewSimulationFailed",
      message: "AllowanceFailedException",
      failures: [
        {
          source: "multicall",
          detail: { reason: "AllowanceFailedException", cause: boom },
        },
      ],
      cause: boom,
    });
  });

  it("passes a matching refusal through by identity and normalises the rest", () => {
    const existing = asPreviewSimulationError(new Error("kept"), "multicall");
    expect(asPreviewSimulationError(existing, "multicall")).toBe(existing);

    const fromString = asPreviewSimulationError("boom", "unknown");
    expect(fromString.code).toBe("previewSimulationFailed");
    expect(fromString.failures).toHaveLength(1);
    expect(fromString.failures[0]?.source).toBe("unknown");

    const fromNull = asPreviewSimulationError(null, "unknown");
    expect(fromNull.code).toBe("previewSimulationFailed");
  });
});

describe("isPreviewOperationError", () => {
  it("isPreviewOperationError accepts all six refusal codes", () => {
    const answers = [
      { code: "unsupportedTarget", message: "m", target: TARGET },
      {
        code: "unsupportedPoolFunction",
        message: "m",
        pool: TARGET,
        functionName: "mint",
      },
      {
        code: "unsupportedZapperFunction",
        message: "m",
        zapper: TARGET,
        functionName: "zapOut",
      },
      {
        code: "unsupportedOperation",
        message: "m",
        operation: "LiquidateCreditAccount",
      },
      { code: "invalidDelayedIntent", message: "m", extraData: CALLDATA },
      asPreviewSimulationError(new Error("reverted"), "multicall"),
    ];
    for (const answer of answers) {
      expect(isPreviewOperationError(answer), answer.code).toBe(true);
    }
  });

  it("isPreviewOperationError rejects everything outside the refusal vocabulary", () => {
    expect(isPreviewOperationError(new Error("boom"))).toBe(false);
    expect(isPreviewOperationError("unsupportedTarget")).toBe(false);
    expect(isPreviewOperationError(42)).toBe(false);
    expect(isPreviewOperationError(null)).toBe(false);
    expect(isPreviewOperationError(undefined)).toBe(false);
    expect(isPreviewOperationError({})).toBe(false);
    expect(isPreviewOperationError({ code: "somethingElse" })).toBe(false);
    // prototype keys must not slip through an `in`-style membership check
    expect(isPreviewOperationError({ code: "toString" })).toBe(false);
    expect(isPreviewOperationError({ code: "constructor" })).toBe(false);
  });
});

describe("preview barrel surface", () => {
  it("barrel exports the guard and the normaliser, and no error constructors", () => {
    expect(typeof previewBarrel.isPreviewOperationError).toBe("function");
    expect(typeof previewBarrel.asPreviewSimulationError).toBe("function");
    for (const name of [
      // the class-era aliases stay types only
      "UnsupportedTargetError",
      "UnsupportedPoolFunctionError",
      "UnsupportedZapperFunctionError",
      "UnsupportedOperationError",
      "InvalidDelayedIntentError",
      "PreviewSimulationError",
      "IntentPreviewError",
      // and no factory took their place — raise sites build literals
      "unsupportedTarget",
      "unsupportedPoolFunction",
      "unsupportedZapperFunction",
      "unsupportedOperation",
      "invalidDelayedIntent",
      "previewSimulationFailed",
    ]) {
      expect(name in previewBarrel, name).toBe(false);
    }
  });
});

describe("previewOperation envelope", () => {
  it("answers sdkErr(unsupportedTarget) for an unknown target — exact object", async () => {
    // An SDK that knows no contract at the target address: the parse refusal
    // must flow out through the envelope instead of being thrown.
    const sdk = { getContract: () => undefined } as unknown as OnchainSDK;

    const answer = await previewOperation({
      sdk,
      to: TARGET,
      calldata: CALLDATA,
      sender: "0x00000000000000000000000000000000000000bb",
    });

    expect(isSDKError(answer)).toBe(true);
    if (!isSDKError(answer)) {
      throw new Error("expected a refusal");
    }
    expect(answer.error).toEqual({
      code: "unsupportedTarget",
      message: `unsupported transaction target: ${TARGET}`,
      target: TARGET,
    });
    expect(answer.error instanceof Error).toBe(false);
  });
});
