import type { Address, Hex } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../../model/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Mode } from "../types.js";
import type { IPreview } from "./types.js";

const input: PreviewOperationInput = {
  chainId: 1,
  to: "0x0000000000000000000000000000000000000001" as Address,
  calldata: "0x" as Hex,
  sender: "0x0000000000000000000000000000000000000002" as Address,
};

describe("mode gates preview existence", () => {
  it("exists where a chain does", () => {
    expectTypeOf<GearboxSDK<"onchain">["preview"]>().toEqualTypeOf<IPreview>();
    expectTypeOf<GearboxSDK<"both">["preview"]>().toEqualTypeOf<IPreview>();
    expectTypeOf<
      GearboxSDK<"offchain">["preview"]
    >().toEqualTypeOf<undefined>();
  });

  it("a widened mode cannot tell whether preview is there", () => {
    expectTypeOf<GearboxSDK<Mode>["preview"]>().toEqualTypeOf<
      IPreview | undefined
    >();
  });
});
