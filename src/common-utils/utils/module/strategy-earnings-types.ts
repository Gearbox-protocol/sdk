import type { Asset } from "@gearbox-protocol/sdk";
import type { Strategy } from "@gearbox-protocol/sdk/common-utils";
import type { calculateEarnings } from "./calculate-earnings.js";
import type { calculateTotalAPY } from "./calculate-total-apy.js";
import type { calculateTotalPoints } from "./calculate-total-points.js";
import type { getListWithAmountInTarget } from "./get-list-with-amount-in-target.js";
import type { CreditManagerData } from "./types.js";

export type StrategyCMEarningsInfo<CM extends CreditManagerData> =
  | {
      status: "ok";
      description: string;
      otherInfo?: object;
      data: {
        info: {
          strategy: Strategy;
          creditManager: CM;
          collateral: Array<Asset>;
          assetsWithAmountInTarget: ReturnType<
            typeof getListWithAmountInTarget
          >;
          assetValue: bigint;
          debt: bigint;
          totalAmount: bigint;
          assetValueInUSD: bigint;
          maxAPY: ReturnType<typeof calculateTotalAPY>;
          bonusAPY: { value: number } | undefined;
          maxLeverage: bigint;
        };
        earnings: ReturnType<typeof calculateEarnings>;
        points: ReturnType<typeof calculateTotalPoints>;
      };
    }
  | {
      status: "error";
      description: string;
      otherInfo?: object;
      data: undefined;
    };

export type EarningsList<CM extends CreditManagerData> = Array<
  StrategyCMEarningsInfo<CM>
>;

export type StrategyEarningsListByChain<CM extends CreditManagerData> = Record<
  number,
  Record<string, EarningsList<CM>>
>;

export interface BestEarningsState<CM extends CreditManagerData> {
  best: StrategyCMEarningsInfo<CM> | undefined;
  sorted: StrategyCMEarningsInfo<CM>[];
  bestRecord: Record<
    number,
    Record<Strategy["id"], StrategyCMEarningsInfo<CM>>
  >;
}
