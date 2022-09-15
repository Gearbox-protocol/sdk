import { BigNumber } from "ethers";

import { TokensWithAPY } from "../apy";
import { TokenData } from "../tokens/tokenData";
import { nonNegativeBn } from "../utils/math";
import { sortBalances } from "./creditAccount";

export interface Asset {
  token: string;
  balance: BigNumber;
}

export interface LpAsset extends Asset {
  symbol: TokensWithAPY;
  name: string;
}

interface NextAssetProps<T extends Asset> {
  allowedTokens: Array<string>;
  selectedAssets: Array<T>;
  balances: Record<string, BigNumber>;
  tokensList: Record<string, TokenData>;
  prices?: Record<string, BigNumber>;
}

export function nextAsset<T extends Asset>({
  allowedTokens,
  selectedAssets,
  balances,
  tokensList,
  prices = {},
}: NextAssetProps<T>): string | undefined {
  const selectedRecord = selectedAssets.reduce<Record<string, true>>(
    (acc, { token }) => {
      acc[token.toLowerCase()] = true;
      return acc;
    },
    {},
  );

  const notSelected = allowedTokens.filter(allowedToken => {
    const alreadySelected = selectedRecord[allowedToken.toLowerCase()];
    return !alreadySelected;
  });

  const sorted = sortBalances(
    getBalances(notSelected, balances),
    prices,
    tokensList,
  );

  const [address] = sorted[0] || [];

  return address;
}

export function getBalances(
  allowedTokens: Array<string>,
  externalBalances: Record<string, BigNumber>,
): Record<string, BigNumber> {
  return allowedTokens.reduce((acc, address) => {
    const addressLc = address.toLowerCase();
    return {
      ...acc,
      [addressLc]: externalBalances[addressLc] || BigNumber.from(0),
    };
  }, {});
}

export function constructAssetRecord<A extends Asset>(a: Array<A>) {
  const record = a.reduce<Record<string, A>>((acc, asset) => {
    acc[asset.token] = asset;
    return acc;
  }, {});
  return record;
}

export type WrapResult<T> = [Array<T>, BigNumber, BigNumber];

export const memoWrapETH = (ethAddress: string, wethAddress: string) =>
  function wrapETH<T extends Asset>(assets: Array<T>): WrapResult<T> {
    const assetsRecord = constructAssetRecord(assets);

    const weth = assetsRecord[wethAddress];
    const { balance: wethAmount = BigNumber.from(0) } = weth || {};

    const eth = assetsRecord[ethAddress];
    const { balance: ethAmount = BigNumber.from(0) } = eth || {};

    const wethOrETH = weth || eth;

    if (wethOrETH) {
      assetsRecord[wethAddress] = {
        ...wethOrETH,
        token: wethAddress,
        balance: nonNegativeBn(ethAmount).add(nonNegativeBn(wethAmount)),
      };
    }

    if (eth) {
      delete assetsRecord[ethAddress];
    }

    return [Object.values(assetsRecord), ethAmount, wethAmount];
  };

/**
 * Sums the the second assets list into the first assets list
 * Creates new assets.
 */
export function sumAssets<A extends Asset, B extends Asset>(
  a: Array<A>,
  b: Array<B>,
): Array<A | B> {
  const aRecord = constructAssetRecord(a);

  const resRecord = b.reduce<Record<string, A | B>>((acc, bAsset) => {
    const aAsset = acc[bAsset.token];
    const { balance: amount = BigNumber.from(0) } = aAsset || {};

    const amountSum = nonNegativeBn(bAsset.balance).add(nonNegativeBn(amount));
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
 * Subtracts the the second assets list from the first assets list
 * Balance cant be negative; doesn't create new assets.
 */
export function subAssets<A extends Asset, B extends Asset>(
  a: Array<A>,
  b: Array<B>,
): Array<A> {
  const bRecord = constructAssetRecord(b);

  return a.map(asset => {
    const bAsset = bRecord[asset.token];
    const { balance: bAmount = BigNumber.from(0) } = bAsset || {};

    const amountSub = nonNegativeBn(asset.balance).sub(nonNegativeBn(bAmount));
    return { ...asset, balance: nonNegativeBn(amountSub) };
  });
}
