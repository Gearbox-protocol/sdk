// D1 (verdict-shim-removal): the clean-surface spec of the six preview
// refusal errors. Each is an interface plus an exported factory — nothing
// else. Payloads are pinned exactly (toEqual) so the answered dictionary
// cannot drift while the shims come out.
import type { Address, Hex } from "viem";
import { describe, expect, it } from "vitest";
import { isSDKError } from "../model/index.js";
import { invalidDelayedIntent } from "../onchain/accounts/withdrawal-compressor/errors.js";
import type { OnchainSDK } from "../onchain/index.js";
import { unsupportedZapperFunction } from "../onchain/market/zapper/errors.js";
import * as previewBarrel from "./index.js";
import { unsupportedPoolFunction, unsupportedTarget } from "./parse/errors.js";
import { unsupportedOperation } from "./preview/errors.js";
import {
  isPreviewOperationError,
  previewOperation,
} from "./preview/previewOperation.js";
import {
  asPreviewSimulationError,
  previewSimulationFailed,
  type SimulationFlowFailure,
} from "./simulate/errors.js";

const TARGET: Address = "0x00000000000000000000000000000000000000aa";
const CALLDATA: Hex = "0x12345678";

describe("factories answer flat refusal objects", () => {
  it("unsupportedTarget factory answers the exact object", () => {
    const answer = unsupportedTarget(TARGET);
    expect(answer).toEqual({
      code: "unsupportedTarget",
      message: `unsupported transaction target: ${TARGET}`,
      target: TARGET,
    });
    expect(answer instanceof Error).toBe(false);
  });

  it("unsupportedPoolFunction factory answers the exact object", () => {
    const answer = unsupportedPoolFunction(TARGET, "mint");
    expect(answer).toEqual({
      code: "unsupportedPoolFunction",
      message: `unsupported pool function "mint" on ${TARGET}`,
      pool: TARGET,
      functionName: "mint",
    });
    expect(answer instanceof Error).toBe(false);
  });

  it("unsupportedOperation factory answers the exact object", () => {
    const answer = unsupportedOperation("LiquidateCreditAccount");
    expect(answer).toEqual({
      code: "unsupportedOperation",
      message:
        'operation "LiquidateCreditAccount" is not supported by previewOperation',
      operation: "LiquidateCreditAccount",
    });
    expect(answer instanceof Error).toBe(false);
  });

  it("invalidDelayedIntent factory answers the exact object", () => {
    const cause = new Error("boom");
    const answer = invalidDelayedIntent(CALLDATA, cause);
    expect(answer).toEqual({
      code: "invalidDelayedIntent",
      message: `cannot decode delayed intent from extraData ${CALLDATA}`,
      extraData: CALLDATA,
      cause,
    });
    expect(answer.cause).toBe(cause);
    expect(answer instanceof Error).toBe(false);
  });

  it("invalidDelayedIntent factory normalises a non-Error cause and omits an absent one", () => {
    const bare = invalidDelayedIntent(CALLDATA);
    expect(bare).toEqual({
      code: "invalidDelayedIntent",
      message: `cannot decode delayed intent from extraData ${CALLDATA}`,
      extraData: CALLDATA,
    });
    expect(Object.hasOwn(bare, "cause")).toBe(false);
    const normalised = invalidDelayedIntent(CALLDATA, "boom");
    expect(normalised.cause).toBeInstanceOf(Error);
    expect(normalised.cause?.message).toBe("boom");
  });

  it("previewSimulationFailed factory answers the exact object", () => {
    const failures: SimulationFlowFailure[] = [
      { source: "multicall", detail: { reason: "AllowanceFailedException" } },
    ];
    const answer = previewSimulationFailed(failures);
    expect(answer).toEqual({
      code: "previewSimulationFailed",
      message: "AllowanceFailedException",
      failures,
    });
    expect(Object.hasOwn(answer, "cause")).toBe(false);
    expect(answer instanceof Error).toBe(false);
  });

  it("previewSimulationFailed keeps the first Error cause and the multi-flow message", () => {
    const boom = new Error("boom");
    const failures: SimulationFlowFailure[] = [
      { source: "multicall", detail: { reason: "first", cause: boom } },
      { source: "unknown", detail: { reason: "second" } },
    ];
    const answer = previewSimulationFailed(failures);
    expect(answer).toEqual({
      code: "previewSimulationFailed",
      message: "all simulation flows failed",
      failures,
      cause: boom,
    });
    expect(answer.cause).toBe(boom);
  });

  it("asPreviewSimulationError passes a matching object through by identity and normalises the rest", () => {
    const existing = previewSimulationFailed([
      { source: "multicall", detail: { reason: "kept" } },
    ]);
    expect(asPreviewSimulationError(existing, "multicall")).toBe(existing);

    const fromString = asPreviewSimulationError("boom", "unknown");
    expect(fromString.code).toBe("previewSimulationFailed");
    expect(fromString.failures).toHaveLength(1);
    expect(fromString.failures[0]?.source).toBe("unknown");

    const fromNull = asPreviewSimulationError(null, "unknown");
    expect(fromNull.code).toBe("previewSimulationFailed");
  });

  it("unsupportedZapperFunction factory answers the exact object", () => {
    const answer = unsupportedZapperFunction(TARGET, "zapOut");
    expect(answer).toEqual({
      code: "unsupportedZapperFunction",
      message: `unsupported zapper function "zapOut" on ${TARGET}`,
      zapper: TARGET,
      functionName: "zapOut",
    });
    expect(answer instanceof Error).toBe(false);
  });
});

describe("isPreviewOperationError", () => {
  it("isPreviewOperationError accepts all six refusal codes", () => {
    const answers = [
      unsupportedTarget(TARGET),
      unsupportedPoolFunction(TARGET, "mint"),
      unsupportedZapperFunction(TARGET, "zapOut"),
      unsupportedOperation("LiquidateCreditAccount"),
      invalidDelayedIntent(CALLDATA),
      previewSimulationFailed([
        { source: "multicall", detail: { reason: "reverted" } },
      ]),
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
  it("barrel exports the factories and the guard, and no callable class aliases", () => {
    expect(typeof previewBarrel.unsupportedTarget).toBe("function");
    expect(typeof previewBarrel.unsupportedPoolFunction).toBe("function");
    expect(typeof previewBarrel.unsupportedZapperFunction).toBe("function");
    expect(typeof previewBarrel.unsupportedOperation).toBe("function");
    expect(typeof previewBarrel.invalidDelayedIntent).toBe("function");
    expect(typeof previewBarrel.previewSimulationFailed).toBe("function");
    expect(typeof previewBarrel.asPreviewSimulationError).toBe("function");
    expect(typeof previewBarrel.isPreviewOperationError).toBe("function");
    for (const name of [
      "UnsupportedTargetError",
      "UnsupportedPoolFunctionError",
      "UnsupportedZapperFunctionError",
      "UnsupportedOperationError",
      "InvalidDelayedIntentError",
      "PreviewSimulationError",
      "IntentPreviewError",
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
    expect(answer.error).toEqual(unsupportedTarget(TARGET));
    expect(answer.error instanceof Error).toBe(false);
  });
});
