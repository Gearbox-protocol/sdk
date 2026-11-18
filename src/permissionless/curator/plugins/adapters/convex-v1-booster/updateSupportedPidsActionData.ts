import type { BaseMarketAction } from "../../../actions/actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { configureAdapter } from "../../../actions/utils/configureCalls.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import {
  adapterAbi,
  adapterActionKeys,
  adapterActionSchema,
  adapterDiagnostics,
  updateActionAdapter,
} from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import type { ConvexV1BoosterAdapterState } from "./convexV1BoosterPlugin.js";

export type UpdateSupportedPidAction = BaseMarketAction<
  "ADAPTER::CVX_V1_BOOSTER::updateSupportedPids",
  AdapterActionContext
>;

export const updateSupportedPidsActionData: MarketScopedDefinition<UpdateSupportedPidAction> =
  defineMarketAction<UpdateSupportedPidAction>({
    type: "ADAPTER::CVX_V1_BOOSTER::updateSupportedPids",
    // got 247,650 with 5 adapters (1 of them a base reward pool) and 77,443
    // with 1 adapter
    gas: ({ params, after }) =>
      35_000 +
      Object.keys(
        after.creditManagers[lowerAddress(params.creditManager)].adapters,
      ).length *
        43_000,
    name: "ConvexBooster::updateSupportedPids",
    description: `Update supported pids and related token mappings, which represents Convex reward pools could be used for swaps for credit accounts.`,
    schema: adapterActionSchema([310], {}),
    // @dev nothing to project: the pids live on chain only. The update still
    // requires the booster adapter to exist.
    check: ({ state, params }) =>
      adapterDiagnostics(state, params, "CVX_V1_BOOSTER"),
    apply: ({ state, params }) =>
      updateActionAdapter<ConvexV1BoosterAdapterState>(
        state,
        params,
        adapter => adapter,
      ),
    encode: ({ ctx, params }) =>
      configureAdapter(
        ctx,
        params,
        adapterAbi("CVX_V1_BOOSTER", params.version),
        {
          functionName: "updateSupportedPids",
        },
      ),
    ...adapterActionKeys,
  });
