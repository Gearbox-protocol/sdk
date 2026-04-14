import { isV310 } from "../constants/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { CreditAccountServiceOptions } from "./AbstractCreditAccountsService.js";
import { CreditAccountServiceV310 } from "./CreditAccountsServiceV310.js";
import type { ICreditAccountsService } from "./types.js";

/**
 * @sdk
 * @version version of desired credit facade
 * @returns
 */
export function createCreditAccountService(
  sdk: OnchainSDK,
  version: number,
  options?: CreditAccountServiceOptions,
): ICreditAccountsService {
  if (isV310(version)) {
    return new CreditAccountServiceV310(sdk, options);
  }
  throw new Error(`Unsupported Credit Account Service version ${version}`);
}
