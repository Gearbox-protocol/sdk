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
import {
  address,
  boolean,
  identity,
  list,
  object,
  optional,
} from "../../../state/diff/schemaNodes.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema } from "../../../validationSchemas.js";
import { adapterBatch } from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import { allowed, type ItemOf, lower } from "../adapterStateSchema.js";
import type { MidasRedemptionAdapterState } from "./midasRedemptionAdapterPlugin.js";

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

/**
 * The adapter's `allowedTokens` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const midasRedemptionAllowedTokensList = list<
  ItemOf<MidasRedemptionAdapterState, "allowedTokens">
>(
  object({
    token: identity(address),
    phantomToken: optional(address),
    allowed: boolean,
  }),
  token => lower(token.token),
  allowed,
);

export const setTokenAllowedStatusBatchActionData: MarketScopedDefinition<SetTokenAllowedStatusBatchAction> =
  defineMarketAction<SetTokenAllowedStatusBatchAction>({
    type: "ADAPTER::MIDAS_REDEMPTION_VAULT::setTokenAllowedStatusBatch",
    gas: () => 200_000, // not measured
    name: "MidasRedemption::setTokenAllowedStatusBatch",
    description: `Set token allowed status batch, which represents tokens could be redeemed for credit accounts.`,
    // v310 pairs every redeemable token with a phantom token, v311 does not.
    schema: z.discriminatedUnion("version", [
      z.object({
        creditManager: creditManagerTargetSchema,
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
        creditManager: creditManagerTargetSchema,
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

    encode: ({ ctx, params }) => {
      const { allowedTokens, version } = params;
      return configureAdapter(
        ctx,
        params,
        adapterActionAbi.MIDAS_REDEMPTION_VAULT![version],
        version > 310
          ? {
              functionName: "setOutputTokenStatusBatch",
              args: [
                allowedTokens.map(({ token }) => token),
                allowedTokens.map(({ allowed }) => allowed),
              ],
            }
          : {
              functionName: "setTokenAllowedStatusBatch",
              args: [
                allowedTokens.map(
                  v => [v.token, v.phantomToken as Address, v.allowed] as const,
                ),
              ],
            },
      );
    },
    ...adapterBatch<
      "allowedTokens",
      SetTokenAllowedStatusBatchAction["params"],
      MidasRedemptionAdapterState
    >({
      type: "MIDAS_REDEMPTION_VAULT",
      field: "allowedTokens",
      list: midasRedemptionAllowedTokensList,
      toState: t => ({
        allowed: t.allowed,
        token: lowerAddress(t.token),
        phantomToken: t.phantomToken?.toLowerCase() as Address | undefined,
      }),
    }),
  });
