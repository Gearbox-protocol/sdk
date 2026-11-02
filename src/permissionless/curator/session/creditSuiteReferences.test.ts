import { zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import type { DeployCreateSuiteParams } from "../actions/actionTypes.js";
import type { GipMarketAction } from "../actions/types.js";
import { MarketExecutor } from "../executor/MarketExecutor.js";
import {
  CM,
  CM2,
  createTestSdk,
  marketState,
  SOURCE_TIMESTAMP,
  WBTC,
} from "../testing/sdkHarness.js";

const suite: DeployCreateSuiteParams = {
  name: "New CM",
  salt: `0x${"11".repeat(32)}`,
  maxEnabledTokens: 4,
  feeInterest: 20,
  feeLiquidation: 2,
  feeLiquidationPremium: 2.5,
  feeLiquidationExpired: 1,
  feeLiquidationPremiumExpired: 2,
  minDebt: 10_000,
  maxDebt: 100_000,
  minorVersion: 310,
  accountFactoryType: "DEFAULT",
  isExpired: false,
  whitelistPolicy: zeroAddress,
};

const createSuite = (params: Partial<DeployCreateSuiteParams> = {}) => ({
  type: "MARKET::createCreditSuite" as const,
  params: { ...suite, ...params },
});

const debtLimit = (creditManager: string, limit: number) =>
  ({
    type: "POOL::setCreditManagerDebtLimit",
    params: { creditManager, limit },
  }) as GipMarketAction;

/** A market without credit managers, so the suite it creates lands on CM2. **/
const emptyMarket = () => marketState({ creditManagers: {} });

describe("credit suite references", () => {
  it("gives a suite an id and names it by reference, with the same calldata", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const recorded = [createSuite(), debtLimit(CM2, 1_000)];
    const preview = await sdk
      .market({ initialState: emptyMarket() })
      .addActions(recorded)
      .preview();

    expect(preview.blockedAt).toBeUndefined();
    expect(preview.inputActions).toEqual([
      createSuite({ id: "New CM" }),
      debtLimit("suite:New CM", 1_000),
    ]);
    expect(preview.resolvedActions[1]).toEqual(debtLimit(CM2, 1_000));

    const unreferenced = await new MarketExecutor(
      {
        client: sdk.readClient,
        marketConfigurator: sdk.marketConfigurator,
        tokens: { decimals: () => 6 },
      },
      { timestamp: SOURCE_TIMESTAMP },
    ).execute(emptyMarket(), recorded);
    expect(preview.txs.map(({ tx }) => tx)).toEqual(
      unreferenced.txs.map(({ tx }) => tx),
    );
  });

  it("keeps a given id and follows it across a recompile", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const first = await sdk
      .market({ initialState: emptyMarket() })
      .addActions([createSuite({ id: "main" }), debtLimit(CM2, 1_000)])
      .preview();
    const again = await sdk
      .market({ initialState: emptyMarket() })
      .addActions(first.inputActions)
      .preview();
    expect(again.inputActions).toEqual(first.inputActions);
    expect(first.inputActions[1]).toEqual(debtLimit("suite:main", 1_000));
  });

  it("refuses the same suite recorded twice instead of merging it", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: emptyMarket() })
      .addActions([createSuite(), createSuite()])
      .preview();
    expect(preview.inputActions.map(action => action.params)).toMatchObject([
      { id: "New CM" },
      { id: "New CM#2" },
    ]);
    expect(preview.blockedAt).toBe(1);
    expect(preview.actionDiagnostics).toMatchObject([
      { actionIndex: 1, code: "CREDIT_MANAGER_EXISTS" },
    ]);
  });

  it("merges an action recorded by address into its reference spelling", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: emptyMarket() })
      .addActions([
        createSuite(),
        debtLimit("suite:New CM", 1_000),
        debtLimit(CM2, 2_000),
      ])
      .preview();
    expect(preview.inputActions).toEqual([
      createSuite({ id: "New CM" }),
      debtLimit("suite:New CM", 2_000),
    ]);
  });

  it("replaces a suite named by its address and keeps what configures it", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: emptyMarket() })
      .addActions([createSuite(), debtLimit(CM2, 1_000)])
      .replaceCreditSuite(
        CM2,
        createSuite({ name: "Renamed", feeInterest: 30 }),
      )
      .preview();
    expect(preview.inputActions).toEqual([
      createSuite({ id: "New CM", name: "Renamed", feeInterest: 30 }),
      debtLimit("suite:New CM", 1_000),
    ]);
  });

  it("copies a suite with what configures it under a new id", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: emptyMarket() })
      .addActions([createSuite(), debtLimit(CM2, 1_000)])
      .copyCreditSuite("suite:New CM", "Copy")
      .preview();
    expect(preview.inputActions).toEqual([
      createSuite({ id: "New CM" }),
      debtLimit("suite:New CM", 1_000),
      createSuite({ id: "New CM#Copy", name: "Copy" }),
      debtLimit("suite:New CM#Copy", 1_000),
    ]);
  });

  it("refuses to edit a credit manager the GIP does not deploy", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    await expect(
      sdk
        .market({ initialState: marketState() })
        .copyCreditSuite(CM, "Copy")
        .preview(),
    ).rejects.toMatchObject({
      name: "GipBuilderError",
      code: "CREDIT_SUITE_NOT_FOUND",
    });
  });

  it("removes an adapter of a suite named by its address", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const allowAdapter = (creditManager: string) =>
      ({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager,
          adapter: { type: "MELLOW_ERC4626_VAULT", version: 310, target: WBTC },
        },
      }) as GipMarketAction;
    const preview = await sdk
      .market({ initialState: emptyMarket() })
      .addActions([createSuite(), allowAdapter(CM2), debtLimit(CM2, 1_000)])
      .removeAdapter(CM2, WBTC)
      .preview();
    expect(preview.inputActions).toEqual([
      createSuite({ id: "New CM" }),
      debtLimit("suite:New CM", 1_000),
    ]);
  });
});
