import type { Address } from "viem";
import { z } from "zod";
import type { MarketState } from "../../core/market-state/types.js";
import type { DeployParams } from "../../core/market-tx.js";
import type { Plugin } from "../logic.js";
import {
  type GaugeRateKeeperParams as GaugeDeployParams,
  type GaugeMarketActions,
  type GaugeRateKeeperState,
  gaugeDeployParamsSchema,
  gaugeMarketActionsData,
  gaugePlugin,
} from "./gauge/logic.js";
import {
  type TumblerRateKeeperParams as TumblerDeployParams,
  type TumblerMarketActions,
  type TumblerRateKeeperState,
  tumblerDeployParamsSchema,
  tumblerMarketActionsData,
  tumblerPlugin,
} from "./tumbler/logic.js";
export type RateKeeperDeployParams = TumblerDeployParams | GaugeDeployParams;
export type RateKeeperState = GaugeRateKeeperState | TumblerRateKeeperState;

export type RateKeeperType = RateKeeperDeployParams["type"];

export interface RateKeeperPlugin
  extends Plugin<
    RateKeeperDeployParams,
    RateKeeperState,
    RateKeeperMarketActions
  > {
  getDeployParams(args: {
    pool: Address;
    gearStakingAddress: Address;
    params: RateKeeperDeployParams;
  }): DeployParams;
  onNewAsset(state: MarketState, asset: Address): MarketState;
}

export const rateKeeperPlugins: Record<RateKeeperType, RateKeeperPlugin> = {
  TUMBLER: tumblerPlugin,
  GAUGE: gaugePlugin,
};

const DEFAULT_RATE_KEEPER_TYPE: RateKeeperType = "TUMBLER";

export const DEFAULT_RATE_KEEPER_PARAMS: RateKeeperDeployParams =
  rateKeeperPlugins[DEFAULT_RATE_KEEPER_TYPE].getDefaultParams();

export const DEFAULT_RATE_KEEPER_STATE: RateKeeperState = rateKeeperPlugins[
  DEFAULT_RATE_KEEPER_PARAMS.type
].getDeployState(DEFAULT_RATE_KEEPER_PARAMS);

export type RateKeeperMarketActions = TumblerMarketActions | GaugeMarketActions;

export const rateKeeperDeployParamsSchema = z.discriminatedUnion("type", [
  tumblerDeployParamsSchema,
  gaugeDeployParamsSchema,
]);

export function updateRateKeeperState<T extends RateKeeperState>(args: {
  state: MarketState;
  update: (state: T) => T;
}): MarketState {
  const { state, update } = args;

  if (!state.rateKeeper) {
    throw new Error("Rate keeper not found");
  }

  return {
    ...state,
    rateKeeper: update(state.rateKeeper as T),
  };
}

export const rateKeeperMarketActionsData = [
  ...tumblerMarketActionsData,
  ...gaugeMarketActionsData,
];
