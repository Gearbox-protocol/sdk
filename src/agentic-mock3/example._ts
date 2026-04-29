/**
 * Usage examples demonstrating the GearboxSDK v3 mock:
 * collection-based builder pattern, mode-dependent typing,
 * cross-entity navigation, sortBy, and runtime mode guarding.
 */

import type { Address, RawTx, TvlChartData } from "./core/index.js";
import type { GearboxSDK } from "./gearbox-sdk.js";
import { createGearboxSDK } from "./gearbox-sdk.js";
import type { MarketCollectionType, MarketType } from "./market/index.js";

// ============================================================================
// Compile-time type assertions
// ============================================================================

type OnchainMarket = MarketType<"onchain">;
//   ^? MarketBase & OnchainMarketOps

type _OM_liq = OnchainMarket["availableLiquidity"]; // bigint
type _OM_kyc = OnchainMarket["kycRequired"]; // boolean
// type _OM_apy = OnchainMarket["supplyApy"];  // ← uncomment → TS2339

type OffchainMarket = MarketType<"offchain">;
//   ^? MarketBase & OffchainMarketOps

type _FM_apy = OffchainMarket["supplyApy"]; // number
type _FM_desc = OffchainMarket["description"]; // string
// type _FM_kyc = OffchainMarket["kycRequired"]; // ← uncomment → TS2339

type FullMarket = MarketType<"onchain" | "offchain">;
//   ^? MarketBase & OnchainMarketOps & OffchainMarketOps

type _BM_kyc = FullMarket["kycRequired"]; // boolean
type _BM_apy = FullMarket["supplyApy"]; // number

type OffchainSDK = GearboxSDK<"offchain">;
type _offHasOpps = OffchainSDK["opportunities"]; // OpportunitiesNamespace
type _offHasCurators = OffchainSDK["curators"]; // CuratorsNamespace

type FullSDK = GearboxSDK<"onchain" | "offchain">;
type _hasOpps = FullSDK["opportunities"]; // OpportunitiesNamespace
type _hasCurators = FullSDK["curators"]; // CuratorsNamespace

// Collection-level type assertions
type OnchainMarkets = MarketCollectionType<"onchain">;
type _MC_onLen = OnchainMarkets["length"]; // number — always available
// type _MC_err = OnchainMarkets["opportunities"];  // ← uncomment → TS2339

type OffchainMarkets = MarketCollectionType<"offchain">;
type _MC_opps = OffchainMarkets["opportunities"]; // OpportunityCollection<"offchain">

type FullMarkets = MarketCollectionType<"onchain" | "offchain">;
type _MC_fullOpps = FullMarkets["opportunities"]; // OpportunityCollection<"onchain" | "offchain">

// ============================================================================
// Example 1: Onchain-only — transaction creation, no offchain data
// ============================================================================

async function onchainOnlyExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  // Iteration — namespaces ARE collections
  for (const market of sdk.markets) {
    console.log("underlying:", market.underlying);
    console.log("liquidity:", market.availableLiquidity);
    console.log("kyc required:", market.kycRequired);
  }

  // Collection chaining
  const mainnetMarket = sdk.markets.withNetworks("Mainnet").first();
  if (mainnetMarket) {
    const tx: RawTx = mainnetMarket.createDepositTx(1000n * 10n ** 6n);
    console.log("deposit tx:", tx);
  }

  // length getter
  console.log("total markets:", sdk.markets.length);

  // Offchain ops are NOT available on MarketType<'onchain'>:
  // mainnetMarket.supplyApy              // ← TS2339
  // mainnetMarket.description            // ← TS2339
  //   mainnetMarket.loadHistoricalTvl(0, 100) // ← TS2339
  //   mainnetMarket.opportunities          // ← TS2339
  //
  // Opportunities and Curators namespaces are NOT available:
  //   sdk.opportunities             // ← TS2339
  //   sdk.curators                  // ← TS2339
}

// ============================================================================
// Example 2: Offchain-only — APYs, descriptions, curators
// ============================================================================

async function offchainOnlyExample() {
  const sdk = createGearboxSDK({
    modes: ["offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  // Collection filters with variadic args
  const mainnetMarkets = sdk.markets.withNetworks("Mainnet");
  const market = mainnetMarkets.first();

  if (market) {
    console.log("underlying:", market.underlying);
    console.log("apy:", market.supplyApy);
    console.log("description:", market.description);

    const tvl: TvlChartData = await market.loadHistoricalTvl(1000, 2000);
    console.log("tvl chart:", tvl);
  }

  // Curators — iteration
  console.log("curators:");
  for (const curator of sdk.curators) {
    console.log(`  ${curator.name}`);
  }

  // Opportunities — filter chaining + type narrowing
  const poolOpps = sdk.opportunities.minApy(3.0).pools();
  for (const opp of poolOpps) {
    console.log(`  [${opp.type}] ${opp.title}, APY: ${opp.supplyApy}%`);
  }

  // Onchain ops are NOT available on MarketType<'offchain'>:
  // market.kycRequired              // ← TS2339
  // market.createDepositTx(1000n)   // ← TS2339
}

// ============================================================================
// Example 3: Both modes — full power
// ============================================================================

async function bothModesExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const market = sdk.markets.withNetworks("Mainnet").first()!;

  // All ops available
  console.log("kyc:", market.kycRequired);
  console.log("apy:", market.supplyApy);
  const tx: RawTx = market.createDepositTx(1000n * 10n ** 6n);
  const tvl: TvlChartData = await market.loadHistoricalTvl(1000, 2000);

  // sortBy via es-toolkit orderBy
  const topMarkets = sdk.markets.sortBy(["supplyApy"], ["desc"]).limit(5);

  console.log("Top 5 markets by APY:");
  for (const m of topMarkets) {
    console.log(`  ${m.network}: ${m.poolAddress} — ${m.supplyApy}%`);
  }

  // sort with custom comparator
  const sorted = sdk.markets.sort((a, b) =>
    Number(b.availableLiquidity - a.availableLiquidity),
  );
  console.log(
    "Markets by liquidity:",
    sorted.map(m => m.poolAddress),
  );

  // Opportunities with kycFree + minApy
  const goodOpps = sdk.opportunities
    .kycFree()
    .minApy(3.0)
    .pools()
    .sortBy(["supplyApy"], ["desc"]);

  for (const opp of goodOpps) {
    console.log(`${opp.chainId}: ${opp.title}, APY=${opp.supplyApy}%`);
  }
}

// ============================================================================
// Example 4: Collection chaining + cross-entity navigation
// ============================================================================

async function collectionChainingExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;

  // Cross-entity chaining: curators → markets → opportunities
  const chaosUsdcOpps = sdk.curators
    .withNames("Chaos")
    .markets.withUnderlyings(usdc)
    .opportunities.pools()
    .sortBy(["supplyApy"], ["desc"]);

  console.log("Chaos Labs USDC pool opportunities:");
  for (const opp of chaosUsdcOpps) {
    console.log(
      `  ${opp.title}: ${opp.supplyApy}% APY, TVL $${opp.tvlUsd.toLocaleString()}`,
    );
  }

  // Generic .filter() escape hatch
  const specific = sdk.markets
    .filter(
      m =>
        m.poolAddress ===
        ("0x1111111111111111111111111111111111111111" as Address),
    )
    .first();
  console.log("Found specific market:", specific?.poolAddress);

  // .map() and .flatMap() return plain arrays
  const titles: string[] = sdk.opportunities.map(o => o.title);
  console.log("All opportunity titles:", titles);

  const allPoolAddresses: Address[] = sdk.curators.flatMap(c =>
    c.markets.map(m => m.poolAddress),
  );
  console.log("All pool addresses across curators:", allPoolAddresses);
}

// ============================================================================
// Example 5: Entity navigation — traverse the graph
// ============================================================================

async function navigationExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  // Market → Curator
  const market = sdk.markets
    .filter(
      m =>
        m.poolAddress ===
        ("0x1111111111111111111111111111111111111111" as Address),
    )
    .first()!;
  const curator = market.curator!;
  console.log(`Market ${market.poolAddress} curated by: ${curator.name}`);

  // Market → Opportunities (returns array from entity)
  const marketOpps = market.opportunities;
  console.log(`Market has ${marketOpps.length} opportunities:`);
  for (const opp of marketOpps) {
    console.log(`  - [${opp.type}] ${opp.title}`);
  }

  // Opportunity → Market (round-trip)
  const opp = marketOpps[0];
  const backToMarket = opp.market;
  console.log(
    `Same market? ${backToMarket.poolAddress === market.poolAddress}`,
  );

  // Curator → Markets (returns array from entity)
  const curatorMarkets = curator.markets;
  console.log(`${curator.name} manages ${curatorMarkets.length} markets:`);
  for (const m of curatorMarkets) {
    console.log(`  - ${m.network}: ${m.poolAddress} (APY: ${m.supplyApy}%)`);
  }

  // Curator → Opportunities
  const curatorOpps = curator.opportunities;
  console.log(`${curator.name} has ${curatorOpps.length} opportunities`);
}

// ============================================================================
// Example 6: AI agent — systematic strategy selection
// ============================================================================

async function aiAgentExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain", "offchain"],
    networks: ["Mainnet", "Monad"],
  });
  await sdk.attach();

  const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;

  // 1. Find best non-KYC USDC pool opportunity
  const best = sdk.opportunities
    .withUnderlyings(usdc)
    .kycFree()
    .pools()
    .sortBy(["supplyApy"], ["desc"])
    .first();

  if (!best) {
    console.log("No viable opportunities");
    return;
  }

  console.log(`Best: ${best.title} — ${best.supplyApy}% APY`);

  // 2. Check the curator's reputation
  const curator = best.curator!;
  console.log(`Curator: ${curator.name}`);
  console.log(`  Markets managed: ${curator.markets.length}`);
  console.log(`  Total opportunities: ${curator.opportunities.length}`);

  // 3. Check historical TVL trend for the pool
  const market = best.market;
  const now = Math.floor(Date.now() / 1000);
  const tvl = await market.loadHistoricalTvl(now - 30 * 86400, now);
  const trend = tvl.length >= 2 ? tvl[tvl.length - 1].tvl - tvl[0].tvl : 0;
  console.log(`TVL trend (30d): ${trend > 0 ? "+" : ""}${trend}`);

  // 4. Create deposit tx
  const rawTx: RawTx = best.createDepositTx(10_000n * 10n ** 6n);
  console.log("Raw tx:", rawTx);
  return rawTx;
}

// ============================================================================
// Example 7: Runtime throw when accessing wrong mode
// ============================================================================

async function runtimeThrowExample() {
  const sdk = createGearboxSDK({
    modes: ["onchain"],
    networks: ["Mainnet"],
  });
  await sdk.attach();

  const market = sdk.markets.first()!;
  console.log("Pool address:", market.poolAddress);
  console.log("KYC required:", market.kycRequired);

  // At the type level, supplyApy is NOT available on MarketType<"onchain">.
  // But at runtime, if someone bypasses types (e.g., via `as any`),
  // the throwing getter guards:
  try {
    const anyMarket = market as any;
    console.log("Trying to access supplyApy...");
    console.log(anyMarket.supplyApy);
  } catch (err) {
    console.log("Caught expected error:", (err as Error).message);
  }

  // Same for createDepositTx when onchain IS available — it works:
  const tx = (market as any).createDepositTx(1000n);
  console.log("Deposit tx succeeded:", tx.description);
}

// ============================================================================
// Run
// ============================================================================

async function main() {
  console.log("=== Onchain-only ===");
  await onchainOnlyExample();

  console.log("\n=== Offchain-only ===");
  await offchainOnlyExample();

  console.log("\n=== Both modes ===");
  await bothModesExample();

  console.log("\n=== Collection chaining ===");
  await collectionChainingExample();

  console.log("\n=== Navigation ===");
  await navigationExample();

  console.log("\n=== AI Agent ===");
  await aiAgentExample();

  console.log("\n=== Runtime throw ===");
  await runtimeThrowExample();
}

main().catch(console.error);
