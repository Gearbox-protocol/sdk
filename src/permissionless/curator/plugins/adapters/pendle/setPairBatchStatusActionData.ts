import type { Address } from "viem";
import { z } from "zod/v4";
import {
  adapterActionAbi,
  PendlePairStatus as PendlePairStatusEnum,
  PendleTokenType,
} from "../../../../../onchain/index.js";
import type { BaseMarketAction } from "../../../actions/actionTypes.js";
import { creditManagerTargetSchema } from "../../../actions/creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { configureAdapter } from "../../../actions/utils/configureCalls.js";
import {
  address,
  identity,
  list,
  object,
  scalar,
  status,
} from "../../../state/diff/schemaNodes.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema, literalsSchema } from "../../../validationSchemas.js";
import { adapterBatch } from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import { enabled, type ItemOf, lower } from "../adapterStateSchema.js";
import type { PendleAdapterState } from "./pendlePlugin.js";

export type PendlePairStatus = {
  market: Address;
  inputToken: Address;
  pendleToken: Address;
  pendleTokenType: PendleTokenType;
  status: PendlePairStatusEnum;
};

export type SetPairBatchStatusParams = AdapterActionContext & {
  pairs: PendlePairStatus[];
};

export type SetPairBatchStatusAction = BaseMarketAction<
  "ADAPTER::PENDLE_ROUTER::setPairStatusBatch",
  SetPairBatchStatusParams
>;

/**
 * The adapter's `pairs` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const pendlePairsList = list<ItemOf<PendleAdapterState, "pairs">>(
  object({
    market: identity(address),
    inputToken: identity(address),
    pendleToken: identity(address),
    pendleTokenType: scalar,
    status,
  }),
  pair => [pair.market, pair.inputToken, pair.pendleToken].map(lower).join("-"),
  enabled,
);

export const setPairBatchStatusActionData: MarketScopedDefinition<SetPairBatchStatusAction> =
  defineMarketAction<SetPairBatchStatusAction>({
    type: "ADAPTER::PENDLE_ROUTER::setPairStatusBatch",
    gas: ({ params }) => 135_000 + params.pairs.length * 160_000, // got 288,453
    name: "Pendle::setPairStatusBatch",
    description: `Set pair batch status, which represents Pendle pairs could be used for swaps for credit accounts.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      version: literalsSchema(310, 311),
      target: addressSchema,
      pairs: z.array(
        z.object({
          market: addressSchema,
          inputToken: addressSchema,
          pendleToken: addressSchema,
          pendleTokenType: z.nativeEnum(PendleTokenType),
          status: z.nativeEnum(PendlePairStatusEnum),
        }),
      ),
    }),

    encode: ({ ctx, params }) => {
      const { pairs, version } = params;
      return configureAdapter(
        ctx,
        params,
        adapterActionAbi.PENDLE_ROUTER![version],
        {
          functionName: "setPairStatusBatch",
          args: [
            // v310 takes no token type
            pairs.map(p =>
              version === 310
                ? ([p.market, p.inputToken, p.pendleToken, p.status] as const)
                : ([
                    p.market,
                    p.inputToken,
                    p.pendleToken,
                    p.pendleTokenType,
                    p.status,
                  ] as const),
            ),
          ],
        },
      );
    },
    ...adapterBatch<
      "pairs",
      SetPairBatchStatusAction["params"],
      PendleAdapterState
    >({
      type: "PENDLE_ROUTER",
      field: "pairs",
      list: pendlePairsList,
      toState: p => ({
        market: lowerAddress(p.market),
        inputToken: lowerAddress(p.inputToken),
        pendleToken: lowerAddress(p.pendleToken),
        pendleTokenType: p.pendleTokenType,
        status: p.status,
      }),
    }),
  });
