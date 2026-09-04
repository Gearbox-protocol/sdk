// D1-S3 (precise-error-unions): the one envelope every refusable sdk
// function answers with. `ok` is the discriminant — narrowing it settles
// which field exists, in both directions, at type level and at runtime.
import { describe, expect, expectTypeOf, it } from "vitest";

import type { IGearboxError } from "./errors.js";
import type { SafeValue, SDKError, SDKResult, SDKReturn } from "./result.js";
import { isSDKError, safeValue, sdkErr, sdkOk } from "./result.js";

interface FixtureError extends IGearboxError {
  code: "fixtureRefused";
  limit: number;
}

const refusal: FixtureError = {
  code: "fixtureRefused",
  message: "the fixture refuses",
  limit: 3,
};

describe("SDKReturn", () => {
  it("narrows on ok in both directions", () => {
    const answer: SDKReturn<string, FixtureError> =
      Math.abs(0) === 0 ? sdkOk("data") : sdkErr(refusal);
    if (answer.ok) {
      expectTypeOf(answer).toEqualTypeOf<SDKResult<string>>();
      expectTypeOf(answer.data).toEqualTypeOf<string>();
      expect(answer.data).toBe("data");
    } else {
      expectTypeOf(answer).toEqualTypeOf<SDKError<FixtureError>>();
      expectTypeOf(answer.error.limit).toEqualTypeOf<number>();
    }
    if (Math.abs(0) !== 0) {
      // Never executed — compile-time only: data is unreachable before the
      // failure half is ruled out.
      // @ts-expect-error data does not exist until ok is narrowed
      void answer.data;
    }
  });

  it("sdkOk and sdkErr build the two halves", () => {
    expect(sdkOk(42)).toEqual({ ok: true, data: 42 });
    expect(sdkErr(refusal)).toEqual({ ok: false, error: refusal });
  });

  it("isSDKError narrows the union", () => {
    const failed: SDKReturn<number, FixtureError> = sdkErr(refusal);
    expect(isSDKError(failed)).toBe(true);
    if (isSDKError(failed)) {
      expectTypeOf(failed.error).toEqualTypeOf<FixtureError>();
      expect(failed.error.code).toBe("fixtureRefused");
    }
    expect(isSDKError(sdkOk(1))).toBe(false);
  });
});

describe("SafeValue", () => {
  it("omits error when the value was not degraded", () => {
    expect(safeValue(42)).toEqual({ value: 42 });
    expect("error" in safeValue(42)).toBe(false);
  });

  it("carries the value and the error together", () => {
    const degraded: SafeValue<number, FixtureError> = safeValue(0, refusal);
    expect(degraded).toEqual({ value: 0, error: refusal });
    expectTypeOf(degraded.error).toEqualTypeOf<FixtureError | undefined>();
  });
});
