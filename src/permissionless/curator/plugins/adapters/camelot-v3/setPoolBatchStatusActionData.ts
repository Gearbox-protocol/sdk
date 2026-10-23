import type { Address } from "viem";
import { z } from "zod/v4";
import { adapterActionAbi } from "../../../../../onchain/index.js";
import type { BaseMarketAction } from "../../../actions/actionTypes.js";
import { creditManagerTargetSchema } from "../../../actions/creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { configureAdapter } from "../../../actions/utils/configureCalls.js";
import { boolean, list, object } from "../../../state/diff/schemaNodes.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema } from "../../../validationSchemas.js";
import { adapterBatch } from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import {
  allowed,
  type ItemOf,
  orderPair,
  pairFields,
  pairKey,
} from "../adapterStateSchema.js";
import type { CamelotV3AdapterState } from "./camelotV3Plugin.js";

export type CamelotV3PairStatus = {
  token0: Address;
  token1: Address;
  allowed: boolean;
};

export type SetPoolBatchStatusParams = AdapterActionContext & {
  pairs: CamelotV3PairStatus[];
};

export type SetPoolBatchStatusAction = BaseMarketAction<
  "ADAPTER::CAMELOT_V3_ROUTER::setPoolStatusBatch",
  SetPoolBatchStatusParams
>;

/**
 * The adapter's `pairs` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const camelotV3PairsList = list<ItemOf<CamelotV3AdapterState, "pairs">>(
  object({ ...pairFields, allowed: boolean }, orderPair),
  pairKey,
  allowed,
);

export const setPoolBatchStatusActionData: MarketScopedDefinition<SetPoolBatchStatusAction> =
  defineMarketAction<SetPoolBatchStatusAction>({
    type: "ADAPTER::CAMELOT_V3_ROUTER::setPoolStatusBatch",
    gas: ({ params }) => 135_000 + params.pairs.length * 60_000, // got 188,433
    name: "CAMELOT_V3_ROUTER::setPoolStatusBatch",
    description: `Set pool batch status, which represents Camelot V3 pairs could be used for swaps for credit accounts.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      target: addressSchema,
      version: z.literal(310),
      pairs: z.array(
        z.object({
          token0: addressSchema,
          token1: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),

    encode: ({ ctx, params }) =>
      configureAdapter(
        ctx,
        params,
        adapterActionAbi.CAMELOT_V3_ROUTER![params.version],
        {
          functionName: "setPoolStatusBatch",
          args: [
            params.pairs.map(p => [p.token0, p.token1, p.allowed] as const),
          ],
        },
      ),
    ...adapterBatch<
      "pairs",
      SetPoolBatchStatusAction["params"],
      CamelotV3AdapterState
    >({
      type: "CAMELOT_V3_ROUTER",
      field: "pairs",
      list: camelotV3PairsList,
      toState: p => ({
        allowed: p.allowed,
        token0: lowerAddress(p.token0),
        token1: lowerAddress(p.token1),
      }),
    }),
  });
