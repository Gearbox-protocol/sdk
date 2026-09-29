import { adapterMarketActionsData } from "../../plugins/adapters/actions.js";
import type { AdapterMarketActions } from "../../plugins/adapters/logic.js";
import type { LossPolicyMarketActions } from "../../plugins/loss-policies/logic.js";
import {
  type RateKeeperMarketActions,
  rateKeeperMarketActionsData,
} from "../../plugins/rate-keepers/logic.js";
// Bytecode Repository domain
import {
  type DeployContractAction,
  deployContractActionData,
} from "./bcr-deploy-contract.js";
// Credit domain
import {
  type AddCollateralTokenAction,
  addCollateralTokenActionData,
} from "./credit-add-collateral-token.js";
import {
  type AllowAdapterAction,
  allowAdapterActionData,
} from "./credit-allow-adapter.js";
import {
  type AllowTokenAction,
  allowTokenActionData,
} from "./credit-allow-token.js";
import {
  type ForbidAdapterAction,
  forbidAdapterActionData,
} from "./credit-forbid-adapter.js";
import {
  type ForbidTokenAction,
  forbidTokenActionData,
} from "./credit-forbid-token.js";
import {
  type PauseCreditManagerAction,
  pauseCreditManagerActionData,
} from "./credit-pause.js";
import {
  type RampLiquidationThresholdAction,
  rampLiquidationThresholdActionData,
} from "./credit-ramp-liquidation-threshold.js";
import {
  type SetExpirationDateAction,
  setExpirationDateActionData,
} from "./credit-set-expiration-date.js";
import { type SetFeesAction, setFeesActionData } from "./credit-set-fees.js";
import {
  type SetMaxDebtPerBlockMultiplierAction,
  setMaxDebtPerBlockMultiplierActionData,
} from "./credit-set-max-debt-per-block-multiplier.js";
import {
  type UnpauseCreditManagerAction,
  unpauseCreditManagerActionData,
} from "./credit-unpause.js";
import {
  type UpgradeCreditFacadeAction,
  upgradeCreditFacadeActionData,
} from "./credit-upgrade-credit-facade.js";
// Market domain
import { type AddAssetAction, addAssetActionData } from "./market-add-asset.js";
import {
  type AddPeripheryContractAction,
  addPeripheryContractActionData,
} from "./market-add-periphery-contract.js";
import {
  type CreateCreditSuiteAction,
  createCreditSuiteAction,
} from "./market-create-credit-suite.js";
import {
  type CreateMarketAction,
  createMarketActionProcessor,
} from "./market-create-market.js";
import {
  type UpdateInterestRateModelAction,
  updateInterestRateModelAction,
} from "./market-update-irm.js";
import {
  type UpdateLossPolicyAction,
  updateLossPolicyAction,
} from "./market-update-loss-policy.js";
import {
  type UpdateRateKeeperAction,
  updateRateKeeperAction,
} from "./market-update-rate-keeper.js";
// Oracle domain
import {
  type SetPriceFeedAction,
  setPriceFeedActionData,
} from "./oracle-set-price-feed.js";
import {
  type SetReservePriceFeedAction,
  setReservePriceFeedActionData,
} from "./oracle-set-reserve-price-feed.js";
import { type PausePoolAction, pausePoolActionData } from "./pool-pause.js";
// Pool domain
import {
  type SetCreditManagerDebtLimitAction,
  setCreditManagerDebtLimitActionData,
} from "./pool-set-credit-manager-debt-limit.js";
import {
  type SetTokenLimitAction,
  setTokenLimitActionData,
} from "./pool-set-token-limit.js";
import {
  type SetTokenQuotaIncreaseFeeAction,
  setTokenQuotaIncreaseFeeAction,
} from "./pool-set-token-quota-increase-fee.js";
import {
  type SetTotalDebtLimitAction,
  setTotalDebtLimitActionData,
} from "./pool-set-total-debt-limit.js";
import {
  type UnpausePoolAction,
  unpausePoolActionData,
} from "./pool-unpause.js";
import type { DistributeAction } from "./treasury-splitter-distribute.js";

export type MarketActions =
  // Market domain
  | CreateMarketAction
  | CreateCreditSuiteAction
  | AddPeripheryContractAction
  | AddAssetAction
  | UpdateLossPolicyAction
  | UpdateRateKeeperAction
  | UpdateInterestRateModelAction
  // Pool domain
  | SetTotalDebtLimitAction
  | SetTokenLimitAction
  | SetTokenQuotaIncreaseFeeAction
  | SetCreditManagerDebtLimitAction
  | PausePoolAction
  | UnpausePoolAction
  // Oracle domain
  | SetPriceFeedAction
  | SetReservePriceFeedAction
  // Credit domain
  | AddCollateralTokenAction
  | AllowAdapterAction
  | ForbidAdapterAction
  | SetFeesAction
  | RampLiquidationThresholdAction
  | ForbidTokenAction
  | AllowTokenAction
  | SetExpirationDateAction
  | PauseCreditManagerAction
  | UnpauseCreditManagerAction
  | UpgradeCreditFacadeAction
  | SetMaxDebtPerBlockMultiplierAction
  // Bytecode Repository domain
  | DeployContractAction
  // Treasury actions
  | DistributeAction
  // Plugin actions
  | RateKeeperMarketActions
  | LossPolicyMarketActions
  | AdapterMarketActions;

export type MarketActionType = MarketActions["type"];

export const MARKET_DOMAIN_ACTIONS = [
  createMarketActionProcessor,
  createCreditSuiteAction,
  addPeripheryContractActionData,
  addAssetActionData,
  updateLossPolicyAction,
  updateRateKeeperAction,
  updateInterestRateModelAction,
];

export const POOL_DOMAIN_ACTIONS = [
  setTotalDebtLimitActionData,
  setTokenLimitActionData,
  setTokenQuotaIncreaseFeeAction,
  setCreditManagerDebtLimitActionData,
  pausePoolActionData,
  unpausePoolActionData,
];

export const ORACLE_DOMAIN_ACTIONS = [
  setPriceFeedActionData,
  setReservePriceFeedActionData,
];

export const CREDIT_DOMAIN_ACTIONS = [
  allowAdapterActionData,
  forbidAdapterActionData,
  allowTokenActionData,
  forbidTokenActionData,
  pauseCreditManagerActionData,
  unpauseCreditManagerActionData,
  rampLiquidationThresholdActionData,
  setExpirationDateActionData,
  setFeesActionData,
  addCollateralTokenActionData,
  upgradeCreditFacadeActionData,
  setMaxDebtPerBlockMultiplierActionData,
];

export const BCR_DOMAIN_ACTIONS = [deployContractActionData];

export const ADAPTER_DOMAIN_ACTIONS = adapterMarketActionsData;

export const RATE_KEEPER_DOMAIN_ACTIONS = rateKeeperMarketActionsData;
