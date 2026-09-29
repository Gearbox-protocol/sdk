import {
  type LossPolicyDeployParams,
  lossPolicyDeployParamsSchema,
  lossPolicyPlugins,
} from "../../plugins/loss-policies/logic.js";
import type { MarketState } from "../market-state/types.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export type UpdateLossPolicyAction = BaseMarketAction<
  "MARKET::updateLossPolicy",
  LossPolicyDeployParams
>;

export const updateLossPolicyAction: MarketActionData<UpdateLossPolicyAction> =
  {
    type: "MARKET::updateLossPolicy",
    description: `Update loss policy. Loss policy is used in cases when bad debt could be accrued. It provides a second opinion
    for particular assets.`,
    schema: lossPolicyDeployParamsSchema,
    stateTransition: (args: {
      state: MarketState;
      params: LossPolicyDeployParams;
    }): MarketState => {
      const { state, params } = args;

      return {
        ...state,
        lossPolicy: lossPolicyPlugins[params.type].getDeployState(params),
      };
    },
    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const addressProvider = await mc.getAddressProvider();
      const deployParams = lossPolicyPlugins[params.type].getDeployParams({
        pool: state.address,
        addressProvider: addressProvider.address,
        params,
      });
      const tx = mc.updateLossPolicy(state.address, deployParams);
      return { tx: { tx, action } };
    },
    replace: () => {
      return false;
    },
  };
