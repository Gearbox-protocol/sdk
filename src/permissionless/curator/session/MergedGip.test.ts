import { type Address, getAddress, stringToHex } from "viem";
import { describe, expect, it } from "vitest";
import {
  ConfigurationExecutor,
  type CreateMarketParams,
  GipRegistry,
  MarketExecutor,
  type MergedGipPreview,
  planRwaPeripheryActions,
} from "../../index.js";
import {
  BCR,
  CM,
  configuratorState,
  createStubClient,
  createTestSdk,
  marketState,
  POOL,
  SOURCE_BLOCK,
  SOURCE_TIMESTAMP,
  TREASURY,
  USDC,
} from "../testing/sdkHarness.js";

const SECOND: Address = "0x1111111111111111111111111111111111111112";
const NFT: Address = "0x0000000000000000000000000000000000000123";

const NFT_REGISTRATION = {
  type: "MARKET::addPeripheryContract" as const,
  params: {
    peripheryContract: NFT,
    domain: "DEGEN_NFT" as const,
    type: "DEGEN_NFT::DEFAULT",
  },
};

const NFT_DEPLOYMENT = {
  type: "BCR::deployContract" as const,
  params: {
    contractType: "DEGEN_NFT::DEFAULT",
    version: 310,
    constructorParams: "0x" as const,
    salt: "0x0000000000000000000000000000000000000000000000000000000000000000" as const,
    expectedAddress: NFT,
  },
};

const NFT_SUITE = {
  type: "MARKET::createCreditSuite" as const,
  params: {
    name: "Shared NFT suite",
    maxEnabledTokens: 4,
    feeInterest: 20,
    feeLiquidation: 2,
    feeLiquidationPremium: 2.5,
    feeLiquidationExpired: 1,
    feeLiquidationPremiumExpired: 2,
    minDebt: 10_000,
    maxDebt: 100_000,
    minorVersion: 310 as const,
    accountFactoryType: "DEFAULT" as const,
    isExpired: false,
    whitelistPolicy: NFT,
  },
};

const NEW_MARKET: CreateMarketParams = {
  minorVersion: 310,
  name: "Gearbox USDC",
  symbol: "dUSDC",
  underlying: USDC,
  underlyingPriceFeed: "0x1010101010101010101010101010101010101010",
  interestRateModel: {
    type: "LINEAR",
    params: {
      U_1: 70,
      U_2: 90,
      R_base: 0,
      R_slope1: 5,
      R_slope2: 20,
      R_slope3: 100,
      isBorrowingMoreU2Forbidden: true,
    },
  },
  rateKeeperParams: { type: "TUMBLER", epochSeconds: 604_800 },
  lossPolicyParams: { type: "ALIAS" },
};

const setTotalDebtLimit = (limit: number) => ({
  type: "POOL::setTotalDebtLimit" as const,
  params: { limit },
});

/** A client on which {@link NFT} reports its Degen NFT contract type. **/
const nftClient = () =>
  createStubClient({
    readContract: args =>
      args.address?.toLowerCase() === NFT &&
      args.functionName === "contractType"
        ? stringToHex("DEGEN_NFT::DEFAULT", { size: 32 })
        : undefined,
  });

/** A client on which the {@link NFT_DEPLOYMENT} lands on {@link NFT}. **/
const deploymentClient = () =>
  createStubClient({
    client: { getCode: async () => undefined },
    readContract: args =>
      args.functionName === "computeAddress"
        ? // @dev only version 310 lands on NFT
          args.args?.[1] === 310n
          ? NFT
          : SECOND
        : args.functionName === "bytecodeRepository"
          ? BCR
          : args.functionName === "isDeployedFromRepository"
            ? false
            : undefined,
  });

/** Action types of every market's calls, in the order they execute. **/
const executedActions = (preview: MergedGipPreview): string[] =>
  preview.executionOrder.flatMap(
    pool =>
      preview.markets
        .find(market => market.pool === pool)
        ?.txs.map(tx => tx.action.type) ?? [],
  );

describe("merged GIP", () => {
  it("compiles all markets, batches once and leaves supplied snapshots untouched", async () => {
    const { sdk, client } = await createTestSdk();
    const first = marketState();
    const second = { ...marketState(), address: SECOND };
    const markets = [first, second].map(initialState =>
      sdk.market({ initialState }).addAction(setTotalDebtLimit(2_000_000)),
    );
    const gip = sdk.merge(markets);
    const eta = SOURCE_TIMESTAMP + 100;
    const preview = await gip.preview({ eta });
    expect(preview.markets.map(m => m.after.totalDebtLimit)).toEqual([
      2_000_000, 2_000_000,
    ]);
    expect(preview.executionOrder).toEqual([POOL, SECOND]);
    expect(preview.batches).toHaveLength(1);
    expect(preview.batches[0].txs).toHaveLength(2);
    expect(first.totalDebtLimit).toBe(1_000_000);
    expect(Object.isFrozen(preview.markets)).toBe(true);
    expect(client.calls.every(c => c.blockNumber === SOURCE_BLOCK)).toBe(true);
    expect(await gip.preview({ eta })).toBe(preview);

    const plan = await gip.build({ eta, author: TREASURY });
    expect(plan.payloadCalls).toHaveLength(2);
    expect(plan.payloadCallHashes).toHaveLength(2);
    expect(plan.timelockTxs.queueBatches).toHaveLength(1);
  });

  it("compiles what the builders record after they are merged", async () => {
    const { sdk } = await createTestSdk();
    const market = sdk.market({ initialState: marketState() });
    const gip = sdk.merge([market]);
    const empty = await gip.preview();
    expect(empty.markets[0].txs).toHaveLength(0);

    market.addAction(setTotalDebtLimit(3_000_000));
    const updated = await gip.preview();
    expect(updated).not.toBe(empty);
    expect(updated.markets[0].after.totalDebtLimit).toBe(3_000_000);
  });

  it("rejects builders of another session and a pool merged twice", async () => {
    const { sdk } = await createTestSdk();
    const { sdk: other } = await createTestSdk();
    expect(() =>
      sdk.merge([other.market({ initialState: marketState() })]),
    ).toThrow(/same session/);
    await expect(
      sdk
        .merge([
          sdk.market({ initialState: marketState() }),
          sdk.market({ initialState: marketState() }),
        ])
        .preview(),
    ).rejects.toThrow(/more than once/);
  });

  it("registers shared periphery once and projects it into every market", async () => {
    const { sdk } = await createTestSdk({ client: nftClient() });
    const preview = await sdk
      .merge([
        sdk.market({ initialState: marketState() }).addAction(NFT_REGISTRATION),
        sdk
          .market({ initialState: { ...marketState(), address: SECOND } })
          .addAction(NFT_REGISTRATION),
      ])
      .preview();
    expect(preview.markets.some(m => m.blockedAt !== undefined)).toBe(false);
    expect(executedActions(preview)).toEqual(["MARKET::addPeripheryContract"]);
    expect(
      preview.markets.every(m =>
        m.after.periphery.some(
          p => p.address === NFT && p.status === "registered",
        ),
      ),
    ).toBe(true);
  });

  it("keeps another pool's zapper out of a market-specific state", async () => {
    const { sdk } = await createTestSdk();
    const first = marketState();
    first.periphery = [
      {
        address: NFT,
        domain: "ZAPPER",
        type: "ZAPPER::ERC4626_UNDERLYING",
        version: 310,
        status: "registered",
      },
    ];
    const preview = await sdk
      .merge([
        sdk.market({ initialState: first }),
        sdk.market({ initialState: { ...marketState(), address: SECOND } }),
      ])
      .preview();
    expect(preview.markets[0].after.periphery).toHaveLength(1);
    expect(preview.markets[1].after.periphery).toHaveLength(0);
  });

  it("runs an identical periphery call listed by two markets once", async () => {
    const { sdk } = await createTestSdk({ client: deploymentClient() });
    const preview = await sdk
      .merge([
        sdk.market({ initialState: marketState() }).addAction(NFT_DEPLOYMENT),
        sdk
          .market({ initialState: { ...marketState(), address: SECOND } })
          // @dev the same call, spelled with a checksummed address
          .addAction({
            ...NFT_DEPLOYMENT,
            params: {
              ...NFT_DEPLOYMENT.params,
              expectedAddress: getAddress(NFT),
            },
          }),
      ])
      .preview();
    expect(executedActions(preview)).toEqual(["BCR::deployContract"]);
    expect(preview.markets[1].resolvedActions).toHaveLength(0);
  });

  it("blocks a conflicting declaration of a shared deployment", async () => {
    const { sdk } = await createTestSdk({ client: deploymentClient() });
    const gip = sdk.merge([
      sdk.market({ initialState: marketState() }).addAction(NFT_DEPLOYMENT),
      sdk
        .market({ initialState: { ...marketState(), address: SECOND } })
        .addAction({
          ...NFT_DEPLOYMENT,
          params: { ...NFT_DEPLOYMENT.params, version: 311 },
        }),
    ]);
    const preview = await gip.preview();
    expect(preview.markets[0].blockedAt).toBeUndefined();
    expect(preview.markets[1].blockedAt).toBe(0);
    expect(preview.markets[1].actionDiagnostics).toContainEqual(
      expect.objectContaining({
        actionIndex: 0,
        code: "EXPECTED_ADDRESS_MISMATCH",
      }),
    );
    await expect(
      gip.build({ eta: SOURCE_TIMESTAMP, author: TREASURY }),
    ).rejects.toMatchObject({ name: "GipActionError" });
  });

  it("orders a deployment before another market registers its contract", async () => {
    const { sdk } = await createTestSdk({ client: deploymentClient() });
    const preview = await sdk
      .merge([
        sdk.market({ initialState: marketState() }).addAction(NFT_REGISTRATION),
        sdk
          .market({ initialState: { ...marketState(), address: SECOND } })
          .addAction(NFT_DEPLOYMENT),
      ])
      .preview();
    expect(preview.markets.some(m => m.blockedAt !== undefined)).toBe(false);
    expect(preview.executionOrder).toEqual([SECOND, POOL]);
    expect(executedActions(preview)).toEqual([
      "BCR::deployContract",
      "MARKET::addPeripheryContract",
    ]);
  });

  it("orders a shared NFT registration before a suite in another market", async () => {
    const { sdk } = await createTestSdk({ client: nftClient() });
    const preview = await sdk
      .merge([
        sdk.market({ initialState: marketState() }).addAction(NFT_SUITE),
        sdk
          .market({ initialState: { ...marketState(), address: SECOND } })
          .addAction(NFT_REGISTRATION),
      ])
      .preview();
    expect(preview.markets.some(m => m.blockedAt !== undefined)).toBe(false);
    expect(executedActions(preview)).toEqual([
      "MARKET::addPeripheryContract",
      "MARKET::createCreditSuite",
    ]);
    expect(
      preview.markets[0].after.periphery.some(p => p.address === NFT),
    ).toBe(true);
  });

  it("orders a shared NFT registration before a facade upgrade in another market", async () => {
    const { sdk } = await createTestSdk({ client: nftClient() });
    const preview = await sdk
      .merge([
        sdk.market({ initialState: marketState() }).addAction({
          type: "CREDIT::upgradeCreditFacade",
          params: {
            creditManager: CM,
            facade: { degenNft: NFT, expirable: false },
          },
        }),
        sdk
          .market({ initialState: { ...marketState(), address: SECOND } })
          .addAction(NFT_REGISTRATION),
      ])
      .preview();
    expect(preview.markets.some(m => m.blockedAt !== undefined)).toBe(false);
    expect(executedActions(preview)).toEqual([
      "MARKET::addPeripheryContract",
      "CREDIT::upgradeCreditFacade",
    ]);
  });

  it("lets a new market use periphery another market registers", async () => {
    const { sdk } = await createTestSdk({
      client: nftClient(),
      marketSuite: null,
    });
    const preview = await sdk
      .merge([
        sdk.newMarket(NEW_MARKET).addAction(NFT_SUITE),
        sdk
          .market({ initialState: { ...marketState(), address: SECOND } })
          .addAction(NFT_REGISTRATION),
      ])
      .preview();
    expect(preview.markets.some(m => m.blockedAt !== undefined)).toBe(false);
    expect(executedActions(preview)).toEqual([
      "MARKET::addPeripheryContract",
      "MARKET::createMarket",
      "MARKET::createCreditSuite",
    ]);
    expect(preview.markets[0].stateProvenance).toBe("new-market");
    expect(
      preview.markets[0].after.periphery.some(p => p.address === NFT),
    ).toBe(true);
  });

  it("compiles every market and refuses to build while one is blocked", async () => {
    const { sdk } = await createTestSdk();
    const gip = sdk.merge([
      // @dev a no-op: the limit is already 1M
      sdk
        .market({ initialState: marketState() })
        .addAction(setTotalDebtLimit(1_000_000)),
      sdk
        .market({ initialState: { ...marketState(), address: SECOND } })
        .addAction(setTotalDebtLimit(2_000_000)),
    ]);
    const preview = await gip.preview();
    expect(preview.markets[0].blockedAt).toBe(0);
    expect(preview.markets[1].after.totalDebtLimit).toBe(2_000_000);
    await expect(
      gip.build({ eta: SOURCE_TIMESTAMP, author: TREASURY }),
    ).rejects.toMatchObject({ name: "GipActionError" });
  });
});

describe("inspection and public API", () => {
  it("preserves historical configurator calls without weakening session checks", async () => {
    const { sdk } = await createTestSdk();
    const before = configuratorState();
    const actions = [
      {
        type: "CONFIGURATOR::addAdmin" as const,
        params: { role: "PAUSABLE_ADMIN" as const, admin: TREASURY },
      },
    ];
    before.pausableAdmins = [TREASURY];
    const ctx = {
      client: sdk.readClient,
      marketConfigurator: sdk.marketConfigurator,
      tokens: { decimals: () => 18 },
    };
    const result = await new ConfigurationExecutor(ctx, {
      checkActions: false,
    }).executeBatch(before, actions);
    expect(result.txs).toHaveLength(1);
    const preview = await sdk
      .configurator({ initialState: before })
      .addActions(actions)
      .preview();
    expect(preview.blockedAt).toBe(0);
    expect(preview.txs).toHaveLength(0);
  });

  it("can inspect an already executed no-op without changing session validation", async () => {
    const { sdk } = await createTestSdk();
    const actions = [setTotalDebtLimit(1_000_000)];
    const executor = new MarketExecutor(
      {
        client: sdk.readClient,
        marketConfigurator: sdk.marketConfigurator,
        tokens: { decimals: () => 6 },
      },
      { checkActions: false, timestamp: SOURCE_TIMESTAMP },
    );
    const historical = await executor.executeBatch(marketState(), actions);
    expect(historical.txs).toHaveLength(1);
    expect(historical.after.totalDebtLimit).toBe(1_000_000);
    const preview = await sdk
      .market({ initialState: marketState() })
      .addActions(actions)
      .preview();
    expect(preview.blockedAt).toBe(0);
  });

  it("enforces supported deployment versions at the registry boundary", () => {
    for (const type of ["MIDAS_ISSUANCE_VAULT", "MIDAS_REDEMPTION_VAULT"]) {
      const plugin = GipRegistry.builtin.requireAdapter(type);
      expect(
        plugin.deployParamsSchema.safeParse({
          ...plugin.getDefaultParams(),
          version: 310,
        }).success,
      ).toBe(false);
      expect(
        plugin.deployParamsSchema.safeParse(plugin.getDefaultParams()).success,
      ).toBe(true);
    }
    expect(GipRegistry.builtin.adapter("INFINIFI_GATEWAY")).toBeUndefined();
  });

  it("exposes decoded transactions on previews without changing their projection", async () => {
    const { sdk } = await createTestSdk();
    const builder = sdk
      .market({ initialState: marketState() })
      .addAction(setTotalDebtLimit(2_000_000));
    const preview = await builder.preview();
    expect(preview.txs).toHaveLength(1);
    expect(preview.txs[0].action.type).toBe("POOL::setTotalDebtLimit");
    expect(preview.txs[0].estimatedGas).toBeGreaterThan(0);
    expect(preview.txs[0].decoded).toBeDefined();
    expect(await builder.preview()).toBe(preview);
  });

  it("plans no periphery for a normal token through the public API", async () => {
    await expect(
      planRwaPeripheryActions({
        underlying: POOL,
        pool: SECOND,
        read: async () => {
          throw new Error("ordinary ERC20");
        },
        getDeployer: async () => TREASURY,
        getRegistered: async () => [],
        isDeployed: async () => false,
        computeZapperAddress: async () => NFT,
      }),
    ).resolves.toEqual([]);
  });
});
