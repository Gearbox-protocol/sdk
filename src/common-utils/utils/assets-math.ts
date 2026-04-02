import type { Address } from "viem";
import type { Asset } from "../../sdk/index.js";
import { BigIntMath } from "./bigint-math.js";
import { sortBalances } from "./creditAccount/sort.js";
import { PriceUtils } from "./price-math.js";

interface TokenDataSlice {
  symbol: string;
  decimals: number;
}

export interface AssetWithView extends Asset {
  balanceView: string;
}

export interface AssetWithAmountInTarget extends Asset {
  amountInTarget: bigint;
}

interface NextAssetProps<T extends Asset> {
  allowedTokens: Array<Address>;
  selectedAssets: Array<T>;
  balances: Record<Address, bigint>;
  tokensList: Record<Address, TokenDataSlice>;
  prices?: Record<Address, bigint>;
}

export type WrapResult = [Array<Asset>, bigint, bigint];

/**
 * Static helper namespace for asset-list transformations and math.
 *
 * The constructor is intentionally private to prevent instantiation.
 */
export class AssetUtils {
  private constructor() {}
  /**
   * Selects the next candidate token to add to a selected-asset list.
   *
   * Flow:
   * 1) Removes tokens already present in `selectedAssets`
   * 2) Builds balances for the remaining allowed tokens
   * 3) Sorts the balances using `CreditAccountDataUtils.sortBalances`
   * 4) Returns the highest-priority token address, if any
   *
   * Addresses are normalized to lowercase for matching.
   *
   * @returns The next token address to select, or `undefined` if no candidates remain.
   */
  static nextAsset<T extends Asset>({
    allowedTokens,
    selectedAssets,
    balances,
    tokensList,
    prices = {},
  }: NextAssetProps<T>): Address | undefined {
    const selectedRecord = selectedAssets.reduce<Record<Address, true>>(
      (acc, { token }) => {
        acc[token.toLowerCase() as Address] = true;
        return acc;
      },
      {},
    );

    const notSelected = allowedTokens.filter(allowedToken => {
      const alreadySelected =
        selectedRecord[allowedToken.toLowerCase() as Address];
      return !alreadySelected;
    });

    const sorted = sortBalances(
      AssetUtils.getBalances(notSelected, balances),
      prices,
      tokensList,
    );

    const [address] = sorted[0] || [];

    return address;
  }

  /**
   * Builds a normalized balance record for a specific token subset.
   *
   * Missing balances are defaulted to `0n`.
   *
   * @param allowedTokens Tokens to include in the output record.
   * @param externalBalances Source balances keyed by lowercase address.
   * @returns A record that contains only `allowedTokens`.
   */
  private static getBalances(
    allowedTokens: Array<Address>,
    externalBalances: Record<Address, bigint>,
  ): Record<Address, bigint> {
    return allowedTokens.reduce<Record<Address, bigint>>((acc, address) => {
      const addressLc = address.toLowerCase() as Address;

      acc[addressLc] = externalBalances[addressLc] || 0n;

      return acc;
    }, {});
  }

  /**
   * Converts an asset array into a token-address keyed record.
   *
   * If duplicate token addresses are present, the last occurrence wins.
   *
   * @param a Source asset list.
   * @returns Record keyed by `asset.token`.
   */
  static constructAssetRecord<A extends Asset>(a: Array<A>) {
    const record = a.reduce<Record<Address, A>>((acc, asset) => {
      acc[asset.token] = asset;
      return acc;
    }, {});
    return record;
  }

  /**
   * Creates a reusable wrapper function that merges "unwrapped" and "wrapped"
   * token balances into the wrapped token representation.
   *
   * The returned function:
   * - converts non-negative unwrapped balance into wrapped units by price
   * - adds the converted amount to the wrapped token balance
   * - removes the unwrapped token from the result list
   * - leaves input untouched when no unwrapped token is present
   *
   * @returns A function producing `[assets, convertedUnwrapped, originalWrapped]`.
   */
  static memoWrap = (
    unwrappedAddress: Address,
    wrappedAddress: Address,
    prices: Record<Address, bigint>,
    tokensList: Record<Address, TokenDataSlice>,
  ) =>
    function wrap(assets: Array<Asset>): WrapResult {
      const assetsRecord = AssetUtils.constructAssetRecord(assets);

      const unwrapped = assetsRecord[unwrappedAddress];

      const wrapped = assetsRecord[wrappedAddress];
      const { balance: wrappedAmount = 0n } = wrapped || {};

      // If an unwrapped token exists, convert and merge it into wrapped.
      if (unwrapped) {
        const { balance: unwrappedAmount = 0n } = unwrapped || {};

        const unwrappedToken = tokensList[unwrappedAddress];
        const unwrappedPrice = prices[unwrappedAddress] || 0n;

        const wrappedToken = tokensList[wrappedAddress];
        const wrappedPrice = prices[wrappedAddress] || 0n;

        // Convert unwrapped token amount into wrapped token units.
        const unwrappedInWrapped = PriceUtils.convertByPrice(
          PriceUtils.calcTotalPrice(
            unwrappedPrice,
            BigIntMath.max(0n, unwrappedAmount),
            unwrappedToken.decimals,
          ),
          {
            price: wrappedPrice,
            decimals: wrappedToken.decimals,
          },
        );

        // Add converted amount to wrapped token balance.
        assetsRecord[wrappedAddress] = {
          token: wrappedAddress,
          balance: BigIntMath.max(0n, wrappedAmount) + unwrappedInWrapped,
        };
        // Remove unwrapped token entry after consolidation.
        delete assetsRecord[unwrappedAddress];

        return [Object.values(assetsRecord), unwrappedInWrapped, wrappedAmount];
      }
      // No unwrapped token found, return assets as-is.
      return [Object.values(assetsRecord), 0n, wrappedAmount];
    };

  /**
   * Adds balances from the second asset list into the first list.
   *
   * Behavior:
   * - balances are clamped to non-negative before summation
   * - tokens found only in `b` are created in the output
   * - existing asset metadata is preserved from `a` when possible
   *
   * @param a Base asset list.
   * @param b Asset deltas to add.
   * @returns A merged list containing assets from both inputs.
   */
  static sumAssets<A extends Asset, B extends Asset>(
    a: Array<A>,
    b: Array<B>,
  ): Array<A | B> {
    const aRecord = AssetUtils.constructAssetRecord(a);

    const resRecord = b.reduce<Record<Address, A | B>>((acc, bAsset) => {
      const aAsset = acc[bAsset.token];
      const { balance: amount = 0n } = aAsset || {};

      const amountSum =
        BigIntMath.max(0n, bAsset.balance) + BigIntMath.max(0n, amount);
      const aOrB = aAsset || bAsset;

      acc[bAsset.token] = {
        ...aOrB,
        balance: amountSum,
      };

      return acc;
    }, aRecord);

    return Object.values(resRecord);
  }

  /**
   * Adds balances from the second list to matching assets in the first list.
   *
   * Behavior:
   * - balances are clamped to non-negative before summation
   * - only assets already present in `a` are returned
   * - no new token entries are created
   *
   * @param a Base asset list.
   * @param b Asset deltas keyed by token.
   * @returns Updated version of `a` with adjusted balances.
   */
  static addBalances<A extends Asset, B extends Asset>(
    a: Array<A>,
    b: Array<B>,
  ): Array<A | B> {
    const bRecord = AssetUtils.constructAssetRecord(b);

    return a.map(asset => {
      const bAsset = bRecord[asset.token];
      const { balance: bAmount = 0n } = bAsset || {};

      const amountSum =
        BigIntMath.max(0n, asset.balance) + BigIntMath.max(0n, bAmount);
      return { ...asset, balance: amountSum };
    });
  }

  /**
   * Subtracts balances in the second list from matching assets in the first list.
   *
   * Behavior:
   * - both operands are clamped to non-negative before subtraction
   * - output balances are clamped to non-negative after subtraction
   * - only assets already present in `a` are returned
   *
   * @param a Base asset list.
   * @param b Asset amounts to subtract by token.
   * @returns Updated `a` list with non-negative post-subtraction balances.
   */
  static subAssets<A extends Asset, B extends Asset>(
    a: Array<A>,
    b: Array<B>,
  ): Array<A> {
    const bRecord = AssetUtils.constructAssetRecord(b);

    return a.map(asset => {
      const bAsset = bRecord[asset.token];
      const { balance: bAmount = 0n } = bAsset || {};

      const amountSub =
        BigIntMath.max(0n, asset.balance) - BigIntMath.max(0n, bAmount);
      return { ...asset, balance: BigIntMath.max(0n, amountSub) };
    });
  }
}
