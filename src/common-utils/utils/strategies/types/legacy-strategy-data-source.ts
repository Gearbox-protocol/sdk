import type { Address } from "viem";

import type { PricesByChainSlice } from "../strategy-info/types.js";
import type { GearboxSDKFullStateByChain } from "./sdk-state.js";
import type {
  StrategyCreditManagerView,
  StrategyDataSource,
} from "./strategy-data-source.js";

const lc = (address: Address): Address => address.toLowerCase() as Address;

function getByAddress<T>(
  record: Record<Address, T> | undefined,
  address: Address,
): T | undefined {
  return record?.[address] ?? record?.[lc(address)];
}

export function createLegacyStrategyDataSource<
  CM extends StrategyCreditManagerView,
>(
  sdkStateByChain: GearboxSDKFullStateByChain<CM> | undefined,
  pricesByChain?: PricesByChainSlice,
): StrategyDataSource<CM> {
  return {
    hasToken(chainId, token) {
      return !!getByAddress(
        sdkStateByChain?.[chainId]?.tokens?.tokenDataList,
        token,
      );
    },
    getToken(chainId, token) {
      return getByAddress(
        sdkStateByChain?.[chainId]?.tokens?.tokenDataList,
        token,
      );
    },
    getPool(chainId, pool) {
      return getByAddress(sdkStateByChain?.[chainId]?.pools, pool);
    },
    getCreditManager(chainId, creditManager) {
      return getByAddress(
        sdkStateByChain?.[chainId]?.creditManagers,
        creditManager,
      );
    },
    getMarketPrices(chainId, pool) {
      return (
        getByAddress(pricesByChain?.[chainId]?.prices, pool) ??
        ({} as Record<Address, bigint>)
      );
    },
    getLastSyncTimestamp(chainId) {
      return sdkStateByChain?.[chainId]?.lastSyncBlock?.blockTimestamp_js;
    },
  };
}
