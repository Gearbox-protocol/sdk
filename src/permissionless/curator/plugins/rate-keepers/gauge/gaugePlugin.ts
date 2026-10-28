import { type Address, encodeAbiParameters, stringToHex, zeroHash } from "viem";
import { z } from "zod/v4";
import { GAUGE_RATE_KEEPER_ABI } from "../../../../plugins/rate-keepers/constructor-params-abi.js";
import { handleSalt } from "../../../../utils/create2.js";
import {
  address,
  identity,
  integer,
  object,
  observed,
  optional,
  record,
  string,
} from "../../../state/diff/schemaNodes.js";
import type { RateKeeperPlugin } from "../rateKeeperPlugins.js";
import { updateRateKeeperState } from "../updateRateKeeperState.js";
import { changeQuotaMaxRateActionData } from "./changeQuotaMaxRateActionData.js";
import { changeQuotaMinRateActionData } from "./changeQuotaMinRateActionData.js";

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

export const gaugePlugin: RateKeeperPlugin = {
  name: "Gauge",
  description:
    "Gauges provide a flexible system for distributing rewards and adjusting parameters based on various economic factors and governance decisions.",

  getDefaultParams(): GaugeRateKeeperParams {
    return {
      type: "GAUGE",
    };
  },

  stateSchema: object<GaugeRateKeeperState>({
    type: identity(string),
    salt: observed(optional(string)),
    rates: record(address, object({ minRate: integer, maxRate: integer })),
  }),
  getDeployState(params): GaugeRateKeeperState {
    if (params.type !== "GAUGE") {
      throw new Error("Invalid params");
    }
    return {
      ...params,
      rates: {},
    };
  },

  getDeployParams({ pool, gearStakingAddress, params }) {
    if (params.type !== "GAUGE") {
      throw new Error("Invalid GAUGE params");
    }

    return {
      postfix: stringToHex("GAUGE", { size: 32 }),
      salt: params.salt ? handleSalt(params.salt) : zeroHash,
      constructorParams: encodeAbiParameters(GAUGE_RATE_KEEPER_ABI, [
        pool,
        gearStakingAddress,
      ]),
    };
  },

  onNewAsset(state, asset) {
    if (state.rateKeeper.type !== "GAUGE") {
      throw new Error("Invalid state");
    }
    return updateRateKeeperState({
      state,
      update: (rateKeeper: GaugeRateKeeperState) => ({
        ...rateKeeper,
        rates: { ...rateKeeper.rates, [asset]: { minRate: 1, maxRate: 1 } },
      }),
    });
  },
};

export const gaugeMarketActionsData = [
  changeQuotaMinRateActionData,
  changeQuotaMaxRateActionData,
];
