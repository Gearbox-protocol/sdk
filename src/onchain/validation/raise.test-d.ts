import { describe, expectTypeOf, it } from "vitest";
import type {
  MalformedTransactionError,
  PoolPausedError,
  PoolSunsetError,
  QuotaCountExceededError,
} from "../../model/index.js";
import type { IntentValidationError } from "./raise.js";

describe("IntentValidationError — what the engine can raise", () => {
  it("does not include the codes only a parsed transaction can produce", () => {
    // @ts-expect-error poolSunset judges a deposit already sent, not a plan
    const _sunset: IntentValidationError = {} as PoolSunsetError;
    // @ts-expect-error quotaCountExceeded is the replay's, not the engine's
    const _count: IntentValidationError = {} as QuotaCountExceededError;
    // @ts-expect-error malformedTransaction can only be said of calldata handed in
    const _malformed: IntentValidationError = {} as MalformedTransactionError;
    // @ts-expect-error poolPaused is checkOperation's; the engine reads the manager
    const _paused: IntentValidationError = {} as PoolPausedError;
    void _sunset;
    void _count;
    void _malformed;
    void _paused;
  });

  it("narrows on code to the fields that code carries", () => {
    const error = {} as IntentValidationError;
    if (error.code === "forbiddenToken") {
      expectTypeOf(error.token).toExtend<{ address: string }>();
    }
    if (error.code === "noRecordedIntent") {
      expectTypeOf(error).not.toHaveProperty("token");
    }
  });
});
