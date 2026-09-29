import type { Address } from "viem";
import { zeroAddress } from "viem";
import {
  type AdapterType,
  adapterPlugins,
} from "../../plugins/adapters/logic.js";
import type { MarketActions } from "../actions/index.js";
import type { CreateCreditSuiteAction } from "../actions/market-create-credit-suite.js";
import {
  isPeripheryContractAdded,
  type PeripheryRegistryEntry,
} from "../actions/utils/periphery.js";
import type { IncompleteRwaPeripherySetup } from "../rwa.js";

export type IssueMarket = {
  underlyingAsset: Address;
  transactions: MarketActions[];
};

export type GipBuilderIssue<TMarket extends IssueMarket> =
  | { type: "poolCreationDeposit"; token: Address; count: number }
  | { type: "updateSupprotedPids"; market: TMarket; creditManager: Address }
  | { type: "updateRates"; market: TMarket }
  | { type: "missingReservePriceFeed"; market: TMarket; assets: Address[] }
  | { type: "outdatedAdapterVersion"; market: TMarket; adapters: AdapterType[] }
  | {
      type: "incompleteRwaPeripherySetup";
      market: TMarket;
      underlyingType: string;
      degenNFT: Address;
      zapper: Address | null;
      missing: IncompleteRwaPeripherySetup<TMarket>["plan"]["missing"];
    }
  | { type: "degenNFTIsNotRegistered"; market: TMarket; degenNFT: Address };

/** All reads are provided by the caller; this module has no store or RPC setup. */
export async function getGipIssues<TMarket extends IssueMarket>(args: {
  markets: TMarket[];
  balanceOf: (asset: Address) => Promise<bigint>;
  incompleteRwaSetups: () => Promise<IncompleteRwaPeripherySetup<TMarket>[]>;
  registeredPeripheryContracts: () => Promise<PeripheryRegistryEntry[]>;
}): Promise<GipBuilderIssue<TMarket>[]> {
  const issues: GipBuilderIssue<TMarket>[] = [];
  const { markets } = args;

  const poolsCreated = markets.filter(
    market => market.transactions[0]?.type === "MARKET::createMarket",
  );
  if (poolsCreated.length > 0) {
    const counts = poolsCreated.reduce((acc, market) => {
      acc.set(
        market.underlyingAsset,
        (acc.get(market.underlyingAsset) ?? 0) + 1,
      );
      return acc;
    }, new Map<Address, number>());
    const underlyingAssets = Array.from(counts, ([asset, count]) => ({
      asset,
      count,
    }));
    const balances = await Promise.all(
      underlyingAssets.map(({ asset }) => args.balanceOf(asset)),
    );
    balances.forEach((balance, index) => {
      const underlying = underlyingAssets[index];
      if (balance < BigInt(underlying.count * 100_000)) {
        issues.push({
          type: "poolCreationDeposit",
          token: underlying.asset,
          count: underlying.count,
        });
      }
    });
  }

  const convexUpdateSkipped = markets.flatMap(market =>
    market.transactions
      .map((action, index) => ({ action, index }))
      .filter(({ action, index }) => {
        if (
          action.type !== "CREDIT::allowAdapter" ||
          action.params.adapter.type !== "CVX_V1_BASE_REWARD_POOL"
        )
          return false;
        const updateIndex = market.transactions.findLastIndex(
          tx =>
            tx.type === "ADAPTER::CVX_V1_BOOSTER::updateSupportedPids" &&
            tx.params.creditManager.toLowerCase() ===
              action.params.creditManager.toLowerCase(),
        );
        return updateIndex < index;
      })
      .map(({ action }) => ({ action, market })),
  );
  convexUpdateSkipped.forEach(({ action, market }) => {
    if (action.type !== "CREDIT::allowAdapter") return;
    const creditManager = action.params.creditManager.toLowerCase() as Address;
    if (
      !issues.some(
        issue =>
          issue.type === "updateSupprotedPids" &&
          issue.creditManager === creditManager,
      )
    ) {
      issues.push({ type: "updateSupprotedPids", market, creditManager });
    }
  });

  markets
    .filter(market => {
      const updateIndex = market.transactions.findLastIndex(
        tx => tx.type === "RATE_KEEPER::TUMBLER::updateRates",
      );
      return market.transactions.some(
        (action, index) =>
          ((action.type === "MARKET::createMarket" &&
            action.params.rateKeeperParams.type === "TUMBLER") ||
            (action.type === "MARKET::updateRateKeeper" &&
              action.params.type === "TUMBLER") ||
            action.type === "RATE_KEEPER::TUMBLER::setRate") &&
          updateIndex < index,
      );
    })
    .forEach(market => {
      issues.push({ type: "updateRates", market });
    });

  markets.forEach(market => {
    const newAssets = market.transactions
      .filter(action => action.type === "MARKET::addAsset")
      .map(action => action.params.token);
    const reserveFeeds = market.transactions
      .filter(action => action.type === "ORACLE::setReservePriceFeed")
      .map(action => action.params.token.toLowerCase());
    const assets = newAssets.filter(
      asset => !reserveFeeds.includes(asset.toLowerCase()),
    );
    if (assets.length > 0)
      issues.push({ type: "missingReservePriceFeed", market, assets });

    const newAdapters = market.transactions
      .filter(action => action.type === "CREDIT::allowAdapter")
      .map(action => action.params.adapter);
    const outdated = newAdapters.filter(
      adapter =>
        adapterPlugins[adapter.type].getDefaultParams().version >
        adapter.version,
    );
    const adapters = [...new Set(outdated.map(({ type }) => type))];
    if (adapters.length > 0)
      issues.push({ type: "outdatedAdapterVersion", market, adapters });
  });

  const incompleteRwaSetups = await args.incompleteRwaSetups();
  incompleteRwaSetups.forEach(({ market, plan }) => {
    issues.push({
      type: "incompleteRwaPeripherySetup",
      market,
      underlyingType: plan.underlyingType,
      degenNFT: plan.degenNFT,
      zapper: plan.zapper,
      missing: plan.missing,
    });
  });

  const registered = await args.registeredPeripheryContracts();
  markets.forEach(market => {
    const nfts = market.transactions
      .filter(
        action =>
          action.type === "MARKET::createCreditSuite" &&
          action.params.whitelistPolicy !== zeroAddress,
      )
      .map(action => (action as CreateCreditSuiteAction).params.whitelistPolicy)
      .filter(
        degenNFT =>
          !isPeripheryContractAdded({
            address: degenNFT,
            domain: "DEGEN_NFT",
            registered,
            queuedActions: market.transactions,
          }),
      );
    [...new Set(nfts)].forEach(degenNFT => {
      issues.push({ type: "degenNFTIsNotRegistered", market, degenNFT });
    });
  });

  return issues;
}
