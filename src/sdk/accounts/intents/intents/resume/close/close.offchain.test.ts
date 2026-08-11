import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  expectCallsArrayExact,
  expectOpsArrayExact,
} from "../../../testing/expect.js";
import {
  ANY,
  buildOffchainOptions,
  RESUME_FIXTURE_PHANTOM,
  RWA_ASSET,
  UND,
} from "../../../testing/resume.js";
import {
  buildCloseResumeProps,
  buildCloseSdk,
  CLAIMED,
  CLOSE_EQUITY,
  closePreviewState,
  closeResumeOps,
} from "./close.fixtures.js";

function runResume(args?: {
  claimedToken?: Parameters<typeof buildCloseResumeProps>[0]["claimedToken"];
  claimedAmount?: bigint;
}) {
  const claimedToken = args?.claimedToken ?? UND;
  const claimedAmount = args?.claimedAmount ?? 0n;
  const sdk = buildCloseSdk({ claimedToken });
  const service = new CreditAccountOperationsService(sdk);
  return service.finishIntent(
    buildCloseResumeProps({
      sdk,
      options: buildOffchainOptions({ claimedToken, claimedAmount }),
      claimedToken,
      claimedAmount,
    }),
  );
}

/**
 * Resume close: claimDelayedWithdrawal first, then the same close op as full.
 */
describe("closeAccount.resume offchain — close after claim", () => {
  it("claim then closeCreditAccount with equity", async () => {
    const result = await runResume();

    expect(result.ok).toBe(true);
    if (!result.ok || !result.instant) {
      throw new Error("expected ok instant close preview");
    }
    expectOpsArrayExact(result.instant.operations, closeResumeOps);
    expectCallsArrayExact(result.instant.calls, []);
    expect(result.instant.preview.min).toEqual(closePreviewState);
    expect(
      result.instant.operations.some(op => op.type === "changeQuota"),
    ).toBe(false);
  });

  it("claim anyAsset → closeCreditAccount (no wrap, no changeQuota)", async () => {
    const result = await runResume({
      claimedToken: ANY,
      claimedAmount: CLAIMED,
    });

    expect(result.ok).toBe(true);
    if (!result.ok || !result.instant) {
      throw new Error("expected ok instant close preview");
    }
    expectOpsArrayExact(result.instant.operations, [
      {
        type: "claimDelayedWithdrawal",
        token: ANY,
        withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
        withdrawalTokenSpent: CLAIMED,
        outputs: [{ token: ANY, amount: CLAIMED, isDelayed: false }],
        calls: [],
      },
      {
        type: "closeCreditAccount",
        amount: CLOSE_EQUITY,
        minAmount: CLOSE_EQUITY,
        underlyingBalance: CLOSE_EQUITY,
        calls: [],
      },
    ]);
    expect(
      result.instant.operations.some(op => op.type === "wrapRwaCollateral"),
    ).toBe(false);
    expect(
      result.instant.operations.some(op => op.type === "changeQuota"),
    ).toBe(false);
  });

  it("claim rwa.asset → closeCreditAccount (no wrap)", async () => {
    const result = await runResume({
      claimedToken: RWA_ASSET,
      claimedAmount: CLAIMED,
    });

    expect(result.ok).toBe(true);
    if (!result.ok || !result.instant) {
      throw new Error("expected ok instant close preview");
    }
    expectOpsArrayExact(result.instant.operations, [
      {
        type: "claimDelayedWithdrawal",
        token: RWA_ASSET,
        withdrawalPhantomToken: RESUME_FIXTURE_PHANTOM,
        withdrawalTokenSpent: CLAIMED,
        outputs: [{ token: RWA_ASSET, amount: CLAIMED, isDelayed: false }],
        calls: [],
      },
      {
        type: "closeCreditAccount",
        amount: CLOSE_EQUITY,
        minAmount: CLOSE_EQUITY,
        underlyingBalance: CLOSE_EQUITY,
        calls: [],
      },
    ]);
    expect(
      result.instant.operations.some(op => op.type === "wrapRwaCollateral"),
    ).toBe(false);
  });
});
