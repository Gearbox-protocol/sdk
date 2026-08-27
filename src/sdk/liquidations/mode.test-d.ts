import { describe, expectTypeOf, it } from "vitest";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Mode } from "../types.js";
import type { ILiquidations } from "./types.js";

describe("mode gates liquidations existence", () => {
  it("exists where a chain does", () => {
    expectTypeOf<
      GearboxSDK<"onchain">["liquidations"]
    >().toEqualTypeOf<ILiquidations>();
    expectTypeOf<
      GearboxSDK<"both">["liquidations"]
    >().toEqualTypeOf<ILiquidations>();
    expectTypeOf<
      GearboxSDK<"offchain">["liquidations"]
    >().toEqualTypeOf<undefined>();
  });

  it("a widened mode cannot tell whether liquidations is there", () => {
    expectTypeOf<GearboxSDK<Mode>["liquidations"]>().toEqualTypeOf<
      ILiquidations | undefined
    >();
  });
});
