import type { Address } from "viem";
import { z } from "zod/v4";
import { actionWarning } from "../actions/actionDiagnostics.js";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import { byToken } from "../actions/utils/actionKeys.js";
import { noOp } from "../actions/utils/checkHelpers.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import {
  resolveTreasurySplitter,
  type TreasurySplitterResolution,
  treasurySplitter,
} from "./configuratorActionHelpers.js";
import {
  type ConfiguratorScopedDefinition,
  defineConfiguratorAction,
} from "./defineConfiguratorAction.js";

interface DistributeParams {
  token: Address;
}

export type DistributeAction = BaseMarketAction<
  "TREASURY_SPLITTER::distribute",
  DistributeParams
>;

export const distributeActionData: ConfiguratorScopedDefinition<
  DistributeAction,
  TreasurySplitterResolution
> = defineConfiguratorAction<DistributeAction, TreasurySplitterResolution>({
  type: "TREASURY_SPLITTER::distribute",
  description:
    "Distribute a token held by the treasury splitter to the receivers of its split, keeping the token's insurance amount.",
  schema: z.object({
    token: addressSchema,
  }),
  resolve: resolveTreasurySplitter,
  check: ({ state, params }) => {
    const balance = state.treasury.balances?.[lowerAddress(params.token)];
    if (!balance) {
      return [
        actionWarning(
          "TOKEN_NOT_TRACKED",
          `The configurator state does not track ${params.token}, so the distributed amount is not projected`,
          ["params", "token"],
        ),
      ];
    }
    // @dev `distribute` returns early when the balance does not exceed the
    // insurance amount
    return balance.available > 0
      ? []
      : [
          noOp(`The treasury splitter has no ${params.token} to distribute`, [
            "params",
            "token",
          ]),
        ];
  },
  apply: ({ state, params }) => {
    const token = lowerAddress(params.token);
    const balances = state.treasury.balances;
    const balance = balances?.[token];
    if (!balances || !balance) return state;
    return {
      ...state,
      treasury: {
        ...state.treasury,
        // Everything above the insurance amount goes to the receivers.
        balances: { ...balances, [token]: { ...balance, available: 0 } },
      },
    };
  },
  encode: ({ ctx, params, resolved }) =>
    treasurySplitter(ctx, resolved).distribute(params.token),
  key: byToken,
});
