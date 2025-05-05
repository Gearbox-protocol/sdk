import type { CreditSuiteState } from "../../base/index.js";
import { isV300, isV310 } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { CreditConfiguratorV300Contract } from "./CreditConfiguratorV300Contract.js";
import { CreditConfiguratorV310Contract } from "./CreditConfiguratorV310Contract.js";
import type { ICreditConfiguratorContract } from "./types.js";

export default function createCreditConfigurator(
  sdk: GearboxSDK,
  data: CreditSuiteState,
): ICreditConfiguratorContract {
  const v = data.creditConfigurator.baseParams.version;
  if (isV300(v)) {
    return new CreditConfiguratorV300Contract(sdk, data);
  } else if (isV310(v)) {
    return new CreditConfiguratorV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit configurator version: ${v}`);
}
