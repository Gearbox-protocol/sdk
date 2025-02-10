import type { CreditManagerData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { CreditFacadeV300Contract } from "./CreditFacadeV300Contract";
import { CreditFacadeV310Contract } from "./CreditFacadeV310Contract";
import type { CreditFacadeContract } from "./types";

export default function createCreditFacade(
  sdk: GearboxSDK,
  data: CreditManagerData,
): CreditFacadeContract {
  const v = data.creditFacade.baseParams.version;
  if (v >= 300 && v < 310) {
    return new CreditFacadeV300Contract(sdk, data);
  } else if (v === 310n) {
    return new CreditFacadeV310Contract(sdk, data);
  }
  throw new Error(`Unsupported credit facade version: ${v}`);
}
