import type { BaseState } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { bytes32ToString } from "../../utils";
import { LinearInterestRateModelContract } from "./LinearInterestRateModelContract";
import type {
  IInterestRateModelContract,
  InterestRateModelType,
} from "./types";

export default function createInterestRateModel(
  sdk: GearboxSDK,
  data: BaseState,
): IInterestRateModelContract {
  const { addr, contractType } = data.baseParams;

  if (sdk.interestRateModels.has(addr)) {
    return sdk.interestRateModels.mustGet(
      addr,
    ) as any as IInterestRateModelContract;
  } else {
    const modelType = bytes32ToString(contractType) as InterestRateModelType;
    switch (modelType) {
      case "IRM::LINEAR": {
        const linearModel = new LinearInterestRateModelContract(sdk, data);
        sdk.interestRateModels.insert(addr, linearModel as any);
        return linearModel;
      }
      default: {
        throw new Error(`Unknown interest rate model type: ${modelType}`);
      }
    }
  }
}
