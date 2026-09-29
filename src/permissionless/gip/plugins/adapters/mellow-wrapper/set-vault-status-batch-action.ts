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
import type { MellowWrapperAdapterState } from "./index.js";

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

export const setVaultStatusBatchActionData: MarketActionData<
  SetVaultStatusBatchAction,
  AdapterActionContext
> = {
  type: "ADAPTER::MELLOW_WRAPPER::setVaultStatusBatch",
  name: "MellowWrapper::setVaultStatusBatch",
  description: `Set vault batch status, which represents Mellow vaults could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: z.literal(310),
    target: addressSchema,
    vaults: z.array(
      z.object({
        vault: addressSchema,
        allowed: z.boolean(),
      }),
    ),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: MellowWrapperAdapterState) => {
        return {
          ...adapter,
          vaults: [
            ...(adapter.vaults || []),
            ...params.vaults.map(v => ({
              allowed: v.allowed,
              vault: v.vault.toLowerCase() as Address,
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
      adapterActionAbi["MELLOW_WRAPPER"]![action.params.version],
      {
        functionName: "setVaultStatusBatch",
        args: [params.vaults.map(v => [v.vault, v.allowed] as const)],
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
  replace: (a: SetVaultStatusBatchParams, b: SetVaultStatusBatchParams) => {
    // Two setVaultStatusBatch actions for the same target and creditManager replace each other
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
