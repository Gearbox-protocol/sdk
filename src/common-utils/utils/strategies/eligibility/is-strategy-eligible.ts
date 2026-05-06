import type {
  AppChains,
  CuratorFilter,
  GearboxSDKFullState,
  NotValidatedStrategy,
} from "../types.js";
import { EMPTY_ADDRESS } from "../types.js";

export function isStrategyEligible(
  s: Pick<
    NotValidatedStrategy,
    "chainId" | "network" | "hideInProd" | "tokenOutAddress" | "showInMainApp"
  >,
  allowedChains: AppChains,
  showHiddenStrategies: boolean,
  sdkStateByChain:
    | Record<number, Pick<GearboxSDKFullState, "tokens"> | undefined>
    | undefined,
  curatorFilter: CuratorFilter,
) {
  const network =
    s?.chainId !== undefined ? allowedChains[s.chainId] : undefined;
  const isNetworkCorrect = !!network && network === s.network;
  const isHidden = !showHiddenStrategies && s.hideInProd;

  const networkConditionMet = isNetworkCorrect && !isHidden;

  const tokensList = sdkStateByChain?.[s.chainId]?.tokens?.tokenDataList;
  const targetToken = tokensList?.[s?.tokenOutAddress || EMPTY_ADDRESS];

  const isTokensCorrect = !!targetToken;

  const showInMainApp = s.showInMainApp ?? true;
  const showCondition = curatorFilter || showInMainApp;

  return networkConditionMet && isTokensCorrect && showCondition
    ? ({
        isEligible: true,
        network,
      } as const)
    : ({
        isEligible: false,
        network: undefined,
      } as const);
}
