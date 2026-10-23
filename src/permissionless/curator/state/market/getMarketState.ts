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

// Constants
const PERCENTAGE_FACTOR = 1e4;
const PERCENTAGE_DIVISOR = 1e2;

// Types
type CreditSuite = MarketSuite["creditManagers"][number];

/**
 * Fetches the complete market state for a given pool
 **/
export async function getMarketState(
  sdk: OnchainSDK,
  marketConfiguratorAddress: Address,
  pool: Address,
  options?: {
    /** Read client for supplemental calls; defaults to the legacy SDK client. **/
    client?: PublicClient<Transport, Chain>;
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
  },
): Promise<MarketState> {
  // Get market data
  const marketSuite = sdk.marketRegister.findByPool(pool);
  const underlyingDecimals = sdk.tokensMeta.decimals(
    marketSuite.pool.pool.underlying,
  );
  const creditManagerAddresses = marketSuite.creditManagers.map(
    cm => cm.creditManager.address,
  );

  // Build market state components
  const creditManagerDebtLimits = buildCreditManagerDebtLimits(
    marketSuite,
    creditManagerAddresses,
    underlyingDecimals,
  );
  const creditManagersState = await buildCreditManagersState(
    marketSuite,
    underlyingDecimals,
    options,
  );
  const marketAssets = buildMarketAssetsState(marketSuite, underlyingDecimals);
  const rateKeeperState = buildRateKeeperState(marketSuite);
  const lossPolicyState = await buildLossPolicyState(marketSuite);
  const interestRateModelState = buildInterestRateModelState(marketSuite);
  const treasutyState = await buildTreasuryState(
    marketSuite,
    underlyingDecimals,
    options?.client,
  );
  const peripheryState = await buildPeripheryState(
    marketSuite,
    marketConfiguratorAddress,
    options?.client,
    options?.knownDeployments,
  );

  // Assemble complete market state
  return {
    minorVersion: marketSuite.pool.pool.version,
    address: marketSuite.pool.pool.address,
    symbol: marketSuite.pool.pool.symbol,
    name: marketSuite.pool.pool.name,
    underlyingAsset: marketSuite.pool.pool.underlying,
    underlyingPriceFeed:
      marketSuite.priceOracle.mainPriceFeeds.get(
        marketSuite.pool.pool.underlying,
      )?.address || zeroAddress,
    totalDebtLimit:
      marketSuite.pool.pool.totalDebtLimit === maxUint256
        ? NO_LIMIT
        : Number(
            formatUnits(
              marketSuite.pool.pool.totalDebtLimit,
              underlyingDecimals,
            ),
          ),
    creditManagerDebtLimit: creditManagerDebtLimits,
    assets: convertArrayToRecord(marketAssets),
    creditManagers: creditManagersState,
    paused: marketSuite.pool.pool.isPaused,
    treasury: treasutyState,
    rateKeeper: rateKeeperState,
    lossPolicy: lossPolicyState,
    interestRateModel: interestRateModelState,
    periphery: peripheryState,
  };
}

/**
 * Converts an array of objects with address field to a record indexed by address
 **/
function convertArrayToRecord<T extends { address: Address }>(
  items: T[],
): Record<Address, T> {
  return items.reduce(
    (acc, item) => {
      acc[item.address] = item;
      return acc;
    },
    {} as Record<Address, T>,
  );
}

/**
 * Builds the rate keeper state based on the market suite
 **/
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

/**
 * Builds tumbler rate keeper state
 **/
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

/**
 * Builds interest rate model state
 **/
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
      U_1: Number(irm.U1 / PERCENTAGE_DIVISOR),
      U_2: Number(irm.U2 / PERCENTAGE_DIVISOR),
      R_base: Number(irm.Rbase / PERCENTAGE_DIVISOR),
      R_slope1: Number(irm.Rslope1 / PERCENTAGE_DIVISOR),
      R_slope2: Number(irm.Rslope2 / PERCENTAGE_DIVISOR),
      R_slope3: Number(irm.Rslope3 / PERCENTAGE_DIVISOR),
      isBorrowingMoreU2Forbidden: irm.isBorrowingMoreU2Forbidden,
    },
  } as InterestRateModelState;
}

/**
 * Builds credit manager debt limits
 **/
function buildCreditManagerDebtLimits(
  marketSuite: MarketSuite,
  creditManagerAddresses: Address[],
  underlyingDecimals: number,
): Record<Address, number> {
  const debtLimits: Record<Address, number> = {};

  for (const creditManager of creditManagerAddresses) {
    const limit =
      marketSuite.pool.pool.creditManagerDebtParams.get(creditManager)?.limit ||
      0n;
    debtLimits[lowerAddress(creditManager)] = Number(
      formatUnits(limit, underlyingDecimals),
    );
  }

  return debtLimits;
}

/**
 * Builds credit managers state
 **/
async function buildCreditManagersState(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
  options?: {
    client?: PublicClient<Transport, Chain>;
    timestamp?: number;
    registry?: GipRegistry;
  },
): Promise<Record<Address, MarketCreditManagerState>> {
  const creditManagersState: Record<Address, MarketCreditManagerState> = {};

  for (const cm of marketSuite.creditManagers) {
    const address = lowerAddress(cm.creditManager.address);

    creditManagersState[address] = {
      address: cm.creditManager.address,
      name: cm.creditManager.name,
      isExpired: isCreditManagerExpired(
        cm.creditFacade,
        options?.timestamp ?? Date.now() / 1000,
      ),
      expirable: cm.creditFacade.expirable,
      expirationDate: cm.creditFacade.expirationDate,
      feeInterest: cm.creditManager.feeInterest / PERCENTAGE_DIVISOR,
      maxEnabledTokens: cm.creditManager.maxEnabledTokens,
      collateralTokens: await buildCollateralTokensState(cm, options?.client),
      adapters: await buildAdaptersState(
        cm,
        options?.client,
        options?.registry,
      ),
      degenNFT: cm.creditFacade.degenNFT,
      minDebt: Number(formatUnits(cm.creditFacade.minDebt, underlyingDecimals)),
      maxDebt: Number(formatUnits(cm.creditFacade.maxDebt, underlyingDecimals)),
      maxDebtPerBlockMultiplier: cm.creditFacade.maxDebtPerBlockMultiplier,
      paused: cm.creditFacade.isPaused,
      feeLiquidation: cm.creditManager.feeLiquidation / PERCENTAGE_DIVISOR,
      feeLiquidationExpired:
        cm.creditManager.feeLiquidationExpired / PERCENTAGE_DIVISOR,
      feeLiquidationPremium:
        (PERCENTAGE_FACTOR - cm.creditManager.liquidationDiscount) /
        PERCENTAGE_DIVISOR,
      feeLiquidationPremiumExpired:
        (PERCENTAGE_FACTOR - cm.creditManager.liquidationDiscountExpired) /
        PERCENTAGE_DIVISOR,
    };
  }

  return creditManagersState;
}

/**
 * Builds collateral tokens state
 **/
export async function buildCollateralTokensState(
  creditManager: CreditSuite,
  client: PublicClient<Transport, Chain> = creditManager.sdk.client,
): Promise<Record<Address, CollateralToken>> {
  const collateralTokens: Record<Address, CollateralToken> = {};
  const forbidden = new Set(creditManager.forbiddenTokens.map(lowerAddress));
  const manager = creditManager.creditManager;
  const underlying = manager.underlying.toLowerCase();
  const tokens = manager.collateralTokens;
  // The underlying has a calculated LT; its ltParams storage is not used.
  const rampTokens = tokens.filter(token => token.toLowerCase() !== underlying);
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
    rampTokens.map((token, i) => [token.toLowerCase(), rampParams[i]]),
  );

  for (const tokenAddress of tokens) {
    const normalizedAddress = lowerAddress(tokenAddress);
    const params = paramsByToken.get(normalizedAddress);
    const isUnderlying = normalizedAddress === underlying;
    if (!isUnderlying && !params) {
      throw new Error(
        `Missing liquidation threshold parameters for ${normalizedAddress}`,
      );
    }

    collateralTokens[normalizedAddress] = {
      liquidationThresholdFinal: isUnderlying
        ? manager.liquidationThresholds.mustGet(tokenAddress) /
          PERCENTAGE_DIVISOR
        : Number(params![1]) / PERCENTAGE_DIVISOR,
      // Static thresholds use uint40.max on chain. MarketState uses zero.
      rampStart:
        isUnderlying || Number(params![3]) === 0 ? 0 : Number(params![2]),
      rampDuration: isUnderlying ? 0 : Number(params![3]),
      isForbidden: forbidden.has(normalizedAddress),
    };
  }

  return collateralTokens;
}

/**
 * Builds market assets state
 **/
function buildMarketAssetsState(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
): MarketAsset[] {
  const mainPriceFeeds = marketSuite.priceOracle.mainPriceFeeds;
  const reservePriceFeeds = marketSuite.priceOracle.reservePriceFeeds;
  const marketAssets: MarketAsset[] = [];

  for (const [address, quota] of marketSuite.pool.pqk.quotas.entries()) {
    const normalizedAddress = lowerAddress(address);

    marketAssets.push({
      address: normalizedAddress,
      quotaLimit: Number(formatUnits(quota.limit, underlyingDecimals)),
      quotaIncreaseFee: Number(quota.quotaIncreaseFee / PERCENTAGE_DIVISOR),
      mainPriceFeed:
        mainPriceFeeds.get(address as Address)?.address || zeroAddress,
      reservePriceFeed:
        reservePriceFeeds.get(address as Address)?.address || zeroAddress,
    });
  }

  return marketAssets;
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
  readClient?: PublicClient<Transport, Chain>,
  knownDeployments: readonly Address[] = [],
): Promise<PeripheryState[]> {
  const client = readClient ?? marketSuite.sdk.client;
  const pool = marketSuite.pool.pool.address;

  const configurator = new PermissionlessMarketConfigurator(
    marketConfiguratorAddress,
    client,
  );
  const peripheryByDomain = await configurator.getPeripheryContracts();

  const degenNFTAddresses = await selectMarketDegenNfts({
    read: contractReaderFromClient(client),
    underlying: marketSuite.pool.pool.underlying,
    registered: (peripheryByDomain.DEGEN_NFT ?? []) as Address[],
    creditManagerDegenNfts: marketSuite.creditManagers.map(
      cm => cm.creditFacade.degenNFT,
    ),
  });

  // Zappers: query pool() for each, keep only those matching the given pool
  const allZapperAddresses = (peripheryByDomain.ZAPPER ?? []) as Address[];
  const zapperPoolResults = await client.multicall({
    allowFailure: true,
    contracts: allZapperAddresses.map(address => ({
      address,
      abi: iZapperAbi,
      functionName: "pool" as const,
    })),
  });
  const zapperAddresses = allZapperAddresses.filter((_, i) => {
    const r = zapperPoolResults[i];
    return r?.status === "success" && isSameAddress(r.result as Address, pool);
  });

  // Known deployments that are not registered, and hold code
  const registered = [...degenNFTAddresses, ...zapperAddresses];
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
  const entries: {
    domain: string;
    address: Address;
    status: PeripheryState["status"];
  }[] = [
    ...degenNFTAddresses.map(address => ({
      domain: "DEGEN_NFT",
      address,
      status: "registered" as const,
    })),
    ...zapperAddresses.map(address => ({
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

  const versionCalls = entries.flatMap(({ address }) => [
    { address, abi: iVersionAbi, functionName: "contractType" as const },
    { address, abi: iVersionAbi, functionName: "version" as const },
  ]);
  const versionResults = await client.multicall({
    allowFailure: true,
    contracts: versionCalls,
  });

  return entries.map(({ domain, address, status }, i) => {
    const typeResult = versionResults[i * 2];
    const versionResult = versionResults[i * 2 + 1];

    const type =
      typeResult?.status === "success" && typeof typeResult.result === "string"
        ? hexToString(typeResult.result as `0x${string}`, { size: 32 })
        : "";

    const version =
      versionResult?.status === "success" &&
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

/**
 * Builds treasury state
 **/
export async function buildTreasuryState(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
  readClient?: PublicClient<Transport, Chain>,
): Promise<TreasuryState> {
  const treasury = marketSuite.treasury;
  const underlying = marketSuite.pool.underlying;
  const pool = marketSuite.pool.pool.address;
  const client = readClient ?? marketSuite.sdk.client;

  const results = await client.multicall({
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

  if (!results) {
    return {
      address: treasury,
      type: "TREASURY",
      balances: {},
    };
  }

  const type = results[0];
  const balances = results.slice(1);
  const addresses = [underlying, pool] as const;

  return {
    address: treasury,
    type:
      type.status === "success" &&
      hexToString(type.result, { size: 32 }) === "TREASURY_SPLITTER"
        ? "TREASURY_SPLITTER"
        : "TREASURY",
    balances: balances.reduce<Record<Address, number>>((acc, call, i) => {
      if (
        call &&
        call.status === "success" &&
        i < addresses.length &&
        typeof call.result === "bigint"
      ) {
        acc[lowerAddress(addresses[i])] = +formatUnits(
          call.result,
          underlyingDecimals,
        );
      }
      return acc;
    }, {}),
  };
}
