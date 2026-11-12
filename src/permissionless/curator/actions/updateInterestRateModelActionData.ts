import {
  type InterestRateModelParams,
  irmDeployParamsSchema,
  irmPlugins,
} from "../plugins/irm/irmPlugins.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { single } from "./utils/actionKeys.js";

export type UpdateInterestRateModelAction = BaseMarketAction<
  "MARKET::updateInterestRateModel",
  InterestRateModelParams
>;

export const updateInterestRateModelActionData: MarketScopedDefinition<UpdateInterestRateModelAction> =
  defineMarketAction<UpdateInterestRateModelAction>({
    type: "MARKET::updateInterestRateModel",
    gas: () => 800_000, // got 779,772
    description: `Update interest rate model. Interest rate model is responsible for calculating base interest rate for a particular market.`,
    schema: irmDeployParamsSchema,
    apply: ({ state, params }) => ({
      ...state,
      interestRateModel: irmPlugins[params.type].getDeployState(params),
    }),
    encode: ({ ctx, state, params }) => {
      const deployParams = irmPlugins[params.type].getDeployParams(params);
      return ctx.marketConfigurator.updateInterestRateModel(state.address, {
        deployParams,
      });
    },
    key: single,
  });
