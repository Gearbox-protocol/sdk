import { adapterMarketActionsData } from "../plugins/adapters/adapterMarketActionsData.js";
import { lossPolicyMarketActionsData } from "../plugins/loss-policies/lossPolicyPlugins.js";
import { rateKeeperMarketActionsData } from "../plugins/rate-keepers/rateKeeperPlugins.js";
import { addAssetActionData } from "./addAssetActionData.js";
import { addCollateralTokenActionData } from "./addCollateralTokenActionData.js";
import { addPeripheryContractActionData } from "./addPeripheryContractActionData.js";
import { allowAdapterActionData } from "./allowAdapterActionData.js";
import { allowTokenActionData } from "./allowTokenActionData.js";
import { createCreditSuiteActionData } from "./createCreditSuiteActionData.js";
import { createMarketActionData } from "./createMarketActionData.js";
import { deployContractActionData } from "./deployContractActionData.js";
import { forbidAdapterActionData } from "./forbidAdapterActionData.js";
import { forbidTokenActionData } from "./forbidTokenActionData.js";
import { pauseCreditManagerActionData } from "./pauseCreditManagerActionData.js";
import { pausePoolActionData } from "./pausePoolActionData.js";
import { rampLiquidationThresholdActionData } from "./rampLiquidationThresholdActionData.js";
import { setCreditManagerDebtLimitActionData } from "./setCreditManagerDebtLimitActionData.js";
import { setExpirationDateActionData } from "./setExpirationDateActionData.js";
import { setFeesActionData } from "./setFeesActionData.js";
import { setMaxDebtPerBlockMultiplierActionData } from "./setMaxDebtPerBlockMultiplierActionData.js";
import { setPriceFeedActionData } from "./setPriceFeedActionData.js";
import { setReservePriceFeedActionData } from "./setReservePriceFeedActionData.js";
import { setTokenLimitActionData } from "./setTokenLimitActionData.js";
import { setTokenQuotaIncreaseFeeActionData } from "./setTokenQuotaIncreaseFeeActionData.js";
import { setTotalDebtLimitActionData } from "./setTotalDebtLimitActionData.js";
import { unpauseCreditManagerActionData } from "./unpauseCreditManagerActionData.js";
import { unpausePoolActionData } from "./unpausePoolActionData.js";
import { updateInterestRateModelActionData } from "./updateInterestRateModelActionData.js";
import { updateLossPolicyActionData } from "./updateLossPolicyActionData.js";
import { updateRateKeeperActionData } from "./updateRateKeeperActionData.js";
import { upgradeCreditFacadeActionData } from "./upgradeCreditFacadeActionData.js";

/** Every market action type, in registration order. **/
export const marketActionDefinitions = [
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
  // Plugin actions
  ...adapterMarketActionsData,
  ...lossPolicyMarketActionsData,
  ...rateKeeperMarketActionsData,
];
