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
import type { MellowClaimerAdapterState } from "./index.js";

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

export const setMultiVaultStatusBatchActionData: MarketActionData<
  SetMultiVaultStatusBatchAction,
  AdapterActionContext
> = {
  type: "ADAPTER::MELLOW_CLAIMER::setMultiVaultStatusBatch",
  name: "MellowClaimer::setMultiVaultStatusBatch",
  description: `Set vault batch status, which represents Mellow vaults could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: z.literal(310),
    target: addressSchema,
    vaults: z.array(
      z.object({
        multiVault: addressSchema,
        stakedToken: addressSchema,
        allowed: z.boolean(),
      }),
    ),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: MellowClaimerAdapterState) => {
        return {
          ...adapter,
          vaults: [
            ...(adapter.vaults || []),
            ...params.vaults.map(v => ({
              allowed: v.allowed,
              multiVault: v.multiVault.toLowerCase() as Address,
              stakedToken: v.stakedToken.toLowerCase() as Address,
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
      adapterActionAbi["MELLOW_CLAIMER"]![action.params.version],
      {
        functionName: "setMultiVaultStatusBatch",
        args: [
          params.vaults.map(
            v => [v.multiVault, v.stakedToken, v.allowed] as const,
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
    a: SetMultiVaultStatusBatchParams,
    b: SetMultiVaultStatusBatchParams,
  ) => {
    // Two setMultiVaultStatusBatch actions for the same target and creditManager replace each other
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
