import { TokenData } from "../tokens/tokenData";
import { nonNegativeBn } from "../utils/math";
import { sortBalances } from "./creditAccount";

export interface Asset {
  token: string;
  balance: bigint;
}

export interface AssetWithView extends Asset {
  balanceView: string;
}

export interface AssetWithAmountInTarget extends Asset {
  amountInTarget: bigint;
}

interface NextAssetProps<T extends Asset> {
  allowedTokens: Array<string>;
  selectedAssets: Array<T>;
  balances: Record<string, bigint>;
  tokensList: Record<string, TokenData>;
  prices?: Record<string, bigint>;
}

export type WrapResult<T> = [Array<T>, bigint, bigint];

export class AssetUtils {
  static nextAsset<T extends Asset>({
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
      AssetUtils.getBalances(notSelected, balances),
      prices,
      tokensList,
    );

    const [address] = sorted[0] || [];

    return address;
  }

  static getBalances(
    allowedTokens: Array<string>,
    externalBalances: Record<string, bigint>,
  ): Record<string, bigint> {
    return allowedTokens.reduce((acc, address) => {
      const addressLc = address.toLowerCase();
      return {
        ...acc,
        [addressLc]: externalBalances[addressLc] || 0n,
      };
    }, {});
  }

  static constructAssetRecord<A extends Asset>(a: Array<A>) {
    const record = a.reduce<Record<string, A>>((acc, asset) => {
      acc[asset.token] = asset;
      return acc;
    }, {});
    return record;
  }

  static memoWrapETH = (ethAddress: string, wethAddress: string) =>
    function wrapETH<T extends Asset>(assets: Array<T>): WrapResult<T> {
      const assetsRecord = AssetUtils.constructAssetRecord(assets);

      const weth = assetsRecord[wethAddress];
      const { balance: wethAmount = 0n } = weth || {};

      const eth = assetsRecord[ethAddress];
      const { balance: ethAmount = 0n } = eth || {};

      const wethOrETH = weth || eth;

      if (wethOrETH) {
        assetsRecord[wethAddress] = {
          ...wethOrETH,
          token: wethAddress,
          balance: nonNegativeBn(ethAmount) + nonNegativeBn(wethAmount),
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
  static sumAssets<A extends Asset, B extends Asset>(
    a: Array<A>,
    b: Array<B>,
  ): Array<A | B> {
    const aRecord = AssetUtils.constructAssetRecord(a);

    const resRecord = b.reduce<Record<string, A | B>>((acc, bAsset) => {
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
   * Subtracts the the second assets list from the first assets list
   * Balance cant be negative; doesn't create new assets.
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
