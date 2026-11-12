import type { Address } from "viem";
import { z } from "zod/v4";
import type { BaseMarketAction } from "../../../actions/actionTypes.js";
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
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterAbi,
  adapterActionSchema,
  adapterBatch,
  lowerAddresses,
} from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import { allowed, type ItemOf, lower } from "../adapterStateSchema.js";
import type { MellowClaimerAdapterState } from "./mellowClaimerAdapterPlugin.js";

export type MellowMultiVaultStatus = {
  multiVault: Address;
  stakedToken: Address;
  allowed: boolean;
};

export type SetMultiVaultStatusBatchParams = AdapterActionContext & {
  vaults: MellowMultiVaultStatus[];
};

export type SetMultiVaultStatusBatchAction = BaseMarketAction<
  "ADAPTER::MELLOW_CLAIMER::setMultiVaultStatusBatch",
  SetMultiVaultStatusBatchParams
>;

/**
 * The adapter's `vaults` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const mellowClaimerVaultsList = list<
  ItemOf<MellowClaimerAdapterState, "vaults">
>(
  object({
    multiVault: identity(address),
    stakedToken: address,
    allowed: boolean,
  }),
  vault => lower(vault.multiVault),
  allowed,
);

export const setMultiVaultStatusBatchActionData: MarketScopedDefinition<SetMultiVaultStatusBatchAction> =
  defineMarketAction<SetMultiVaultStatusBatchAction>({
    type: "ADAPTER::MELLOW_CLAIMER::setMultiVaultStatusBatch",
    gas: () => 200_000, // not measured
    name: "MellowClaimer::setMultiVaultStatusBatch",
    description: `Set vault batch status, which represents Mellow vaults could be used for swaps for credit accounts.`,
    schema: adapterActionSchema([310], {
      vaults: z.array(
        z.object({
          multiVault: addressSchema,
          stakedToken: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),

    encode: ({ ctx, params }) =>
      configureAdapter(
        ctx,
        params,
        adapterAbi("MELLOW_CLAIMER", params.version),
        {
          functionName: "setMultiVaultStatusBatch",
          args: [
            params.vaults.map(
              v => [v.multiVault, v.stakedToken, v.allowed] as const,
            ),
          ],
        },
      ),
    ...adapterBatch({
      type: "MELLOW_CLAIMER",
      field: "vaults",
      list: mellowClaimerVaultsList,
      toState: v => lowerAddresses(v, ["multiVault", "stakedToken"]),
    }),
  });
