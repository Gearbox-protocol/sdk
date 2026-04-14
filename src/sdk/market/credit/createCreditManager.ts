import type { CreditSuiteState } from "../../base/index.js";
import { isV310 } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { CreditManagerV310Contract } from "./CreditManagerV310Contract.js";
import type { ICreditManagerContract } from "./types.js";

export default function createCreditManager(
  sdk: OnchainSDK,
  data: CreditSuiteState,
): ICreditManagerContract {
  const v = data.creditManager.baseParams.version;
  if (isV310(v)) {
    return new CreditManagerV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit manager version: ${v}`);
}
