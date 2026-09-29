import type { Address } from "viem";
import { z } from "zod";
import { adapterActionAbi } from "../../../../../onchain/index.js";
import { createCallData } from "../../../../index.js";
import type {
  BaseMarketAction,
  MarketActionData,
} from "../../../core/actions/types.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterActionContext } from "../actions.js";
import { updateAdapterState } from "../logic.js";
import type { KelpLRTWithdrawalManagerAdapterState } from "./index.js";

export type KelpLRTWithdrawalManagerTokenOutStatus = {
  tokenOut: Address;
  phantomToken: Address;
  allowed: boolean;
};

export type SetTokensOutStatusBatchParams = AdapterActionContext & {
  tokensOut: KelpLRTWithdrawalManagerTokenOutStatus[];
};

export type SetTokensOutStatusBatchAction = BaseMarketAction<
  "ADAPTER::KELP_WITHDRAWAL::setTokensOutStatusBatch",
  SetTokensOutStatusBatchParams
>;

export const setTokensOutStatusBatchActionData: MarketActionData<
  SetTokensOutStatusBatchAction,
  AdapterActionContext
> = {
  type: "ADAPTER::KELP_WITHDRAWAL::setTokensOutStatusBatch",
  name: "KELP_WITHDRAWAL::setTokensOutStatusBatch",
  description: `Set tokens out status batch, which represents Kelp LRT Withdrawal Manager tokens could be used for withdrawals for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: z.literal(310),
    target: addressSchema,
    tokensOut: z.array(
      z.object({
        tokenOut: addressSchema,
        phantomToken: addressSchema,
        allowed: z.boolean(),
      }),
    ),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: KelpLRTWithdrawalManagerAdapterState) => ({
        ...adapter,
        tokensOut: [
          ...adapter.tokensOut,
          ...params.tokensOut.map(p => ({
            allowed: p.allowed,
            tokenOut: p.tokenOut.toLowerCase() as Address,
            phantomToken: p.phantomToken.toLowerCase() as Address,
          })),
        ],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["KELP_WITHDRAWAL"]![action.params.version],
      {
        functionName: "setTokensOutBatchStatus",
        args: [
          params.tokensOut.map(({ tokenOut, phantomToken, allowed }) => [
            tokenOut,
            phantomToken,
            allowed,
          ]),
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
  replace: (
    a: SetTokensOutStatusBatchParams,
    b: SetTokensOutStatusBatchParams,
  ) => {
    // Two setTokensOutStatusBatch actions for the same target and creditManager replace each other
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
