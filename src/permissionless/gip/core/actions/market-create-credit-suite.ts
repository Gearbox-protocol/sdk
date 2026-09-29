import type { Address } from "viem";
import { z } from "zod";
import type {
  MarketCreditManagerState,
  MarketState,
} from "../market-state/types.js";
import {
  addressSchema,
  minorVersionSchema,
  nonEmptyStringSchema,
  percentageSchema,
  positiveNumberSchema,
} from "../validation.js";
import { convertTokenAmount } from "./context.js";
import {
  AccountFactoryTypes,
  type BaseMarketAction,
  type DeployCreateSuiteParams,
  type MarketActionData,
} from "./types.js";

export type CreateCreditSuiteAction = BaseMarketAction<
  "MARKET::createCreditSuite",
  DeployCreateSuiteParams
>;

export const createCreditSuiteSchema = z
  .object({
    name: nonEmptyStringSchema,
    salt: z.string().optional(),
    minorVersion: minorVersionSchema,
    feeInterest: percentageSchema,
    feeLiquidation: percentageSchema,
    feeLiquidationExpired: percentageSchema,
    feeLiquidationPremium: percentageSchema,
    feeLiquidationPremiumExpired: percentageSchema,
    minDebt: positiveNumberSchema,
    maxDebt: positiveNumberSchema,
    maxEnabledTokens: z.number().min(1, "Must allow at least 1 token").max(10),
    whitelistPolicy: addressSchema,
    accountFactoryType: z.enum(AccountFactoryTypes).default("DEFAULT"),
    isExpired: z.boolean(),
    expirationDate: z.number().optional(),
  })
  .refine(
    data => {
      // Check if feeLiquidation <= liquidationPremium
      if (data.feeLiquidation > data.feeLiquidationPremium) {
        return false;
      }

      return true;
    },
    {
      message: "Invalid fees: liquidation fee must not be lower than premium",
    },
  )
  .refine(
    data => data.feeLiquidationExpired <= data.feeLiquidationPremiumExpired,
    {
      message:
        "Invalid fees: expired liquidation fee must not be lower than expired premium",
    },
  )
  .refine(data => data.feeLiquidationExpired <= data.feeLiquidation, {
    message:
      "Invalid fees: expired liquidation fee must not be lower than liquidation fee",
  })
  .refine(
    data => data.feeLiquidationPremiumExpired <= data.feeLiquidationPremium,
    {
      message:
        "Invalid fees: expired liquidation premium must not be lower than liquidation premium",
    },
  )
  .refine(data => data.feeLiquidationPremium + data.feeLiquidation < 100, {
    message:
      "Invalid fees: fee liquidation and premium must be less than 100% in total",
  })
  .refine(
    // Check if each fee is > 0
    data =>
      data.feeLiquidation *
        data.feeLiquidationPremium *
        data.feeLiquidationExpired *
        data.feeLiquidationPremiumExpired >
      0,
    {
      message: "Invalid fees: each fee must be greater than zero",
    },
  )
  .refine(data => data.maxDebt >= data.minDebt, {
    message: "Invalid debt limits: maxDebt must not be less than minDebt",
  })
  .refine(data => data.maxDebt * data.maxEnabledTokens <= data.minDebt * 100, {
    message:
      "Invalid debt limits: total potential debt must not exceed 100x minDebt (maxDebt/minDebt <= 100/maxEnabledTokens)",
  });

export const createCreditSuiteAction: MarketActionData<CreateCreditSuiteAction> =
  {
    type: "MARKET::createCreditSuite",
    description: `Create a new credit suite. Credit suite is a set of credit managers with the same parameters.`,
    schema: createCreditSuiteSchema,
    stateTransition: (args: {
      state: MarketState;
      params: DeployCreateSuiteParams;
      newContract?: Address;
    }): MarketState => {
      const { state, params, newContract } = args;

      if (!newContract) {
        throw new Error("No new contract address provided");
      }

      const creditManagerAddress = newContract.toLowerCase() as Address;

      if (state.creditManagers[creditManagerAddress]) {
        throw new Error("Credit manager already exists");
      }

      const newCreditManagerState: MarketCreditManagerState = {
        address: creditManagerAddress.toLowerCase() as Address,
        degenNFT: params.whitelistPolicy,
        isExpired:
          params.isExpired &&
          params.expirationDate > 0 &&
          params.expirationDate < Date.now() / 1000,
        expirable: params.isExpired,
        expirationDate: params.expirationDate,
        feeInterest: params.feeInterest,
        feeLiquidation: params.feeLiquidation,
        feeLiquidationPremium: params.feeLiquidationPremium,
        feeLiquidationExpired: params.feeLiquidationExpired,
        feeLiquidationPremiumExpired: params.feeLiquidationPremiumExpired,
        name: params.name,
        minDebt: params.minDebt,
        maxDebt: params.maxDebt,
        maxDebtPerBlockMultiplier: 2,
        maxEnabledTokens: params.maxEnabledTokens,
        adapters: {},
        collateralTokens: {
          [state.underlyingAsset.toLowerCase()]: {
            liquidationThresholdFinal:
              100 - params.feeLiquidation - params.feeLiquidationPremium,
            rampStart: 0,
            rampDuration: 0,
            isForbidden: false,
          },
        },
        paused: false,
      };

      return {
        ...state,
        creditManagers: {
          ...state.creditManagers,
          [creditManagerAddress]: newCreditManagerState,
        },
      };
    },
    replace: (a, b) => {
      const stripDebts = (obj: DeployCreateSuiteParams) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { minDebt, maxDebt, ...rest } = obj;
        return rest;
      };

      return JSON.stringify(stripDebts(a)) === JSON.stringify(stripDebts(b));
    },

    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { tx, creditManager } = await mc.createCreditSuite(
        // instance,
        // state,
        {
          pool: state.address,
          name: state.name,
          symbol: state.symbol,
          underlyingAsset: state.underlyingAsset,
          minorVersion: state.minorVersion,
        },
        {
          params: {
            ...action.params,
            minDebt: convertTokenAmount({
              tokens: ctx.tokens,
              token: state.underlyingAsset,
              amount: action.params.minDebt,
            }),
            maxDebt: convertTokenAmount({
              tokens: ctx.tokens,
              token: state.underlyingAsset,
              amount: action.params.maxDebt,
            }),
          },
        },
      );
      return { tx: { tx, action, newContract: creditManager } };
    },
  };
