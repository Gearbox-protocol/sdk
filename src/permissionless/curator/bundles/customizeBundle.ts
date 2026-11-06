import type { Address } from "viem";
import {
  type CreateCreditSuiteAction,
  createCreditSuiteSchema,
} from "../actions/createCreditSuiteActionData.js";
import { BUNDLE_TARGET } from "../actions/creditManagerTargets.js";
import { uniqueAddresses } from "../utils/addressUtils.js";
import { addressSchema, percentageSchema } from "../validationSchemas.js";
import type { Bundle } from "./Bundle.js";
import { GipBuilderError } from "./GipBuilderError.js";

export interface BundleCustomization {
  /** Applies to all collateral with a positive LT in the catalog bundle. **/
  targetAssetParams?: {
    /** Optional selected token metadata from the app's strategy form. **/
    token?: string;
    liquidationThreshold: number;
  };
  /** Merged before prediction; maxEnabledTokens comes from bundle.enabledTokens. **/
  deployCreditSuiteParams?: Partial<
    Omit<CreateCreditSuiteAction["params"], "maxEnabledTokens">
  >;
}

export function customizeBundle(
  bundle: Bundle,
  { targetAssetParams, deployCreditSuiteParams }: BundleCustomization,
): Bundle {
  const customized = structuredClone(bundle);
  for (const action of customized.actions) {
    if (action.type !== "MARKET::createCreditSuite") continue;
    action.params.maxEnabledTokens =
      createCreditSuiteSchema.shape.maxEnabledTokens
        .int()
        .parse(bundle.enabledTokens);
  }
  const createSuite = customized.actions.find(
    (action): action is CreateCreditSuiteAction =>
      action.type === "MARKET::createCreditSuite",
  );
  if (deployCreditSuiteParams) {
    if (!createSuite) {
      throw new GipBuilderError(
        "CREATE_CREDIT_SUITE_ACTION_NOT_FOUND",
        "Create credit suite action not found",
      );
    }
    const params = {
      ...createSuite.params,
      ...deployCreditSuiteParams,
      // Ignore legacy JSON overrides and keep the count supplied by the bundle.
      maxEnabledTokens: createSuite.params.maxEnabledTokens,
    };
    // The app mirrors regular liquidation fees into expired fees. Preserve
    // that default, while allowing an SDK caller to supply expired fees.
    if (
      deployCreditSuiteParams.feeLiquidation !== undefined &&
      deployCreditSuiteParams.feeLiquidationExpired === undefined
    ) {
      params.feeLiquidationExpired = deployCreditSuiteParams.feeLiquidation;
    }
    if (
      deployCreditSuiteParams.feeLiquidationPremium !== undefined &&
      deployCreditSuiteParams.feeLiquidationPremiumExpired === undefined
    ) {
      params.feeLiquidationPremiumExpired =
        deployCreditSuiteParams.feeLiquidationPremium;
    }
    const validated = createCreditSuiteSchema.parse(params);
    createSuite.params = {
      ...params,
      ...validated,
      whitelistPolicy: validated.whitelistPolicy as Address,
    };
  }
  if (!targetAssetParams) return customized;
  const liquidationThreshold = percentageSchema.parse(
    targetAssetParams.liquidationThreshold,
  );
  if (targetAssetParams.token !== undefined) {
    addressSchema.parse(targetAssetParams.token);
  }
  // Partial overrides use the effective deployment debt bound. For a bundle
  // targeting an existing manager, LT-only changes leave its limits alone.
  const debtLimit = createSuite?.params.maxDebt;
  const nonZeroLtAssets = uniqueAddresses(
    customized.actions.flatMap(action =>
      action.type === "CREDIT::addCollateralToken" &&
      action.params.liquidationThreshold > 0
        ? [action.params.token]
        : [],
    ),
  );

  if (nonZeroLtAssets.length === 0) {
    throw new GipBuilderError(
      "NO_NON_ZERO_LT_ASSETS",
      "No non-zero LT assets found",
    );
  }

  for (const token of nonZeroLtAssets) {
    customized.actions.push({
      type: "CREDIT::addCollateralToken",
      params: {
        creditManager: BUNDLE_TARGET,
        token,
        liquidationThreshold,
      },
    });
    if (debtLimit !== undefined) {
      customized.actions.push({
        type: "POOL::setTokenLimit",
        params: {
          token,
          limit: debtLimit,
        },
      });
    }
  }
  if (debtLimit !== undefined) {
    customized.actions.push({
      type: "POOL::setCreditManagerDebtLimit",
      params: {
        creditManager: BUNDLE_TARGET,
        limit: debtLimit,
      },
    });
  }
  customized.actions.push({
    type: "RATE_KEEPER::TUMBLER::updateRates",
    params: {},
  });

  return customized;
}
