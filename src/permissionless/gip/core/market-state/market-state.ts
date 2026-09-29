// External libraries
import {
  type Address,
  erc20Abi,
  formatUnits,
  hexToString,
  maxUint256,
  zeroAddress,
} from "viem";
import { iVersionAbi } from "../../../../abi/iVersion.js";
import { iZapperAbi } from "../../../../abi/iZapper.js";
// Gearbox SDK
import {
  IOnchainSDKPlugin,
  type MarketSuite,
  type OnchainSDK,
} from "../../../../onchain/index.js";
import { MarketConfiguratorContract as PermissionlessMarketConfigurator } from "../../../index.js";
import type { InterestRateModelState } from "../../plugins/irm/logic.js";
import type { RateKeeperState } from "../../plugins/rate-keepers/logic.js";
import { contractReaderFromClient } from "../rwa.js";
import { buildAdaptersState } from "./adapters-state.js";
import { buildLossPolicyState } from "./loss-policy-state.js";
import { selectMarketDegenNfts } from "./periphery-state.js";
// Local imports
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
 */
export async function getMarketState(
  sdk: OnchainSDK,
  marketConfiguratorAddress: Address,
  pool: Address,
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
  );
  const marketAssets = buildMarketAssetsState(marketSuite, underlyingDecimals);
  const rateKeeperState = buildRateKeeperState(marketSuite);
  const lossPolicyState = await buildLossPolicyState(marketSuite);
  const interestRateModelState = buildInterestRateModelState(marketSuite);
  const treasutyState = await buildTreasuryState(
    marketSuite,
    underlyingDecimals,
  );
  const peripheryState = await buildPeripheryState(
    marketSuite,
    marketConfiguratorAddress,
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
 */
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
 */
function buildRateKeeperState(marketSuite: MarketSuite): RateKeeperState {
  switch (marketSuite.pool.rateKeeper.contractType) {
    case "RATE_KEEPER::TUMBLER":
      return buildTumblerRateKeeperState(marketSuite);
    case "RATE_KEEPER::GAUGE":
      return buildGaugeRateKeeperState(marketSuite);
    default:
      return {} as RateKeeperState;
  }
}

/**
 * Builds tumbler rate keeper state
 */
function buildTumblerRateKeeperState(
  marketSuite: MarketSuite,
): RateKeeperState {
  const tumbler = marketSuite.pool.tumbler;
  const rates: Record<Address, number> = {};

  for (const [address, rate] of tumbler.rates.entries()) {
    rates[address.toLowerCase() as Address] = Number(rate);
  }

  return {
    type: "TUMBLER",
    epochSeconds: Number(tumbler.epochLength),
    rates,
  };
}

/**
 * Builds gauge rate keeper state
 */
function buildGaugeRateKeeperState(marketSuite: MarketSuite): RateKeeperState {
  // TODO: implement gauge rates extraction
  return {
    type: "GAUGE",
    rates: {},
  };
}

/**
 * Builds interest rate model state
 */
function buildInterestRateModelState(
  marketSuite: MarketSuite,
): InterestRateModelState {
  if (marketSuite.pool.interestRateModel.contractType !== "IRM::LINEAR") {
    return {} as InterestRateModelState;
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
 */
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
    debtLimits[creditManager.toLowerCase() as Address] = Number(
      formatUnits(limit, underlyingDecimals),
    );
  }

  return debtLimits;
}

/**
 * Builds credit managers state
 */
async function buildCreditManagersState(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
): Promise<Record<Address, MarketCreditManagerState>> {
  const creditManagersState: Record<Address, MarketCreditManagerState> = {};

  for (const cm of marketSuite.creditManagers) {
    const address = cm.creditManager.address.toLowerCase() as Address;

    creditManagersState[address] = {
      address: cm.creditManager.address,
      name: cm.creditManager.name,
      isExpired:
        cm.creditFacade.expirable &&
        cm.creditFacade.expirationDate > 0 &&
        cm.creditFacade.expirationDate < Date.now() / 1000,
      expirable: cm.creditFacade.expirable,
      expirationDate: cm.creditFacade.expirationDate,
      feeInterest: cm.creditManager.feeInterest / PERCENTAGE_DIVISOR,
      maxEnabledTokens: cm.creditManager.maxEnabledTokens,
      collateralTokens: buildCollateralTokensState(cm),
      adapters: await buildAdaptersState(cm),
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
 */
function buildCollateralTokensState(
  creditManager: CreditSuite,
): Record<Address, CollateralToken> {
  const collateralTokens: Record<Address, CollateralToken> = {};
  const forbiddenTokensMask = creditManager.creditFacade.forbiddenTokensMask;

  for (const [
    i,
    tokenAddress,
  ] of creditManager.creditManager.collateralTokens.entries()) {
    const normalizedAddress = tokenAddress.toLowerCase() as Address;
    const tokenMask = 1n << BigInt(i);
    const isForbidden = (forbiddenTokensMask & tokenMask) !== 0n;

    collateralTokens[normalizedAddress] = {
      liquidationThresholdFinal:
        (creditManager.creditManager.liquidationThresholds.get(
          normalizedAddress,
        ) || 0) / PERCENTAGE_DIVISOR,
      rampStart: 0, // TODO: handle ramp start
      rampDuration: 0, // TODO: handle ramp duration
      isForbidden,
    };
  }

  return collateralTokens;
}

/**
 * Builds market assets state
 */
function buildMarketAssetsState(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
): MarketAsset[] {
  const mainPriceFeeds = marketSuite.priceOracle.mainPriceFeeds;
  const reservePriceFeeds = marketSuite.priceOracle.reservePriceFeeds;
  const marketAssets: MarketAsset[] = [];

  for (const [address, quota] of marketSuite.pool.pqk.quotas.entries()) {
    const normalizedAddress = address.toLowerCase() as Address;

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
 */
async function buildPeripheryState(
  marketSuite: MarketSuite,
  marketConfiguratorAddress: Address,
): Promise<PeripheryState[]> {
  const client = marketSuite.sdk.client;
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
    return (
      r?.status === "success" &&
      (r.result as Address).toLowerCase() === pool.toLowerCase()
    );
  });

  // Assemble final list and enrich with contractType + version
  const entries: { domain: string; address: Address }[] = [
    ...degenNFTAddresses.map(address => ({ domain: "DEGEN_NFT", address })),
    ...zapperAddresses.map(address => ({ domain: "ZAPPER", address })),
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

  return entries.map(({ domain, address }, i) => {
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

    return { address, domain, type, version };
  });
}

/**
 * Builds treasury state
 */
export async function buildTreasuryState(
  marketSuite: MarketSuite,
  underlyingDecimals: number,
): Promise<TreasuryState> {
  const treasury = marketSuite.treasury;
  const underlying = marketSuite.pool.underlying;
  const pool = marketSuite.pool.pool.address;
  const client = marketSuite.sdk.client;

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
        acc[addresses[i].toLowerCase() as Address] = +formatUnits(
          call.result,
          underlyingDecimals,
        );
      }
      return acc;
    }, {}),
  };
}
