import type { Address } from "viem";
import { z } from "zod";
import {
  adapterActionAbi,
  PendlePairStatus as PendlePairStatusEnum,
  PendleTokenType,
} from "../../../../../onchain/index.js";
import { createCallData } from "../../../../index.js";
import type {
  BaseMarketAction,
  MarketActionData,
} from "../../../core/actions/types.js";
import { addressSchema, literalsSchema } from "../../../core/validation.js";
import type { AdapterActionContext } from "../actions.js";
import { updateAdapterState } from "../logic.js";
import type { PendleAdapterState } from "./index.js";

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

export const setPairBatchStatusActionData: MarketActionData<
  SetPairBatchStatusAction,
  AdapterActionContext
> = {
  type: "ADAPTER::PENDLE_ROUTER::setPairStatusBatch",
  name: "Pendle::setPairStatusBatch",
  description: `Set pair batch status, which represents Pendle pairs could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
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
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: PendleAdapterState) => ({
        ...adapter,
        pairs: [
          ...adapter.pairs,
          ...params.pairs.map(p => ({
            market: p.market.toLowerCase() as Address,
            inputToken: p.inputToken.toLowerCase() as Address,
            pendleToken: p.pendleToken.toLowerCase() as Address,
            pendleTokenType: p.pendleTokenType,
            status: p.status,
          })),
        ],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["PENDLE_ROUTER"]![action.params.version],
      {
        functionName: "setPairStatusBatch",
        args: [
          params.pairs.map(p =>
            action.params.version === 310
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
    const tx = mc.configureAdapterFor(
      params.creditManager,
      params.target,
      calldata,
    );
    return { tx: { tx, action } };
  },
  replaceKeep: "last",
  replace: (a: SetPairBatchStatusParams, b: SetPairBatchStatusParams) => {
    // Two setPairBatchStatus actions for the same target and creditManager replace each other
    return (
      a.creditManager.toLowerCase() === b.creditManager.toLowerCase() &&
      a.target.toLowerCase() === b.target.toLowerCase()
    );
  },
  replaceCmAddress: ({ action, oldCm, newCm }) => {
    if (action.params.creditManager.toLowerCase() === oldCm.toLowerCase()) {
      return {
        ...action,
        params: {
          ...action.params,
          creditManager: newCm,
        },
      };
    }
    return action;
  },
};
