import type { Address } from "viem";
import type {
  Asset,
  MultiCall,
  OnchainSDK,
  PermitResult,
  RouterCASlice,
} from "../../../../index.js";

export interface RepayCreditAccountOperation {
  type: "repayCreditAccount";
  expectedRepayAsset?: Asset[];
  expectedWithdrawAssets?: Asset[];
  value?: bigint;
  calls: MultiCall[];
}

export async function buildRepayCreditAccountOperation(
  input: {
    expectedRepayAsset?: Asset[];
    expectedWithdrawAssets?: Asset[];
    value?: bigint;
    sdk: OnchainSDK;
  },
  option:
    | { kind: "offchain" }
    | {
        kind: "onchain";
        to: Address;
        permits: Record<string, PermitResult>;
        creditAccount: RouterCASlice;
        tokensToClaim: Asset[];
        wrapCalls?: MultiCall[];
      },
): Promise<RepayCreditAccountOperation> {
  const calls =
    option.kind === "onchain"
      ? await input.sdk.accounts.assembleRepayCreditAccountCalls({
          collateralAssets: input.expectedRepayAsset ?? [],
          assetsToWithdraw: input.expectedWithdrawAssets ?? [],
          creditAccount: option.creditAccount,
          permits: option.permits,
          to: option.to,
          tokensToClaim: option.tokensToClaim,
          calls: option.wrapCalls,
        })
      : [];

  return {
    type: "repayCreditAccount",
    expectedRepayAsset: input.expectedRepayAsset,
    expectedWithdrawAssets: input.expectedWithdrawAssets,
    value: input.value,
    calls,
  };
}
