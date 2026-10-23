import type { Address } from "viem";
import { zeroAddress } from "viem";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import type { GipMarketAction } from "../actions/types.js";
import {
  isPeripheryContractAdded,
  type PeripheryRegistryEntry,
} from "../actions/utils/isPeripheryContractAdded.js";
import { POOL_CREATION_DEPOSIT } from "../constants.js";
import { GipRegistry } from "../GipRegistry.js";
import type { IncompleteRwaPeripherySetup } from "../rwaPeripherySetup.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";

export type DiagnosticMarket = {
  underlyingAsset: Address;
  transactions: GipMarketAction[];
};

export type GipDiagnostic<TMarket extends DiagnosticMarket> =
  | {
      type: "poolCreationDeposit";
      token: Address;
      count: number;
      market?: TMarket;
    }
  | { type: "updateSupprotedPids"; market: TMarket; creditManager: Address }
  | { type: "updateRates"; market: TMarket }
  | { type: "missingReservePriceFeed"; market: TMarket; assets: Address[] }
  | { type: "outdatedAdapterVersion"; market: TMarket; adapters: string[] }
  | {
      type: "incompleteRwaPeripherySetup";
      market: TMarket;
      underlyingType: string;
      degenNFT: Address;
      zapper: Address | null;
      missing: IncompleteRwaPeripherySetup<TMarket>["plan"]["missing"];
    }
  | { type: "degenNFTIsNotRegistered"; market: TMarket; degenNFT: Address };

/** Every created pool needs its creation deposit on the configurator. **/
async function poolCreationDepositDiagnostics<TMarket extends DiagnosticMarket>(
  markets: TMarket[],
  balanceOf: (asset: Address) => Promise<bigint>,
): Promise<GipDiagnostic<TMarket>[]> {
  const poolsPerUnderlying = new Map<Address, number>();
  for (const market of markets) {
    if (market.transactions[0]?.type !== "MARKET::createMarket") continue;
    poolsPerUnderlying.set(
      market.underlyingAsset,
      (poolsPerUnderlying.get(market.underlyingAsset) ?? 0) + 1,
    );
  }

  const underlyings = [...poolsPerUnderlying];
  const balances = await Promise.all(
    underlyings.map(([token]) => balanceOf(token)),
  );
  return underlyings.flatMap(([token, count], index) =>
    balances[index] < BigInt(count) * POOL_CREATION_DEPOSIT
      ? [{ type: "poolCreationDeposit" as const, token, count }]
      : [],
  );
}

/**
 * A Convex base reward pool adapter only works once the booster adapter of the
 * same credit manager has re-read its supported pids.
 **/
function staleConvexPidsDiagnostics<TMarket extends DiagnosticMarket>(
  markets: TMarket[],
): GipDiagnostic<TMarket>[] {
  const diagnostics = new Map<Address, GipDiagnostic<TMarket>>();
  for (const market of markets) {
    for (const [index, action] of market.transactions.entries()) {
      if (
        action.type !== "CREDIT::allowAdapter" ||
        action.params.adapter.type !== "CVX_V1_BASE_REWARD_POOL"
      )
        continue;
      const updateIndex = market.transactions.findLastIndex(
        tx =>
          tx.type === "ADAPTER::CVX_V1_BOOSTER::updateSupportedPids" &&
          isSameAddress(tx.params.creditManager, action.params.creditManager),
      );
      const creditManager = lowerAddress(action.params.creditManager);
      if (updateIndex < index && !diagnostics.has(creditManager)) {
        diagnostics.set(creditManager, {
          type: "updateSupprotedPids",
          market,
          creditManager,
        });
      }
    }
  }
  return [...diagnostics.values()];
}

/** Tumbler rates only take effect after a trailing `updateRates`. **/
function staleTumblerRatesDiagnostics<TMarket extends DiagnosticMarket>(
  markets: TMarket[],
): GipDiagnostic<TMarket>[] {
  const changesTumblerRates = (action: GipMarketAction) =>
    (action.type === "MARKET::createMarket" &&
      action.params.rateKeeperParams.type === "TUMBLER") ||
    (action.type === "MARKET::updateRateKeeper" &&
      action.params.type === "TUMBLER") ||
    action.type === "RATE_KEEPER::TUMBLER::setRate";

  return markets
    .filter(market => {
      const updateIndex = market.transactions.findLastIndex(
        tx => tx.type === "RATE_KEEPER::TUMBLER::updateRates",
      );
      return market.transactions.some(
        (action, index) => changesTumblerRates(action) && updateIndex < index,
      );
    })
    .map(market => ({ type: "updateRates", market }));
}

function missingReservePriceFeedDiagnostics<TMarket extends DiagnosticMarket>(
  market: TMarket,
): GipDiagnostic<TMarket>[] {
  const newAssets = market.transactions
    .filter(action => action.type === "MARKET::addAsset")
    .map(action => action.params.token);
  const reserveFeeds = market.transactions
    .filter(action => action.type === "ORACLE::setReservePriceFeed")
    .map(action => action.params.token.toLowerCase());
  const assets = newAssets.filter(
    asset => !reserveFeeds.includes(asset.toLowerCase()),
  );
  return assets.length > 0
    ? [{ type: "missingReservePriceFeed", market, assets }]
    : [];
}

function outdatedAdapterVersionDiagnostics<TMarket extends DiagnosticMarket>(
  market: TMarket,
  registry: GipRegistry,
): GipDiagnostic<TMarket>[] {
  const outdated = market.transactions
    .filter(action => action.type === "CREDIT::allowAdapter")
    .map(action => action.params.adapter)
    .filter(adapter => {
      const latest = registry.adapter(adapter.type)?.getDefaultParams().version;
      return latest !== undefined && latest > adapter.version;
    });
  const adapters = [...new Set(outdated.map(({ type }) => type))];
  return adapters.length > 0
    ? [{ type: "outdatedAdapterVersion", market, adapters }]
    : [];
}

/** A whitelisted credit suite needs its Degen NFT registered as periphery. **/
function unregisteredDegenNftDiagnostics<TMarket extends DiagnosticMarket>(
  market: TMarket,
  registered: PeripheryRegistryEntry[],
): GipDiagnostic<TMarket>[] {
  const degenNfts = market.transactions
    .filter(
      (action): action is CreateCreditSuiteAction =>
        action.type === "MARKET::createCreditSuite" &&
        action.params.whitelistPolicy !== zeroAddress,
    )
    .map(action => action.params.whitelistPolicy)
    .filter(
      degenNFT =>
        !isPeripheryContractAdded({
          address: degenNFT,
          domain: "DEGEN_NFT",
          registered,
          queuedActions: market.transactions,
        }),
    );
  return [...new Set(degenNfts)].map(degenNFT => ({
    type: "degenNFTIsNotRegistered",
    market,
    degenNFT,
  }));
}

/** All reads are provided by the caller; this module has no store or RPC setup. **/
export async function getGipDiagnostics<
  TMarket extends DiagnosticMarket,
>(args: {
  markets: TMarket[];
  balanceOf: (asset: Address) => Promise<bigint>;
  incompleteRwaSetups: () => Promise<IncompleteRwaPeripherySetup<TMarket>[]>;
  registeredPeripheryContracts: () => Promise<PeripheryRegistryEntry[]>;
  /** Adapter plugins giving the latest adapter versions; built-in by default. **/
  registry?: GipRegistry;
}): Promise<GipDiagnostic<TMarket>[]> {
  const { markets, registry = GipRegistry.builtin } = args;

  const diagnostics: GipDiagnostic<TMarket>[] = [
    ...(await poolCreationDepositDiagnostics(markets, args.balanceOf)),
    ...staleConvexPidsDiagnostics(markets),
    ...staleTumblerRatesDiagnostics(markets),
    ...markets.flatMap(market => [
      ...missingReservePriceFeedDiagnostics(market),
      ...outdatedAdapterVersionDiagnostics(market, registry),
    ]),
  ];

  for (const { market, plan } of await args.incompleteRwaSetups()) {
    diagnostics.push({
      type: "incompleteRwaPeripherySetup",
      market,
      underlyingType: plan.underlyingType,
      degenNFT: plan.degenNFT,
      zapper: plan.zapper,
      missing: plan.missing,
    });
  }

  const registered = await args.registeredPeripheryContracts();
  diagnostics.push(
    ...markets.flatMap(market =>
      unregisteredDegenNftDiagnostics(market, registered),
    ),
  );

  return diagnostics;
}
