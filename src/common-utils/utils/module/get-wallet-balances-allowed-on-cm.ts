import type { Address } from "viem";
import type { Asset } from "../../../sdk/router/types.js";
import { sortBalances } from "../../utils/creditAccount/sort.js";
import type { TokenData } from "./types.js";
import { wrapTokenAddress } from "./wrap-token-address.js";
export interface GetWalletBalancesAllowedOnCMProps {
  walletBalances: Record<Address, bigint> | undefined;
  collateralRecord: Record<Address, Address>;

  tokensList: Record<Address, TokenData>;
  prices: Record<Address, bigint>;
  nativeTokenAddress: Address;
  wrappedNativeTokenAddress: Address | undefined;

  isPaused?: boolean;
}

export function getWalletBalancesAllowedOnCM({
  walletBalances,
  collateralRecord,

  nativeTokenAddress,
  wrappedNativeTokenAddress,
  prices,
  tokensList,

  isPaused = false,
}: GetWalletBalancesAllowedOnCMProps) {
  const walletBalancesSorted = sortBalances(
    walletBalances || {},
    prices,
    tokensList,
  );

  const { list, record } = walletBalancesSorted.reduce<{
    list: Array<Asset>;
    record: Record<Address, Asset>;
  }>(
    (acc, [token, balance]) => {
      if (isPaused && token === nativeTokenAddress) return acc;

      const wrappedAddress = wrapTokenAddress(
        token,
        nativeTokenAddress,
        wrappedNativeTokenAddress,
      );

      // only add if wrapped address is allowed as collateral
      if (collateralRecord[wrappedAddress]) {
        const asset: Asset = {
          token,
          balance,
        };

        acc.list.push(asset);
        acc.record[wrappedAddress] = asset;
      }

      return acc;
    },
    { list: [], record: {} },
  );

  const collateralList = Object.values(collateralRecord);
  // if any allowed collateral is missing in balances obtained, we consider them as equal to 0
  const missingAssets = collateralList
    .filter(token =>
      isPaused
        ? token !== nativeTokenAddress && !record[token]
        : !record[token],
    )
    .map(
      (token): Asset => ({
        token,
        balance: 0n,
      }),
    );

  const r = [...list, ...missingAssets];

  return r;
}
