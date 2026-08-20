import type { Address, Hex } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  OperationPreview,
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../../model/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Mode } from "../types.js";
import type { Preview } from "./types.js";

const input: PreviewOperationInput = {
  chainId: 1,
  to: "0x0000000000000000000000000000000000000001" as Address,
  calldata: "0x" as Hex,
  sender: "0x0000000000000000000000000000000000000002" as Address,
};

describe("mode gates preview existence", () => {
  it("exists where a chain does", () => {
    expectTypeOf<GearboxSDK<"onchain">["preview"]>().toEqualTypeOf<Preview>();
    expectTypeOf<GearboxSDK<"both">["preview"]>().toEqualTypeOf<Preview>();
    expectTypeOf<
      GearboxSDK<"offchain">["preview"]
    >().toEqualTypeOf<undefined>();
  });

  it("a widened mode cannot tell whether preview is there", () => {
    expectTypeOf<GearboxSDK<Mode>["preview"]>().toEqualTypeOf<
      Preview | undefined
    >();
  });
});

describe("the public surface is the model types", () => {
  it("names the chain, not the on-chain SDK", () => {
    expectTypeOf<PreviewOperationInput>().toHaveProperty("chainId");
    expectTypeOf<PreviewOperationInput>().not.toHaveProperty("sdk");
  });

  it("takes the model input and options, and answers with OperationPreview", () => {
    const preview = {} as Preview;
    expectTypeOf(preview.previewOperation).toBeCallableWith(input);
    expectTypeOf(preview.previewOperation).toBeCallableWith(input, {
      blockNumber: 1n,
    } satisfies PreviewOperationOptions);
    expectTypeOf(
      preview.previewOperation,
    ).returns.resolves.toEqualTypeOf<OperationPreview>();
  });
});
