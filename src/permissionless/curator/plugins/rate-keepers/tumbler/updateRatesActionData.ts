import { z } from "zod/v4";
import { iTumblerV310Abi } from "../../../../../abi/310/generated.js";
import type { BaseMarketAction } from "../../../actions/actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { single } from "../../../actions/utils/actionKeys.js";
import { rateKeeperMismatch } from "../../../actions/utils/checkHelpers.js";
import { configureRateKeeper } from "../../../actions/utils/configureCalls.js";
import { updateRateKeeperState } from "../updateRateKeeperState.js";
import type { TumblerRateKeeperState } from "./tumblerPlugin.js";

export type UpdateRatesAction = BaseMarketAction<
  "RATE_KEEPER::TUMBLER::updateRates",
  Record<never, never>
>;

export const updateRatesActionData: MarketScopedDefinition<UpdateRatesAction> =
  defineMarketAction<UpdateRatesAction>({
    type: "RATE_KEEPER::TUMBLER::updateRates",
    // got 94,601 with 1 quoted token and 112,034 with 2
    gas: ({ after }) =>
      80_000 + 20_000 * Object.keys(after.rateKeeper.rates).length,
    description: `Update token rates. The function is used to update quota rates`,
    schema: z.object({}),
    // @dev nothing to project: it only makes already recorded rates effective
    check: ({ state }) =>
      state.rateKeeper.type === "TUMBLER"
        ? []
        : [rateKeeperMismatch("TUMBLER", state.rateKeeper.type)],
    apply: ({ state }) =>
      updateRateKeeperState({
        state,
        update: (rateKeeper: TumblerRateKeeperState) => rateKeeper,
      }),
    encode: ({ ctx, state }) =>
      configureRateKeeper(ctx, state, iTumblerV310Abi, {
        functionName: "updateRates",
      }),
    merge: { position: "last" },
    key: single,
  });
