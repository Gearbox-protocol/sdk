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
import type { MidasRedemptionAdapterState } from "./index.js";

export type MidasRedemptionTokenStatus = {
  token: Address;
  phantomToken?: Address;
  allowed: boolean;
};

export type SetTokenAllowedStatusBatchParams = AdapterActionContext & {
  allowedTokens: MidasRedemptionTokenStatus[];
};

export type SetTokenAllowedStatusBatchAction = BaseMarketAction<
  "ADAPTER::MIDAS_REDEMPTION_VAULT::setTokenAllowedStatusBatch",
  SetTokenAllowedStatusBatchParams
>;

export const setTokenAllowedStatusBatchActionData: MarketActionData<
  SetTokenAllowedStatusBatchAction,
  AdapterActionContext
> = {
  type: "ADAPTER::MIDAS_REDEMPTION_VAULT::setTokenAllowedStatusBatch",
  name: "MidasRedemption::setTokenAllowedStatusBatch",
  description: `Set token allowed status batch, which represents tokens could be redeemed for credit accounts.`,
  schema: z.discriminatedUnion("version", [
    z.object({
      creditManager: addressSchema,
      version: z.literal(310),
      target: addressSchema,
      allowedTokens: z.array(
        z.object({
          token: addressSchema,
          phantomToken: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),
    z.object({
      creditManager: addressSchema,
      version: z.literal(311),
      target: addressSchema,
      allowedTokens: z.array(
        z.object({
          token: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),
  ]),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: MidasRedemptionAdapterState) => {
        return {
          ...adapter,
          allowedTokens: [
            ...(adapter.allowedTokens || []),
            ...params.allowedTokens.map(t => ({
              allowed: t.allowed,
              token: t.token.toLowerCase() as Address,
              phantomToken: t?.phantomToken?.toLowerCase() as
                | Address
                | undefined,
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
      adapterActionAbi["MIDAS_REDEMPTION_VAULT"]![action.params.version],
      params.version > 310
        ? {
            functionName: "setOutputTokenStatusBatch",
            args: [
              params.allowedTokens.map(({ token }) => token),
              params.allowedTokens.map(({ allowed }) => allowed),
            ],
          }
        : {
            functionName: "setTokenAllowedStatusBatch",
            args: [
              params.allowedTokens.map(
                v => [v.token, v.phantomToken as Address, v.allowed] as const,
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
