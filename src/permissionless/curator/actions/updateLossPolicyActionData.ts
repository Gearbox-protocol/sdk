import type { Address } from "viem";
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

export type UpdateLossPolicyAction = BaseMarketAction<
  "MARKET::updateLossPolicy",
  LossPolicyDeployParams
>;

/** The address provider the new loss policy is constructed with. **/
export interface UpdateLossPolicyResolution {
  addressProvider: Address;
}

export const updateLossPolicyActionData: MarketScopedDefinition<
  UpdateLossPolicyAction,
  UpdateLossPolicyResolution
> = defineMarketAction<UpdateLossPolicyAction, UpdateLossPolicyResolution>({
  type: "MARKET::updateLossPolicy",
  // @note no measurement: the action cannot currently be executed
  gas: () => 0,
  description: `Update loss policy. Loss policy is used in cases when bad debt could be accrued. It provides a second opinion
    for particular assets.`,
  schema: lossPolicyDeployParamsSchema,
  resolve: async ({ ctx }) => ({
    addressProvider: (await ctx.marketConfigurator.getAddressProvider())
      .address,
  }),
  apply: ({ state, params }) => ({
    ...state,
    lossPolicy: lossPolicyPlugins[params.type].getDeployState(params),
  }),
  encode: ({ ctx, state, params, resolved }) =>
    ctx.marketConfigurator.updateLossPolicy(
      state.address,
      lossPolicyPlugins[params.type].getDeployParams({
        pool: state.address,
        addressProvider: resolved.addressProvider,
        params,
      }),
    ),
  // @dev every update deploys a new policy: updates never merge
  key: () => undefined,
});
