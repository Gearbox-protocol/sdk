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
import {
  type ChangeQuotaMaxRateAction,
  changeQuotaMaxRateActionData,
} from "./change-quota-max-rate-action.js";
import {
  type ChangeQuotaMinRateAction,
  changeQuotaMinRateActionData,
} from "./change-quota-min-rate-action.js";

export type GaugeRateKeeperParams = {
  type: "GAUGE";
  salt?: string;
};

export interface GaugeRateKeeperState extends GaugeRateKeeperParams {
  rates: Record<Address, { minRate: number; maxRate: number }>;
}

export const gaugeDeployParamsSchema = z.object({
  type: z.literal("GAUGE"),
  salt: z.string().optional(),
});

export type GaugeMarketActions =
  | ChangeQuotaMinRateAction
  | ChangeQuotaMaxRateAction;

export const gaugePlugin: RateKeeperPlugin = {
  name: "Gauge",
  description:
    "Gauges provide a flexible system for distributing rewards and adjusting parameters based on various economic factors and governance decisions.",

  getDefaultParams(): GaugeRateKeeperParams {
    return {
      type: "GAUGE",
    };
  },

  getDeployState(params: RateKeeperDeployParams): GaugeRateKeeperState {
    if (params.type !== "GAUGE") {
      throw new Error("Invalid params");
    }
    return {
      ...params,
      rates: {},
    };
  },

  getDeployParams(args: {
    pool: Address;
    gearStakingAddress: Address;
    params: RateKeeperDeployParams;
  }): DeployParams {
    const { pool, gearStakingAddress, params } = args;

    if (params.type !== "GAUGE") {
      throw new Error("Invalid GAUGE params");
    }

    return {
      postfix: stringToHex("GAUGE", { size: 32 }),
      salt: params.salt ? (params.salt as Hex) : numberToHex(0, { size: 32 }),
      constructorParams: encodeAbiParameters(
        [{ type: "address" }, { type: "address" }],
        [pool, gearStakingAddress],
      ),
    };
  },

  onNewAsset(state: MarketState, asset: Address): MarketState {
    if (state.rateKeeper.type !== "GAUGE") {
      throw new Error("Invalid state");
    }
    return updateRateKeeperState({
      state,
      update: state => ({
        ...state,
        rates: {
          ...state.rates,
          [asset]: { minRate: 1, maxRate: 1 },
        },
      }),
    });
  },
};

export const gaugeMarketActionsData = [
  changeQuotaMinRateActionData,
  changeQuotaMaxRateActionData,
];
