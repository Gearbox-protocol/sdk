import { describe, expect, it } from "vitest";
import { GipRegistry } from "./GipRegistry.js";

describe("built-in registry", () => {
  it("registers every built-in action type once", () => {
    const { marketActions, configuratorActions } = GipRegistry.builtin;
    expect(new Set(marketActions.map(action => action.type)).size).toBe(48);
    expect(marketActions).toHaveLength(48);
    expect(configuratorActions).toHaveLength(6);
  });
});
