import type { Address } from "viem";

import type { StrategyDataSource } from "../types/index.js";
import { getStrategyInfoCore } from "./get-strategy-info-core.js";
import type {
  CreditManagerSlice,
  GetStrategyInfoArgs,
  StrategyInfoResult,
} from "./types.js";

function getByAddress<T>(
  record: Record<Address, T> | undefined,
  address: Address,
): T | undefined {
  return record?.[address] ?? record?.[address.toLowerCase() as Address];
}

export function getStrategyInfo<
  ID extends string | number,
  CM extends CreditManagerSlice = CreditManagerSlice,
>({
  strategy,
  creditManagers,
  sdkStateByChain,
  apyListByNetwork,
  quotaReserve,
  slippage,
  allPricesByChain,
}: GetStrategyInfoArgs<ID, CM>): StrategyInfoResult<CM> | undefined {
  return getStrategyInfoCore({
    strategy,
    creditManagers: creditManagers?.[strategy.chainId]?.[strategy.id],
    source: {
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
      getCreditManager() {
        return undefined;
      },
      getMarketPrices(chainId, pool) {
        return getByAddress(allPricesByChain?.[chainId]?.prices, pool) || {};
      },
      getLastSyncTimestamp() {
        return undefined;
      },
    } satisfies StrategyDataSource,
    apyListByNetwork,
    quotaReserve,
    slippage,
  });
}
