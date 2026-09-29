import type { Address } from "viem";
import { setPoolBatchStatusActionData as balancerV3SetPoolBatchStatusActionData } from "./balancer-v3/set-pool-batch-status-action.js";
import { setPoolBatchStatusActionData as camelotV3SetPoolBatchStatusActionData } from "./camelot-v3/set-pool-batch-status-action.js";
import { updateSupportedPidsActionData } from "./convex-v1-booster/update-supported-pids-action.js";
import { getSetLockedTokenBatchStatusActionData } from "./infinifi/set-pool-key-status-batch-action.js";
import { setAssetStatusBatchActionData as kelpDepositSetAssetStatusBatchActionData } from "./kelp-lrt-deposit-pool/set-asset-status-batch-action.js";
import { setTokensOutStatusBatchActionData as kelpWithdrawalSetTokensOutStatusBatchActionData } from "./kelp-lrt-withdrawal-manager/set-tokens-out-status-batch-action.js";
import { setMultiVaultStatusBatchActionData } from "./mellow-claimer/set-multi-vault-status-batch-action.js";
import { setVaultStatusBatchActionData } from "./mellow-wrapper/set-vault-status-batch-action.js";
import { setTokenAllowedStatusBatchActionData as midasIssuanceSetTokenAllowedStatusBatchActionData } from "./midas-issuance/set-token-allowed-status-batch-action.js";
import { setTokenAllowedStatusBatchActionData as midasRedemptionSetTokenAllowedStatusBatchActionData } from "./midas-redemption/set-token-allowed-status-batch-action.js";
import { setPairBatchStatusActionData as pendleSetPairBatchStatusActionData } from "./pendle/set-pair-batch-status-action.js";
import { setPoolBatchStatusActionData as traderJoeV2SetPoolBatchStatusActionData } from "./traderjoe/set-pool-batch-status-action.js";
import { setPairBatchStatusActionData } from "./uniswap-v2/set-pair-batch-status-action.js";
import { setPoolBatchStatusActionData as uniswapV3SetPoolBatchStatusActionData } from "./uniswap-v3/set-pool-batch-status-action.js";
import { setPoolKeyStatusBatchActionData } from "./uniswap-v4/set-pool-key-status-batch-action.js";
import { setPoolBatchStatusActionData as velodromeV2SetPoolBatchStatusActionData } from "./velodrome-v2/set-pool-batch-status-action.js";

export type AdapterActionContext = {
  creditManager: Address;
  version: number;
  target: Address;
};

export const adapterMarketActionsData = [
  setPairBatchStatusActionData,
  balancerV3SetPoolBatchStatusActionData,
  camelotV3SetPoolBatchStatusActionData,
  updateSupportedPidsActionData,
  getSetLockedTokenBatchStatusActionData("INFINIFI_GATEWAY"),
  getSetLockedTokenBatchStatusActionData("INFINIFI_UNWINDING"),
  kelpDepositSetAssetStatusBatchActionData,
  kelpWithdrawalSetTokensOutStatusBatchActionData,
  setMultiVaultStatusBatchActionData,
  setVaultStatusBatchActionData,
  midasIssuanceSetTokenAllowedStatusBatchActionData,
  midasRedemptionSetTokenAllowedStatusBatchActionData,
  pendleSetPairBatchStatusActionData,
  traderJoeV2SetPoolBatchStatusActionData,
  uniswapV3SetPoolBatchStatusActionData,
  setPoolKeyStatusBatchActionData,
  velodromeV2SetPoolBatchStatusActionData,
];
