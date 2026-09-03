import type { Address, Hex } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type { OperationPreview, SDKReturn } from "../../model/index.js";
import {
  type ClientOptions,
  type InvalidDelayedIntentError,
  OnchainSDK,
} from "../../onchain/index.js";
// @ts-expect-error IntentPreviewError left the public validation barrel: the
// engine keeps it internally (raise.js), the public surface answers error
// objects instead.
import { IntentPreviewError } from "../../onchain/validation/index.js";
import { BotsPlugin } from "../../plugins/bots/index.js";
import type {
  UnsupportedPoolFunctionError,
  UnsupportedTargetError,
  UnsupportedZapperFunctionError,
} from "../parse/errors.js";
import { UnsupportedTargetError as UnsupportedTargetValue } from "../parse/errors.js";
import type { PreviewSimulationError } from "../simulate/errors.js";
import type { UnsupportedOperationError } from "./errors.js";
import { previewOperation } from "./previewOperation.js";

void IntentPreviewError;
// @ts-expect-error the class-era alias survives as a type only since the
// declassing: using it as a value must fail.
void UnsupportedTargetValue;

const to: Address = "0x0000000000000000000000000000000000000001";
const sender: Address = "0x0000000000000000000000000000000000000002";
const calldata: Hex = "0x";

const clientOptions: ClientOptions = {
  rpcURLs: ["http://127.0.0.1:8545"],
};

const sdkWithoutPlugins = new OnchainSDK("Mainnet", clientOptions);

const sdkWithUnrelatedPlugin = new OnchainSDK("Mainnet", clientOptions, {
  plugins: { bots: new BotsPlugin() },
});

describe("previewOperation sdk typing", () => {
  it("accepts an SDK created without plugins", () => {
    void previewOperation({ sdk: sdkWithoutPlugins, to, calldata, sender });
  });

  it("accepts an SDK with unrelated plugins", () => {
    void previewOperation({
      sdk: sdkWithUnrelatedPlugin,
      to,
      calldata,
      sender,
    });
  });
});

describe("previewOperation result envelope", () => {
  it("answers SDKReturn over the exact union of preview refusal errors", () => {
    expectTypeOf(previewOperation).returns.resolves.toEqualTypeOf<
      SDKReturn<
        OperationPreview,
        | UnsupportedTargetError
        | UnsupportedPoolFunctionError
        | UnsupportedZapperFunctionError
        | UnsupportedOperationError
        | InvalidDelayedIntentError
        | PreviewSimulationError
      >
    >();
  });

  it("narrows to the preview or the refusal on the ok discriminant", async () => {
    const answer = await previewOperation({
      sdk: sdkWithoutPlugins,
      to,
      calldata,
      sender,
    });
    if (answer.ok) {
      expectTypeOf(answer.data).toEqualTypeOf<OperationPreview>();
    } else {
      expectTypeOf(answer.error.code).toEqualTypeOf<
        | "unsupportedTarget"
        | "unsupportedPoolFunction"
        | "unsupportedZapperFunction"
        | "unsupportedOperation"
        | "invalidDelayedIntent"
        | "previewSimulationFailed"
      >();
    }
  });
});
