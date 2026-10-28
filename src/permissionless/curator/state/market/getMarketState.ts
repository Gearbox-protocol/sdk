import {
  type Address,
  type Chain,
  erc20Abi,
  formatUnits,
  hexToString,
  maxUint256,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import { iCreditManagerV310Abi } from "../../../../abi/310/generated.js";
import { iVersionAbi } from "../../../../abi/iVersion.js";
import { iZapperAbi } from "../../../../abi/iZapper.js";
import type { MarketSuite, OnchainSDK } from "../../../../onchain/index.js";
import { MarketConfiguratorContract as PermissionlessMarketConfigurator } from "../../../bindings/market-configurator.js";
import type { GipRegistry } from "../../GipRegistry.js";
import type { InterestRateModelState } from "../../plugins/irm/irmPlugins.js";
import type { RateKeeperState } from "../../plugins/rate-keepers/rateKeeperPlugins.js";
import { contractReaderFromClient } from "../../rwaPeripherySetup.js";
import { isSameAddress, lowerAddress } from "../../utils/addressUtils.js";
import { buildAdaptersState } from "./buildAdaptersState.js";
import { buildLossPolicyState } from "./buildLossPolicyState.js";
import { isCreditManagerExpired } from "./isCreditManagerExpired.js";
import { selectMarketDegenNfts } from "./selectMarketDegenNfts.js";
import {
  type CollateralToken,
  type MarketAsset,
  type MarketCreditManagerState,
  type MarketState,
  NO_LIMIT,
  type PeripheryState,
  type TreasuryState,
} from "./types.js";

const PERCENTAGE_FACTOR = 1e4;
const PERCENTAGE_DIVISOR = 1e2;

type CreditSuite = MarketSuite["creditManagers"][number];
type ReadClient = PublicClient<Transport, Chain>;

/**
 * Fetches the complete market state for a given pool
 **/
export async function getMarketState(
  sdk: OnchainSDK,
  marketConfiguratorAddress: Address,
  pool: Address,
  options: {
    /** Read client for supplemental calls; defaults to the legacy SDK client. **/
    client?: ReadClient;
    /** Timestamp used for expiration; defaults to legacy wall-clock time. **/
    timestamp?: number;
    /**
     * Periphery contracts expected to be deployed but not registered, e.g.
     * by a simulated GIP. Each one holding code is reported as `deployed`;
     * the reader cannot discover unregistered contracts by itself.
     **/
    knownDeployments?: readonly Address[];
    /** Adapter plugins reading adapter states; the built-in ones by default. **/
    registry?: GipRegistry;
  } = {},
): Promise<MarketState> {
  const marketSuite = sdk.marketRegister.findByPool(pool);
  const poolContract = marketSuite.pool.pool;
  const underlying = poolContract.underlying;
  const underlyingDecimals = sdk.tokensMeta.decimals(underlying);
  const client = options.client ?? marketSuite.sdk.client;

  const creditManagers = await buildCreditManagersState(marketSuite, {
    underlyingDecimals,
    client,
    timestamp: options.timestamp ?? Date.now() / 1000,
    registry: options.registry,
  });
  const treasury = await buildTreasuryState(
    marketSuite,
    underlyingDecimals,
    client,
  );
  const periphery = await buildPeripheryState(
    marketSuite,
    marketConfiguratorAddress,
    client,
    options.knownDeployments ?? [],
  );

  return {
    minorVersion: poolContract.version,
    address: poolContract.address,
    symbol: poolContract.symbol,
    name: poolContract.name,
    underlyingAsset: underlying,
    underlyingPriceFeed:
      marketSuite.priceOracle.mainPriceFeeds.get(underlying)?.address ??
      zeroAddress,
    underlyingReservePriceFeed:
      marketSuite.priceOracle.reservePriceFeeds.get(underlying)?.address ??
      zeroAddress,
    totalDebtLimit: debtLimit(poolContract.totalDebtLimit, underlyingDecimals),
    creditManagerDebtLimit: buildCreditManagerDebtLimits(
      marketSuite,
      underlyingDecimals,
    ),
    assets: buildMarketAssetsState(marketSuite, underlyingDecimals),
    creditManagers,
    paused: poolContract.isPaused,
    treasury,
    rateKeeper: buildRateKeeperState(marketSuite),
    lossPolicy: buildLossPolicyState(marketSuite),
    interestRateModel: buildInterestRateModelState(marketSuite),
    periphery,
  };
}

/** A debt limit in underlying units; `maxUint256` on chain means no limit. **/
function debtLimit(
  limit: bigint,
  underlyingDecimals: number,
): number | typeof NO_LIMIT {
  return limit === maxUint256
    ? NO_LIMIT
    : Number(formatUnits(limit, underlyingDecimals));
}

function buildRateKeeperState(marketSuite: MarketSuite): RateKeeperState {
  switch (marketSuite.pool.rateKeeper.contractType) {
    case "RATE_KEEPER::TUMBLER":
      return buildTumblerRateKeeperState(marketSuite);
    case "RATE_KEEPER::GAUGE":
      return buildGaugeRateKeeperState(marketSuite);
    default:
      throw new Error(
        `Unsupported rate keeper ${marketSuite.pool.rateKeeper.contractType} of pool ${marketSuite.pool.pool.address}`,
      );
  }
}

function buildTumblerRateKeeperState(
  marketSuite: MarketSuite,
): RateKeeperState {
  const tumbler = marketSuite.pool.tumbler;
  const rates: Record<Address, number> = {};

  for (const [address, rate] of tumbler.rates.entries()) {
    rates[lowerAddress(address)] = Number(rate);
  }

  return {
    type: "TUMBLER",
    epochSeconds: Number(tumbler.epochLength),
    rates,
  };
}

/**
 * Builds gauge rate keeper state: each quoted token's range of quota rates,
 * in basis points, as the SDK's gauge reads it.
 **/
function buildGaugeRateKeeperState(marketSuite: MarketSuite): RateKeeperState {
  const rates: Record<Address, { minRate: number; maxRate: number }> = {};
  for (const [token, params] of marketSuite.pool.gauge.quotaParams.entries()) {
    rates[lowerAddress(token)] = {
      minRate: params.minRate,
      maxRate: params.maxRate,
    };
  }
  return { type: "GAUGE", rates };
}

function buildInterestRateModelState(
  marketSuite: MarketSuite,
): InterestRateModelState {
  if (marketSuite.pool.interestRateModel.contractType !== "IRM::LINEAR") {
    throw new Error(
      `Unsupported interest rate model ${marketSuite.pool.interestRateModel.contractType} of pool ${marketSuite.pool.pool.address}`,
    );
  }

  const irm = marketSuite.pool.linearModel;
  return {
    type: "LINEAR",
    params: {
      U_1: irm.U1 / PERCENTAGE_DIVISOR,
      U_2: irm.U2 / PERCENTAGE_DIVISOR,
      R_base: irm.Rbase / PERCENTAGE_DIVISOR,
      R_slope1: irm.Rslope1 / PERCENTAGE_DIVISOR,
      R_slope2: irm.Rslope2 / PERCENTAGE_DIVISOR,
      R_slope3: irm.Rslope3 / PERCENTAGE_DIVISOR,
      isBorrowingMoreU2Forbidden: irm.isBorrowingMoreU2Forbidden,
    },
  };
}

function buildCreditManagerDebtLimits(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
): Record<Address, number | typeof NO_LIMIT> {
  const debtLimits: Record<Address, number | typeof NO_LIMIT> = {};

  for (const cm of marketSuite.creditManagers) {
    const address = cm.creditManager.address;
    const limit =
      marketSuite.pool.pool.creditManagerDebtParams.get(address)?.limit ?? 0n;
    debtLimits[lowerAddress(address)] = debtLimit(limit, underlyingDecimals);
  }

  return debtLimits;
}

async function buildCreditManagersState(
  marketSuite: MarketSuite,
  args: {
    underlyingDecimals: number;
    client: ReadClient;
    timestamp: number;
    registry: GipRegistry | undefined;
  },
): Promise<Record<Address, MarketCreditManagerState>> {
  const { underlyingDecimals, client, timestamp, registry } = args;
  const creditManagersState: Record<Address, MarketCreditManagerState> = {};

  for (const cm of marketSuite.creditManagers) {
    const { creditManager: manager, creditFacade: facade } = cm;

    creditManagersState[lowerAddress(manager.address)] = {
      address: manager.address,
      name: manager.name,
      isExpired: isCreditManagerExpired(facade, timestamp),
      expirable: facade.expirable,
      expirationDate: facade.expirationDate,
      feeInterest: manager.feeInterest / PERCENTAGE_DIVISOR,
      maxEnabledTokens: manager.maxEnabledTokens,
      collateralTokens: await buildCollateralTokensState(cm, client),
      adapters: await buildAdaptersState(cm, client, registry),
      degenNFT: facade.degenNFT,
      creditFacade: facade.address,
      minDebt: Number(formatUnits(facade.minDebt, underlyingDecimals)),
      maxDebt: Number(formatUnits(facade.maxDebt, underlyingDecimals)),
      maxDebtPerBlockMultiplier: facade.maxDebtPerBlockMultiplier,
      paused: facade.isPaused,
      feeLiquidation: manager.feeLiquidation / PERCENTAGE_DIVISOR,
      feeLiquidationExpired: manager.feeLiquidationExpired / PERCENTAGE_DIVISOR,
      feeLiquidationPremium:
        (PERCENTAGE_FACTOR - manager.liquidationDiscount) / PERCENTAGE_DIVISOR,
      feeLiquidationPremiumExpired:
        (PERCENTAGE_FACTOR - manager.liquidationDiscountExpired) /
        PERCENTAGE_DIVISOR,
    };
  }

  return creditManagersState;
}

/**
 * Builds collateral tokens state. The underlying has a calculated LT and no
 * ramp; every other token's thresholds and ramp come from its `ltParams`.
 **/
export async function buildCollateralTokensState(
  creditManager: CreditSuite,
  client: ReadClient = creditManager.sdk.client,
): Promise<Record<Address, CollateralToken>> {
  const collateralTokens: Record<Address, CollateralToken> = {};
  const forbidden = new Set(creditManager.forbiddenTokens.map(lowerAddress));
  const manager = creditManager.creditManager;
  const underlying = lowerAddress(manager.underlying);
  const rampTokens = manager.collateralTokens.filter(
    token => lowerAddress(token) !== underlying,
  );
  const rampParams =
    rampTokens.length === 0
      ? []
      : await client.multicall({
          contracts: rampTokens.map(token => ({
            address: manager.address,
            abi: iCreditManagerV310Abi,
            functionName: "ltParams" as const,
            args: [token] as const,
          })),
          allowFailure: false,
        });
  const paramsByToken = new Map(
    rampTokens.map((token, i) => [lowerAddress(token), rampParams[i]]),
  );

  for (const token of manager.collateralTokens) {
    const address = lowerAddress(token);
    const isForbidden = forbidden.has(address);
    if (address === underlying) {
      const threshold =
        manager.liquidationThresholds.mustGet(token) / PERCENTAGE_DIVISOR;
      collateralTokens[address] = {
        liquidationThresholdInitial: threshold,
        liquidationThresholdFinal: threshold,
        rampStart: 0,
        rampDuration: 0,
        isForbidden,
      };
      continue;
    }

    const params = paramsByToken.get(address);
    if (!params) {
      throw new Error(
        `Missing liquidation threshold parameters for ${address}`,
      );
    }
    const [initial, final, rampStart, rampDuration] = params;
    collateralTokens[address] = {
      liquidationThresholdInitial: Number(initial) / PERCENTAGE_DIVISOR,
      liquidationThresholdFinal: Number(final) / PERCENTAGE_DIVISOR,
      // Static thresholds use uint40.max on chain. MarketState uses zero.
      rampStart: Number(rampDuration) === 0 ? 0 : Number(rampStart),
      rampDuration: Number(rampDuration),
      isForbidden,
    };
  }

  return collateralTokens;
}

function buildMarketAssetsState(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
): Record<Address, MarketAsset> {
  const { mainPriceFeeds, reservePriceFeeds } = marketSuite.priceOracle;
  const assets: Record<Address, MarketAsset> = {};

  for (const [token, quota] of marketSuite.pool.pqk.quotas.entries()) {
    const address = lowerAddress(token);
    assets[address] = {
      address,
      quotaLimit: Number(formatUnits(quota.limit, underlyingDecimals)),
      quotaIncreaseFee: quota.quotaIncreaseFee / PERCENTAGE_DIVISOR,
      mainPriceFeed: mainPriceFeeds.get(token)?.address ?? zeroAddress,
      reservePriceFeed: reservePriceFeeds.get(token)?.address ?? zeroAddress,
    };
  }

  return assets;
}

/**
 * Builds periphery state for a market:
 * - DEGEN_NFT: registered addresses used by a credit manager in this market,
 *   plus the registered Degen NFT belonging to a Securitize RWA underlying.
 * - ZAPPER: configurator's ZAPPER addresses filtered to those whose pool()
 *   matches the given pool.
 * Each included address is enriched with contractType and version.
 **/
async function buildPeripheryState(
  marketSuite: MarketSuite,
  marketConfiguratorAddress: Address,
  client: ReadClient,
  knownDeployments: readonly Address[],
): Promise<PeripheryState[]> {
  const pool = marketSuite.pool.pool.address;
  const configurator = new PermissionlessMarketConfigurator(
    marketConfiguratorAddress,
    client,
  );
  const { DEGEN_NFT: registeredDegenNfts, ZAPPER: registeredZappers } =
    await configurator.getPeripheryContracts();

  const selectedDegenNfts = await selectMarketDegenNfts({
    read: contractReaderFromClient(client),
    underlying: marketSuite.pool.pool.underlying,
    registered: registeredDegenNfts,
    creditManagerDegenNfts: marketSuite.creditManagers.map(
      cm => cm.creditFacade.degenNFT,
    ),
  });
  const degenNfts = [
    ...new Set([
      ...selectedDegenNfts,
      ...registeredDegenNfts.filter(address =>
        knownDeployments.some(known => isSameAddress(known, address)),
      ),
    ]),
  ];

  // Zappers: query pool() for each, keep only those matching the given pool
  const zapperPools = await client.multicall({
    allowFailure: true,
    contracts: registeredZappers.map(address => ({
      address,
      abi: iZapperAbi,
      functionName: "pool" as const,
    })),
  });
  const zappers = registeredZappers.filter((_, i) => {
    const result = zapperPools[i];
    return result.status === "success" && isSameAddress(result.result, pool);
  });

  // Known deployments that are not registered, and hold code
  const registered = [...degenNfts, ...zappers];
  const unregistered = knownDeployments.filter(
    address => !registered.some(entry => isSameAddress(entry, address)),
  );
  const codes = await Promise.all(
    unregistered.map(address => client.getCode({ address })),
  );
  const deployed = unregistered.filter(
    (_, i) => codes[i] !== undefined && codes[i] !== "0x",
  );

  // Assemble final list and enrich with contractType + version
  const entries = [
    ...degenNfts.map(address => ({
      domain: "DEGEN_NFT",
      address,
      status: "registered" as const,
    })),
    ...zappers.map(address => ({
      domain: "ZAPPER",
      address,
      status: "registered" as const,
    })),
    ...deployed.map(address => ({
      // @dev the domain comes from the contract type, read below
      domain: "",
      address: lowerAddress(address),
      status: "deployed" as const,
    })),
  ];

  if (entries.length === 0) return [];

  const versions = await client.multicall({
    allowFailure: true,
    contracts: entries.flatMap(({ address }) => [
      { address, abi: iVersionAbi, functionName: "contractType" as const },
      { address, abi: iVersionAbi, functionName: "version" as const },
    ]),
  });

  return entries.map(({ domain, address, status }, i) => {
    const typeResult = versions[i * 2];
    const versionResult = versions[i * 2 + 1];

    const type =
      typeResult.status === "success" && typeof typeResult.result === "string"
        ? hexToString(typeResult.result, { size: 32 })
        : "";
    const version =
      versionResult.status === "success" &&
      typeof versionResult.result === "bigint"
        ? Number(versionResult.result)
        : 0;

    return {
      address,
      domain: domain || type.split("::")[0],
      type,
      version,
      status,
    };
  });
}

/** The treasury's type and its balances of the pool's underlying and shares. **/
async function buildTreasuryState(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
  client: ReadClient,
): Promise<TreasuryState> {
  const treasury = marketSuite.treasury;
  const underlying = marketSuite.pool.underlying;
  const pool = marketSuite.pool.pool.address;

  const [type, underlyingBalance, poolBalance] = await client.multicall({
    allowFailure: true,
    contracts: [
      {
        address: treasury,
        abi: iVersionAbi,
        functionName: "contractType",
      },
      {
        address: underlying,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [treasury],
      },
      {
        address: pool,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [treasury],
      },
    ],
  });

  const balances: Record<Address, number> = {};
  for (const [token, call] of [
    [underlying, underlyingBalance],
    [pool, poolBalance],
  ] as const) {
    if (call.status === "success") {
      balances[lowerAddress(token)] = Number(
        formatUnits(call.result, underlyingDecimals),
      );
    }
  }

  return {
    address: treasury,
    type:
      type.status === "success" &&
      hexToString(type.result, { size: 32 }) === "TREASURY_SPLITTER"
        ? "TREASURY_SPLITTER"
        : "TREASURY",
    balances,
  };
}
