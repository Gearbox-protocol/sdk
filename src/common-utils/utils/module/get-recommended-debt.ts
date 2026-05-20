import { LEVERAGE_DECIMALS } from "@gearbox-protocol/sdk";
import type { LeverageFactor } from "@gearbox-protocol/sdk/common-utils";
import { calculateMaxLeverageFactor } from "@gearbox-protocol/sdk/common-utils";
import type { Address } from "viem";
import { calculateMaxStrategyDebt } from "./calculate-max-strategy-debt.js";
import { getRecommendedLeverageFactor } from "./get-recommended-leverage-factor.js";
import type { CreditManagerData } from "./types.js";

export interface GetRecommendedDebtProps {
  targetToken: Address;
  amount: bigint;
  creditManager: CreditManagerData;
  slippage: number;
  maxLeverageConstantLoss?: bigint;
  maxDebtConstantLoss?: bigint;
  recommendedDebtConstantLoss?: bigint;
  swapCollateral?: boolean;
  leverageLimit: number | undefined;
}

export function getRecommendedDebt({
  targetToken,
  amount,
  creditManager,
  slippage,
  maxLeverageConstantLoss,
  maxDebtConstantLoss,
  recommendedDebtConstantLoss = 3_400n,
  swapCollateral,
  leverageLimit,
}: GetRecommendedDebtProps): {
  maxDebt: bigint;
  recommended: {
    factor: LeverageFactor;
    debt: bigint;
  };
} {
  const maxDebt = calculateMaxStrategyDebt({
    targetToken,
    amount,
    creditManager,
    slippage,
    constantLoss: maxDebtConstantLoss,
    swapCollateral,
  });

  const recommendedLeverageFactor = getRecommendedLeverageFactor({
    maxLeverageFactor: calculateMaxLeverageFactor({
      targetToken,
      creditManagers: [creditManager],
      slippage,
      leverageLimit,
      constantLoss: maxLeverageConstantLoss,
    }),
  });

  if (maxDebt === 0n || amount === 0n) {
    return {
      maxDebt: maxDebt,
      recommended: {
        factor: recommendedLeverageFactor,
        debt: maxDebt,
      },
    };
  }

  const recommendedMaxDebt = calculateMaxStrategyDebt({
    targetToken,
    amount,
    creditManager,
    slippage,
    constantLoss: recommendedDebtConstantLoss,
    swapCollateral,
  });

  const leverageFactorOfMaxDebt = ((recommendedMaxDebt * LEVERAGE_DECIMALS) /
    amount) as LeverageFactor;

  return {
    maxDebt: maxDebt,
    recommended: {
      factor: leverageFactorOfMaxDebt,
      debt: recommendedMaxDebt,
    },
  };
}
