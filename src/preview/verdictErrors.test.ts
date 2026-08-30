import type { Address, Hex } from "viem";
import { describe, expect, it } from "vitest";
import { isSDKError } from "../model/index.js";
import { InvalidDelayedIntentError } from "../onchain/accounts/withdrawal-compressor/errors.js";
import type { OnchainSDK } from "../onchain/index.js";
import { UnsupportedZapperFunctionError } from "../onchain/market/zapper/errors.js";
import {
  UnsupportedPoolFunctionError,
  UnsupportedTargetError,
} from "./parse/errors.js";
import { UnsupportedOperationError } from "./preview/errors.js";
import { previewOperation } from "./preview/previewOperation.js";
import {
  asPreviewSimulationError,
  PreviewSimulationError,
  type SimulationFlowFailure,
} from "./simulate/errors.js";

const TARGET: Address = "0x00000000000000000000000000000000000000aa";
const SENDER: Address = "0x00000000000000000000000000000000000000bb";
const CALLDATA: Hex = "0x12345678";

describe("verdicts are returned, not thrown", () => {
  it("previewOperation answers sdkErr(unsupportedTarget) for an unknown target", async () => {
    // An SDK that knows no contract at the target address: the parse verdict
    // must flow out through the envelope instead of being thrown.
    const sdk = { getContract: () => undefined } as unknown as OnchainSDK;

    const answer = await previewOperation({
      sdk,
      to: TARGET,
      calldata: CALLDATA,
      sender: SENDER,
    });

    expect(isSDKError(answer)).toBe(true);
    if (!isSDKError(answer)) {
      throw new Error("expected a refusal");
    }
    expect(answer.error).toMatchObject({
      code: "unsupportedTarget",
      target: TARGET,
    });
    expect(typeof answer.error.message).toBe("string");
    expect(answer.error instanceof Error).toBe(false);
  });

  it("unsupportedTarget still constructs through legacy `new`", () => {
    const verdict = new UnsupportedTargetError(TARGET);
    expect(verdict).toMatchObject({
      code: "unsupportedTarget",
      target: TARGET,
    });
    expect(verdict instanceof UnsupportedTargetError).toBe(true);
    expect(verdict instanceof Error).toBe(false);
  });

  it("unsupportedPoolFunction carries the pool and the function name", () => {
    const verdict = UnsupportedPoolFunctionError(TARGET, "mint");
    expect(verdict).toMatchObject({
      code: "unsupportedPoolFunction",
      pool: TARGET,
      functionName: "mint",
    });
    expect(verdict instanceof UnsupportedPoolFunctionError).toBe(true);
    expect(verdict instanceof Error).toBe(false);
  });

  it("unsupportedOperation names the operation kind", () => {
    const verdict = UnsupportedOperationError("LiquidateCreditAccount");
    expect(verdict).toMatchObject({
      code: "unsupportedOperation",
      operation: "LiquidateCreditAccount",
    });
    expect(verdict.message).toContain("LiquidateCreditAccount");
    expect(verdict instanceof Error).toBe(false);
  });

  it("unsupportedZapperFunction carries the zapper and the function name", () => {
    const verdict = new UnsupportedZapperFunctionError(TARGET, "zapOut");
    expect(verdict).toMatchObject({
      code: "unsupportedZapperFunction",
      zapper: TARGET,
      functionName: "zapOut",
    });
    expect(verdict instanceof UnsupportedZapperFunctionError).toBe(true);
    expect(verdict instanceof Error).toBe(false);
  });

  it("invalidDelayedIntent keeps the raw extraData and the cause", () => {
    const cause = new Error("boom");
    const verdict = InvalidDelayedIntentError(CALLDATA, cause);
    expect(verdict).toMatchObject({
      code: "invalidDelayedIntent",
      extraData: CALLDATA,
    });
    expect(verdict.cause).toBe(cause);
    expect(verdict instanceof InvalidDelayedIntentError).toBe(true);
    expect(verdict instanceof Error).toBe(false);
  });

  it("previewSimulationFailed keeps the decoded flow failures", () => {
    const failures: SimulationFlowFailure[] = [
      { source: "multicall", detail: { reason: "AllowanceFailedException" } },
    ];
    const verdict = PreviewSimulationError(failures);
    expect(verdict).toMatchObject({
      code: "previewSimulationFailed",
      message: "AllowanceFailedException",
    });
    expect(verdict.failures).toHaveLength(1);
    expect(verdict instanceof PreviewSimulationError).toBe(true);
    expect(verdict instanceof Error).toBe(false);
    // The normaliser passes an existing verdict through untouched.
    expect(asPreviewSimulationError(verdict, "multicall")).toBe(verdict);
  });
});

describe("verdicts on the public barrels", () => {
  it("onchain validation barrel no longer exports IntentPreviewError", async () => {
    const validation = await import("../onchain/validation/index.js");
    expect("IntentPreviewError" in validation).toBe(false);
    // The engine keeps raising it internally, through the module itself.
    const refusal = await import("../onchain/validation/refusal.js");
    expect(typeof refusal.IntentPreviewError).toBe("function");
  });

  it("preview barrel exports the declassed factories and no Error classes", async () => {
    const barrel = await import("./index.js");
    for (const name of [
      "UnsupportedTargetError",
      "UnsupportedPoolFunctionError",
      "UnsupportedZapperFunctionError",
      "UnsupportedOperationError",
      "InvalidDelayedIntentError",
      "PreviewSimulationError",
    ] as const) {
      const factory: unknown = barrel[name];
      expect(typeof factory, name).toBe("function");
      const proto = (factory as { prototype?: unknown }).prototype;
      expect(proto instanceof Error, name).toBe(false);
    }
    expect("IntentPreviewError" in barrel).toBe(false);
  });
});
