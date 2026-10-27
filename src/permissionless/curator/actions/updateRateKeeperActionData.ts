import type { Address } from "viem";
import { zeroHash } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import {
  type RateKeeperDeployParams,
  type RateKeeperState,
  rateKeeperDeployParamsSchema,
  rateKeeperPlugins,
} from "../plugins/rate-keepers/rateKeeperPlugins.js";
import { tumblerDiagnostics } from "../plugins/rate-keepers/tumbler/tumblerPlugin.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { single } from "./utils/actionKeys.js";

export type UpdateRateKeeperAction = BaseMarketAction<
  "MARKET::updateRateKeeper",
  RateKeeperDeployParams
>;

/**
 * The configurator call. The SDK builds it asynchronously, so it is built while
 * resolving; it depends on the pool and GEAR staking only.
 **/
export interface UpdateRateKeeperResolution {
  tx: RawTx;
}

export const updateRateKeeperActionData: MarketScopedDefinition<
  UpdateRateKeeperAction,
  UpdateRateKeeperResolution
> = defineMarketAction<UpdateRateKeeperAction, UpdateRateKeeperResolution>({
  type: "MARKET::updateRateKeeper",
  // @dev depends on the number of quoted assets; got 1,029,266 (Tumbler)
  // and 1,716,420 (Gauge)
  gas: ({ params }) => (params.type === "GAUGE" ? 1_750_000 : 1_100_000),
  description: `Update rate keeper. Rate keeper is responsible for calculating additional interest rate for a collateral token.`,
  schema: rateKeeperDeployParamsSchema,
  resolve: async ({ ctx, market, params }) => {
    if (!market) throw new Error("The market to update does not exist");
    const mc = ctx.marketConfigurator;
    const addressProvider = await mc.getAddressProvider();
    const gearStakingAddress =
      await addressProvider.getAddressOrRevert("GEAR_STAKING");
    const deployParams = rateKeeperPlugins[params.type].getDeployParams({
      pool: market.address,
      gearStakingAddress,
      params,
    });
    return { tx: await mc.updateRateKeeper(market.address, { deployParams }) };
  },
  check: ({ params }) => tumblerDiagnostics(params),
  apply: ({ state, params }) => {
    // The new keeper starts every already-quoted token at the minimal rate.
    const rates = Object.fromEntries(
      Object.keys(state.rateKeeper.rates).map(token => [
        token as Address,
        params.type === "GAUGE" ? { minRate: 1, maxRate: 1 } : 1,
      ]),
    );

    return {
      ...state,
      rateKeeper: {
        salt: params.salt ? params.salt : zeroHash,
        ...params,
        rates,
      } as RateKeeperState,
    };
  },
  encode: ({ resolved }) => resolved.tx,
  key: single,
});
