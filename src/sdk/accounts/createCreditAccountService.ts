import { isV300, isV310 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { CreditAccountServiceV300 } from "./CreditAccountsServiceV300.js";
import { CreditAccountServiceV310 } from "./CreditAccountsServiceV310.js";
import type { CreditAccountsServiceInstance } from "./types.js";

/**
 * @sdk
 * @version version of desired credit facade; if no credit facade is considered (you only want to get ca list), either v300 or v310 is fine)
 * @returns
 */
export function createCreditAccountService(
  sdk: GearboxSDK,
  version: number,
): CreditAccountsServiceInstance {
  if (isV300(version)) {
    return new CreditAccountServiceV300(sdk);
  }
  if (isV310(version)) {
    return new CreditAccountServiceV310(sdk);
  }
  throw new Error(`Unsupported Credit Account Service version ${version}`);
}
