import {
  type Address,
  encodeAbiParameters,
  type Hex,
  numberToHex,
  stringToHex,
} from "viem";
import { z } from "zod";
import type { MarketState } from "../../../core/market-state/types.js";
import type { DeployParams } from "../../../core/market-tx.js";
import {
  type RateKeeperDeployParams,
  type RateKeeperPlugin,
  updateRateKeeperState,
} from "../logic.js";

import { type SetRateAction, setRateActionData } from "./set-rate-action.js";
import {
  type UpdateRatesAction,
  updateRatesActionData,
} from "./update-rates-action.js";

export type TumblerRateKeeperParams = {
  type: "TUMBLER";
  epochSeconds: number;
  salt?: string;
};

export interface TumblerRateKeeperState extends TumblerRateKeeperParams {
  rates: Record<Address, number>;
}

export const tumblerDeployParamsSchema = z.object({
  type: z.literal("TUMBLER"),
  epochSeconds: z.number().min(0),
  salt: z.string().optional(),
});

export type TumblerMarketActions = SetRateAction | UpdateRatesAction;

export const tumblerPlugin: RateKeeperPlugin = {
  name: "Tumbler",
  description:
    "Tumbler is a rate keeper mechanism that adjusts interest rates based on market conditions, ensuring optimal utilization and risk management.",

  getDefaultParams(): TumblerRateKeeperParams {
    return {
      type: "TUMBLER",
      epochSeconds: 0,
    };
  },

  getDeployState(params: RateKeeperDeployParams): TumblerRateKeeperState {
    if (params.type !== "TUMBLER") {
      throw new Error("Invalid params");
    }
    return {
      ...params,
      rates: {},
    };
  },

  onNewAsset(state: MarketState, asset: Address): MarketState {
    if (state.rateKeeper.type !== "TUMBLER") {
      throw new Error("Invalid state");
    }
    return updateRateKeeperState({
      state,
      update: state => ({
        ...state,
        rates: {
          ...state.rates,
          [asset]: 1,
        },
      }),
    });
  },

  getDeployParams(args: {
    pool: Address;
    gearStakingAddress: Address;
    params: RateKeeperDeployParams;
  }): DeployParams {
    const { pool, params } = args;

    if (params.type !== "TUMBLER") {
      throw new Error("Invalid TUMBLER params");
    }

    return {
      postfix: stringToHex(params.type, { size: 32 }),
      salt: params.salt ? (params.salt as Hex) : numberToHex(0, { size: 32 }),
      constructorParams: encodeAbiParameters(
        [{ type: "address" }, { type: "uint256" }],
        [pool, BigInt(params.epochSeconds || 0)],
      ),
    };
  },
};

export const tumblerMarketActionsData = [
  setRateActionData,
  updateRatesActionData,
];
