import type { Address } from "viem";

import type { TokenData } from "../tokens/tokenData";
import { nonNegativeBn } from "../utils/math";
import { PriceUtils } from "../utils/price";
import { CreditAccountData } from "./creditAccount";

export interface Asset {
  token: Address;
  balance: bigint;
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
  tokensList: Record<Address, TokenData>;
  prices?: Record<Address, bigint>;
}

export type WrapResult = [Array<Asset>, bigint, bigint];

export class AssetUtils {
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

    const sorted = CreditAccountData.sortBalances(
      AssetUtils.getBalances(notSelected, balances),
      prices,
      tokensList,
    );

    const [address] = sorted[0] || [];

    return address;
  }

  static getBalances(
    allowedTokens: Array<Address>,
    externalBalances: Record<Address, bigint>,
  ): Record<Address, bigint> {
    return allowedTokens.reduce((acc, address) => {
      const addressLc = address.toLowerCase() as Address;
      return {
        ...acc,
        [addressLc]: externalBalances[addressLc] || 0n,
      };
    }, {});
  }

  static constructAssetRecord<A extends Asset>(a: Array<A>) {
    const record = a.reduce<Record<Address, A>>((acc, asset) => {
      acc[asset.token] = asset;
      return acc;
    }, {});
    return record;
  }

  static memoWrap = (
    unwrappedAddress: Address,
    wrappedAddress: Address,
    prices: Record<Address, bigint>,
    tokensList: Record<Address, TokenData>,
  ) =>
    function wrap(assets: Array<Asset>): WrapResult {
      const assetsRecord = AssetUtils.constructAssetRecord(assets);

      const unwrapped = assetsRecord[unwrappedAddress];

      const wrapped = assetsRecord[wrappedAddress];
      const { balance: wrappedAmount = 0n } = wrapped || {};

      // if there unwrapped token
      if (unwrapped) {
        const { balance: unwrappedAmount = 0n } = unwrapped || {};

        const unwrappedToken = tokensList[unwrappedAddress];
        const unwrappedPrice = prices[unwrappedAddress] || 0n;

        const wrappedToken = tokensList[wrappedAddress];
        const wrappedPrice = prices[wrappedAddress] || 0n;

        // convert unwrapped into wrapped by price
        const unwrappedInWrapped = PriceUtils.convertByPrice(
          PriceUtils.calcTotalPrice(
            unwrappedPrice,
            nonNegativeBn(unwrappedAmount),
            unwrappedToken.decimals,
          ),
          {
            price: wrappedPrice,
            decimals: wrappedToken.decimals,
          },
        );

        // sum them
        assetsRecord[wrappedAddress] = {
          token: wrappedAddress,
          balance: nonNegativeBn(wrappedAmount) + unwrappedInWrapped,
        };
        // remove unwrapped
        delete assetsRecord[unwrappedAddress];

        return [Object.values(assetsRecord), unwrappedInWrapped, wrappedAmount];
      }
      // else no actions needed
      return [Object.values(assetsRecord), 0n, wrappedAmount];
    };

  /**
   * Sums the the second assets list into the first assets list
   * Balances cant be negative; creates new assets.
   */
  static sumAssets<A extends Asset, B extends Asset>(
    a: Array<A>,
    b: Array<B>,
  ): Array<A | B> {
    const aRecord = AssetUtils.constructAssetRecord(a);

    const resRecord = b.reduce<Record<Address, A | B>>((acc, bAsset) => {
      const aAsset = acc[bAsset.token];
      const { balance: amount = 0n } = aAsset || {};

      const amountSum = nonNegativeBn(bAsset.balance) + nonNegativeBn(amount);
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
   * Sums the the second assets list into the first assets list
   * Balances cant be negative; doesn't create new assets.
   */
  static addBalances<A extends Asset, B extends Asset>(
    a: Array<A>,
    b: Array<B>,
  ): Array<A | B> {
    const bRecord = AssetUtils.constructAssetRecord(b);

    return a.map(asset => {
      const bAsset = bRecord[asset.token];
      const { balance: bAmount = 0n } = bAsset || {};

      const amountSum = nonNegativeBn(asset.balance) + nonNegativeBn(bAmount);
      return { ...asset, balance: nonNegativeBn(amountSum) };
    });
  }

  /**
   * Subtracts the the second assets list from the first assets list
   * Balances cant be negative; doesn't create new assets.
   */
  static subAssets<A extends Asset, B extends Asset>(
    a: Array<A>,
    b: Array<B>,
  ): Array<A> {
    const bRecord = AssetUtils.constructAssetRecord(b);

    return a.map(asset => {
      const bAsset = bRecord[asset.token];
      const { balance: bAmount = 0n } = bAsset || {};

      const amountSub = nonNegativeBn(asset.balance) - nonNegativeBn(bAmount);
      return { ...asset, balance: nonNegativeBn(amountSub) };
    });
  }
}
