import type { Address } from "viem";
import { type Curator as CuratorName, chains } from "../../../sdk/index.js";
import type { OffchainCurator } from "../types/curators.js";

interface CuratorMetricSeed {
  id: string;
  badDebtEvents: number;
  badDebtUsd: number;
  parameterChanges30d: number;
  tvlUsd: number;
}

/**
 * Static metric seeds per curator. Numeric ids reuse `curatorId` values that
 * already appear in the pool/strategy opportunity mocks so that the
 * `Curator -> opportunities` navigation actually resolves.
 *
 * Values are hand-picked random samples; some `badDebtUsd` are zeroed
 * intentionally to exercise the `withMaxBadDebt(0)` filter.
 */
const METRIC_SEEDS: Record<CuratorName, CuratorMetricSeed | undefined> = {
  Re7: {
    id: "28",
    badDebtEvents: 0,
    badDebtUsd: 0,
    parameterChanges30d: 18,
    tvlUsd: 412_500_000,
  },
  "Chaos Labs": {
    id: "24",
    badDebtEvents: 1,
    badDebtUsd: 47_300,
    parameterChanges30d: 32,
    tvlUsd: 685_200_000,
  },
  "Invariant Group": {
    id: "34",
    badDebtEvents: 0,
    badDebtUsd: 0,
    parameterChanges30d: 11,
    tvlUsd: 128_900_000,
  },
  UltraYield: {
    id: "37",
    badDebtEvents: 2,
    badDebtUsd: 91_400,
    parameterChanges30d: 24,
    tvlUsd: 256_700_000,
  },
  Tulipa: {
    id: "44",
    badDebtEvents: 0,
    badDebtUsd: 0,
    parameterChanges30d: 7,
    tvlUsd: 64_300_000,
  },
  cp0x: {
    id: "30",
    badDebtEvents: 1,
    badDebtUsd: 12_500,
    parameterChanges30d: 5,
    tvlUsd: 38_900_000,
  },
  kpk: {
    id: "31",
    badDebtEvents: 0,
    badDebtUsd: 0,
    parameterChanges30d: 14,
    tvlUsd: 89_400_000,
  },
  "Gami Labs": {
    id: "32",
    badDebtEvents: 3,
    badDebtUsd: 156_800,
    parameterChanges30d: 21,
    tvlUsd: 47_100_000,
  },
  Hyperithm: {
    id: "33",
    badDebtEvents: 0,
    badDebtUsd: 0,
    parameterChanges30d: 9,
    tvlUsd: 22_600_000,
  },
  TelosC: {
    id: "35",
    badDebtEvents: 1,
    badDebtUsd: 28_700,
    parameterChanges30d: 16,
    tvlUsd: 71_800_000,
  },
  // Names defined in the Curator type but absent from defaultMarketConfigurators
  // are intentionally undefined.
  K3: undefined,
  "M11 Credit": undefined,
  Securitize: undefined,
};

function buildCurators(): OffchainCurator[] {
  const grouped = new Map<
    CuratorName,
    OffchainCurator["marketConfigurators"]
  >();

  for (const chain of Object.values(chains)) {
    for (const [address, curatorName] of Object.entries(
      chain.defaultMarketConfigurators,
    )) {
      const list = grouped.get(curatorName) ?? [];
      list.push({ address: address as Address, chainId: chain.id });
      grouped.set(curatorName, list);
    }
  }

  const result: OffchainCurator[] = [];
  for (const [name, marketConfigurators] of grouped.entries()) {
    const seed = METRIC_SEEDS[name];
    if (!seed) continue;
    result.push({
      id: seed.id,
      name,
      badDebtEvents: seed.badDebtEvents,
      badDebtUsd: seed.badDebtUsd,
      parameterChanges30d: seed.parameterChanges30d,
      tvlUsd: seed.tvlUsd,
      marketConfigurators,
    });
  }
  return result;
}

export const CURATORS: OffchainCurator[] = buildCurators();
