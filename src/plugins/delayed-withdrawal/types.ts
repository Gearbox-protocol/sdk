import type {
  BaseContractStateHuman,
  WithdrawableAsset as WithdrawableAssetBase,
} from "../../onchain/index.js";

export interface WithdrawableAsset extends WithdrawableAssetBase {
  disabled: boolean;
}

export interface WithdrawableAssetStateHuman
  extends WithdrawableAsset,
    BaseContractStateHuman {}
