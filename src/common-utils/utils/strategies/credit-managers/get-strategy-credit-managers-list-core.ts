import type { Address } from "viem";

import { TypedObjectUtils } from "../../../../sdk/utils/mappers.js";
import { isUsableToken } from "../tokens/index.js";
import type {
  CuratorFilter,
  StrategiesCMListByChain,
  Strategy,
  StrategyCreditManagerView,
  StrategyDataSource,
} from "../types.js";
import { isCreditManagerUsable } from "./is-credit-manager-usable.js";

const lc = (address: Address): Address => address.toLowerCase() as Address;

export interface GetStrategyCreditManagersListCoreArgs<
  CM extends StrategyCreditManagerView,
> {
  strategies: Array<Strategy> | undefined;
  source: StrategyDataSource<CM>;
  curatorFilter: CuratorFilter;
}

export function getStrategyCreditManagersListCore<
  CM extends StrategyCreditManagerView,
>({
  strategies,
  source,
  curatorFilter,
}: GetStrategyCreditManagersListCoreArgs<CM>):
  | StrategiesCMListByChain<CM>
  | undefined {
  if (!strategies) return strategies;

  return strategies.reduce<StrategiesCMListByChain<CM>>((acc, strategy) => {
    const targetToken = lc(strategy.tokenOutAddress);

    const cms = (strategy.creditManagers || []).reduce<Record<Address, CM>>(
      (cmAcc, cmAddress) => {
        const cm = source.getCreditManager(strategy.chainId, cmAddress);
        if (!cm || !isCreditManagerUsable(cm)) return cmAcc;

        const usable = isUsableToken({
          address: targetToken,
          creditManager: cm,
        });
        const limit = cm.quotas[targetToken]?.limit || 0n;
        const limitZero =
          targetToken === cm.underlyingToken ? false : limit === 0n;

        if (usable && !cm.isBorrowingForbidden && !limitZero) {
          cmAcc[cm.address] = cm;
        }

        return cmAcc;
      },
      {},
    );

    const cmsAfterCuratorFilter = curatorFilter
      ? TypedObjectUtils.entries(cms).filter(
          ([, cm]) => curatorFilter[cm.marketConfigurator],
        )
      : TypedObjectUtils.entries(cms);

    if (!acc[strategy.chainId]) acc[strategy.chainId] = {};
    acc[strategy.chainId][strategy.id] = Object.fromEntries(
      cmsAfterCuratorFilter,
    );

    return acc;
  }, {});
}
