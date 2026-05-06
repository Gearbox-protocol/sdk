import { TypedObjectUtils } from "../../../../sdk/utils/mappers.js";

import type {
  CreditManagerDataSlice,
  CuratorFilter,
  GearboxSDKFullStateByChain,
  StrategiesCMListByChain,
  Strategy,
} from "../types.js";

import { getStrategyCreditManagers } from "./get-strategy-credit-managers.js";

export function getStrategyCreditManagersList<
  CM extends CreditManagerDataSlice,
>(
  strategies: Array<Strategy> | undefined,
  sdkStateByChain: GearboxSDKFullStateByChain<CM> | undefined,
  curatorFilter: CuratorFilter,
) {
  if (!sdkStateByChain) return sdkStateByChain;
  if (!strategies) return strategies;

  const r = strategies.reduce<StrategiesCMListByChain<CM>>((acc, s) => {
    const currentSdkState = sdkStateByChain[s.chainId];
    const { creditManagers, tokens } = currentSdkState || {};

    const cms =
      creditManagers && tokens
        ? getStrategyCreditManagers({
            strategy: s,
            allCreditManagers: creditManagers,
          })
        : {};

    const cmsAfterCuratorFilter = curatorFilter
      ? TypedObjectUtils.entries(cms).filter(
          ([, cm]) => curatorFilter[cm.marketConfigurator],
        )
      : TypedObjectUtils.entries(cms);

    if (!acc[s.chainId]) acc[s.chainId] = {};
    acc[s.chainId][s.id] = Object.fromEntries(cmsAfterCuratorFilter);

    return acc;
  }, {});

  return r;
}
