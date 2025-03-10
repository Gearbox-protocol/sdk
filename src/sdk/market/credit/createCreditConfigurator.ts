import type { CreditManagerData } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { CreditConfiguratorV300Contract } from "./CreditConfiguratorV300Contract.js";
import { CreditConfiguratorV310Contract } from "./CreditConfiguratorV310Contract.js";
import type { ICreditConfiguratorContract } from "./types.js";

export default function createCreditConfigurator(
  sdk: GearboxSDK,
  data: CreditManagerData,
): ICreditConfiguratorContract {
  const v = data.creditConfigurator.baseParams.version;
  if (v >= 300 && v < 310) {
    return new CreditConfiguratorV300Contract(sdk, data);
  } else if (v === 310n) {
    return new CreditConfiguratorV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit configurator version: ${v}`);
}
