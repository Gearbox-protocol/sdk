import type { CreditSuiteState } from "../../base/index.js";
import { isV310 } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { CreditFacadeV310Contract } from "./CreditFacadeV310Contract.js";
import type { ICreditFacadeContract } from "./types.js";

export default function createCreditFacade(
  sdk: OnchainSDK,
  data: CreditSuiteState,
): ICreditFacadeContract {
  const v = data.creditFacade.baseParams.version;
  if (isV310(v)) {
    return new CreditFacadeV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit facade version: ${v}`);
}
