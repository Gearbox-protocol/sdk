/**
 * Mock MultichainSDK — the "onchain" data source.
 * Mirrors the shape of the real MultichainSDK from src/sdk/MultichainSDK.ts.
 */
import type { Address, Hex, NetworkType, RawTx } from "../core/index.js";
import type { OnchainMarketData, OnchainPoolState } from "./types.js";

// ---------------------------------------------------------------------------
// Per-chain SDK
// ---------------------------------------------------------------------------

export class MockOnchainSDK {
  readonly network: NetworkType;
  readonly chainId: number;
  #markets: OnchainMarketData[] = [];

  constructor(network: NetworkType, chainId: number) {
    this.network = network;
    this.chainId = chainId;
  }

  async attach(): Promise<void> {
    this.#markets = makeDummyMarkets(this.network);
  }

  get markets(): readonly OnchainMarketData[] {
    return this.#markets;
  }

  findMarket(poolAddress: Address): OnchainMarketData | undefined {
    return this.#markets.find(m => m.pool.address === poolAddress);
  }

  findPool(poolAddress: Address): OnchainPoolState | undefined {
    return this.#markets.find(m => m.pool.address === poolAddress)?.pool;
  }

  createDepositTx(poolAddress: Address, amount: bigint): RawTx {
    return {
      to: poolAddress,
      callData: `0x${amount.toString(16)}` as Hex,
      value: "0",
      description: `deposit ${amount} into pool ${poolAddress}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Multichain wrapper
// ---------------------------------------------------------------------------

export interface MockMultichainSDKConfig {
  chains: Partial<Record<NetworkType, { rpcUrl: string }>>;
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

export class MockMultichainSDK {
  readonly #chains: Map<NetworkType, MockOnchainSDK> = new Map();

  constructor(config: MockMultichainSDKConfig) {
    for (const network of Object.keys(config.chains) as NetworkType[]) {
      this.#chains.set(
        network,
        new MockOnchainSDK(network, CHAIN_IDS[network] ?? 1),
      );
    }
  }

  async attach(): Promise<void> {
    await Promise.all([...this.#chains.values()].map(s => s.attach()));
  }

  chain(network: NetworkType): MockOnchainSDK {
    const sdk = this.#chains.get(network);
    if (!sdk) throw new Error(`Chain ${network} not configured`);
    return sdk;
  }

  get chains(): ReadonlyMap<NetworkType, MockOnchainSDK> {
    return this.#chains;
  }

  allMarkets(): Array<{ network: NetworkType; market: OnchainMarketData }> {
    const result: Array<{ network: NetworkType; market: OnchainMarketData }> =
      [];
    for (const [network, sdk] of this.#chains) {
      for (const market of sdk.markets) {
        result.push({ network, market });
      }
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// Dummy data
// ---------------------------------------------------------------------------

function makeDummyMarkets(network: NetworkType): OnchainMarketData[] {
  if (network === "Mainnet") {
    return [
      {
        configurator: "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC" as Address,
        pool: {
          address: "0x1111111111111111111111111111111111111111" as Address,
          underlying: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
          availableLiquidity: 5_000_000n * 10n ** 6n,
          isPaused: false,
          kycRequired: true,
        },
      },
      {
        configurator: "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD" as Address,
        pool: {
          address: "0x3333333333333333333333333333333333333333" as Address,
          underlying: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address,
          availableLiquidity: 2_000n * 10n ** 18n,
          isPaused: false,
          kycRequired: false,
        },
      },
    ];
  }
  return [
    {
      configurator: "0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" as Address,
      pool: {
        address: "0x2222222222222222222222222222222222222222" as Address,
        underlying: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
        availableLiquidity: 3_000_000n * 10n ** 6n,
        isPaused: false,
        kycRequired: false,
      },
    },
  ];
}
