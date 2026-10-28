import { type Address, encodeAbiParameters, stringToHex, zeroHash } from "viem";
import { z } from "zod/v4";
import { TUMBLER_RATE_KEEPER_ABI } from "../../../../plugins/rate-keepers/constructor-params-abi.js";
import { handleSalt } from "../../../../utils/create2.js";
import { actionError } from "../../../actions/actionDiagnostics.js";
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
import { setRateActionData } from "./setRateActionData.js";
import { updateRatesActionData } from "./updateRatesActionData.js";

export type TumblerRateKeeperParams = {
  type: "TUMBLER";
  epochSeconds: number;
  salt?: string;
};

export interface TumblerRateKeeperState extends TumblerRateKeeperParams {
  rates: Record<Address, number>;
}

/** Longest Tumbler epoch, in seconds. **/
const MAX_TUMBLER_EPOCH = 28 * 24 * 60 * 60;

export const tumblerDeployParamsSchema = z.object({
  type: z.literal("TUMBLER"),
  epochSeconds: z.number().int().min(0).max(MAX_TUMBLER_EPOCH),
  salt: z.string().optional(),
});

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

  stateSchema: object<TumblerRateKeeperState>({
    type: identity(string),
    salt: observed(optional(string)),
    epochSeconds: integer,
    rates: record(address, integer),
  }),
  getDeployState(params): TumblerRateKeeperState {
    if (params.type !== "TUMBLER") {
      throw new Error("Invalid params");
    }
    return {
      ...params,
      rates: {},
    };
  },

  onNewAsset(state, asset) {
    if (state.rateKeeper.type !== "TUMBLER") {
      throw new Error("Invalid state");
    }
    return updateRateKeeperState({
      state,
      update: (rateKeeper: TumblerRateKeeperState) => ({
        ...rateKeeper,
        rates: { ...rateKeeper.rates, [asset]: 1 },
      }),
    });
  },

  getDeployParams({ pool, params }) {
    if (params.type !== "TUMBLER") {
      throw new Error("Invalid TUMBLER params");
    }

    return {
      postfix: stringToHex(params.type, { size: 32 }),
      salt: params.salt ? handleSalt(params.salt) : zeroHash,
      constructorParams: encodeAbiParameters(TUMBLER_RATE_KEEPER_ABI, [
        pool,
        BigInt(params.epochSeconds || 0),
      ]),
    };
  },
};

export const tumblerMarketActionsData = [
  setRateActionData,
  updateRatesActionData,
];

export function tumblerDiagnostics(params: {
  type: string;
  epochSeconds?: number;
}) {
  return params.type === "TUMBLER" &&
    (params.epochSeconds ?? 0) > MAX_TUMBLER_EPOCH
    ? [
        actionError(
          "TUMBLER_EPOCH_TOO_LONG",
          "Tumbler epochs cannot exceed 28 days",
          ["params", "epochSeconds"],
        ),
      ]
    : [];
}
