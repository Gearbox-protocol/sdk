import type {
  BaseContractStateHuman,
  WithdrawableAsset as WithdrawableAssetBase,
} from "../../sdk/index.js";

export interface WithdrawableAsset extends WithdrawableAssetBase {
  disabled: boolean;
}

export interface WithdrawableAssetStateHuman
  extends WithdrawableAsset,
    BaseContractStateHuman {}
