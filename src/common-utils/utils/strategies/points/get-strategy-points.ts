import type { Address } from "viem";

import { getFactorFromLeverage } from "../leverage/index.js";
import type {
  APYListByNetwork,
  Strategy,
  StrategyCreditManagerLike,
  StrategyInfoLike,
} from "../types.js";
import { EMPTY_ADDRESS } from "../types.js";

import { getComplexPointsList } from "./get-complex-points-list.js";
import { getPointsInfo } from "./get-points-info.js";
import { getPointsRates } from "./get-points-rates.js";

const EMPTY_CHAIN_ID = 0;
const EMPTY_ARRAY: Array<never> = [];

export interface GetStrategyPointsProps {
  readonly strategy: Strategy;
  readonly info: StrategyInfoLike | undefined;
  readonly strategyCreditManagers: Record<Address, StrategyCreditManagerLike>;
  readonly apyListByNetwork: APYListByNetwork | undefined;
}

export function getStrategyPoints({
  strategy,
  info,
  strategyCreditManagers,
  apyListByNetwork,
}: GetStrategyPointsProps) {
  const { maxLeverage = 0n, minCreditManager } = info || {};

  const chainId = strategy.chainId;
  const apySnapshotForChain = apyListByNetwork?.[chainId || EMPTY_CHAIN_ID];

  const cmPointsList = getComplexPointsList(
    apySnapshotForChain?.pointsList,
    apySnapshotForChain?.extraCollateralPointsList,
    minCreditManager?.pool ?? EMPTY_ADDRESS,
  );
  const pointsInfo = getPointsInfo({
    chainId,
    pointsList: cmPointsList,
    token: strategy.tokenOutAddress,
    creditManagers: minCreditManager
      ? { [minCreditManager.address]: minCreditManager }
      : undefined,
  });

  const debtPointsList = getComplexPointsList(
    apySnapshotForChain?.pointsList,
    apySnapshotForChain?.extraCollateralPointsList,
    EMPTY_ADDRESS,
  );
  const pointsInfoDebt = getPointsInfo({
    chainId,
    pointsList: debtPointsList,
    token: strategy.tokenOutAddress,
    creditManagers: strategyCreditManagers,
  });

  const { rewards = EMPTY_ARRAY } = pointsInfo || {};
  const { debtRewards = EMPTY_ARRAY } = pointsInfoDebt || {};

  const rewardRates = getPointsRates(rewards, BigInt(maxLeverage));
  const debtRewardRates = getPointsRates(
    debtRewards,
    getFactorFromLeverage(maxLeverage),
  );

  return {
    pointsInfo,
    pointsInfoDebt,
    rewards,
    debtRewards,
    rewardRates,
    debtRewardRates,
  };
}
