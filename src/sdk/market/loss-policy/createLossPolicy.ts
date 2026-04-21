import type { BaseState } from "../../base/index.js";
import { bytes32ToString } from "../../index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AliasLossPolicyV310Contract } from "./AliasLossPolicyV310Contract.js";
import { LOSS_POLICY_ALIASED, LOSS_POLICY_DEFAULT } from "./constants.js";
import { LossPolicyContract } from "./LossPolicyContract.js";
import type { ILossPolicyContract } from "./types.js";

export function createLossPolicy(
  sdk: OnchainSDK,
  { baseParams }: BaseState,
): ILossPolicyContract {
  const existing = sdk.getContract<ILossPolicyContract>(baseParams.addr);
  if (existing) {
    return existing;
  }
  const contractType = bytes32ToString(baseParams.contractType);

  switch (contractType) {
    case LOSS_POLICY_ALIASED:
      return new AliasLossPolicyV310Contract(sdk, baseParams);
    case LOSS_POLICY_DEFAULT:
      return new LossPolicyContract(sdk, baseParams);
    default:
      if (sdk.strictContractTypes) {
        throw new Error(`unsupported loss policy type ${contractType}`);
      }
      return new LossPolicyContract(sdk, baseParams);
  }
}
