import type { CreditSuiteState } from "../../base/index.js";
import { isV300, isV310 } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { CreditFacadeV300Contract } from "./CreditFacadeV300Contract.js";
import { CreditFacadeV310Contract } from "./CreditFacadeV310Contract.js";
import type { CreditFacadeContract } from "./types.js";

export default function createCreditFacade(
  sdk: GearboxSDK,
  data: CreditSuiteState,
): CreditFacadeContract {
  const v = data.creditFacade.baseParams.version;
  if (isV300(v)) {
    return new CreditFacadeV300Contract(sdk, data);
  } else if (isV310(v)) {
    return new CreditFacadeV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit facade version: ${v}`);
}
