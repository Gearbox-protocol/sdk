import {
  type Address,
  keccak256,
  numberToHex,
  stringToHex,
  toBytes,
} from "viem";
import { handleSalt } from "../../../index.js";
import {
  type RateKeeperDeployParams,
  type RateKeeperState,
  rateKeeperDeployParamsSchema,
  rateKeeperPlugins,
} from "../../plugins/rate-keepers/logic.js";
import type { MarketState } from "../market-state/types.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export type UpdateRateKeeperAction = BaseMarketAction<
  "MARKET::updateRateKeeper",
  RateKeeperDeployParams
>;

export const updateRateKeeperAction: MarketActionData<UpdateRateKeeperAction> =
  {
    type: "MARKET::updateRateKeeper",
    description: `Update rate keeper. Rate keeper is responsible for calculating additional interest rate for a collateral token.`,
    schema: rateKeeperDeployParamsSchema,
    stateTransition: (args: {
      state: MarketState;
      params: RateKeeperDeployParams;
    }): MarketState => {
      const { state, params } = args;

      const quotedTokens = Object.keys(state.rateKeeper.rates);
      const rates:
        | Record<Address, { minRate: number; maxRate: number }>
        | Record<Address, number> = {};

      if (params.type === "GAUGE") {
        quotedTokens.forEach(token => {
          rates[token as Address] = { minRate: 1, maxRate: 1 };
        });
      } else {
        quotedTokens.forEach(token => {
          rates[token as Address] = 1;
        });
      }

      const salt = args.params.salt
        ? args.params.salt
        : numberToHex(0, { size: 32 });

      return {
        ...state,
        rateKeeper: {
          salt,
          ...params,
          rates,
        } as RateKeeperState,
      };
    },
    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const addressProvider = await mc.getAddressProvider();
      const gearStakingAddress =
        await addressProvider.getAddressOrRevert("GEAR_STAKING");
      const deployParams = rateKeeperPlugins[params.type].getDeployParams({
        pool: state.address,
        gearStakingAddress,
        params,
      });
      const tx = await mc.updateRateKeeper(state.address, {
        deployParams,
      });
      return { tx: { tx, action } };
    },
    replace: () => {
      return true;
    },
  };
