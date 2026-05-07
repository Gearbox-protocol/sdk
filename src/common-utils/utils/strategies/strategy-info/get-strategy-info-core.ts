import type { Address } from "viem";
import { getSingleQuotaBorrowRate } from "../../index.js";
import { PriceUtils } from "../../price-math.js";
import { getFactorFromLeverage } from "../leverage/index.js";
import { getStrategyPoints } from "../points/get-strategy-points.js";
import { sortStrategyCMsByAvailability } from "../sort-strategy-cms-by-availability/index.js";
import type { StrategyDataSource } from "../types/index.js";
import type { BasePointsList, ExtraCollateralPointsList } from "../types.js";
import { getStrategyMaxAPY } from "./get-strategy-max-apy.js";
import { isStrategyCMDisabled } from "./is-strategy-cm-disabled.js";
import type {
  APYListSlice,
  CreditManagerSlice,
  PoolSlice,
  StrategyInfoResult,
  StrategySlice,
} from "./types.js";

const EMPTY_ADDRESS = "" as Address;
const lc = (address: Address): Address => address.toLowerCase() as Address;

export interface GetStrategyInfoCoreArgs<
  ID extends string | number,
  CM extends CreditManagerSlice,
> {
  strategy: StrategySlice<ID>;
  creditManagers: Record<Address, CM> | undefined;
  source: StrategyDataSource;
  apyListByNetwork:
    | Record<
        number,
        | (APYListSlice & {
            pointsList?: BasePointsList;
            extraCollateralPointsList?: ExtraCollateralPointsList;
          })
        | undefined
      >
    | undefined;
  quotaReserve: number;
  slippage: number;
}

export function getStrategyInfoCore<
  ID extends string | number,
  CM extends CreditManagerSlice,
>({
  strategy,
  creditManagers,
  source,
  apyListByNetwork,
  quotaReserve,
  slippage,
}: GetStrategyInfoCoreArgs<ID, CM>): StrategyInfoResult<CM> | undefined {
  const strategyCMsList = Object.values(creditManagers || {});

  if (strategyCMsList.length === 0) return undefined;

  const targetTokenAddress = lc(strategy.tokenOutAddress);

  const openableCMsList = strategyCMsList.filter(
    cm => !isStrategyCMDisabled(cm, cm.quotas[targetTokenAddress]),
  );

  const pools = strategyCMsList.reduce<Record<Address, PoolSlice>>(
    (acc, cm) => {
      const pool = source.getPool(cm.chainId, cm.pool);
      if (pool) acc[cm.pool] = pool;
      return acc;
    },
    {},
  );

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

    effectiveBaseRate = 0,
    effectiveQuotaRate = 0n,
  } = getStrategyMaxAPY(
    targetTokenAddress,
    minCreditManager,
    apyListByNetwork,
    slippage,
    quotaReserve,
    strategy.maxLeverage,
  ) || {};

  const prices = source.getMarketPrices(
    minCreditManager?.chainId ?? strategy.chainId,
    minCreditManager?.pool || EMPTY_ADDRESS,
  );
  const underlyingPrice = prices?.[underlyingToken] || 0n;
  const underlyingDecimals =
    source.getToken(strategy.chainId, underlyingToken)?.decimals || 18;
  const availableToBorrowMoney = PriceUtils.calcTotalPrice(
    underlyingPrice,
    availableToBorrow,
    underlyingDecimals,
  );

  const r =
    (BigInt(effectiveBaseRate) * getFactorFromLeverage(maxLeverage)) /
    maxLeverage;
  const qr = effectiveQuotaRate;
  const totalBorrowRate = Number(r + qr);

  const baseQuotaRateWithFee = getSingleQuotaBorrowRate({
    quotaRates: minCreditManager?.quotas || {},
    feeInterest: minCreditManager?.feeInterest || 0,
    quotas: {
      [targetTokenAddress]: {
        token: targetTokenAddress,
        balance: 1n,
      },
    },
  });

  const points = getStrategyPoints({
    strategy: {
      chainId: strategy.chainId,
      tokenOutAddress: targetTokenAddress,
    },
    info: {
      maxLeverage,
      minCreditManager,
    },
    strategyCreditManagers: creditManagers ?? {},
    apyListByNetwork,
  });

  return {
    maxLeverage,
    maxAPY: totalMaxApy,
    bonusAPY,

    totalBorrowRate,
    baseQuotaRateWithFee,
    availableToBorrowMoney,
    minCreditManager,
    points,
  };
}
