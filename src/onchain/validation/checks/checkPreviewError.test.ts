import { describe, expect, it } from "vitest";
import { TOK } from "../testing/tokens.js";
import {
  checkPreviewError,
  isMalformedPreviewError,
} from "./checkPreviewError.js";

const malformed = {
  code: "adapterCallOutsideBracket" as const,
  message: "bad bracket",
  adapter: TOK.address,
};
const unpriceable = {
  code: "unpriceableToken" as const,
  message: "no price",
  token: TOK.address,
};

describe("checkPreviewError", () => {
  it("blocks a malformed transaction and carries the SDK's own warning", () => {
    expect(checkPreviewError(malformed)).toEqual([
      {
        code: "malformedTransaction",
        message: expect.any(String),
        warning: malformed,
      },
    ]);
  });

  it("stands down for an incomplete evaluation and for no warning at all", () => {
    expect(checkPreviewError(unpriceable)).toEqual([]);
    expect(checkPreviewError(undefined)).toEqual([]);
  });
});

describe("isMalformedPreviewError", () => {
  it("classifies by code, not by a numeric range", () => {
    expect(isMalformedPreviewError(malformed)).toBe(true);
    expect(isMalformedPreviewError(unpriceable)).toBe(false);
    expect(isMalformedPreviewError({ code: "other", message: "x" })).toBe(
      false,
    );
  });
});
