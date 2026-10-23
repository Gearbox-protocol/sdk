import type { Address } from "viem";
import { zeroAddress } from "viem";
import { z } from "zod/v4";
import type { RawTx } from "../../../onchain/index.js";
import { isCreditManagerExpired } from "../state/market/isCreditManagerExpired.js";
import type { MarketCreditManagerState } from "../state/market/types.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import {
  addressSchema,
  minorVersionSchema,
  nonEmptyStringSchema,
  percentageSchema,
  positiveNumberSchema,
  refineLiquidationFees,
  uintSchema,
} from "../validationSchemas.js";
import { actionError } from "./actionDiagnostics.js";
import {
  AccountFactoryTypes,
  type BaseMarketAction,
  type DeployCreateSuiteParams,
} from "./actionTypes.js";
import {
  convertUnderlyingAmount,
  type GipBuilderContext,
} from "./builderContext.js";
import { creditSuiteRef } from "./creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketIdentity,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { paramsKey, resource } from "./utils/actionKeys.js";
import { findCreditManager } from "./utils/checkHelpers.js";

export type CreateCreditSuiteAction = BaseMarketAction<
  "MARKET::createCreditSuite",
  DeployCreateSuiteParams
>;

export const createCreditSuiteSchema = z
  .object({
    id: z.string().min(1).optional(),
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
    maxEnabledTokens: z
      .number()
      .int()
      .min(1, "Must allow at least 1 token")
      .max(10),
    whitelistPolicy: addressSchema,
    accountFactoryType: z.enum(AccountFactoryTypes).default("DEFAULT"),
    isExpired: z.boolean(),
    expirationDate: uintSchema(40).optional(),
  })
  .superRefine(refineLiquidationFees)
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

/** The market fields a credit suite deployment depends on. **/
export type CreditSuiteMarket = MarketIdentity;

/**
 * Builds the `createCreditSuite` transaction and previews the credit manager it
 * deploys. The preview depends on the action's own salt, so the same action
 * always resolves to the same address.
 **/
export function createCreditSuite(args: {
  ctx: GipBuilderContext;
  market: CreditSuiteMarket;
  params: DeployCreateSuiteParams;
}): Promise<CreateCreditSuiteResolution> {
  const { ctx, market, params } = args;
  return ctx.marketConfigurator.createCreditSuite(
    {
      pool: market.address,
      name: market.name,
      symbol: market.symbol,
      underlyingAsset: market.underlyingAsset,
      minorVersion: market.minorVersion,
    },
    {
      params: {
        ...params,
        accountFactorySalt: params.salt,
        minDebt: convertUnderlyingAmount(ctx, market, params.minDebt),
        maxDebt: convertUnderlyingAmount(ctx, market, params.maxDebt),
      },
    },
  );
}

/** The configurator call and the credit manager it is predicted to deploy. **/
export interface CreateCreditSuiteResolution {
  tx: RawTx;
  creditManager: Address;
}

export const createCreditSuiteActionData: MarketScopedDefinition<
  CreateCreditSuiteAction,
  CreateCreditSuiteResolution
> = defineMarketAction<CreateCreditSuiteAction, CreateCreditSuiteResolution>({
  type: "MARKET::createCreditSuite",
  gas: () => 14_600_000, // got 14,453,571
  touchedFeeds: ({ after }) => [after.underlyingPriceFeed],
  description: `Create a new credit suite. Credit suite is a set of credit managers with the same parameters.`,
  schema: createCreditSuiteSchema,
  resolve: ({ ctx, market, params }) => {
    if (!market) throw new Error("A credit suite needs an existing market");
    return createCreditSuite({ ctx, market, params });
  },
  check: ({ state, resolved }) =>
    findCreditManager(state, resolved.creditManager)
      ? [
          actionError(
            "CREDIT_MANAGER_EXISTS",
            `Credit manager ${resolved.creditManager} already exists; use another name or salt`,
            ["params", "name"],
          ),
        ]
      : [],
  apply: ({ state, params, resolved, env }) => {
    const creditManagerAddress = lowerAddress(resolved.creditManager);

    const newCreditManagerState: MarketCreditManagerState = {
      address: creditManagerAddress,
      degenNFT: params.whitelistPolicy,
      isExpired: isCreditManagerExpired(
        {
          expirable: params.isExpired,
          expirationDate: params.expirationDate ?? 0,
        },
        env.timestamp,
      ),
      expirable: params.isExpired,
      expirationDate: params.expirationDate ?? 0,
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
        // The underlying's LT is derived from the fees, never configured.
        [lowerAddress(state.underlyingAsset)]: {
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
  // @dev debt limits are the only suite parameters that can change without
  // producing a different credit suite
  // @dev a suite with an id is that suite; otherwise debt limits are the only
  // params that can change without producing a different suite
  provides: params =>
    params.id === undefined
      ? []
      : [resource.creditManager(creditSuiteRef(params.id))],
  // @dev a whitelisted suite needs its Degen NFT registered first
  requires: params =>
    isSameAddress(params.whitelistPolicy, zeroAddress)
      ? []
      : [resource.periphery("DEGEN_NFT", params.whitelistPolicy)],
  key: params =>
    params.id === undefined
      ? paramsKey(params, ["minDebt", "maxDebt"])
      : `id:${params.id}`,
  encode: ({ resolved }) => resolved.tx,
  deployedContract: ({ resolved }) => resolved.creditManager,
  suiteId: params => params.id,
});
