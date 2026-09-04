import { describe, expectTypeOf, it } from "vitest";

import type { Token } from "../../model/index.js";
import type {
  PreviewErrorDetails,
  PreviewErrorReason,
  PreviewRefusal,
} from "./refusal.js";

describe("refusal shape — reason decides what detail comes with it", () => {
  it("gives every reason a detail, and details nothing else", () => {
    expectTypeOf<
      keyof PreviewErrorDetails
    >().toEqualTypeOf<PreviewErrorReason>();
  });

  it("ties each reason to its own detail", () => {
    expectTypeOf<{
      ok: false;
      reason: "forbiddenToken";
      detail: { token: Token };
    }>().toExtend<PreviewRefusal>();

    expectTypeOf<{
      ok: false;
      reason: "forbiddenToken";
      detail: { creditManager: `0x${string}` };
    }>().not.toExtend<PreviewRefusal>();
  });

  it("does not accept a refusal with no detail at all", () => {
    expectTypeOf<{
      ok: false;
      reason: "forbiddenToken";
    }>().not.toExtend<PreviewRefusal>();
  });
});
