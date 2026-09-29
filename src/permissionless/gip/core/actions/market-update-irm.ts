import {
  type InterestRateModelParams,
  irmDeployParamsSchema,
  irmPlugins,
} from "../../plugins/irm/logic.js";
import type { MarketState } from "../market-state/types.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export type UpdateInterestRateModelAction = BaseMarketAction<
  "MARKET::updateInterestRateModel",
  InterestRateModelParams
>;

export const updateInterestRateModelAction: MarketActionData<UpdateInterestRateModelAction> =
  {
    type: "MARKET::updateInterestRateModel",
    description: `Update interest rate model. Interest rate model is responsible for calculating base interest rate for a particular market.`,
    schema: irmDeployParamsSchema,
    stateTransition: (args: {
      state: MarketState;
      params: InterestRateModelParams;
    }): MarketState => {
      const { state, params } = args;

      return {
        ...state,
        interestRateModel: irmPlugins[params.type].getDeployState(params),
      };
    },
    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const deployParams = irmPlugins[params.type].getDeployParams(params);
      const tx = mc.updateInterestRateModel(state.address, { deployParams });
      return { tx: { tx, action } };
    },
    replace: () => {
      return true;
    },
  };
