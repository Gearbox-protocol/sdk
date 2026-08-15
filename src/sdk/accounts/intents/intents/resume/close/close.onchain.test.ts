import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import { toBN } from "../../../../../index.js";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  expectCallsArrayExact,
  expectOpsArrayExact,
  withOnchainOpCalls,
} from "../../../testing/expect.js";
import {
  ANY,
  CREDIT_FACADE,
  RESUME_FIXTURE_PHANTOM,
  RWA_ASSET,
  UND,
} from "../../../testing/resume.js";
import {
  MOCK_CLAIM_CALL,
  MOCK_CLOSE_CALL,
  MOCK_ROUTER_CALL,
} from "../../../testing/sdk-mock.js";
import { eq } from "../../../utils/index.js";
import {
  A0_TOK,
  buildCloseResumeProps,
  buildCloseSdk,
  CLAIMED,
  CLOSE_EQUITY,
  CLOSE_T0,
  CREDIT_ACCOUNT,
  closeResumeOps,
} from "./close.fixtures.js";

function mocksOf(sdk: ReturnType<typeof buildCloseSdk>) {
  return {
    findBestClosePath: vi.mocked(
      sdk.routerFor({ creditFacade: CREDIT_FACADE }).findBestClosePath,
    ),
    assembleClose: vi.mocked(sdk.accounts.assembleCloseCreditAccountCalls),
  };
}

function expectedBalanceMap(
  expectedBalances: Array<{ token: Address; balance: bigint }>,
) {
  return new Map(expectedBalances.map(a => [a.token.toLowerCase(), a.balance]));
}

describe("closeAccount.resume onchain — close after claim", () => {
  it("router uses balances after claim (not phantom)", async () => {
    const sdk = buildCloseSdk({
      claimedToken: UND,
      closePath: {
        amount: 0n,
        minAmount: 0n,
        calls: [],
        underlyingBalance: CLAIMED,
      },
    });
    const { findBestClosePath } = mocksOf(sdk);
    const service = new CreditAccountOperationsService(sdk);

    const result = await service.finishIntent(
      buildCloseResumeProps({
        sdk,
        claimedToken: UND,
        claimedAmount: CLAIMED,
        tokens: [
          { token: ANY, balance: A0_TOK, quota: 0n, mask: 0n, success: true },
          {
            token: RESUME_FIXTURE_PHANTOM,
            balance: CLAIMED,
            quota: 0n,
            mask: 0n,
            success: true,
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    expect(findBestClosePath).toHaveBeenCalledTimes(1);

    const pathArgs = findBestClosePath.mock.calls[0]?.[0];
    expect(pathArgs?.balances?.leftoverBalances).toEqual([]);
    expect(pathArgs?.balances?.tokensToClaim).toEqual([]);
    const byToken = expectedBalanceMap(
      pathArgs?.balances?.expectedBalances ?? [],
    );

    expect(byToken.get(RESUME_FIXTURE_PHANTOM.toLowerCase())).toBeUndefined();
    expect(byToken.get(UND.toLowerCase())).toBe(CLAIMED);
    expect(byToken.get(ANY.toLowerCase())).toBe(A0_TOK);
  });

  it("claim UND then closeCreditAccount with equity", async () => {
    const sdk = buildCloseSdk({
      claimedToken: UND,
      closePath: {
        amount: CLOSE_EQUITY,
        minAmount: CLOSE_EQUITY,
        calls: [],
        underlyingBalance: CLOSE_EQUITY,
      },
    });
    const { assembleClose } = mocksOf(sdk);
    const service = new CreditAccountOperationsService(sdk);

    const result = await service.finishIntent(
      buildCloseResumeProps({
        sdk,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok || !result.instant) {
      throw new Error("expected ok instant close preview");
    }
    expectOpsArrayExact(
      result.instant.operations,
      withOnchainOpCalls([
        closeResumeOps[0],
        {
          type: "closeCreditAccount",
          amount: CLOSE_EQUITY,
          minAmount: CLOSE_EQUITY,
          underlyingBalance: CLOSE_EQUITY,
          calls: [MOCK_CLOSE_CALL],
        },
      ]),
    );
    expectCallsArrayExact(result.instant.calls, [
      MOCK_CLAIM_CALL,
      MOCK_CLOSE_CALL,
    ]);
    expect(result.instant.preview.min).toEqual({
      kind: "close",
      amount: CLOSE_EQUITY,
      minAmount: CLOSE_EQUITY,
      underlyingBalance: CLOSE_EQUITY,
    });
    expect(
      result.instant.operations.some(op => op.type === "changeQuota"),
    ).toBe(false);
    expect(
      result.instant.operations.some(op => op.type === "wrapRwaCollateral"),
    ).toBe(false);

    expect(assembleClose).toHaveBeenCalledTimes(1);
    const assembleArgs = assembleClose.mock.calls[0]?.[0];
    expect(assembleArgs?.creditAccount.creditAccount.toLowerCase()).toBe(
      CREDIT_ACCOUNT,
    );
    expect(assembleArgs?.assetsToWithdraw).toEqual([UND]);
  });

  it("claim rwa.asset → close; router sees claimed rwa.asset (no wrap)", async () => {
    const sdk = buildCloseSdk({
      claimedToken: RWA_ASSET,
      closePath: {
        amount: CLOSE_EQUITY,
        minAmount: CLOSE_EQUITY,
        calls: [MOCK_ROUTER_CALL],
        underlyingBalance: CLOSE_EQUITY,
      },
      rwaAssets: { [UND]: RWA_ASSET },
    });
    const { findBestClosePath, assembleClose } = mocksOf(sdk);
    const service = new CreditAccountOperationsService(sdk);

    const result = await service.finishIntent(
      buildCloseResumeProps({
        sdk,
        claimedToken: RWA_ASSET,
        claimedAmount: CLAIMED,
      }),
    );

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
        calls: [MOCK_CLAIM_CALL],
      },
      {
        type: "closeCreditAccount",
        amount: CLOSE_EQUITY,
        minAmount: CLOSE_EQUITY,
        underlyingBalance: CLOSE_EQUITY,
        calls: [MOCK_CLOSE_CALL],
      },
    ]);
    expectCallsArrayExact(result.instant.calls, [
      MOCK_CLAIM_CALL,
      MOCK_CLOSE_CALL,
    ]);
    expect(
      result.instant.operations.some(op => op.type === "wrapRwaCollateral"),
    ).toBe(false);
    expect(
      result.instant.operations.some(op => op.type === "changeQuota"),
    ).toBe(false);

    const pathArgs = findBestClosePath.mock.calls[0]?.[0];
    expect(pathArgs?.balances?.leftoverBalances).toEqual([]);
    expect(pathArgs?.balances?.tokensToClaim).toEqual([]);
    const byToken = expectedBalanceMap(
      pathArgs?.balances?.expectedBalances ?? [],
    );
    expect(byToken.get(RESUME_FIXTURE_PHANTOM.toLowerCase())).toBeUndefined();
    expect(byToken.get(RWA_ASSET.toLowerCase())).toBe(CLAIMED);

    const assembleArgs = assembleClose.mock.calls[0]?.[0];
    expect(assembleArgs?.routerCalls).toEqual([MOCK_ROUTER_CALL]);
    expect(assembleArgs?.assetsToWithdraw).toEqual([RWA_ASSET]);
    expect(
      assembleArgs?.creditAccount.tokens.find(t =>
        eq(t.token, RESUME_FIXTURE_PHANTOM),
      )?.balance,
    ).toBe(CLAIMED);
  });

  it("claim anyAsset → close; router sees claimed token balances (no wrap)", async () => {
    const sdk = buildCloseSdk({
      claimedToken: ANY,
      closePath: {
        amount: CLOSE_EQUITY,
        minAmount: CLOSE_EQUITY,
        calls: [MOCK_ROUTER_CALL],
        underlyingBalance: CLOSE_EQUITY,
      },
    });
    const { findBestClosePath, assembleClose } = mocksOf(sdk);
    const service = new CreditAccountOperationsService(sdk);

    const result = await service.finishIntent(
      buildCloseResumeProps({
        sdk,
        claimedToken: ANY,
        claimedAmount: CLAIMED,
        tokens: [
          {
            token: RESUME_FIXTURE_PHANTOM,
            balance: CLAIMED,
            quota: 0n,
            mask: 0n,
            success: true,
          },
        ],
      }),
    );

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
        calls: [MOCK_CLAIM_CALL],
      },
      {
        type: "closeCreditAccount",
        amount: CLOSE_EQUITY,
        minAmount: CLOSE_EQUITY,
        underlyingBalance: CLOSE_EQUITY,
        calls: [MOCK_CLOSE_CALL],
      },
    ]);
    expectCallsArrayExact(result.instant.calls, [
      MOCK_CLAIM_CALL,
      MOCK_CLOSE_CALL,
    ]);

    const pathArgs = findBestClosePath.mock.calls[0]?.[0];
    expect(pathArgs?.balances?.leftoverBalances).toEqual([]);
    expect(pathArgs?.balances?.tokensToClaim).toEqual([]);
    const byToken = expectedBalanceMap(
      pathArgs?.balances?.expectedBalances ?? [],
    );
    expect(byToken.get(RESUME_FIXTURE_PHANTOM.toLowerCase())).toBeUndefined();
    expect(byToken.get(ANY.toLowerCase())).toBe(CLAIMED);

    const assembleArgs = assembleClose.mock.calls[0]?.[0];
    expect(assembleArgs?.assetsToWithdraw).toEqual([UND]);
    expect(
      assembleArgs?.creditAccount.tokens.find(t =>
        eq(t.token, RESUME_FIXTURE_PHANTOM),
      )?.balance,
    ).toBe(CLAIMED);
  });

  it("does not emit separate changeQuota; assembleClose keeps original CA with phantom quota", async () => {
    const phantomQuota = toBN("50000", 8);

    const sdk = buildCloseSdk({
      claimedToken: UND,
      closePath: {
        amount: CLOSE_EQUITY,
        minAmount: CLOSE_EQUITY,
        calls: [],
        underlyingBalance: CLOSE_EQUITY,
      },
    });
    const { assembleClose } = mocksOf(sdk);
    const service = new CreditAccountOperationsService(sdk);

    const result = await service.finishIntent(
      buildCloseResumeProps({
        sdk,
        claimedToken: UND,
        claimedAmount: CLAIMED,
        tokens: [
          {
            token: RESUME_FIXTURE_PHANTOM,
            balance: CLAIMED,
            quota: phantomQuota,
            mask: 0n,
            success: true,
          },
          {
            token: UND,
            balance: CLOSE_T0 - CLAIMED,
            quota: 0n,
            mask: 0n,
            success: true,
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok || !result.instant) {
      throw new Error("expected ok instant close preview");
    }

    expect(
      result.instant.operations.some(op => op.type === "changeQuota"),
    ).toBe(false);
    expectCallsArrayExact(result.instant.calls, [
      MOCK_CLAIM_CALL,
      MOCK_CLOSE_CALL,
    ]);

    const assembleArgs = assembleClose.mock.calls[0]?.[0];
    expect(
      assembleArgs?.creditAccount.tokens.find(t =>
        eq(t.token, RESUME_FIXTURE_PHANTOM),
      )?.quota,
    ).toBe(phantomQuota);
  });
});
