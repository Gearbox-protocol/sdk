import type { Address } from "viem";

import { PriceUtils } from "../../price-math.js";
import { getFactorFromLeverage } from "../leverage/index.js";
import { sortStrategyCMsByAvailability } from "../sort-strategy-cms-by-availability/index.js";
import { getStrategyMaxAPY } from "./get-strategy-max-apy.js";
import { isStrategyCMDisabled } from "./is-strategy-cm-disabled.js";
import type {
  CreditManagerSlice,
  GetStrategyInfoArgs,
  StrategyInfoResult,
} from "./types.js";

const EMPTY_ADDRESS = "" as Address;
const EMPTY_CHAIN_ID = 0;

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
  const strategyCMs = creditManagers?.[strategy.chainId]?.[strategy.id] || {};
  const strategyCMsList = Object.values(strategyCMs);

  if (strategyCMsList.length === 0) return undefined;

  const openableCMsList = strategyCMsList.filter(
    cm => !isStrategyCMDisabled(cm, cm.quotas[strategy.tokenOutAddress]),
  );

  const currentSdkState = sdkStateByChain?.[strategy.chainId];

  const pools = currentSdkState?.pools;
  const tokensList = currentSdkState?.tokens?.tokenDataList;
  const targetTokenAddress = strategy.tokenOutAddress;

  const minCreditManager =
    sortStrategyCMsByAvailability({
      targetToken: targetTokenAddress,
      allCreditManagers:
        openableCMsList.length > 0 ? openableCMsList : strategyCMsList,
      apyListByNetwork,

      slippage,
      quotaReserve,

      pools,
      leverageLimit: strategy.maxLeverage,

      isStrategy: true,
    })?.[0] || strategyCMsList[0];

  const { underlyingToken = EMPTY_ADDRESS, availableToBorrow = 0n } =
    minCreditManager || {};

  const {
    bonusAPY,
    totalMaxApy = 0,
    maxLeverage = 0n,

    baseBorrowRate = 0,
    quotaRateMin = 0n,
  } = getStrategyMaxAPY(
    targetTokenAddress,
    minCreditManager,
    apyListByNetwork,
    slippage,
    quotaReserve,
    strategy.maxLeverage,
  ) || {};

  const prices =
    allPricesByChain?.[minCreditManager?.chainId ?? EMPTY_CHAIN_ID]?.prices?.[
      minCreditManager?.pool || EMPTY_ADDRESS
    ];

  const underlyingPrice = prices?.[underlyingToken] || 0n;
  const underlyingDecimals = tokensList?.[underlyingToken]?.decimals || 18;
  const availableToBorrowMoney = PriceUtils.calcTotalPrice(
    underlyingPrice,
    availableToBorrow,
    underlyingDecimals,
  );

  const r =
    (BigInt(baseBorrowRate) * getFactorFromLeverage(maxLeverage)) / maxLeverage;
  const qr = quotaRateMin;
  const totalBorrowRate = Number(r + qr);

  return {
    maxLeverage,
    maxAPY: totalMaxApy,
    bonusAPY,

    totalBorrowRate,
    availableToBorrowMoney,
    minCreditManager: minCreditManager as unknown as CM,
  };
}
