import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  assetBalance,
  expectAdjustResumePreview,
  withOnchainOpCalls,
} from "../../../testing/expect.js";
import type { ResumeCase } from "../../../testing/resume.js";
import {
  buildOnchainOptions,
  buildResumeSdk,
} from "../../../testing/resume.js";
import { CA_OP_CALLS, MOCK_CLAIM_CALL } from "../../../testing/sdk-mock.js";
import {
  buildResumeDepositProps,
  case_b_und_any,
  case_b_und_rwa,
  case_claimed_und,
  type DepositLikeDelayedIntent,
} from "./deposit.fixtures.js";

type DepositResumeProps = ReturnType<typeof buildResumeDepositProps>;

/** Same quota-only resume for both delayed deposit intents. */
const RESUME_NAMESPACES = [
  {
    name: "deposit",
    delayedIntent: {
      type: "DEPOSIT",
    } as const satisfies DepositLikeDelayedIntent,
    finish: (
      service: CreditAccountOperationsService,
      props: DepositResumeProps,
    ) => service.finishIntent({ ...props, intent: { type: "DEPOSIT" } }),
  },
  {
    name: "depositAndIncreaseLeverage",
    delayedIntent: {
      type: "DEPOSIT_AND_INCREASE_LEVERAGE",
    } as const satisfies DepositLikeDelayedIntent,
    finish: (
      service: CreditAccountOperationsService,
      props: DepositResumeProps,
    ) =>
      service.finishIntent({
        ...props,
        intent: { type: "DEPOSIT_AND_INCREASE_LEVERAGE" },
      }),
  },
] as const;

describe("deposit-like.resume onchain — quota-only after claim", () => {
  for (const ns of RESUME_NAMESPACES) {
    describe(ns.name, () => {
      function runResume(c: ResumeCase) {
        const sdk = buildResumeSdk(c);
        const service = new CreditAccountOperationsService(sdk);
        const props = buildResumeDepositProps({
          case: c,
          sdk,
          options: buildOnchainOptions(c),
          delayedIntent: ns.delayedIntent,
        });
        return ns.finish(service, props);
      }

      it("claimed ANY → changeQuota (flow B: C=und, T=any)", async () => {
        const result = await runResume(case_b_und_any);
        const state = expectAdjustResumePreview(result, {
          totalValue: case_b_und_any.postClaimTotalValue,
          accountDebt: case_b_und_any.postClaimDebt,
          expectedOps: withOnchainOpCalls([...case_b_und_any.resumeOps]),
          expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.changeQuota],
        });

        expect(assetBalance(state.assets, case_b_und_any.claimedToken)).toBe(
          case_b_und_any.claimedAmount,
        );
        expect(state.quotas[case_b_und_any.claimedToken]?.balance).toBe(
          case_b_und_any.expectedQuotaBalance,
        );
      });

      it("claimed RWA asset → changeQuota (flow B: C=und, T=asset)", async () => {
        const result = await runResume(case_b_und_rwa);
        const state = expectAdjustResumePreview(result, {
          totalValue: case_b_und_rwa.postClaimTotalValue,
          accountDebt: case_b_und_rwa.postClaimDebt,
          expectedOps: withOnchainOpCalls([...case_b_und_rwa.resumeOps]),
          expectedCalls: [MOCK_CLAIM_CALL, CA_OP_CALLS.changeQuota],
        });

        expect(assetBalance(state.assets, case_b_und_rwa.claimedToken)).toBe(
          case_b_und_rwa.claimedAmount,
        );
        expect(state.quotas[case_b_und_rwa.claimedToken]?.balance).toBe(
          case_b_und_rwa.expectedQuotaBalance,
        );
      });

      it("claimed UND → empty ops (und not on active quota-buy path)", async () => {
        const result = await runResume(case_claimed_und);
        const state = expectAdjustResumePreview(result, {
          totalValue: case_claimed_und.postClaimTotalValue,
          accountDebt: case_claimed_und.postClaimDebt,
          expectedOps: withOnchainOpCalls([...case_claimed_und.resumeOps]),
          expectedCalls: [MOCK_CLAIM_CALL],
        });

        expect(assetBalance(state.assets, case_claimed_und.claimedToken)).toBe(
          case_claimed_und.claimedAmount,
        );
      });
    });
  }
});
