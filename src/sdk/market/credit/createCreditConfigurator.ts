import type { CreditManagerData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { CreditConfiguratorV300Contract } from "./CreditConfiguratorV300Contract";
import { CreditConfiguratorV310Contract } from "./CreditConfiguratorV310Contract";
import type { ICreditConfiguratorContract } from "./types";

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
