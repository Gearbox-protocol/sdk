import { describe, expect, it } from "vitest";
import { creditManagerPaused, noRecordedIntent } from "../../model/index.js";
import { IntentPreviewError, raise } from "./raise.js";

describe("raise — the first error a check found", () => {
  it("throws that error, wrapped, with the engine's sentence", () => {
    const error = creditManagerPaused("0x1");
    expect(() => raise([error], "paused")).toThrowError(
      expect.objectContaining({
        name: "IntentPreviewError",
        message: "paused",
        error,
      }),
    );
  });

  it("passes when the check found nothing", () => {
    expect(() => raise([], "paused")).not.toThrow();
  });
});

describe("IntentPreviewError", () => {
  it("carries the error object and defaults the log line to its message", () => {
    const error = noRecordedIntent();
    const thrown = new IntentPreviewError(error);
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.error).toBe(error);
    expect(thrown.message).toBe(error.message);
  });
});
