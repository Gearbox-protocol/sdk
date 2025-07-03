import { isV300, isV310 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { AbstractCreditAccountService } from "./AbstractCreditAccountsService.js";
import { CreditAccountServiceV300 } from "./CreditAccountsServiceV300.js";
import { CreditAccountServiceV310 } from "./CreditAccountsServiceV310.js";
import type { ICreditAccountsService } from "./types.js";

export function createRouter(
  sdk: GearboxSDK,
  version: number,
): AbstractCreditAccountService & ICreditAccountsService {
  if (isV300(version)) {
    return new CreditAccountServiceV300(sdk);
  }
  if (isV310(version)) {
    return new CreditAccountServiceV310(sdk);
  }
  throw new Error(`Unsupported Credit Account Service version ${version}`);
}
