import type { Address } from "viem";
import {
  bytesToHex,
  createPublicClient,
  custom,
  getAddress,
  hexToBytes,
} from "viem";
import { iPriceOracleV310Abi } from "../../../abi/310/generated.js";
import {
  ChainContractsRegister,
  type PriceFeedAnswer,
  type PriceOracleData,
} from "../../base/index.js";
import { getChain } from "../../chain/index.js";
import { AP_WETH_TOKEN, PRICE_DECIMALS_POW } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { toBN } from "../../utils/index.js";
import { PriceFeedRef } from "../pricefeeds/index.js";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract.js";

/**
 * USD price accepted by every {@link TestPriceOracle} input:
 * - `number` | `string` — human USD per whole token (`"1738.1183"`, `2000`),
 *   scaled to the oracle's 8-decimal fixed point internally;
 * - `bigint` — already in 8-decimal fixed point, passed through as-is
 *   (what record-based fixtures like intents/testing/market.ts hold).
 **/
export type UsdPrice = number | string | bigint;

/**
 * Token seeded into a {@link TestPriceOracle}. Omitted `price` / `reservePrice`
 * means that feed is not configured.
 *
 * `decimals` / `symbol` / `name` default from {@link MockTokens} when the
 * address is well-known, otherwise to 18 and a short generated ticker.
 **/
export interface TestOracleToken {
  decimals?: number;
  /**
   * Display ticker. Defaults to a short generated one.
   **/
  symbol?: string;
  /**
   * Display name. Defaults to {@link symbol}.
   **/
  name?: string;
  /**
   * Main feed answer. Omit for no main feed.
   **/
  price?: UsdPrice;
  /**
   * Reserve feed answer. Omit for no reserve feed.
   **/
  reservePrice?: UsdPrice;
}

interface MockTokenMeta {
  decimals: number;
  symbol: string;
  name: string;
}

/**
 * Well-known mainnet tokens for tests. The oracle prefills their metadata;
 * a seed can then be as small as `{ price: 2000 }`.
 **/
export const MockTokens = {
  WETH: getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
  USDC: getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
  DAI: getAddress("0x6B175474E89094C44Da98b954EedeAC495271d0F"),
  cbETH: getAddress("0xBe9895146f7AF43049ca1c1AE358B0541Ea49704"),
  dcUSDC: getAddress("0x50A9C808cd114E8fEA72f03aE2B1A8825677D56D"),
  ACRED: getAddress("0x17418038ecF73BA4026c4f428547BF099706F27B"),
  srpACRED_USDC: getAddress("0xe4a38b653B2580C9D72a50F190Ddd6E2d2D2a412"),
} as const;

const MOCK_TOKEN_META: Record<Address, MockTokenMeta> = {
  [MockTokens.WETH]: { decimals: 18, symbol: "WETH", name: "Wrapped Ether" },
  [MockTokens.USDC]: { decimals: 6, symbol: "USDC", name: "USD Coin" },
  [MockTokens.DAI]: { decimals: 18, symbol: "DAI", name: "Dai Stablecoin" },
  [MockTokens.cbETH]: {
    decimals: 18,
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
  },
  [MockTokens.dcUSDC]: {
    decimals: 6,
    symbol: "dcUSDC",
    name: "Default compliant USD Coin",
  },
  [MockTokens.ACRED]: {
    decimals: 6,
    symbol: "ACRED",
    name: "Apollo Diversified Credit Securitize Fund",
  },
  [MockTokens.srpACRED_USDC]: {
    decimals: 6,
    symbol: "srpACRED_USDC",
    name: "Securitize pending redemption Apollo Diversified Credit Securitize Fund to USD Coin",
  },
};

export const TEST_ORACLE_ADDRESS: Address = getAddress(
  "0x040ac1e000000000000000000000000000000310",
);

const FAILED_ANSWER: PriceFeedAnswer = {
  price: 0n,
  success: false,
  updatedAt: 0n,
};

/**
 * Register whose client rejects any RPC request: the oracle never talks to a
 * node. `addressProvider.getAddress` answers `AP_WETH_TOKEN` with mainnet WETH
 * so `#priceableToken` and `safeConvertMinUSD` exercise their real native
 * branches.
 **/
class TestOracleSdk extends ChainContractsRegister {
  addressProvider = {
    getAddress: (contract: string, version?: number): Address => {
      if (contract === AP_WETH_TOKEN) {
        return MockTokens.WETH;
      }
      throw new Error(`Address ${contract}, version: ${version} not found`);
    },
  };
  priceFeeds = {
    generatePriceFeedsUpdateTxs: (): never => {
      throw new Error("TestPriceOracle: no priceFeeds");
    },
  };
}

/**
 * A real {@link PriceOracleBaseContract} seeded from plain records, for tests.
 *
 * Conversion, safe-price fallback, and native-through-WETH all run the
 * production code. Feed-tree methods (`priceFeedData`, `priceUpdatesFor*`, …)
 * are not wired and throw if touched.
 **/
export class TestPriceOracle extends PriceOracleBaseContract<
  typeof iPriceOracleV310Abi
> {
  constructor(tokens: Record<Address, TestOracleToken> = {}) {
    const register = new TestOracleSdk(
      createPublicClient({
        chain: getChain("Mainnet"),
        transport: custom({
          request: async () => {
            throw new Error("not implemented");
          },
        }),
      }),
    );
    super(
      register as unknown as OnchainSDK,
      {
        abi: iPriceOracleV310Abi,
        addr: TEST_ORACLE_ADDRESS,
        name: "TestPriceOracle",
      },
      { priceFeedMap: [], priceFeedTree: [] } as unknown as PriceOracleData,
    );
    for (const [token, meta] of Object.entries(MOCK_TOKEN_META)) {
      const addr = getAddress(token as Address);
      this.register.tokensMeta.upsert(addr, { addr, ...meta });
    }
    for (const [token, cfg] of Object.entries(tokens)) {
      this.addToken(token as Address, cfg);
    }
  }

  /**
   * Registers token meta and optional feed answers. Chainable, like all
   * modifiers.
   **/
  public addToken(token: Address, cfg: TestOracleToken): this {
    const addr = getAddress(token);
    const known = MOCK_TOKEN_META[addr];
    const symbol = cfg.symbol ?? known?.symbol ?? `T_${addr.slice(2, 8)}`;
    this.register.tokensMeta.upsert(addr, {
      addr,
      symbol,
      name: cfg.name ?? known?.name ?? symbol,
      decimals: cfg.decimals ?? known?.decimals ?? 18,
    });
    if (cfg.price !== undefined) {
      this.setMainPrice(addr, cfg.price);
    }
    if (cfg.reservePrice !== undefined) {
      this.setReservePrice(addr, cfg.reservePrice);
    }
    return this;
  }

  public setMainPrice(token: Address, price: UsdPrice): this {
    this.#setAnswer(token, "main", rawPrice(price));
    return this;
  }

  public setReservePrice(token: Address, price: UsdPrice): this {
    this.#setAnswer(token, "reserve", rawPrice(price));
    return this;
  }

  /**
   * Feed stays configured, its answer failed — {@link PriceFeedAnswerMap.price}
   * throws. Distinct from {@link removeMainFeed}.
   **/
  public failMainAnswer(token: Address): this {
    this.#failAnswer(token, "main");
    return this;
  }

  /**
   * Feed stays configured, its answer failed. Distinct from
   * {@link removeReserveFeed}: `safeConvertMinUSD` treats a present-but-failed
   * reserve feed as an error, and a missing one as an untrusted 0.
   **/
  public failReserveAnswer(token: Address): this {
    this.#failAnswer(token, "reserve");
    return this;
  }

  /**
   * No main feed at all: distinct from a failed answer.
   **/
  public removeMainFeed(token: Address): this {
    this.mainPriceFeeds.delete(token);
    this.mainPrices.delete(token);
    return this;
  }

  /**
   * No reserve feed at all: distinct from a failed answer, and what
   * `safeConvertMinUSD` treats as an untrusted token (value 0, no error).
   **/
  public removeReserveFeed(token: Address): this {
    this.reservePriceFeeds.delete(token);
    this.reservePrices.delete(token);
    return this;
  }

  public override async updateAndConvert(
    _from: Address,
    _to: Address,
    _amount: bigint,
  ): Promise<bigint> {
    throw new Error("TestPriceOracle: updateAndConvert needs a node");
  }

  #setAnswer(token: Address, kind: "main" | "reserve", price: bigint): void {
    this.#ensureFeed(token, kind);
    this.#answers(kind).upsert(token, {
      price,
      success: true,
      updatedAt: 0n,
    });
  }

  #failAnswer(token: Address, kind: "main" | "reserve"): void {
    this.#ensureFeed(token, kind);
    this.#answers(kind).upsert(token, FAILED_ANSWER);
  }

  #ensureFeed(token: Address, kind: "main" | "reserve"): void {
    const feeds =
      kind === "main" ? this.mainPriceFeeds : this.reservePriceFeeds;
    if (!feeds.has(token)) {
      feeds.upsert(
        token,
        new PriceFeedRef(this.register, feedAddr(token, kind), 0),
      );
    }
  }

  #answers(kind: "main" | "reserve") {
    return kind === "main" ? this.mainPrices : this.reservePrices;
  }
}

/** Human USD → 8-decimal fixed point; bigint passes through. */
function rawPrice(price: UsdPrice): bigint {
  return typeof price === "bigint"
    ? price
    : toBN(String(price), PRICE_DECIMALS_POW);
}

/** Deterministic unused address per token feed; never resolved. */
function feedAddr(token: Address, kind: "main" | "reserve"): Address {
  const bytes = hexToBytes(getAddress(token));
  bytes[0] = kind === "main" ? 0xfe : 0xfd;
  return getAddress(bytesToHex(bytes));
}
