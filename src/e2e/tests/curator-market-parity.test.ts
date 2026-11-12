import { type Address, http, toFunctionSelector, zeroAddress } from "viem";
import { beforeEach, describe, expect, it } from "vitest";
import { createAnvilClient } from "../../dev/createAnvilClient.js";
import type { RawTx } from "../../onchain/index.js";
import { marketActionDefinitions } from "../../permissionless/curator/actions/marketActionDefinitions.js";
import { actionEnv } from "../../permissionless/curator/executor/actionEnv.js";
import { CuratorSession } from "../../permissionless/curator/session/CuratorSession.js";
import type { MarketState } from "../../permissionless/curator/state/market/types.js";
import { ANVIL_URL } from "../constants.js";
import {
  describeSimulation,
  simulationMatches,
} from "../curator/reproduceExecutedGip.js";
import { useFixture } from "../helpers.js";

const MC: Address = "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe";
const POOL: Address = "0x9396dcbf78fc526bb003665337c5e73b699571ef";
const anvil = createAnvilClient({ transport: http(ANVIL_URL) });

function revertData(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const object = error as { data?: unknown; cause?: unknown; error?: unknown };
  return typeof object.data === "string" && object.data.startsWith("0x")
    ? object.data
    : (revertData(object.cause) ??
        revertData(object.error) ??
        revertData(object.data));
}

describe("curator market contract parity", () => {
  useFixture({ network: "Mainnet", block: 24928628n });
  let session: CuratorSession;
  let state: MarketState;
  let admin: Address;

  beforeEach(async () => {
    await anvil.setBlockTimestampInterval({ interval: 0 });
    session = await CuratorSession.create({
      marketConfigurator: MC,
      fork: { rpcUrl: ANVIL_URL },
    });
    state = (await session.market({ pool: POOL }).preview()).after;
    admin = await session.marketConfigurator.contract.read.admin();
  });

  const builder = () => session.market({ initialState: state });
  const manager = () =>
    Object.values(state.creditManagers)[0].address.toLowerCase() as Address;
  const upgrade = () => ({
    type: "CREDIT::upgradeCreditFacade" as const,
    params: {
      creditManager: manager(),
      facade: { degenNft: zeroAddress, expirable: true },
    },
  });

  async function expectActualRevert(tx: RawTx, signature: string) {
    try {
      await anvil.request({
        method: "eth_call",
        params: [
          { from: admin, to: tx.to, data: tx.callData, gas: "0x1c9c380" },
          "latest",
        ],
      });
      expect.unreachable(`Expected ${signature}`);
    } catch (error) {
      expect(revertData(error)?.slice(0, 10)).toBe(
        toFunctionSelector(signature),
      );
    }
  }

  async function expectMatch(
    proposal: ReturnType<typeof builder>,
    eta?: number,
  ) {
    const result = await proposal.simulate({ eta });
    expect(simulationMatches(result), describeSimulation(result)).toBe(true);
    return result;
  }

  it("promotes a reserve, then restores it without a false no-op", async () => {
    const asset = Object.values(state.assets).find(
      asset =>
        asset.reservePriceFeed !== zeroAddress &&
        asset.reservePriceFeed !== asset.mainPriceFeed,
    )!;
    expect(asset).toBeDefined();
    await expectMatch(
      builder().addActions([
        {
          type: "ORACLE::setPriceFeed",
          params: { token: asset.address, priceFeed: asset.reservePriceFeed },
        },
        {
          type: "ORACLE::setReservePriceFeed",
          params: { token: asset.address, priceFeed: asset.reservePriceFeed },
        },
      ]),
    );
  });

  it("configures the underlying reserve", async () => {
    await expectMatch(
      builder().addAction({
        type: "ORACLE::setReservePriceFeed",
        params: {
          token: state.underlyingAsset,
          priceFeed: state.underlyingPriceFeed,
        },
      }),
    );
  });

  it("preserves pause → upgrade → pause ordering and projects the new facade correctly", async () => {
    await expectMatch(
      builder().addActions([
        { type: "CREDIT::pause", params: { creditManager: manager() } },
        upgrade(),
        { type: "CREDIT::pause", params: { creditManager: manager() } },
      ]),
    );
  });

  it.each([-100, 100])(
    "clamps expiration with ETA %s seconds from the source block",
    async offset => {
      const eta = session.source.blockTimestamp + offset;
      const timestamp = Math.max(eta, session.source.blockTimestamp);
      const proposal = builder().addActions([
        upgrade(),
        {
          type: "CREDIT::setExpirationDate",
          params: {
            creditManager: manager(),
            expirationDate: timestamp + 86400,
          },
        },
      ]);
      const preview = await proposal.preview({ eta });
      expect(preview.after.creditManagers[manager()].expirationDate).toBe(
        timestamp + 14 * 86400,
      );
      const result = await expectMatch(proposal, eta);
      expect(
        result.receipts.every(receipt => receipt.blockTimestamp === timestamp),
      ).toBe(true);
    },
  );

  it("stores both initial and final LT and clamps a past ramp start", async () => {
    const cm = Object.values(state.creditManagers).find(cm =>
      Object.keys(cm.collateralTokens).some(
        token => token.toLowerCase() !== state.underlyingAsset.toLowerCase(),
      ),
    )!;
    const token = Object.keys(cm.collateralTokens).find(
      token => token.toLowerCase() !== state.underlyingAsset.toLowerCase(),
    ) as Address;
    await expectMatch(
      builder().addAction({
        type: "CREDIT::rampLiquidationThreshold",
        params: {
          creditManager: cm.address,
          token,
          liquidationThresholdFinal: 50,
          rampStart: 0,
          rampDuration: 172800,
        },
      }),
    );
  });

  it("deploys an expirable suite with no date, then explicitly sets its expiration", async () => {
    const proposal = builder().addActions([
      {
        type: "MARKET::createCreditSuite",
        params: {
          id: "parity",
          name: "Parity expiration",
          salt: "parity-expiry",
          minorVersion: 310,
          feeInterest: 10,
          feeLiquidation: 1,
          feeLiquidationPremium: 2,
          feeLiquidationExpired: 0.5,
          feeLiquidationPremiumExpired: 1,
          minDebt: 1,
          maxDebt: 10,
          maxEnabledTokens: 4,
          whitelistPolicy: zeroAddress,
          accountFactoryType: "DEFAULT",
          isExpired: true,
        },
      },
      {
        type: "CREDIT::setExpirationDate",
        params: {
          creditManager: "suite:parity",
          expirationDate: session.source.blockTimestamp + 30 * 86400,
        },
      },
    ]);
    await expectMatch(proposal);
  });

  it("rejects quota overflow with the same downstream contract restriction", async () => {
    const asset = Object.values(state.assets).find(
      asset => asset.quotaLimit > 0,
    )!;
    const sdk = await session.onchainSdk();
    const params = {
      token: asset.address,
      limit: 5e28 / 10 ** sdk.tokensMeta.decimals(state.underlyingAsset),
    };
    const preview = await builder()
      .addAction({ type: "POOL::setTokenLimit", params })
      .preview();
    expect(
      preview.actionDiagnostics.some(
        diagnostic => diagnostic.code === "AMOUNT_OVERFLOW",
      ),
    ).toBe(true);
    const definition = marketActionDefinitions.find(
      definition => definition.type === "POOL::setTokenLimit",
    )!;
    const ctx = {
      client: session.readClient,
      marketConfigurator: session.marketConfigurator,
      tokens: { decimals: (token: Address) => sdk.tokensMeta.decimals(token) },
    };
    const tx = definition.encode({
      ctx,
      state,
      params,
      resolved: undefined,
      env: actionEnv({ timestamp: session.source.blockTimestamp }),
    });
    await expectActualRevert(tx, "IncorrectParameterException()");
  });

  it("defers an unavailable active price to Anvil execution", async () => {
    const asset = Object.values(state.assets).find(
      asset => asset.quotaLimit > 0,
    )!;
    // Make the existing feed revert when the contract reads its current price.
    await anvil.setCode({
      address: asset.mainPriceFeed,
      bytecode: "0x60006000fd",
    });
    const proposal = builder().addAction({
      type: "POOL::setTokenLimit",
      params: { token: asset.address, limit: asset.quotaLimit === 1 ? 2 : 1 },
    });
    expect((await proposal.preview()).blockedAt).toBeUndefined();
    const result = await proposal.simulate();
    expect(result.verdict, describeSimulation(result)).toBe("execution_failed");
    expect(result.receipts[0].status).toBe("reverted");
  });

  it("rejects aliases on underlying and unapproved token feeds like the contracts", async () => {
    const asset = Object.values(state.assets)[0];
    const sdk = await session.onchainSdk();
    const ctx = {
      client: session.readClient,
      marketConfigurator: session.marketConfigurator,
      tokens: { decimals: (token: Address) => sdk.tokensMeta.decimals(token) },
    };
    const env = actionEnv({ timestamp: session.source.blockTimestamp });
    const alias = {
      token: state.underlyingAsset,
      alias: state.underlyingPriceFeed,
    };
    expect(
      (
        await builder()
          .addAction({ type: "LOSS_POLICY::ALIAS::setAlias", params: alias })
          .preview()
      ).blockedAt,
    ).toBe(0);
    const aliasDefinition = marketActionDefinitions.find(
      definition => definition.type === "LOSS_POLICY::ALIAS::setAlias",
    )!;
    await expectActualRevert(
      aliasDefinition.encode({
        ctx,
        state,
        params: alias,
        resolved: undefined,
        env,
      }),
      "TokenIsNotQuotedException()",
    );
    const feed = { token: asset.address, priceFeed: state.underlyingPriceFeed };
    const preview = await builder()
      .addAction({ type: "ORACLE::setPriceFeed", params: feed })
      .preview();
    expect(
      preview.actionDiagnostics.some(
        diagnostic => diagnostic.code === "PRICE_FEED_NOT_ALLOWED",
      ),
    ).toBe(true);
    const feedDefinition = marketActionDefinitions.find(
      definition => definition.type === "ORACLE::setPriceFeed",
    )!;
    await expectActualRevert(
      feedDefinition.encode({
        ctx,
        state,
        params: feed,
        resolved: await feedDefinition.resolve!({
          ctx,
          market: state,
          params: feed,
          registry: env.registry,
        }),
        env,
      }),
      "PriceFeedNotAllowedException(address,address)",
    );
  });
});
