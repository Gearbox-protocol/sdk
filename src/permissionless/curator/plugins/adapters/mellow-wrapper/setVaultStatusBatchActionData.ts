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
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      version: z.literal(310),
      target: addressSchema,
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
        adapterActionAbi.MELLOW_WRAPPER![params.version],
        {
          functionName: "setVaultStatusBatch",
          args: [params.vaults.map(v => [v.vault, v.allowed] as const)],
        },
      ),
    ...adapterBatch<
      "vaults",
      SetVaultStatusBatchAction["params"],
      MellowWrapperAdapterState
    >({
      type: "MELLOW_WRAPPER",
      field: "vaults",
      list: mellowWrapperVaultsList,
      toState: v => ({
        allowed: v.allowed,
        vault: lowerAddress(v.vault),
      }),
    }),
  });
