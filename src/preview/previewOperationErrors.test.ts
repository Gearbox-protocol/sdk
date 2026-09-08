// D1 (preview errors cleanup): the clean-surface spec of the eight preview
// refusal errors. Each is an interface alone — raise sites build the literal
// (`satisfies`), nothing constructs them for callers. Payloads are pinned
// exactly (toEqual) so the answered dictionary cannot drift.
import type { Address, Hex } from "viem";
import { describe, expect, it } from "vitest";
import type { OnchainSDK } from "../onchain/index.js";
import * as previewBarrel from "./index.js";
import { previewOperation } from "./preview/previewOperation.js";

const TARGET: Address = "0x00000000000000000000000000000000000000aa";
const CALLDATA: Hex = "0x12345678";

describe("preview barrel surface", () => {
  it("barrel exports no error constructors or guards", () => {
    for (const name of [
      // the class-era aliases stay types only
      "UnsupportedTargetError",
      "UnsupportedPoolFunctionError",
      "UnsupportedZapperFunctionError",
      "UnsupportedOperationError",
      "InvalidDelayedIntentError",
      "PoolOperationPreviewError",
      "MalformedTransactionError",
      "CreditAccountNotFoundError",
      "IntentPreviewError",
      "isPreviewOperationError",
      // and no factory took their place — raise sites build literals
      "unsupportedTarget",
      "unsupportedPoolFunction",
      "unsupportedZapperFunction",
      "unsupportedOperation",
      "invalidDelayedIntent",
      "poolOperationPreviewError",
      "malformedTransaction",
      "creditAccountNotFound",
    ]) {
      expect(name in previewBarrel, name).toBe(false);
    }
  });
});

describe("previewOperation envelope", () => {
  it("answers sdkErr(unsupportedTarget) for an unknown target — exact object", async () => {
    // An SDK that knows no contract at the target address: the parse refusal
    // must flow out through the envelope instead of being thrown.
    const sdk = { getContract: () => undefined } as unknown as OnchainSDK;

    const answer = await previewOperation({
      sdk,
      to: TARGET,
      calldata: CALLDATA,
      sender: "0x00000000000000000000000000000000000000bb",
    });

    expect(answer.ok).toBe(false);
    if (answer.ok) {
      throw new Error("expected a refusal");
    }
    expect(answer.error).toEqual({
      code: "unsupportedTarget",
      message: `unsupported transaction target: ${TARGET}`,
      target: TARGET,
    });
    expect(answer.error instanceof Error).toBe(false);
  });
});
