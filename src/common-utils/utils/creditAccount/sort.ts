import type { Address } from "viem";
import { type Asset, PRICE_DECIMALS } from "../../../sdk/index.js";
import { PriceUtils } from "../price-math.js";
import type { TokenDataSlice } from "./types.js";

/**
 * Sorts balance record entries by descending total value.
 *
 * Ordering uses `assetComparator` (value-desc, then amount-desc, then symbol-asc).
 *
 * @param balances Token balance map.
 * @param prices Token prices map.
 * @param tokens Token metadata map.
 * @returns Sorted `[token, balance]` tuples.
 */
export function sortBalances(
  balances: Record<Address, bigint>,
  prices: Record<Address, bigint>,
  tokens: Record<Address, TokenDataSlice>,
): Array<[Address, bigint]> {
  return (Object.entries(balances) as Array<[Address, bigint]>).sort(
    ([addr1, amount1], [addr2, amount2]) => {
      return assetComparator(
        {
          token: addr1,
          balance: amount1,
        },
        {
          token: addr2,
          balance: amount2,
        },
        prices,
        prices,
        tokens,
        tokens,
      );
    },
  );
}

/**
 * Sorts an asset array by descending total value.
 *
 * Ordering uses `assetComparator` (value-desc, then amount-desc, then symbol-asc).
 *
 * @param balances Asset list to sort.
 * @param prices Token prices map.
 * @param tokens Token metadata map.
 * @returns New sorted array (input is not mutated).
 */
export function sortAssets<T extends Asset>(
  balances: Array<T>,
  prices: Record<Address, bigint>,
  tokens: Record<Address, TokenDataSlice>,
) {
  return [...balances].sort((t1, t2) =>
    assetComparator(t1, t2, prices, prices, tokens, tokens),
  );
}

/**
 * Compares two assets for deterministic sorting.
 *
 * Priority:
 * 1) higher total value (price * amount) first
 * 2) higher raw balance first when values are equal
 * 3) token symbol alphabetical order when balances are equal
 *
 * Missing prices fall back to `PRICE_DECIMALS`; missing token metadata
 * is tolerated.
 *
 * @returns Comparator result suitable for `Array.prototype.sort`.
 */
export function assetComparator<T extends Asset>(
  t1: T,
  t2: T,

  prices1: Record<Address, bigint> | undefined,
  prices2: Record<Address, bigint> | undefined,

  tokens1: Record<Address, TokenDataSlice> | undefined,
  tokens2: Record<Address, TokenDataSlice> | undefined,
) {
  const addr1Lc = t1.token.toLowerCase() as Address;
  const addr2Lc = t2.token.toLowerCase() as Address;

  const token1 = tokens1?.[addr1Lc];
  const token2 = tokens2?.[addr2Lc];

  const price1 = prices1?.[addr1Lc] || PRICE_DECIMALS;
  const price2 = prices2?.[addr2Lc] || PRICE_DECIMALS;

  const totalPrice1 = PriceUtils.calcTotalPrice(
    price1,
    t1.balance,
    token1?.decimals,
  );
  const totalPrice2 = PriceUtils.calcTotalPrice(
    price2,
    t2.balance,
    token2?.decimals,
  );

  if (totalPrice1 === totalPrice2) {
    return t1.balance === t2.balance
      ? tokensAbcComparator(token1, token2)
      : amountAbcComparator(t1.balance, t2.balance);
  }

  return amountAbcComparator(totalPrice1, totalPrice2);
}

/**
 * Alphabetical comparator for token symbols (case-insensitive).
 *
 * @param t1 First token metadata.
 * @param t2 Second token metadata.
 * @returns `-1`, `0`, or `1` for ascending symbol order.
 */
export function tokensAbcComparator(t1?: TokenDataSlice, t2?: TokenDataSlice) {
  const { symbol: symbol1 = "" } = t1 || {};
  const { symbol: symbol2 = "" } = t2 || {};
  const symbol1LC = symbol1.toLowerCase();
  const symbol2LC = symbol2.toLowerCase();

  if (symbol1LC === symbol2LC) return 0;
  return symbol1LC > symbol2LC ? 1 : -1;
}

/**
 * Descending numeric comparator for bigint amounts.
 *
 * @param t1 First amount.
 * @param t2 Second amount.
 * @returns `-1` when `t1` should come before `t2`, otherwise `1`.
 */
export function amountAbcComparator(t1: bigint, t2: bigint) {
  return t1 > t2 ? -1 : 1;
}
