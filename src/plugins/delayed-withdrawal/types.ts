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
  disabled: boolean;
  // token - source token (ex. rstETH)
  // withdrawalPhantomToken -> withdrawal phantom token (ex. wdwstETH)
  // wstETH -> target token (ex. wstETH)
};

export interface WithdrawableAssetStateHuman
  extends WithdrawableAsset,
    BaseContractStateHuman {}
