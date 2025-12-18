import type { BaseState } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { bytes32ToString } from "../../utils/index.js";
import { LinearInterestRateModelContract } from "./LinearInterestRateModelContract.js";
import type {
  IInterestRateModelContract,
  InterestRateModelType,
} from "./types.js";

export default function createInterestRateModel(
  sdk: GearboxSDK,
  data: BaseState,
): IInterestRateModelContract {
  const { addr, contractType } = data.baseParams;
  const existing = sdk.getContract<IInterestRateModelContract>(addr);

  if (existing) {
    return existing;
  }
  const modelType = bytes32ToString(contractType) as InterestRateModelType;
  switch (modelType) {
    case "IRM::LINEAR": {
      return new LinearInterestRateModelContract(sdk, data);
    }
    default: {
      throw new Error(`Unknown interest rate model type: ${modelType}`);
    }
  }
}
