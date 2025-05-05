import type { CreditSuiteState } from "../../base/index.js";
import { isV300, isV310 } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { CreditManagerV300Contract } from "./CreditManagerV300Contract.js";
import { CreditManagerV310Contract } from "./CreditManagerV310Contract.js";
import type { ICreditManagerContract } from "./types.js";

export default function createCreditManager(
  sdk: GearboxSDK,
  data: CreditSuiteState,
): ICreditManagerContract {
  const v = data.creditManager.baseParams.version;
  if (isV300(v)) {
    return new CreditManagerV300Contract(sdk, data);
  } else if (isV310(v)) {
    return new CreditManagerV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit manager version: ${v}`);
}
