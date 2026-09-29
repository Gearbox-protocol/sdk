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
import type { KelpLRTDepositPoolAdapterState } from "./index.js";

export type KelpLRTDepositPoolAssetsStatus = {
  asset: Address;
  allowed: boolean;
};

export type SetAssetStatusBatchParams = AdapterActionContext & {
  allowedAssets: KelpLRTDepositPoolAssetsStatus[];
};

export type SetAssetStatusBatchAction = BaseMarketAction<
  "ADAPTER::KELP_DEPOSIT_POOL::setAssetStatusBatch",
  SetAssetStatusBatchParams
>;

export const setAssetStatusBatchActionData: MarketActionData<
  SetAssetStatusBatchAction,
  AdapterActionContext
> = {
  type: "ADAPTER::KELP_DEPOSIT_POOL::setAssetStatusBatch",
  name: "KELP_DEPOSIT_POOL::setAssetStatusBatch",
  description: `Set asset status batch, which represents Kelp LRT Deposit Pool assets could be used for deposits for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: z.literal(310),
    target: addressSchema,
    allowedAssets: z.array(
      z.object({
        asset: addressSchema,
        allowed: z.boolean(),
      }),
    ),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: KelpLRTDepositPoolAdapterState) => ({
        ...adapter,
        allowedAssets: [
          ...adapter.allowedAssets,
          ...params.allowedAssets.map(p => ({
            allowed: p.allowed,
            asset: p.asset.toLowerCase() as Address,
          })),
        ],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["KELP_DEPOSIT_POOL"]![action.params.version],
      {
        functionName: "setAssetStatusBatch",
        args: [
          params.allowedAssets.map(({ asset }) => asset),
          params.allowedAssets.map(({ allowed }) => allowed),
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
  replace: (a: SetAssetStatusBatchParams, b: SetAssetStatusBatchParams) => {
    // Two setAssetStatusBatch actions for the same target and creditManager replace each other
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
