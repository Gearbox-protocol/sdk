import type { Address, Hex } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  CreditAccountNotFoundError,
  InvalidDelayedIntentError,
  MalformedTransactionError,
  OperationPreview,
  PoolOperationPreviewError,
  SDKReturn,
  UnsupportedOperationError,
  UnsupportedPoolFunctionError,
  UnsupportedTargetError,
  UnsupportedZapperFunctionError,
} from "../../../model/index.js";
import { type ClientOptions, OnchainSDK } from "../../index.js";
// @ts-expect-error IntentPreviewError left the public validation barrel: the
// engine keeps it internally (raise.js), the public surface answers error
// objects instead.
import { IntentPreviewError } from "../../validation/index.js";
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

const sdk = new OnchainSDK("Mainnet", clientOptions);

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
        | PoolOperationPreviewError
        | MalformedTransactionError
        | CreditAccountNotFoundError
      >
    >();
  });

  it("narrows to the preview or the refusal on the ok discriminant", async () => {
    const answer = await previewOperation(sdk, {
      chainId: sdk.chainId,
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
        | "poolOperationPreviewError"
        | "malformedTransaction"
        | "creditAccountNotFound"
      >();
    }
  });
});
