import { isV300, isV310 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { CreditAccountServiceOptions } from "./AbstractCreditAccountsService.js";
import { CreditAccountServiceV300 } from "./CreditAccountsServiceV300.js";
import { CreditAccountServiceV310 } from "./CreditAccountsServiceV310.js";
import type { CreditAccountsServiceInstance } from "./types.js";

/**
 * @sdk
 * @version version of desired credit facade; if no credit facade is considered (you only want to get ca list), either v300 or v310 is fine, because ca compressor has nothing to do with credit facade version
 * @returns
 */
export function createCreditAccountService(
  sdk: GearboxSDK,
  version: number,
  options?: CreditAccountServiceOptions,
): CreditAccountsServiceInstance {
  if (isV300(version)) {
    return new CreditAccountServiceV300(sdk, options);
  }
  if (isV310(version)) {
    return new CreditAccountServiceV310(sdk, options);
  }
  throw new Error(`Unsupported Credit Account Service version ${version}`);
}
