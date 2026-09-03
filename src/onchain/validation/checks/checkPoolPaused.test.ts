import { describe, expect, it } from "vitest";
import { POOL } from "../testing/tokens.js";
import { checkPoolPaused } from "./checkPoolPaused.js";

describe("checkPoolPaused", () => {
  it("names the pool rather than a manager", () => {
    expect(checkPoolPaused({ isPaused: true, pool: POOL })).toEqual([
      { code: "poolPaused", message: expect.any(String), pool: POOL },
    ]);
  });

  it("passes a live pool", () => {
    expect(checkPoolPaused({ isPaused: false, pool: POOL })).toEqual([]);
  });
});
