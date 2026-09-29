import type { Address } from "viem";
import { z } from "zod";
import { adapterActionAbi } from "../../../../../onchain/index.js";
import { createCallData } from "../../../../index.js";
import type { GipBuilderContext } from "../../../core/actions/context.js";
import type {
  BaseMarketAction,
  MarketActionData,
} from "../../../core/actions/types.js";
import type { MarketState } from "../../../core/market-state/types.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterActionContext } from "../actions.js";
import { updateAdapterState } from "../logic.js";
import type {
  InfinifiAdapterState,
  SetLockedTokenBatchStatusParams,
} from "./index.js";

export type GatewaySetLockedTokenBatchStatusAction = BaseMarketAction<
  "ADAPTER::INFINIFI_GATEWAY::setLockedTokenBatchStatus",
  SetLockedTokenBatchStatusParams
>;

export type UnwindingSetLockedTokenBatchStatusAction = BaseMarketAction<
  "ADAPTER::INFINIFI_UNWINDING::setLockedTokenBatchStatus",
  SetLockedTokenBatchStatusParams
>;

type InfinifiAdapterType = "INFINIFI_GATEWAY" | "INFINIFI_UNWINDING";

export function getSetLockedTokenBatchStatusActionData(
  type: "INFINIFI_GATEWAY",
): MarketActionData<
  GatewaySetLockedTokenBatchStatusAction,
  AdapterActionContext
>;
export function getSetLockedTokenBatchStatusActionData(
  type: "INFINIFI_UNWINDING",
): MarketActionData<
  UnwindingSetLockedTokenBatchStatusAction,
  AdapterActionContext
>;

export function getSetLockedTokenBatchStatusActionData(
  type: InfinifiAdapterType,
):
  | MarketActionData<
      GatewaySetLockedTokenBatchStatusAction,
      AdapterActionContext
    >
  | MarketActionData<
      UnwindingSetLockedTokenBatchStatusAction,
      AdapterActionContext
    > {
  const actionType =
    type === "INFINIFI_GATEWAY"
      ? "ADAPTER::INFINIFI_GATEWAY::setLockedTokenBatchStatus"
      : "ADAPTER::INFINIFI_UNWINDING::setLockedTokenBatchStatus";
  const actionName =
    type === "INFINIFI_GATEWAY"
      ? "INFINIFI_GATEWAY::setLockedTokenBatchStatus"
      : "INFINIFI_UNWINDING::setLockedTokenBatchStatus";

  return {
    type: actionType as
      | "ADAPTER::INFINIFI_GATEWAY::setLockedTokenBatchStatus"
      | "ADAPTER::INFINIFI_UNWINDING::setLockedTokenBatchStatus",
    name: actionName,
    description: `Set locked token batch status, which represents infinifi locked tokens could be used for swaps for credit accounts.`,
    schema: z.object({
      creditManager: addressSchema,
      version: z.literal(310),
      target: addressSchema,
      lockedTokens: z.array(
        z.object({
          lockedToken: addressSchema,
          unwindingEpochs: z.number(),
          allowed: z.boolean(),
        }),
      ),
    }),
    stateTransition: ({ state, params }) => {
      return updateAdapterState({
        state,
        creditManager: params.creditManager,
        target: params.target,
        update: (adapter: InfinifiAdapterState) => ({
          ...adapter,
          lockedTokens: [
            ...adapter.lockedTokens,
            ...params.lockedTokens.map(p => ({
              lockedToken: p.lockedToken.toLowerCase() as Address,
              unwindingEpochs: p.unwindingEpochs,
              allowed: p.allowed,
            })),
          ],
        }),
      });
    },
    getRawTx: async ({
      ctx,
      action,
    }: {
      ctx: GipBuilderContext;
      state: MarketState;
      action:
        | GatewaySetLockedTokenBatchStatusAction
        | UnwindingSetLockedTokenBatchStatusAction;
    }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const calldata = createCallData(
        adapterActionAbi[type]![action.params.version],
        {
          functionName: "setLockedTokenBatchStatus",
          args: [
            params.lockedTokens.map(
              ({ lockedToken, unwindingEpochs, allowed }) =>
                [lockedToken, unwindingEpochs, allowed] as const,
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
      a: SetLockedTokenBatchStatusParams,
      b: SetLockedTokenBatchStatusParams,
    ) => {
      // Two setLockedTokenBatchStatus actions for the same target and creditManager replace each other
      return (
        a.creditManager.toLowerCase() === b.creditManager.toLowerCase() &&
        a.target.toLowerCase() === b.target.toLowerCase()
      );
    },
    replaceCmAddress: ({
      action,
      oldCm,
      newCm,
    }: {
      action:
        | GatewaySetLockedTokenBatchStatusAction
        | UnwindingSetLockedTokenBatchStatusAction;
      oldCm: Address;
      newCm: Address;
    }) => {
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
  } as
    | MarketActionData<
        GatewaySetLockedTokenBatchStatusAction,
        AdapterActionContext
      >
    | MarketActionData<
        UnwindingSetLockedTokenBatchStatusAction,
        AdapterActionContext
      >;
}
