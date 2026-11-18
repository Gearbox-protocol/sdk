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
import type { TreehouseRouterAdapterState } from "./treehouseRouterAdapterPlugin.js";

export type TreehouseRouterAssetStatus = {
  asset: Address;
  allowed: boolean;
};

export type SetAssetStatusBatchParams = AdapterActionContext & {
  allowedAssets: TreehouseRouterAssetStatus[];
};

export type SetAssetStatusBatchAction = BaseMarketAction<
  "ADAPTER::TREEHOUSE_ROUTER::setAssetStatusBatch",
  SetAssetStatusBatchParams
>;

/**
 * The adapter's `allowedAssets` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const treehouseRouterAllowedAssetsList = list<
  ItemOf<TreehouseRouterAdapterState, "allowedAssets">
>(
  object({ asset: identity(address), allowed: boolean }),
  asset => lower(asset.asset),
  allowed,
);

export const setAssetStatusBatchActionData: MarketScopedDefinition<SetAssetStatusBatchAction> =
  defineMarketAction<SetAssetStatusBatchAction>({
    type: "ADAPTER::TREEHOUSE_ROUTER::setAssetStatusBatch",
    gas: () => 200_000, // not measured
    name: "TreehouseRouter::setAssetStatusBatch",
    description: `Set asset status batch, which represents assets credit accounts can deposit into the tAsset through the Treehouse router.`,
    schema: adapterActionSchema([310], {
      allowedAssets: z.array(
        z.object({
          asset: addressSchema,
          allowed: z.boolean(),
        }),
      ),
    }),

    encode: ({ ctx, params }) => {
      const { allowedAssets, version } = params;
      return configureAdapter(
        ctx,
        params,
        adapterAbi("TREEHOUSE_ROUTER", version),
        {
          functionName: "setAssetStatusBatch",
          args: [
            allowedAssets.map(({ asset }) => asset),
            allowedAssets.map(({ allowed }) => allowed),
          ],
        },
      );
    },
    ...adapterBatch({
      type: "TREEHOUSE_ROUTER",
      field: "allowedAssets",
      list: treehouseRouterAllowedAssetsList,
      toState: a => lowerAddresses(a, ["asset"]),
    }),
  });
