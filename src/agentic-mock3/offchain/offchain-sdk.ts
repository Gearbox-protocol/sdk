import type { Address, NetworkType, TvlChartData } from "../core/index.js";
import type {
  OffchainCurator,
  OffchainInitialData,
  OffchainMarketData,
  OffchainOpportunity,
} from "./types.js";

export interface MockOffchainSDKConfig {
  chains: Partial<Record<NetworkType, { apiUrl: string }>>;
}

const CHAIN_IDS: Record<string, number> = {
  Mainnet: 1,
  Arbitrum: 42161,
  Optimism: 10,
  Base: 8453,
  Sonic: 146,
  Monad: 10143,
  Berachain: 80094,
};

export class MockOffchainSDK {
  readonly #networks: NetworkType[];
  #data: OffchainInitialData = { markets: [], opportunities: [], curators: [] };

  constructor(config: MockOffchainSDKConfig) {
    this.#networks = Object.keys(config.chains) as NetworkType[];
  }

  async attach(): Promise<void> {
    this.#data = buildDummyData(this.#networks);
  }

  get markets(): readonly OffchainMarketData[] {
    return this.#data.markets;
  }

  get opportunities(): readonly OffchainOpportunity[] {
    return this.#data.opportunities;
  }

  get curators(): readonly OffchainCurator[] {
    return this.#data.curators;
  }

  findMarket(
    network: NetworkType,
    poolAddress: Address,
  ): OffchainMarketData | undefined {
    return this.#data.markets.find(
      m => m.network === network && m.pool.address === poolAddress,
    );
  }

  findOpportunitiesByPool(poolAddress: Address): OffchainOpportunity[] {
    return this.#data.opportunities.filter(o => o.poolAddress === poolAddress);
  }

  findCurator(name: string): OffchainCurator | undefined {
    return this.#data.curators.find(c => c.name === name);
  }

  async loadHistoricalTvl(
    _network: NetworkType,
    _poolAddress: Address,
    from: number,
    to: number,
  ): Promise<TvlChartData> {
    return [
      { timestamp: from, tvl: 5_000_000 },
      { timestamp: Math.floor((from + to) / 2), tvl: 7_500_000 },
      { timestamp: to, tvl: 8_200_000 },
    ];
  }
}

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address;

function buildDummyData(networks: NetworkType[]): OffchainInitialData {
  const markets: OffchainMarketData[] = [];
  const opportunities: OffchainOpportunity[] = [];

  const hasMainnet = networks.includes("Mainnet");
  const hasMonad = networks.includes("Monad");

  if (hasMainnet) {
    const mainnetChainId = CHAIN_IDS.Mainnet;

    markets.push(
      {
        configurator: "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC" as Address,
        curatorName: "Chaos Labs",
        network: "Mainnet",
        pool: {
          address: "0x1111111111111111111111111111111111111111" as Address,
          chainId: mainnetChainId,
          underlying: USDC,
          availableLiquidity: 5_000_000n * 10n ** 6n,
          supplyApy: 5.2,
          description: "High-yield USDC lending pool curated by Chaos Labs",
        },
      },
      {
        configurator: "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD" as Address,
        curatorName: "Re7 Capital",
        network: "Mainnet",
        pool: {
          address: "0x3333333333333333333333333333333333333333" as Address,
          chainId: mainnetChainId,
          underlying: WETH,
          availableLiquidity: 2_000n * 10n ** 18n,
          supplyApy: 3.1,
          description: "WETH lending pool curated by Re7 Capital",
        },
      },
    );

    opportunities.push(
      {
        id: "pool-mainnet-0x1111",
        chainId: mainnetChainId,
        type: "pool",
        title: "USDC Lending — Chaos Labs",
        curatorName: "Chaos Labs",
        poolAddress: "0x1111111111111111111111111111111111111111" as Address,
        underlying: USDC,
        permissionless: false,
        kycRequired: true,
        supplyApy: 5.2,
        tvl: 12_000_000,
        tvlUsd: 12_000_000,
        utilization: 0.72,
      },
      {
        id: "strategy-mainnet-0x1111-lev",
        chainId: mainnetChainId,
        type: "strategy",
        title: "USDC Leveraged Farming — Chaos Labs",
        curatorName: "Chaos Labs",
        poolAddress: "0x1111111111111111111111111111111111111111" as Address,
        underlying: USDC,
        permissionless: false,
        kycRequired: true,
        creditManagerAddress:
          "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" as Address,
        borrowApy: 4.8,
        maxLeverage: 5,
        basicApy: 8.5,
        maxLeverageApy: 22.0,
        minDebt: 1_000n * 10n ** 6n,
        maxDebt: 500_000n * 10n ** 6n,
      },
      {
        id: "pool-mainnet-0x3333",
        chainId: mainnetChainId,
        type: "pool",
        title: "WETH Lending — Re7 Capital",
        curatorName: "Re7 Capital",
        poolAddress: "0x3333333333333333333333333333333333333333" as Address,
        underlying: WETH,
        permissionless: true,
        kycRequired: false,
        supplyApy: 3.1,
        tvl: 5_000,
        tvlUsd: 15_000_000,
        utilization: 0.58,
      },
    );
  }

  if (hasMonad) {
    const monadChainId = CHAIN_IDS.Monad;

    markets.push({
      configurator: "0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" as Address,
      curatorName: "Chaos Labs",
      network: "Monad",
      pool: {
        address: "0x2222222222222222222222222222222222222222" as Address,
        chainId: monadChainId,
        underlying: USDC,
        availableLiquidity: 3_000_000n * 10n ** 6n,
        supplyApy: 7.8,
        description: "USDC pool on Monad curated by Chaos Labs",
      },
    });

    opportunities.push({
      id: "pool-monad-0x2222",
      chainId: monadChainId,
      type: "pool",
      title: "USDC Lending on Monad — Chaos Labs",
      curatorName: "Chaos Labs",
      poolAddress: "0x2222222222222222222222222222222222222222" as Address,
      underlying: USDC,
      permissionless: true,
      kycRequired: false,
      supplyApy: 7.8,
      tvl: 8_000_000,
      tvlUsd: 8_000_000,
      utilization: 0.65,
    });
  }

  const curators: OffchainCurator[] = [
    {
      name: "Chaos Labs",
      link: "https://chaoslabs.xyz",
      description: "Leading DeFi risk management and analytics firm",
      marketConfigurators: [
        ...(hasMainnet
          ? [
              {
                chainId: CHAIN_IDS.Mainnet,
                address:
                  "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC" as Address,
                name: "Chaos Labs Mainnet",
                poolAddresses: [
                  "0x1111111111111111111111111111111111111111" as Address,
                ],
              },
            ]
          : []),
        ...(hasMonad
          ? [
              {
                chainId: CHAIN_IDS.Monad,
                address:
                  "0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" as Address,
                name: "Chaos Labs Monad",
                poolAddresses: [
                  "0x2222222222222222222222222222222222222222" as Address,
                ],
              },
            ]
          : []),
      ],
    },
    ...(hasMainnet
      ? [
          {
            name: "Re7 Capital",
            link: "https://re7.capital",
            description:
              "Digital asset investment firm specializing in DeFi strategies",
            marketConfigurators: [
              {
                chainId: CHAIN_IDS.Mainnet,
                address:
                  "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD" as Address,
                name: "Re7 Capital Mainnet",
                poolAddresses: [
                  "0x3333333333333333333333333333333333333333" as Address,
                ],
              },
            ],
          },
        ]
      : []),
  ];

  return { markets, opportunities, curators };
}
