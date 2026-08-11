import type { Address } from "viem";
import { describe, it } from "vitest";
import type { OnchainSDK } from "../../../../../index.js";
import { toBN } from "../../../../../index.js";

import { CreditAccountOperationsService } from "../../../index.js";
import {
  type ExpectedFlowOp,
  expectAdjustResumePreview,
} from "../../../testing/expect.js";
import { ANY, ANY2, RWA_ASSET as RWA, UND } from "../../../testing/resume.js";
import type { IntentPreviewResult } from "../../../types.js";
import {
  buildWithdrawOffchainOptions,
  buildWithdrawResumeProps,
  buildWithdrawSdk,
  DEBT_DELTA,
  PHANTOM,
  WITHDRAW_ANY,
  WITHDRAW_BASE_TV,
  WITHDRAW_PRE_D,
  WITHDRAW_RWA,
  WITHDRAW_TO,
  WITHDRAW_UND,
} from "./withdraw.fixtures.js";

const CLAIM_USDC = "0xcccccccccccccccccccccccccccccccccccccccc" as Address;
/** Unpriced rwa.asset (RLUSD-like): reachable only via the wrapped-und bridge. */
const RWA_ASSET = "0xdddddddddddddddddddddddddddddddddddddddd" as Address;

type WithdrawProps = ReturnType<typeof buildWithdrawResumeProps>;

function claimOp(token: Address, amount: bigint): ExpectedFlowOp {
  return {
    type: "claimDelayedWithdrawal",
    token,
    withdrawalPhantomToken: PHANTOM,
    withdrawalTokenSpent: amount,
    outputs: [{ token, amount, isDelayed: false }],
    calls: [],
  };
}

function swapOp(
  tokenIn: Address,
  amountIn: bigint,
  tokenOut: Address,
  amountOut: bigint,
): ExpectedFlowOp {
  return {
    type: "swap",
    from: [{ token: tokenIn, balance: amountIn }],
    tokenOut,
    amountOut,
    calls: [],
  };
}

function decreaseDebtOp(amount: bigint): ExpectedFlowOp {
  return { type: "decreaseDebt", amount };
}

function withdrawOp(token: Address, amount: bigint): ExpectedFlowOp {
  return { type: "withdrawCollateral", token, amount, to: WITHDRAW_TO };
}

async function runWithdraw(props: WithdrawProps): Promise<IntentPreviewResult> {
  const service = new CreditAccountOperationsService(props.sdk as OnchainSDK);
  return service.finishWithdrawCollateralIntent(props);
}

function resumeProps(args: {
  sourceToken: Address;
  withdrawToken: Address;
  claimedToken: Address;
  claimedAmount: bigint;
  debtRepaid: bigint;
  withdrawAmount?: bigint;
  sdkExtras?: Parameters<typeof buildWithdrawSdk>[0];
}): WithdrawProps {
  const sdk = buildWithdrawSdk({
    claimedToken: args.claimedToken,
    ...args.sdkExtras,
  });
  return buildWithdrawResumeProps({
    sourceToken: args.sourceToken,
    withdrawToken: args.withdrawToken,
    claimedToken: args.claimedToken,
    claimedAmount: args.claimedAmount,
    debtRepaid: args.debtRepaid,
    withdrawAmount: args.withdrawAmount,
    options: buildWithdrawOffchainOptions({
      claimedToken: args.claimedToken,
      claimedAmount: args.claimedAmount,
    }),
    sdk,
  });
}

/**
 * Withdraw resume matrix after the withdraw-token constraint
 * (W ∈ {underlying, rwa.asset}).
 */
describe("withdraw resume S/T matrix (offchain)", () => {
  it("2.2.1 claims and withdraws only available W with no debt repayment", async () => {
    const claimed = WITHDRAW_UND / 2n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: UND,
        withdrawToken: UND,
        claimedToken: UND,
        claimedAmount: claimed,
        debtRepaid: 0n,
      }),
    );
    // claim adds `claimed` (no phantom on CA), withdraw removes it → TV unchanged
    expectAdjustResumePreview(result, {
      totalValue: WITHDRAW_BASE_TV,
      accountDebt: WITHDRAW_PRE_D,
      expectedOps: [claimOp(UND, claimed), withdrawOp(UND, claimed)],
    });
  });

  it("2.2.2 claims, swaps, and withdraws available W", async () => {
    const claimed = WITHDRAW_ANY / 2n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: UND,
        withdrawToken: UND,
        claimedToken: ANY,
        claimedAmount: claimed,
        debtRepaid: 0n,
      }),
    );
    expectAdjustResumePreview(result, {
      totalValue: WITHDRAW_BASE_TV,
      accountDebt: WITHDRAW_PRE_D,
      expectedOps: [
        claimOp(ANY, claimed),
        // 1000 ANY @ $1 → 500e8 UND @ $2
        swapOp(ANY, claimed, UND, 50000000000n),
        withdrawOp(UND, 50000000000n),
      ],
    });
  });

  it("2.2.1 (T=rwa.asset): claim=config.underlying === T → withdraw only", async () => {
    const claimed = WITHDRAW_RWA / 2n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: UND,
        withdrawToken: RWA,
        claimedToken: RWA,
        claimedAmount: claimed,
        debtRepaid: 0n,
        withdrawAmount: WITHDRAW_RWA,
        sdkExtras: {
          claimedToken: RWA,
          rwaAssets: { [UND]: RWA },
        },
      }),
    );
    expectAdjustResumePreview(result, {
      totalValue: WITHDRAW_BASE_TV,
      accountDebt: WITHDRAW_PRE_D,
      expectedOps: [claimOp(RWA, claimed), withdrawOp(RWA, claimed)],
    });
  });

  it("2.2.2 (T=rwa.asset): claim≠T → swap into T, then withdraw", async () => {
    const result = await runWithdraw(
      resumeProps({
        sourceToken: UND,
        withdrawToken: RWA,
        claimedToken: UND,
        claimedAmount: WITHDRAW_RWA,
        debtRepaid: 0n,
        withdrawAmount: WITHDRAW_RWA,
        sdkExtras: {
          claimedToken: UND,
          rwaAssets: { [UND]: RWA },
        },
      }),
    );
    expectAdjustResumePreview(result, {
      totalValue: WITHDRAW_BASE_TV,
      accountDebt: WITHDRAW_PRE_D,
      expectedOps: [
        claimOp(UND, WITHDRAW_RWA),
        // 1:1 price, same decimals
        swapOp(UND, WITHDRAW_RWA, RWA, WITHDRAW_RWA),
        withdrawOp(RWA, WITHDRAW_RWA),
      ],
    });
  });

  it("2.3.1 reserves W before repaying debt", async () => {
    const claimed = DEBT_DELTA + 10n ** 11n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: ANY,
        withdrawToken: UND,
        claimedToken: UND,
        claimedAmount: claimed,
        debtRepaid: DEBT_DELTA,
      }),
    );
    expectAdjustResumePreview(result, {
      // claim +5e11, repay −4e11, withdraw −1e11 → net 0 on TV
      totalValue: WITHDRAW_BASE_TV,
      accountDebt: WITHDRAW_PRE_D - DEBT_DELTA,
      expectedOps: [
        claimOp(UND, claimed),
        // min(claimed − min(W, claimed), dD) = min(5000e8 − 1000e8, 4000e8)
        decreaseDebtOp(DEBT_DELTA),
        withdrawOp(UND, WITHDRAW_UND),
      ],
    });
  });

  it("2.3.2 claim≠U: swaps into U, repays from the remainder, withdraws W", async () => {
    const claimed = 2n * WITHDRAW_ANY;
    const repay = 100000000000n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: ANY,
        withdrawToken: UND,
        claimedToken: ANY,
        claimedAmount: claimed,
        debtRepaid: DEBT_DELTA,
      }),
    );
    expectAdjustResumePreview(result, {
      // claim 2000e8 und-worth, repay 1000e8, withdraw 1000e8 → net 0
      totalValue: WITHDRAW_BASE_TV,
      accountDebt: WITHDRAW_PRE_D - repay,
      expectedOps: [
        claimOp(ANY, claimed),
        // 4000 ANY @ $1 → 2000e8 UND @ $2
        swapOp(ANY, claimed, UND, 200000000000n),
        // min(2000e8 − min(W=1000e8, 2000e8), dD) = 1000e8
        decreaseDebtOp(repay),
        withdrawOp(UND, WITHDRAW_UND),
      ],
    });
  });

  it("2.5.2 repays from claim then withdraws W from the account", async () => {
    const result = await runWithdraw(
      resumeProps({
        sourceToken: UND,
        withdrawToken: UND,
        claimedToken: ANY2,
        claimedAmount: DEBT_DELTA,
        debtRepaid: DEBT_DELTA,
      }),
    );
    expectAdjustResumePreview(result, {
      // claim truncates to 20 und, repay 20, withdraw W=1000e8 from CA
      totalValue: WITHDRAW_BASE_TV - WITHDRAW_UND,
      accountDebt: WITHDRAW_PRE_D - 20n,
      expectedOps: [
        claimOp(ANY2, DEBT_DELTA),
        // 4e11 ANY2 (18 dec) @ $1 → 20n UND @ $2 (truncated)
        swapOp(ANY2, DEBT_DELTA, UND, 20n),
        decreaseDebtOp(20n),
        withdrawOp(UND, WITHDRAW_UND),
      ],
    });
  });

  it("2.5.1 (S=T=rwa.asset): claim=U repays debt directly, W withdrawn from CA", async () => {
    const claimed = DEBT_DELTA + 10n ** 11n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: RWA,
        withdrawToken: RWA,
        claimedToken: UND,
        claimedAmount: claimed,
        debtRepaid: DEBT_DELTA,
        withdrawAmount: WITHDRAW_RWA,
        sdkExtras: {
          claimedToken: UND,
          rwaAssets: { [UND]: RWA },
        },
      }),
    );
    expectAdjustResumePreview(result, {
      // claim +5e11 und, repay −4e11; W not on CA so withdraw is a no-op on TVL
      totalValue: WITHDRAW_BASE_TV + 10n ** 11n,
      accountDebt: WITHDRAW_PRE_D - DEBT_DELTA,
      expectedOps: [
        claimOp(UND, claimed),
        // min(claimed, dD)
        decreaseDebtOp(DEBT_DELTA),
        withdrawOp(RWA, WITHDRAW_RWA),
      ],
    });
  });

  it("2.5.2 (S=T=rwa.asset): claim=other → swap to U, repay, withdraw W", async () => {
    const claimed = 2n * WITHDRAW_ANY;
    const repay = 200000000000n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: RWA,
        withdrawToken: RWA,
        claimedToken: ANY,
        claimedAmount: claimed,
        debtRepaid: DEBT_DELTA,
        withdrawAmount: WITHDRAW_RWA,
        sdkExtras: {
          claimedToken: ANY,
          rwaAssets: { [UND]: RWA },
        },
      }),
    );
    expectAdjustResumePreview(result, {
      // claim 2000e8 und-worth, repay 2000e8; W not on CA
      totalValue: WITHDRAW_BASE_TV,
      accountDebt: WITHDRAW_PRE_D - repay,
      expectedOps: [
        claimOp(ANY, claimed),
        swapOp(ANY, claimed, UND, 200000000000n),
        // min(2000e8, dD)
        decreaseDebtOp(repay),
        withdrawOp(RWA, WITHDRAW_RWA),
      ],
    });
  });

  it("2.4.1 claims U, repays with the rest, then swaps W (rwa.asset)", async () => {
    const claimed = toBN("10000", 8);
    const result = await runWithdraw(
      resumeProps({
        sourceToken: ANY,
        withdrawToken: RWA,
        claimedToken: UND,
        claimedAmount: claimed,
        debtRepaid: DEBT_DELTA,
        withdrawAmount: WITHDRAW_RWA,
        sdkExtras: {
          claimedToken: UND,
          rwaAssets: { [UND]: RWA },
        },
      }),
    );
    expectAdjustResumePreview(result, {
      // claim +10000e8, repay −4000e8, withdraw W −2000e8 → +4000e8
      totalValue: WITHDRAW_BASE_TV + 400000000000n,
      accountDebt: WITHDRAW_PRE_D - DEBT_DELTA,
      expectedOps: [
        claimOp(UND, claimed),
        // min(claimed − wIn(=W, 1:1), dD) = min(8000e8, 4000e8)
        decreaseDebtOp(DEBT_DELTA),
        swapOp(UND, WITHDRAW_RWA, RWA, WITHDRAW_RWA),
        withdrawOp(RWA, WITHDRAW_RWA),
      ],
    });
  });

  it("2.4.2 claims W (rwa.asset): swaps only amount − W, withdraws reserved W", async () => {
    const claimed = 5n * WITHDRAW_RWA;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: ANY,
        withdrawToken: RWA,
        claimedToken: RWA,
        claimedAmount: claimed,
        debtRepaid: DEBT_DELTA,
        withdrawAmount: WITHDRAW_RWA,
        sdkExtras: {
          claimedToken: RWA,
          rwaAssets: { [UND]: RWA },
        },
      }),
    );
    expectAdjustResumePreview(result, {
      // claim +10000e8, repay −4000e8, withdraw −2000e8 → +4000e8
      totalValue: WITHDRAW_BASE_TV + 400000000000n,
      accountDebt: WITHDRAW_PRE_D - DEBT_DELTA,
      expectedOps: [
        claimOp(RWA, claimed),
        swapOp(RWA, claimed - WITHDRAW_RWA, UND, claimed - WITHDRAW_RWA),
        // min(8000e8, dD)
        decreaseDebtOp(DEBT_DELTA),
        withdrawOp(RWA, WITHDRAW_RWA),
      ],
    });
  });

  it("2.4.3 with rwa.asset T (no asset price): still reserves W from claim", async () => {
    // ACRED claim→USDC, withdraw RLUSD on dcRLUSD pool: pool prices often omit
    // rwa.asset, so W→claim must bridge via wrapped und.
    const claimAmount = 8_216_588_654n;
    const withdrawW = 2_000n * 10n ** 18n;
    const wInUsdc = 2_000n * 10n ** 6n;
    const result = await runWithdraw(
      resumeProps({
        sourceToken: ANY,
        withdrawToken: RWA_ASSET,
        claimedToken: CLAIM_USDC,
        claimedAmount: claimAmount,
        debtRepaid: DEBT_DELTA,
        withdrawAmount: withdrawW,
        sdkExtras: {
          claimedToken: CLAIM_USDC,
          extraPrices: { [CLAIM_USDC]: toBN("2", 8) },
          extraDecimals: { [CLAIM_USDC]: 6, [RWA_ASSET]: 18 },
          rwaAssets: { [UND]: RWA_ASSET },
        },
      }),
    );
    expectAdjustResumePreview(result, {
      // claim USDC worth 821658865400, repay 4000e8, withdraw W 2000e8 und-worth
      totalValue: WITHDRAW_BASE_TV + 221_658_865_400n,
      accountDebt: WITHDRAW_PRE_D - DEBT_DELTA,
      expectedOps: [
        claimOp(CLAIM_USDC, claimAmount),
        // debt leg: USDC(6dec) @ $2 → UND(8dec) @ $2 (×1e2)
        swapOp(CLAIM_USDC, claimAmount - wInUsdc, UND, 621658865400n),
        // min(621658865400n, dD)
        decreaseDebtOp(DEBT_DELTA),
        // W leg: USDC → UND → wrap rescale 8→18 decimals
        swapOp(CLAIM_USDC, wInUsdc, RWA_ASSET, withdrawW),
        withdrawOp(RWA_ASSET, withdrawW),
      ],
    });
  });
});
