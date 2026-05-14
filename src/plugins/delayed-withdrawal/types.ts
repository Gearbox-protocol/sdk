import type { Address, GetContractReturnType, PublicClient } from "viem";
import type { iWithdrawalCompressorV310Abi } from "../../abi/IWithdrawalCompressorV310.js";
import type { iWithdrawalCompressorV311Abi } from "../../abi/IWithdrawalCompressorV311.js";
import type { BaseContractStateHuman } from "../../sdk/index.js";

type WithdrawalCompressorV310InstanceType = GetContractReturnType<
  typeof iWithdrawalCompressorV310Abi,
  PublicClient
>;
type WithdrawalCompressorV311InstanceType = GetContractReturnType<
  typeof iWithdrawalCompressorV311Abi,
  PublicClient
>;

type WithdrawableAssetV310 = Awaited<
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

type WithdrawableAssetV311 = Awaited<
  ReturnType<
    WithdrawalCompressorV311InstanceType["read"]["getWithdrawableAssets"]
  >
>[number] & {
  creditManager: Address;
  disabled: boolean;
  // token - source token (ex. rstETH)
  // withdrawalPhantomToken -> withdrawal phantom token (ex. wdwstETH)
  // wstETH -> target token (ex. wstETH)
};

type CommonType = WithdrawableAssetV310 &
  Partial<Omit<WithdrawableAssetV311, keyof WithdrawableAssetV310>>;

export type WithdrawableAsset = CommonType;

export interface WithdrawableAssetStateHuman
  extends CommonType,
    BaseContractStateHuman {}
