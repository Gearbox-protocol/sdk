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
import type { MidasIssuanceAdapterState } from "./index.js";

export type MidasIssuanceTokenStatus = {
  token: Address;
  allowed: boolean;
};

export type SetTokenAllowedStatusBatchParams = AdapterActionContext & {
  allowedTokens: MidasIssuanceTokenStatus[];
};

export type SetTokenAllowedStatusBatchAction = BaseMarketAction<
  "ADAPTER::MIDAS_ISSUANCE_VAULT::setTokenAllowedStatusBatch",
  SetTokenAllowedStatusBatchParams
>;

export const setTokenAllowedStatusBatchActionData: MarketActionData<
  SetTokenAllowedStatusBatchAction,
  AdapterActionContext
> = {
  type: "ADAPTER::MIDAS_ISSUANCE_VAULT::setTokenAllowedStatusBatch",
  name: "MidasIssuance::setTokenAllowedStatusBatch",
  description: `Set token allowed status batch, which represents tokens could be issued for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: z.literal(310 | 311),
    target: addressSchema,
    allowedTokens: z.array(
      z.object({
        token: addressSchema,
        allowed: z.boolean(),
      }),
    ),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: MidasIssuanceAdapterState) => {
        return {
          ...adapter,
          allowedTokens: [
            ...(adapter.allowedTokens || []),
            ...params.allowedTokens.map(t => ({
              allowed: t.allowed,
              token: t.token.toLowerCase() as Address,
            })),
          ],
        };
      },
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["MIDAS_ISSUANCE_VAULT"]![action.params.version],
      {
        functionName:
          action.params.version > 310
            ? "setInputTokenStatusBatch"
            : "setTokenAllowedStatusBatch",
        args: [
          params.allowedTokens.map(({ token }) => token),
          params.allowedTokens.map(({ allowed }) => allowed),
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
    a: SetTokenAllowedStatusBatchParams,
    b: SetTokenAllowedStatusBatchParams,
  ) => {
    // Two setTokenAllowedStatusBatch actions for the same target and creditManager replace each other
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
