import type { Address } from "viem";
import { zeroAddress } from "viem";
import { z } from "zod/v4";
import type { RawTx } from "../../../onchain/index.js";
import { isCreditManagerExpired } from "../state/market/isCreditManagerExpired.js";
import type { MarketCreditManagerState } from "../state/market/types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { errorMessage } from "../utils/errorMessage.js";
import {
  addressSchema,
  minorVersionSchema,
  nonEmptyStringSchema,
  percentageSchema,
  positiveNumberSchema,
  refineLiquidationFees,
} from "../validationSchemas.js";
import type { ActionDiagnostic } from "./actionDiagnostics.js";
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
import { paramsKey, requiresDegenNft, resource } from "./utils/actionKeys.js";
import type { ChainRead } from "./utils/chainReads.js";
import { findCreditManager } from "./utils/checkHelpers.js";
import {
  degenNftDiagnostics,
  resolveDegenNft,
} from "./utils/degenNftChecks.js";
import { MAX_UINT128 } from "./utils/rawAmounts.js";

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
    expirationDate: z.never().optional(),
  })
  .superRefine(refineLiquidationFees)
  .refine(data => data.maxDebt >= data.minDebt, {
    message: "Invalid debt limits: maxDebt must not be less than minDebt",
  })
  .refine(data => data.maxDebt * data.maxEnabledTokens <= data.minDebt * 100, {
    message:
      "Invalid debt limits: total potential debt must not exceed 100x minDebt (maxDebt/minDebt <= 100/maxEnabledTokens)",
  });

/**
 * Builds the `createCreditSuite` transaction and previews the credit manager it
 * deploys. The preview depends on the action's own salt, so the same action
 * always resolves to the same address.
 **/
export function createCreditSuite(args: {
  ctx: GipBuilderContext;
  market: MarketIdentity;
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

/** The raw debt limits fit uint128, and so do the facade's debt ratio products. **/
function debtLimitDiagnostics(
  ctx: GipBuilderContext,
  market: MarketIdentity,
  params: DeployCreateSuiteParams,
): ActionDiagnostic[] {
  try {
    const min = convertUnderlyingAmount(ctx, market, params.minDebt);
    const max = convertUnderlyingAmount(ctx, market, params.maxDebt);
    const maxTokens = BigInt(params.maxEnabledTokens);
    if (
      min > MAX_UINT128 ||
      max * 2n > MAX_UINT128 ||
      min * 100n > MAX_UINT128 ||
      max * maxTokens > MAX_UINT128
    )
      return [
        actionError(
          "AMOUNT_OVERFLOW",
          "Debt limits and their safety-ratio products must fit uint128",
        ),
      ];
    return min > max || max * maxTokens > min * 100n
      ? [
          actionError(
            "INVALID_DEBT_LIMITS",
            "Raw debt limits violate the facade debt ratio bound",
          ),
        ]
      : [];
  } catch (error) {
    return [actionError("INVALID_TOKEN_AMOUNT", errorMessage(error))];
  }
}

/** The configurator call and the credit manager it is predicted to deploy. **/
export interface CreateCreditSuiteResolution {
  tx?: RawTx;
  creditManager: Address;
  diagnostics?: ActionDiagnostic[];
  nftRegistration?: ChainRead<boolean>;
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
  resolve: async ({ ctx, market, params }) => {
    if (!market) throw new Error("A credit suite needs an existing market");
    // Validate raw amounts before the deployment binding encodes uint128 fields.
    const diagnostics = debtLimitDiagnostics(ctx, market, params);
    // @dev a bundle payload failing the schema is kept as is: this is its only guard
    if ((params as { expirationDate?: unknown }).expirationDate !== undefined)
      diagnostics.push(
        actionError(
          "CREATION_EXPIRATION_UNSUPPORTED",
          "Creation cannot set expirationDate; add CREDIT::setExpirationDate",
        ),
      );
    if (diagnostics.length) return { creditManager: zeroAddress, diagnostics };
    const [deployment, nftRegistration] = await Promise.all([
      createCreditSuite({ ctx, market, params }),
      resolveDegenNft(ctx, params.whitelistPolicy),
    ]);
    return { ...deployment, nftRegistration };
  },
  check: ({ state, params, resolved }) => {
    if (resolved.diagnostics?.length) return resolved.diagnostics;
    if (findCreditManager(state, resolved.creditManager))
      return [
        actionError(
          "CREDIT_MANAGER_EXISTS",
          `Credit manager ${resolved.creditManager} already exists; use another name or salt`,
          ["params", "name"],
        ),
      ];
    return degenNftDiagnostics(
      state,
      params.whitelistPolicy,
      resolved.nftRegistration ?? { error: undefined },
    );
  },
  apply: ({ state, params, resolved, env }) => {
    const creditManagerAddress = lowerAddress(resolved.creditManager);
    // The underlying's LT is derived from the fees, never configured.
    const underlyingLt =
      100 - params.feeLiquidation - params.feeLiquidationPremium;

    const newCreditManagerState: MarketCreditManagerState = {
      address: creditManagerAddress,
      degenNFT: params.whitelistPolicy,
      isExpired: isCreditManagerExpired(
        { expirable: params.isExpired, expirationDate: 0 },
        env.timestamp,
      ),
      expirable: params.isExpired,
      expirationDate: 0,
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
        [lowerAddress(state.underlyingAsset)]: {
          liquidationThresholdInitial: underlyingLt,
          liquidationThresholdFinal: underlyingLt,
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
  provides: params =>
    params.id === undefined
      ? []
      : [resource.creditManager(creditSuiteRef(params.id))],
  // @dev a whitelisted suite needs its Degen NFT registered first
  requires: params => requiresDegenNft(params.whitelistPolicy),
  // @dev a suite with an id is that suite; otherwise debt limits are the only
  // params that can change without producing a different suite
  key: params =>
    params.id === undefined
      ? paramsKey(params, ["minDebt", "maxDebt"])
      : `id:${params.id}`,
  encode: ({ resolved }) => {
    if (!resolved.tx) throw new Error("Cannot encode an invalid credit suite");
    return resolved.tx;
  },
  deployedContract: ({ resolved }) => resolved.creditManager,
  suiteId: params => params.id,
});
