import type { Address } from "viem";
import { adapterMarketActionsData } from "../../plugins/adapters/actions.js";
import { lossPolicyMarketActionsData } from "../../plugins/loss-policies/logic.js";
import { rateKeeperMarketActionsData } from "../../plugins/rate-keepers/logic.js";
import { deployContractActionData } from "./bcr-deploy-contract.js";
import { addCollateralTokenActionData } from "./credit-add-collateral-token.js";
import { allowAdapterActionData } from "./credit-allow-adapter.js";
import { allowTokenActionData } from "./credit-allow-token.js";
import { forbidAdapterActionData } from "./credit-forbid-adapter.js";
import { forbidTokenActionData } from "./credit-forbid-token.js";
import { pauseCreditManagerActionData } from "./credit-pause.js";
import { rampLiquidationThresholdActionData } from "./credit-ramp-liquidation-threshold.js";
import { setExpirationDateActionData } from "./credit-set-expiration-date.js";
import { setFeesActionData } from "./credit-set-fees.js";
import { setMaxDebtPerBlockMultiplierActionData } from "./credit-set-max-debt-per-block-multiplier.js";
import { unpauseCreditManagerActionData } from "./credit-unpause.js";
import { upgradeCreditFacadeActionData } from "./credit-upgrade-credit-facade.js";
import type { MarketActions, MarketActionType } from "./index.js";
import { addAssetActionData } from "./market-add-asset.js";
import { addPeripheryContractActionData } from "./market-add-periphery-contract.js";
import { createCreditSuiteAction as createCreditSuiteActionData } from "./market-create-credit-suite.js";
import { createMarketActionProcessor as createMarketActionData } from "./market-create-market.js";
import { updateInterestRateModelAction as updateInterestRateModelActionData } from "./market-update-irm.js";
import { updateLossPolicyAction as updateLossPolicyActionData } from "./market-update-loss-policy.js";
import { updateRateKeeperAction as updateRateKeeperActionData } from "./market-update-rate-keeper.js";
import { setPriceFeedActionData } from "./oracle-set-price-feed.js";
import { setReservePriceFeedActionData } from "./oracle-set-reserve-price-feed.js";
import { pausePoolActionData } from "./pool-pause.js";
import { setCreditManagerDebtLimitActionData } from "./pool-set-credit-manager-debt-limit.js";
import { setTokenLimitActionData } from "./pool-set-token-limit.js";
import { setTokenQuotaIncreaseFeeAction as setTokenQuotaIncreaseFeeActionData } from "./pool-set-token-quota-increase-fee.js";
import { setTotalDebtLimitActionData } from "./pool-set-total-debt-limit.js";
import { unpausePoolActionData } from "./pool-unpause.js";
import { distributeActionData } from "./treasury-splitter-distribute.js";
import type { MarketActionData } from "./types.js";

export const marketActionsData = [
  // Credit domain
  addCollateralTokenActionData,
  allowAdapterActionData,
  allowTokenActionData,
  forbidAdapterActionData,
  forbidTokenActionData,
  pauseCreditManagerActionData,
  unpauseCreditManagerActionData,
  rampLiquidationThresholdActionData,
  setExpirationDateActionData,
  setFeesActionData,
  upgradeCreditFacadeActionData,
  setMaxDebtPerBlockMultiplierActionData,
  // Market domain
  createMarketActionData,
  createCreditSuiteActionData,
  addPeripheryContractActionData,
  addAssetActionData,
  updateLossPolicyActionData,
  updateRateKeeperActionData,
  updateInterestRateModelActionData,
  // Pool domain
  setTotalDebtLimitActionData,
  setTokenLimitActionData,
  setTokenQuotaIncreaseFeeActionData,
  setCreditManagerDebtLimitActionData,
  pausePoolActionData,
  unpausePoolActionData,
  // Oracle domain
  setPriceFeedActionData,
  setReservePriceFeedActionData,
  // Bytecode Repository domain
  deployContractActionData,
  // Treasury actions
  distributeActionData,
  // Plugin actions
  ...adapterMarketActionsData,
  ...lossPolicyMarketActionsData,
  ...rateKeeperMarketActionsData,
];

export const marketActionsMap = marketActionsData.reduce(
  (acc, action) => {
    acc[action.type] = action as MarketActionData<MarketActions>;
    return acc;
  },
  {} as Record<MarketActions["type"], MarketActionData<MarketActions>>,
);

export function marketActionsReplace(
  a: MarketActions,
  b: MarketActions,
): boolean {
  if (a.type !== b.type) return false;

  const MarketActionProcessor = marketActionsMap[a.type];

  if (!MarketActionProcessor) {
    throw new Error("Market action type not found");
  }

  return MarketActionProcessor.replace(a.params, b.params);
}

function hasCreditManagerParam(
  params: MarketActions["params"],
): params is { creditManager: Address } {
  return (
    params != null && typeof params === "object" && "creditManager" in params
  );
}

export function marketActionsReplaceCmAddress(params: {
  action: MarketActions;
  newCm: Address;
  oldCm: Address;
}): MarketActions {
  const { action } = params;
  const MarketActionProcessor = marketActionsMap[action.type];

  if (!MarketActionProcessor) {
    throw new Error("Market action type not found");
  }

  if (hasCreditManagerParam(action.params)) {
    if (!MarketActionProcessor.replaceCmAddress) {
      throw new Error("Invalid market action");
    }

    return MarketActionProcessor.replaceCmAddress(params);
  }
  return action;
}

export function copyCmActions(params: {
  actions: MarketActions[];
  newCm: Address;
  oldCm: Address;
}): MarketActions[] {
  const { actions, newCm, oldCm } = params;

  return actions
    .map(action => {
      const MarketActionProcessor = marketActionsMap[action.type];

      if (!MarketActionProcessor) {
        throw new Error("Market action type not found");
      }

      if (hasCreditManagerParam(action.params)) {
        if (!MarketActionProcessor.replaceCmAddress) {
          throw new Error("Invalid market action");
        }

        // Skip action if it's not the old CM
        if (action.params.creditManager.toLowerCase() !== oldCm.toLowerCase()) {
          return undefined;
        }

        return MarketActionProcessor.replaceCmAddress({
          action,
          oldCm,
          newCm,
        });
      }
      return undefined;
    })
    .filter(action => action !== undefined);
}

export function validateMarketAction(action: {
  type: string;
  params: unknown;
}): MarketActions {
  const { type } = action;

  const MarketActionProcessor = marketActionsMap[type as MarketActionType];
  if (!MarketActionProcessor) {
    throw new Error("Market action type not found");
  }

  const schema = MarketActionProcessor.schema;

  const params = schema.parse(action.params);
  return {
    type,
    params,
  } as MarketActions;
}
