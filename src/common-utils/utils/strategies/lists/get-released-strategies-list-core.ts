import { isStrategyReleased } from "../eligibility/is-strategy-released.js";
import type {
  AppChains,
  CuratorFilter,
  NotValidatedStrategy,
  Strategy,
  StrategyDataSource,
} from "../types.js";

export interface GetReleasedStrategiesListCoreArgs {
  strategyPayloadsList: NotValidatedStrategy[] | undefined;
  allowedChains: AppChains | undefined;
  source: StrategyDataSource;
  curatorFilter: CuratorFilter;
  showHiddenStrategies: boolean;
}

export function getReleasedStrategiesListCore({
  strategyPayloadsList,
  allowedChains,
  source,
  curatorFilter,
  showHiddenStrategies,
}: GetReleasedStrategiesListCoreArgs): Strategy[] | undefined {
  if (!allowedChains) return undefined;
  if (!strategyPayloadsList) return undefined;

  const eligibleStrategies = strategyPayloadsList.reduce<Array<Strategy>>(
    (acc, s) => {
      const network =
        s.chainId !== undefined ? allowedChains[s.chainId] : undefined;
      const isNetworkCorrect = !!network && network === s.network;
      const isHidden = !showHiddenStrategies && !!s.hideInProd;
      const showInMainApp = s.showInMainApp ?? true;
      const showCondition = !!curatorFilter || showInMainApp;

      if (isNetworkCorrect && !isHidden && showCondition) {
        acc.push({
          ...s,
          network,
        });
      }

      return acc;
    },
    [],
  );

  return eligibleStrategies.filter(s => {
    const lastSyncTimestamp = source.getLastSyncTimestamp(s.chainId);
    if (!lastSyncTimestamp) return true;

    return showHiddenStrategies
      ? true
      : isStrategyReleased(s.releaseAt, lastSyncTimestamp);
  });
}
