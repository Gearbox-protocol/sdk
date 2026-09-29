import type { Address } from "viem";
import { zeroAddress } from "viem";
import type { Bundle } from "../../bundles/types.js";
import type { MarketActions } from "../actions/index.js";
import type { CreateCreditSuiteAction } from "../actions/market-create-credit-suite.js";
import { GipBuilderError } from "./errors.js";

export interface BundleCustomization {
  targetAssetParams?: { liquidationThreshold: number };
  deployCreditSuiteParams?: Partial<CreateCreditSuiteAction["params"]>;
}

export function customizeBundle(
  bundle: Bundle,
  { targetAssetParams, deployCreditSuiteParams }: BundleCustomization,
): Bundle {
  const customized = structuredClone(bundle);
  const nonZeroLtAssets = customized.actions
    .filter(
      (
        action,
      ): action is Extract<
        MarketActions,
        { type: "CREDIT::addCollateralToken" }
      > =>
        action.type === "CREDIT::addCollateralToken" &&
        action.params.liquidationThreshold > 0,
    )
    .map(action => action.params.token.toLowerCase() as Address);

  if (nonZeroLtAssets.length === 0) {
    throw new GipBuilderError(
      "NO_NON_ZERO_LT_ASSETS",
      "No non-zero LT assets found",
    );
  }

  if (targetAssetParams) {
    for (const token of nonZeroLtAssets) {
      customized.actions.push({
        type: "CREDIT::addCollateralToken",
        params: {
          creditManager: zeroAddress,
          token,
          liquidationThreshold: targetAssetParams.liquidationThreshold,
        },
      });
      customized.actions.push({
        type: "POOL::setTokenLimit",
        params: {
          token,
          limit: deployCreditSuiteParams?.maxDebt ?? 0,
        },
      });
    }
    customized.actions.push({
      type: "POOL::setCreditManagerDebtLimit",
      params: {
        creditManager: zeroAddress,
        limit: deployCreditSuiteParams?.maxDebt ?? 0,
      },
    });
    customized.actions.push({
      type: "RATE_KEEPER::TUMBLER::updateRates",
      params: {},
    });
  }

  return customized;
}
