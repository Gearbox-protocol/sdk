import {
  type LossPolicyDeployParams,
  lossPolicyDeployParamsSchema,
  lossPolicyPlugins,
} from "../plugins/loss-policies/lossPolicyPlugins.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { ADDRESS_PROVIDER } from "./utils/systemContracts.js";

export type UpdateLossPolicyAction = BaseMarketAction<
  "MARKET::updateLossPolicy",
  LossPolicyDeployParams
>;

export const updateLossPolicyActionData: MarketScopedDefinition<UpdateLossPolicyAction> =
  defineMarketAction<UpdateLossPolicyAction>({
    type: "MARKET::updateLossPolicy",
    // @dev deploys the policy and runs the market's hooks; see each plugin
    gas: ({ params }) => lossPolicyPlugins[params.type].deployGas,
    description: `Update loss policy. Loss policy is used in cases when bad debt could be accrued. It provides a second opinion
    for particular assets.`,
    schema: lossPolicyDeployParamsSchema,
    apply: ({ state, params }) => ({
      ...state,
      lossPolicy: lossPolicyPlugins[params.type].getDeployState(params),
    }),
    encode: ({ ctx, state, params }) =>
      ctx.marketConfigurator.updateLossPolicy(
        state.address,
        lossPolicyPlugins[params.type].getDeployParams({
          pool: state.address,
          addressProvider: ADDRESS_PROVIDER,
          params,
        }),
      ),
    // @dev every update deploys a new policy: updates never merge
    key: () => undefined,
  });
