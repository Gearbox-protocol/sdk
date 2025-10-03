import type { Address, GetContractReturnType, PublicClient } from "viem";
import type { iWithdrawalCompressorV310Abi } from "../../abi/IWithdrawalCompressorV310.js";
import type { BaseContractStateHuman } from "../../sdk/index.js";

type WithdrawalCompressorV310InstanceType = GetContractReturnType<
  typeof iWithdrawalCompressorV310Abi,
  PublicClient
>;

export type WithdrawableAsset = Awaited<
  ReturnType<
    WithdrawalCompressorV310InstanceType["read"]["getWithdrawableAssets"]
  >
>[number] & {
  creditManager: Address;
};

export interface WithdrawableAssetStateHuman
  extends WithdrawableAsset,
    BaseContractStateHuman {}
