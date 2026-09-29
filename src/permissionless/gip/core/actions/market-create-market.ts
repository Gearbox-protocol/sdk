import type { Address } from "viem";
import { z } from "zod";
import { irmDeployParamsSchema, irmPlugins } from "../../plugins/irm/logic.js";
import {
  lossPolicyDeployParamsSchema,
  lossPolicyPlugins,
} from "../../plugins/loss-policies/logic.js";
import {
  rateKeeperDeployParamsSchema,
  rateKeeperPlugins,
} from "../../plugins/rate-keepers/logic.js";
import { type MarketState, NO_LIMIT } from "../market-state/types.js";
import {
  minorVersionSchema,
  nonEmptyStringSchema,
  nonZeroAddressSchema,
} from "../validation.js";
import type {
  BaseMarketAction,
  CreateMarketParams,
  MarketActionData,
} from "./types.js";

export type CreateMarketAction = BaseMarketAction<
  "MARKET::createMarket",
  CreateMarketParams
>;

export const createMarketParamsSchema = z.object({
  minorVersion: minorVersionSchema,
  name: nonEmptyStringSchema.refine(data => data.length >= 3, {
    message: "Must be at least 3 characters long",
  }),
  symbol: nonEmptyStringSchema.refine(data => data.length >= 3, {
    message: "Must be at least 3 characters long",
  }),
  underlying: nonZeroAddressSchema,
  underlyingPriceFeed: nonZeroAddressSchema,
  interestRateModel: irmDeployParamsSchema,
  rateKeeperParams: rateKeeperDeployParamsSchema,
  lossPolicyParams: lossPolicyDeployParamsSchema,
});

export const createMarketActionProcessor: MarketActionData<CreateMarketAction> =
  {
    type: "MARKET::createMarket",
    description: `Create a new market.`,
    schema: createMarketParamsSchema,
    stateTransition: (args: {
      state?: MarketState;
      params: CreateMarketParams;
      newContract?: Address;
    }): MarketState => {
      const { params, state, newContract } = args;

      if (!newContract) {
        throw new Error("No new contract address provided");
      }

      return {
        minorVersion: params.minorVersion,
        address: newContract.toLowerCase() as Address,
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
        treasury: state!.treasury,
        interestRateModel: irmPlugins[
          params.interestRateModel.type
        ].getDeployState(params.interestRateModel),
        rateKeeper: rateKeeperPlugins[
          params.rateKeeperParams.type
        ].getDeployState(params.rateKeeperParams),
        lossPolicy: lossPolicyPlugins[
          params.lossPolicyParams.type
        ].getDeployState(params.lossPolicyParams),
      };
    },
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const previewPool = await mc.previewCreateMarket({
        minorVersion: params.minorVersion,
        underlying: params.underlying,
        name: params.name,
        symbol: params.symbol,
      });
      const addressProvider = await mc.getAddressProvider();
      const gearStakingAddress =
        await addressProvider.getAddressOrRevert("GEAR_STAKING");
      const { tx, pool } = await mc.createMarket({
        minorVersion: params.minorVersion,
        underlying: params.underlying,
        name: params.name,
        symbol: params.symbol,
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
      return { tx: { tx, action, newContract: pool } };
    },
    replace: (a, b) => {
      return (
        a.minorVersion === b.minorVersion &&
        a.underlying.toLowerCase() === b.underlying.toLowerCase() &&
        a.name === b.name &&
        a.symbol === b.symbol
      );
    },
    replaceKeep: "first",
  };
