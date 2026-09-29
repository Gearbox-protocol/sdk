import { describe, expectTypeOf, it } from "vitest";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Mode } from "../types.js";
import type { IRewards } from "./types.js";

describe("mode gates rewards existence", () => {
  it("exists where a chain does", () => {
    expectTypeOf<GearboxSDK<"onchain">["rewards"]>().toEqualTypeOf<IRewards>();
    expectTypeOf<GearboxSDK<"both">["rewards"]>().toEqualTypeOf<IRewards>();
    expectTypeOf<
      GearboxSDK<"offchain">["rewards"]
    >().toEqualTypeOf<undefined>();
  });

  it("a widened mode cannot tell whether rewards is there", () => {
    expectTypeOf<GearboxSDK<Mode>["rewards"]>().toEqualTypeOf<
      IRewards | undefined
    >();
  });
});
