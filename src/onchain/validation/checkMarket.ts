import type {
  CreditManagerPausedError,
  MarketExpiredError,
} from "../../model/index.js";
import type { CreditSuite } from "../market/credit/CreditSuite.js";
import {
  checkCreditManagerPaused,
  checkMarketExpired,
} from "./checks/index.js";

/** {@inheritDoc checkMarket} */
export type MarketStateError = CreditManagerPausedError | MarketExpiredError;

/**
 * What the market itself stops, whatever the operation does.
 *
 * Neither state is anything the sender can fix, which is why it comes first
 * wherever it is composed in.
 */
export function checkMarket(suite: CreditSuite): MarketStateError[] {
  const creditManager = suite.creditManager.address;
  return [
    ...checkCreditManagerPaused({ isPaused: suite.isPaused, creditManager }),
    ...checkMarketExpired({
      isExpired: suite.isExpired,
      creditManager,
      expirationDate: suite.creditFacade.expirationDate,
    }),
  ];
}
