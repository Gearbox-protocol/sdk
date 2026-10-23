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
import type { UniswapV2AdapterState } from "./uniswapV2Plugin.js";

export type UniswapV2PairStatus = {
  token0: Address;
  token1: Address;
  allowed: boolean;
};

export type SetPairBatchStatusParams = AdapterActionContext & {
  pairs: UniswapV2PairStatus[];
};

export type SetPairBatchStatusAction = BaseMarketAction<
  "ADAPTER::UNISWAP_V2_ROUTER::setPairBatchStatus",
  SetPairBatchStatusParams
>;

/**
 * The adapter's `pairs` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const uniswapV2PairsList = list<ItemOf<UniswapV2AdapterState, "pairs">>(
  object({ ...pairFields, allowed: boolean }, orderPair),
  pairKey,
  allowed,
);

export const setPairBatchStatusActionData: MarketScopedDefinition<SetPairBatchStatusAction> =
  defineMarketAction<SetPairBatchStatusAction>({
    type: "ADAPTER::UNISWAP_V2_ROUTER::setPairBatchStatus",
    // got 188,465 for 1 pair and 301,457 for 3 pairs
    gas: ({ params }) => 135_000 + params.pairs.length * 60_000,
    name: "UniswapV2::setPairBatchStatus",
    description: `Set pair batch status, which represents Uniswap V2 pairs could be used for swaps for credit accounts.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      version: z.literal(310),
      target: addressSchema,
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
        adapterActionAbi.UNISWAP_V2_ROUTER![params.version],
        {
          functionName: "setPairStatusBatch",
          args: [
            params.pairs.map(p => [p.token0, p.token1, p.allowed] as const),
          ],
        },
      ),
    ...adapterBatch<
      "pairs",
      SetPairBatchStatusAction["params"],
      UniswapV2AdapterState
    >({
      type: "UNISWAP_V2_ROUTER",
      field: "pairs",
      list: uniswapV2PairsList,
      toState: p => ({
        allowed: p.allowed,
        token0: lowerAddress(p.token0),
        token1: lowerAddress(p.token1),
      }),
    }),
  });
