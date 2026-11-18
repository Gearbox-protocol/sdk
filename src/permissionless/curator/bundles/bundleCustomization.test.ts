import { decodeFunctionData, stringToHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { iPoolConfigureActionsAbi } from "../../../abi/310/configure/iPoolConfigureActions.js";
import { iMarketConfiguratorV310Abi } from "../../../abi/310/generated.js";
import type { RawTx } from "../../../onchain/types/transactions.js";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import type { GipMarketAction } from "../actions/types.js";
import { mfoneBundle } from "../testing/mfoneBundle.js";
import {
  CM,
  CM2,
  CONFIGURATOR,
  createTestSdk,
  FEED_WBTC,
  marketState,
  SOURCE_TIMESTAMP,
  USDC,
  WBTC,
} from "../testing/sdkHarness.js";
import type { Bundle } from "./Bundle.js";
import { customizeBundle } from "./customizeBundle.js";
import { GipBuilderError } from "./GipBuilderError.js";

function strategyBundle(): Bundle {
  return {
    name: "WBTC strategy",
    tokenIn: [USDC],
    tokenOut: [WBTC],
    enabledTokens: 2,
    warning: undefined,
    actions: [
      {
        type: "MARKET::addAsset",
        params: { token: WBTC, priceFeed: FEED_WBTC },
      },
      { type: "POOL::setTokenLimit", params: { token: WBTC, limit: 50_000 } },
      {
        type: "MARKET::createCreditSuite",
        params: {
          name: "Catalog strategy",
          salt: "catalog",
          minorVersion: 310,
          maxEnabledTokens: 4,
          feeInterest: 20,
          feeLiquidation: 2,
          feeLiquidationPremium: 2.5,
          feeLiquidationExpired: 1,
          feeLiquidationPremiumExpired: 2,
          minDebt: 10_000,
          maxDebt: 100_000,
          accountFactoryType: "DEFAULT",
          isExpired: false,
          whitelistPolicy: zeroAddress,
        },
      },
      {
        type: "CREDIT::addCollateralToken",
        params: {
          creditManager: zeroAddress,
          token: WBTC,
          liquidationThreshold: 80,
        },
      },
    ],
  };
}

/** The bundle's `MARKET::createCreditSuite`; it must have one. **/
function createSuite(bundle: {
  actions: readonly GipMarketAction[];
}): CreateCreditSuiteAction {
  const action = bundle.actions.find(
    (action): action is CreateCreditSuiteAction =>
      action.type === "MARKET::createCreditSuite",
  );
  if (!action) throw new Error("The bundle has no MARKET::createCreditSuite");
  return action;
}

describe("bundle customization through the scoped SDK", () => {
  it("uses bundle metadata without overrides when the deployment action has a different count", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const bundle = strategyBundle();
    expect(createSuite(bundle).params.maxEnabledTokens).toBe(4);
    expect(bundle.enabledTokens).toBe(2);
    const preview = await sdk
      .market({ initialState: marketState() })
      .applyBundle(bundle)
      .preview();
    expect(
      createSuite({ actions: preview.resolvedActions }).params.maxEnabledTokens,
    ).toBe(2);
    expect(preview.after.creditManagers[CM2].maxEnabledTokens).toBe(2);
    expect(createSuite(bundle).params.maxEnabledTokens).toBe(4);
  });

  it("ignores enabled-token overrides from legacy JSON input", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    // Legacy JSON carries a field the options type no longer has.
    const options: {
      deployCreditSuiteParams: { name: string; maxEnabledTokens: number };
    } = JSON.parse(
      '{"deployCreditSuiteParams":{"name":"Custom strategy","maxEnabledTokens":9}}',
    );
    const preview = await sdk
      .market({ initialState: marketState() })
      .applyBundle(strategyBundle(), options)
      .preview();
    expect(preview.after.creditManagers[CM2].maxEnabledTokens).toBe(2);
    expect(options.deployCreditSuiteParams.maxEnabledTokens).toBe(9);
  });

  it("carries every strategy-form override into projection and execution calldata", async () => {
    const { sdk, client } = await createTestSdk({ marketSuite: null });
    const bundle = strategyBundle();
    const original = structuredClone(bundle);
    const options = {
      deployCreditSuiteParams: {
        name: "Custom strategy",
        salt: "custom-strategy",
        feeInterest: 12,
        feeLiquidation: 0.5,
        feeLiquidationPremium: 1.5,
        minDebt: 20_000,
        maxDebt: 120_000,
      },
      targetAssetParams: { token: WBTC, liquidationThreshold: 88.123 },
    };
    const market = sdk
      .market({ initialState: marketState() })
      .applyBundle(bundle, options);
    // Captured options and the catalog are independent of later caller edits.
    options.deployCreditSuiteParams.name = "Edited later";
    options.deployCreditSuiteParams.maxDebt = 999_999;
    options.targetAssetParams.liquidationThreshold = 1;
    const preview = await market.preview();
    const manager = preview.after.creditManagers[CM2];
    expect(manager).toMatchObject({
      name: "Custom strategy",
      feeInterest: 12,
      feeLiquidation: 0.5,
      feeLiquidationPremium: 1.5,
      feeLiquidationExpired: 0.5,
      feeLiquidationPremiumExpired: 1.5,
      minDebt: 20_000,
      maxDebt: 120_000,
      maxEnabledTokens: 2,
    });
    expect(manager.collateralTokens[WBTC].liquidationThresholdFinal).toBe(
      88.12,
    );
    expect(preview.after.creditManagerDebtLimit[CM2]).toBe(120_000);
    expect(preview.after.assets[WBTC].quotaLimit).toBe(120_000);
    expect(preview.after.creditManagers[CM]).toEqual(
      preview.before?.creditManagers[CM],
    );
    expect(preview.bundles[0].targetResolution).toBe("predicted-suite");
    expect(preview.bundles[0].paramWarnings).toBeUndefined();
    expect(bundle).toEqual(original);

    const plan = await market.build({
      author: CM,
      eta: SOURCE_TIMESTAMP + 3600,
    });
    const mc = new MarketConfiguratorContract(CONFIGURATOR, client);
    const deployment = plan.payloadCalls.find(
      call =>
        decodeFunctionData({
          abi: iMarketConfiguratorV310Abi,
          data: call.callData,
        }).functionName === "createCreditSuite",
    );
    expect(deployment).toBeDefined();
    const decoded = mc.parseFunctionData((deployment as RawTx).callData);
    const params = JSON.parse(decoded.args.creditSuiteParams) as Record<
      string,
      unknown
    > & { accountFactoryParams: { salt: string } };
    expect(params).toMatchObject({
      name: "Custom strategy",
      minDebt: "20000000000",
      maxDebt: "120000000000",
      maxEnabledTokens: 2,
      feeInterest: 1200,
      feeLiquidation: 50,
      liquidationPremium: 150,
      feeLiquidationExpired: 50,
      liquidationPremiumExpired: 150,
    });
    expect(params.accountFactoryParams.salt).toBe(
      stringToHex("custom-strategy", { size: 32 }),
    );
    const poolCalls = plan.payloadCalls
      .map(call =>
        decodeFunctionData({
          abi: iMarketConfiguratorV310Abi,
          data: call.callData,
        }),
      )
      .filter(call => call.functionName === "configurePool");
    const debtLimit = poolCalls
      .map(call =>
        decodeFunctionData({
          abi: iPoolConfigureActionsAbi,
          data: call.args[1],
        }),
      )
      .find(call => call.functionName === "setCreditManagerDebtLimit");
    expect(debtLimit?.args[0].toLowerCase()).toBe(CM2);
    expect(debtLimit?.args[1]).toBe(120_000n * 10n ** 6n);
  });

  it("accepts deployment-only overrides without introducing collateral or debt-limit actions", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: marketState() })
      .applyBundle(strategyBundle(), {
        deployCreditSuiteParams: {
          name: "Different name",
          salt: "another-salt",
          feeInterest: 7,
        },
      })
      .preview();
    expect(preview.after.creditManagers[CM2]).toMatchObject({
      name: "Different name",
      feeInterest: 7,
      maxDebt: 100_000,
    });
    expect(
      preview.resolvedActions.find(
        action => action.type === "MARKET::createCreditSuite",
      )?.params.salt,
    ).toBe("another-salt");
    expect(
      preview.resolvedActions.some(
        action => action.type === "POOL::setCreditManagerDebtLimit",
      ),
    ).toBe(false);
    expect(
      preview.after.creditManagers[CM2].collateralTokens[WBTC]
        .liquidationThresholdFinal,
    ).toBe(80);
  });

  it("uses the catalog debt bound for partial overrides instead of defaulting it to zero", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: marketState() })
      .applyBundle(strategyBundle(), {
        deployCreditSuiteParams: { name: "Only a new name" },
        targetAssetParams: { liquidationThreshold: 85 },
      })
      .preview();
    expect(preview.after.creditManagerDebtLimit[CM2]).toBe(100_000);
    expect(preview.after.assets[WBTC].quotaLimit).toBe(100_000);
  });

  it("can customize existing-manager collateral without clearing its borrowing limit", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const bundle = strategyBundle();
    bundle.actions = bundle.actions.filter(
      action => action.type !== "MARKET::createCreditSuite",
    );
    const preview = await sdk
      .market({ initialState: marketState() })
      .applyBundle(bundle, {
        targetAssetParams: { liquidationThreshold: 70 },
      })
      .preview();
    expect(
      preview.after.creditManagers[CM].collateralTokens[WBTC]
        .liquidationThresholdFinal,
    ).toBe(70);
    expect(preview.after.creditManagerDebtLimit[CM]).toBe(500_000);
    expect(
      preview.resolvedActions.some(
        action => action.type === "POOL::setCreditManagerDebtLimit",
      ),
    ).toBe(false);
  });

  it("rejects invalid overrides before recording an intent or issuing RPCs", async () => {
    const { sdk, client } = await createTestSdk({ marketSuite: null });
    const market = sdk.market({ initialState: marketState() });
    const callsBefore = client.calls.length;
    for (const options of [
      { deployCreditSuiteParams: { minDebt: 200_000, maxDebt: 100_000 } },
      { deployCreditSuiteParams: { name: "" } },
      { targetAssetParams: { liquidationThreshold: 110 } },
    ])
      expect(() => market.applyBundle(strategyBundle(), options)).toThrow();
    expect(market.revision).toBe(0);
    expect(market.recordedActions()).toEqual([]);
    expect(client.calls.length).toBe(callsBefore);
  });
});

describe("shared customization helper", () => {
  it("uses the mF-ONE bundle's count of two with no user overrides", () => {
    const bundle = mfoneBundle();
    // Whatever the suite action itself says, the bundle's count wins.
    createSuite(bundle).params.maxEnabledTokens = 4;
    const result = customizeBundle(bundle, {});
    expect(createSuite(result).params.maxEnabledTokens).toBe(
      bundle.enabledTokens,
    );
    expect(createSuite(result).params.maxEnabledTokens).toBe(2);
  });

  it("merges the app's deployment fields into the real mF-ONE bundle without mutating it", () => {
    const bundle = mfoneBundle();
    const original = structuredClone(bundle);
    const custom = customizeBundle(bundle, {
      deployCreditSuiteParams: {
        name: "My mF-ONE",
        salt: "new-mfone",
        minDebt: 100_000,
        maxDebt: 1_000_000,
        feeInterest: 10,
        feeLiquidation: 0.5,
        feeLiquidationPremium: 2,
      },
      targetAssetParams: {
        token: bundle.tokenOut[0],
        liquidationThreshold: 87,
      },
    });
    expect(createSuite(custom).params).toMatchObject({
      name: "My mF-ONE",
      salt: "new-mfone",
      feeInterest: 10,
      feeLiquidation: 0.5,
      feeLiquidationExpired: 0.5,
      feeLiquidationPremium: 2,
      feeLiquidationPremiumExpired: 2,
      minDebt: 100_000,
      maxDebt: 1_000_000,
      maxEnabledTokens: 2,
    });
    const customCollateral = custom.actions
      .filter(action => action.type === "CREDIT::addCollateralToken")
      .slice(-2);
    expect(
      customCollateral.map(action => action.params.liquidationThreshold),
    ).toEqual([87, 87]);
    expect(bundle).toEqual(original);
  });

  it("honors explicitly supplied expired fees", () => {
    const custom = customizeBundle(strategyBundle(), {
      deployCreditSuiteParams: {
        feeLiquidation: 0.5,
        feeLiquidationExpired: 0.25,
        feeLiquidationPremium: 1.5,
        feeLiquidationPremiumExpired: 1,
      },
    });
    expect(createSuite(custom).params.feeLiquidationExpired).toBe(0.25);
    expect(createSuite(custom).params.feeLiquidationPremiumExpired).toBe(1);
  });

  it("reports a missing deployment when deployment overrides are supplied", () => {
    const bundle = strategyBundle();
    bundle.actions = bundle.actions.filter(
      action => action.type !== "MARKET::createCreditSuite",
    );
    expect(() =>
      customizeBundle(bundle, {
        deployCreditSuiteParams: { name: "My strategy" },
      }),
    ).toThrow(GipBuilderError);
    try {
      customizeBundle(bundle, {
        deployCreditSuiteParams: { name: "My strategy" },
      });
    } catch (error) {
      expect((error as GipBuilderError).code).toBe(
        "CREATE_CREDIT_SUITE_ACTION_NOT_FOUND",
      );
    }
  });
});
