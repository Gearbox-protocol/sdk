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

export async function buildRepayCreditAccountOperation(input: {
  expectedRepayAsset?: Asset[];
  expectedWithdrawAssets?: Asset[];
  value?: bigint;
  to: Address;
  permits: Record<string, PermitResult>;
  creditAccount: RouterCASlice;
  tokensToClaim: Asset[];
  wrapCalls?: MultiCall[];
  sdk: OnchainSDK;
}): Promise<RepayCreditAccountOperation> {
  return {
    type: "repayCreditAccount",
    expectedRepayAsset: input.expectedRepayAsset,
    expectedWithdrawAssets: input.expectedWithdrawAssets,
    value: input.value,
    calls: await input.sdk.accounts.assembleRepayCreditAccountCalls({
      collateralAssets: input.expectedRepayAsset ?? [],
      assetsToWithdraw: input.expectedWithdrawAssets ?? [],
      creditAccount: input.creditAccount,
      permits: input.permits,
      to: input.to,
      tokensToClaim: input.tokensToClaim,
      calls: input.wrapCalls,
    }),
  };
}
