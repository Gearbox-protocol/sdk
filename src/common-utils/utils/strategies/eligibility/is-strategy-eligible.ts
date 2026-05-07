import type { Address } from "abitype";
import type {
  AppChains,
  CuratorFilter,
  GearboxSDKFullState,
  NotValidatedStrategy,
  StrategyCreditManagerView,
} from "../types.js";

const EMPTY_ADDRESS = "" as Address;

export function isStrategyEligible<CM extends StrategyCreditManagerView>(
  s: Pick<
    NotValidatedStrategy,
    "chainId" | "network" | "hideInProd" | "tokenOutAddress" | "showInMainApp"
  >,
  allowedChains: AppChains,
  showHiddenStrategies: boolean,
  sdkStateByChain:
    | Record<number, Pick<GearboxSDKFullState<CM>, "tokens"> | undefined>
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
