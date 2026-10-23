import type { Address } from "viem";
import { z } from "zod/v4";
import type { RawTx } from "../../../onchain/index.js";
import {
  irmDeployParamsSchema,
  irmPlugins,
} from "../plugins/irm/irmPlugins.js";
import {
  lossPolicyDeployParamsSchema,
  lossPolicyPlugins,
} from "../plugins/loss-policies/lossPolicyPlugins.js";
import {
  rateKeeperDeployParamsSchema,
  rateKeeperPlugins,
} from "../plugins/rate-keepers/rateKeeperPlugins.js";
import { NO_LIMIT } from "../state/market/types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import {
  minorVersionSchema,
  nonEmptyStringSchema,
  nonZeroAddressSchema,
} from "../validationSchemas.js";
import { actionError } from "./actionDiagnostics.js";
import type { BaseMarketAction, CreateMarketParams } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";

export type CreateMarketAction = BaseMarketAction<
  "MARKET::createMarket",
  CreateMarketParams
>;

const marketLabelSchema = nonEmptyStringSchema.refine(
  data => data.length >= 3,
  { message: "Must be at least 3 characters long" },
);

export const createMarketParamsSchema = z.object({
  minorVersion: minorVersionSchema,
  name: marketLabelSchema,
  symbol: marketLabelSchema,
  underlying: nonZeroAddressSchema,
  underlyingPriceFeed: nonZeroAddressSchema,
  interestRateModel: irmDeployParamsSchema,
  rateKeeperParams: rateKeeperDeployParamsSchema,
  lossPolicyParams: lossPolicyDeployParamsSchema,
});

/** What creating a market needs from the chain. **/
export interface CreateMarketResolution {
  /** Pool the creation is predicted to deploy. **/
  pool: Address;
  /** The configurator's treasury, which every new market inherits. **/
  treasury: Address;
  tx: RawTx;
}

export const createMarketActionData: MarketScopedDefinition<
  CreateMarketAction,
  CreateMarketResolution
> = defineMarketAction<CreateMarketAction, CreateMarketResolution>({
  type: "MARKET::createMarket",
  // got 11,456,469 with a Tumbler and 12,174,444 with a Gauge rate keeper
  gas: ({ params }) =>
    params.rateKeeperParams.type === "GAUGE" ? 12_300_000 : 11_600_000,
  touchedFeeds: ({ params }) => [params.underlyingPriceFeed],
  description: `Create a new market.`,
  schema: createMarketParamsSchema,
  resolve: async ({ ctx, params }) => {
    const mc = ctx.marketConfigurator;
    const market = {
      minorVersion: params.minorVersion,
      underlying: params.underlying,
      name: params.name,
      symbol: params.symbol,
    };
    // The rate keeper and the loss policy are constructed with the pool
    // address, so it has to be known before the market exists.
    const previewPool = await mc.previewCreateMarket(market);
    const addressProvider = await mc.getAddressProvider();
    const gearStakingAddress =
      await addressProvider.getAddressOrRevert("GEAR_STAKING");
    const { tx, pool } = await mc.createMarket({
      ...market,
      interestRateModelParams: irmPlugins[
        params.interestRateModel.type
      ].getDeployParams(params.interestRateModel),
      rateKeeperParams: rateKeeperPlugins[
        params.rateKeeperParams.type
      ].getDeployParams({
        pool: previewPool,
        gearStakingAddress,
        params: params.rateKeeperParams,
      }),
      lossPolicyParams: lossPolicyPlugins[
        params.lossPolicyParams.type
      ].getDeployParams({
        pool: previewPool,
        addressProvider: addressProvider.address,
        params: params.lossPolicyParams,
      }),
      underlyingPriceFeed: params.underlyingPriceFeed,
    });
    return { pool, treasury: await mc.treasury(), tx };
  },
  check: () => [
    actionError(
      "MARKET_ALREADY_EXISTS",
      "The market already exists: createMarket can only be its first action",
    ),
  ],
  create: ({ params, resolved }) => ({
    minorVersion: params.minorVersion,
    address: lowerAddress(resolved.pool),
    symbol: params.symbol,
    name: params.name,
    underlyingAsset: params.underlying,
    underlyingPriceFeed: params.underlyingPriceFeed,
    totalDebtLimit: NO_LIMIT,
    creditManagerDebtLimit: {},
    assets: {},
    creditManagers: {},
    paused: false,
    periphery: [],
    // @note a new market's treasury balances are not tracked
    treasury: { address: resolved.treasury, type: "TREASURY", balances: {} },
    interestRateModel: irmPlugins[params.interestRateModel.type].getDeployState(
      params.interestRateModel,
    ),
    rateKeeper: rateKeeperPlugins[params.rateKeeperParams.type].getDeployState(
      params.rateKeeperParams,
    ),
    lossPolicy: lossPolicyPlugins[params.lossPolicyParams.type].getDeployState(
      params.lossPolicyParams,
    ),
  }),
  // @dev a market is created only as the first action of its builder
  apply: () => {
    throw new Error("The market already exists");
  },
  encode: ({ resolved }) => resolved.tx,
  deployedContract: ({ resolved }) => resolved.pool,
  // @dev the pool address is derived from these
  key: params =>
    [
      params.minorVersion,
      params.underlying.toLowerCase(),
      params.name,
      params.symbol,
    ].join(":"),
});
