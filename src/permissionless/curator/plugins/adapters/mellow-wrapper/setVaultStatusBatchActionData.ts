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
import type { MellowWrapperAdapterState } from "./mellowWrapperAdapterPlugin.js";

export type MellowVaultStatus = {
  vault: Address;
  allowed: boolean;
};

export type SetVaultStatusBatchParams = AdapterActionContext & {
  vaults: MellowVaultStatus[];
};

export type SetVaultStatusBatchAction = BaseMarketAction<
  "ADAPTER::MELLOW_WRAPPER::setVaultStatusBatch",
  SetVaultStatusBatchParams
>;

/**
 * The adapter's `vaults` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const mellowWrapperVaultsList = list<
  ItemOf<MellowWrapperAdapterState, "vaults">
>(
  object({ vault: identity(address), allowed: boolean }),
  vault => lower(vault.vault),
  allowed,
);

export const setVaultStatusBatchActionData: MarketScopedDefinition<SetVaultStatusBatchAction> =
  defineMarketAction<SetVaultStatusBatchAction>({
    type: "ADAPTER::MELLOW_WRAPPER::setVaultStatusBatch",
    gas: () => 200_000, // not measured
    name: "MellowWrapper::setVaultStatusBatch",
    description: `Set vault batch status, which represents Mellow vaults could be used for swaps for credit accounts.`,
    schema: adapterActionSchema([310], {
      vaults: z.array(
        z.object({
          vault: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),

    encode: ({ ctx, params }) =>
      configureAdapter(
        ctx,
        params,
        adapterAbi("MELLOW_WRAPPER", params.version),
        {
          functionName: "setVaultStatusBatch",
          args: [params.vaults.map(v => [v.vault, v.allowed] as const)],
        },
      ),
    ...adapterBatch({
      type: "MELLOW_WRAPPER",
      field: "vaults",
      list: mellowWrapperVaultsList,
      toState: v => lowerAddresses(v, ["vault"]),
    }),
  });
