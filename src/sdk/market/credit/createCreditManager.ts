import type { CreditManagerData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { CreditManagerV300Contract } from "./CreditManagerV300Contract";
import { CreditManagerV310Contract } from "./CreditManagerV310Contract";
import type { ICreditManagerContract } from "./types";

export default function createCreditManager(
  sdk: GearboxSDK,
  data: CreditManagerData,
): ICreditManagerContract {
  const v = data.creditManager.baseParams.version;
  if (v >= 300 && v < 310) {
    return new CreditManagerV300Contract(sdk, data);
  } else if (v === 310n) {
    return new CreditManagerV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit manager version: ${v}`);
}
