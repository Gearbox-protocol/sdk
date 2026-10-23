import type { Address } from "viem";
import { z } from "zod/v4";
import { iTumblerV310Abi } from "../../../../../abi/310/generated.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { byToken, requiresAsset } from "../../../actions/utils/actionKeys.js";
import {
  noOp,
  rateKeeperMismatch,
  tokenNotQuoted,
} from "../../../actions/utils/checkHelpers.js";
import { configureRateKeeper } from "../../../actions/utils/configureCalls.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema, uintSchema } from "../../../validationSchemas.js";
import { updateRateKeeperState } from "../updateRateKeeperState.js";
import type { TumblerRateKeeperState } from "./tumblerPlugin.js";

export type SetRateAction = {
  type: "RATE_KEEPER::TUMBLER::setRate";
  params: {
    token: Address;
    rate: number;
  };
};

export const setRateActionData: MarketScopedDefinition<SetRateAction> =
  defineMarketAction<SetRateAction>({
    type: "RATE_KEEPER::TUMBLER::setRate",
    gas: () => 75_000, // got 73,674
    description: `Set rate for a token. The function is used to set rate for a particular token`,
    schema: z.object({
      token: addressSchema,
      rate: uintSchema(16).min(1, "Rate must be positive"),
    }),
    check: ({ state, params }) => {
      if (state.rateKeeper.type !== "TUMBLER") {
        return [rateKeeperMismatch("TUMBLER", state.rateKeeper.type)];
      }
      const rate = state.rateKeeper.rates[lowerAddress(params.token)];
      if (rate === undefined) return [tokenNotQuoted(params.token)];
      return rate === params.rate
        ? [
            noOp(`The token's rate is already ${params.rate}`, [
              "params",
              "rate",
            ]),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateRateKeeperState({
        state,
        update: (rateKeeper: TumblerRateKeeperState) => ({
          ...rateKeeper,
          rates: {
            ...rateKeeper.rates,
            [params.token.toLowerCase()]: params.rate,
          },
        }),
      }),
    // @dev `rate` is in basis points, as `setRate(address,uint16)` takes it
    encode: ({ ctx, state, params }) =>
      configureRateKeeper(ctx, state, iTumblerV310Abi, {
        functionName: "setRate",
        args: [params.token, params.rate],
      }),
    // Two setRate actions for the same token replace each other
    requires: requiresAsset,
    key: byToken,
  });
