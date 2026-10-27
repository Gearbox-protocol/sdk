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
} from "../../../state/diff/schemaNodes.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema } from "../../../validationSchemas.js";
import { adapterBatch } from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import { allowed, type ItemOf, lower } from "../adapterStateSchema.js";
import type { MidasIssuanceAdapterState } from "./midasIssuanceAdapterPlugin.js";

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

/**
 * The adapter's `allowedTokens` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const midasIssuanceAllowedTokensList = list<
  ItemOf<MidasIssuanceAdapterState, "allowedTokens">
>(
  object({ token: identity(address), allowed: boolean }),
  token => lower(token.token),
  allowed,
);

export const setTokenAllowedStatusBatchActionData: MarketScopedDefinition<SetTokenAllowedStatusBatchAction> =
  defineMarketAction<SetTokenAllowedStatusBatchAction>({
    type: "ADAPTER::MIDAS_ISSUANCE_VAULT::setTokenAllowedStatusBatch",
    gas: () => 200_000, // not measured
    name: "MidasIssuance::setTokenAllowedStatusBatch",
    description: `Set token allowed status batch, which represents tokens credit accounts can deposit into the Midas issuance vault.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      version: z.union([z.literal(310), z.literal(311)]),
      target: addressSchema,
      allowedTokens: z.array(
        z.object({
          token: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),

    encode: ({ ctx, params }) => {
      const { allowedTokens, version } = params;
      return configureAdapter(
        ctx,
        params,
        adapterActionAbi.MIDAS_ISSUANCE_VAULT![version],
        {
          // The function was renamed after v310.
          functionName:
            version > 310
              ? "setInputTokenStatusBatch"
              : "setTokenAllowedStatusBatch",
          args: [
            allowedTokens.map(({ token }) => token),
            allowedTokens.map(({ allowed }) => allowed),
          ],
        },
      );
    },
    ...adapterBatch<
      "allowedTokens",
      SetTokenAllowedStatusBatchAction["params"],
      MidasIssuanceAdapterState
    >({
      type: "MIDAS_ISSUANCE_VAULT",
      field: "allowedTokens",
      list: midasIssuanceAllowedTokensList,
      toState: t => ({
        allowed: t.allowed,
        token: lowerAddress(t.token),
      }),
    }),
  });
