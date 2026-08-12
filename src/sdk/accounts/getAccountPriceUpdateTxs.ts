import { DUST_THRESHOLD } from "../constants/index.js";
import type {
  IPriceFeedContract,
  UpdatePriceFeedsResult,
} from "../market/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { AddressSet } from "../utils/index.js";
import type { CreditAccountTokensSlice } from "./types.js";

/**
 * @internal
 * Generates the price feed update transactions an account needs to be valued:
 * one per price feed of its underlying and of every enabled token it holds a
 * non-dust balance of.
 *
 * @param sdk - SDK instance, for market lookup and price feed generation.
 * @param account - Account whose tokens to cover.
 * @param ignoreReservePrices - When true, only main price feeds are updated.
 **/
export async function getAccountPriceUpdateTxs(
  sdk: OnchainSDK,
  account: CreditAccountTokensSlice,
  ignoreReservePrices?: boolean,
): Promise<UpdatePriceFeedsResult> {
  const { creditManager, creditAccount, enabledTokensMask } = account;
  const market = sdk.marketRegister.findByCreditManager(creditManager);
  const cm = sdk.marketRegister.findCreditManager(creditManager).creditManager;

  // underlying - always included
  const tokens = new AddressSet([cm.underlying]);

  // enabled tokens with non-zero balance
  for (const t of account.tokens) {
    const isEnabled = (t.mask & enabledTokensMask) !== 0n;
    if (t.balance > DUST_THRESHOLD && isEnabled) {
      tokens.add(t.token);
    }
  }

  const priceFeeds: Array<IPriceFeedContract> =
    market.priceOracle.priceFeedsForTokens(Array.from(tokens), {
      main: true,
      reserve: !ignoreReservePrices,
    });
  const tStr = tokens.map(t => sdk.labelAddress(t)).join(", ");
  const remark = ignoreReservePrices ? " main" : "";
  sdk.logger?.debug(
    { account: creditAccount, manager: cm.name },
    `generating price feed updates for ${tStr} from ${priceFeeds.length}${remark} price feeds`,
  );
  return sdk.priceFeeds.generatePriceFeedsUpdateTxs(priceFeeds);
}
