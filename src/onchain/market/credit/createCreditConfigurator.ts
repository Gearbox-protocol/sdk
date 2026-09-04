import type { CreditSuiteState } from "../../base/index.js";
import { isV310 } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { CreditConfiguratorV310Contract } from "./CreditConfiguratorV310Contract.js";
import type { ICreditConfiguratorContract } from "./types.js";

export default function createCreditConfigurator(
  sdk: OnchainSDK,
  data: CreditSuiteState,
): ICreditConfiguratorContract {
  const v = data.creditConfigurator.baseParams.version;
  if (isV310(v)) {
    return new CreditConfiguratorV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit configurator version: ${v}`);
}
