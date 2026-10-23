import type { Address } from "viem";
import { z } from "zod/v4";
import type { ActionOf } from "../../actions/defineMarketAction.js";
import type { MarketState } from "../../state/market/types.js";
import type { DeployParams } from "../../types.js";
import type { Plugin } from "../Plugin.js";
import {
  type GaugeRateKeeperParams as GaugeDeployParams,
  type GaugeRateKeeperState,
  gaugeDeployParamsSchema,
  gaugeMarketActionsData,
  gaugePlugin,
} from "./gauge/gaugePlugin.js";
import {
  type TumblerRateKeeperParams as TumblerDeployParams,
  type TumblerRateKeeperState,
  tumblerDeployParamsSchema,
  tumblerMarketActionsData,
  tumblerPlugin,
} from "./tumbler/tumblerPlugin.js";

export type RateKeeperDeployParams = TumblerDeployParams | GaugeDeployParams;
export type RateKeeperState = GaugeRateKeeperState | TumblerRateKeeperState;

export type RateKeeperType = RateKeeperDeployParams["type"];

export interface RateKeeperPlugin
  extends Plugin<RateKeeperDeployParams, RateKeeperState> {
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

export type RateKeeperMarketActions = ActionOf<
  (typeof rateKeeperMarketActionsData)[number]
>;

export const rateKeeperDeployParamsSchema = z.discriminatedUnion("type", [
  tumblerDeployParamsSchema,
  gaugeDeployParamsSchema,
]);

export const rateKeeperMarketActionsData = [
  ...tumblerMarketActionsData,
  ...gaugeMarketActionsData,
];
