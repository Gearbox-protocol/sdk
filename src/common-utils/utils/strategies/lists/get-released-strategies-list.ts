import { isStrategyEligible } from "../eligibility/is-strategy-eligible.js";
import { isStrategyReleased } from "../eligibility/is-strategy-released.js";
import type {
  AppChains,
  CreditManagerDataSlice,
  CuratorFilter,
  GearboxSDKFullStateByChain,
  NotValidatedStrategy,
  Strategy,
} from "../types.js";

export function getReleasedStrategiesList<CM extends CreditManagerDataSlice>(
  strategyPayloadsList: NotValidatedStrategy[] | undefined,
  allowedChains: AppChains | undefined,

  sdkStateByChain: GearboxSDKFullStateByChain<CM> | undefined,
  curatorFilter: CuratorFilter,
  showHiddenStrategies: boolean,
) {
  if (!allowedChains) return undefined;
  if (!strategyPayloadsList) return undefined;

  const eligibleStrategies = strategyPayloadsList.reduce<Array<Strategy>>(
    (acc, s) => {
      const eligible = isStrategyEligible(
        s,
        allowedChains,
        showHiddenStrategies,
        sdkStateByChain,
        curatorFilter,
      );

      if (eligible.isEligible) {
        acc.push({
          ...s,
          id: s.tokenOutAddress,
          network: eligible.network,
        });
      }

      return acc;
    },
    [],
  );

  if (!sdkStateByChain) return eligibleStrategies;

  const releasedStrategies = eligibleStrategies.filter(s => {
    const lastSyncBlock = sdkStateByChain?.[s.chainId]?.lastSyncBlock;
    if (!lastSyncBlock) return true;

    return showHiddenStrategies
      ? true
      : isStrategyReleased(s.releaseAt, lastSyncBlock.blockTimestamp_js);
  }, {});

  return releasedStrategies;
}
