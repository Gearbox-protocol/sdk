import type {
  Address,
  Chain,
  Hex,
  MulticallParameters,
  PublicClient,
  ReadContractParameters,
  Transport,
} from "viem";
import { maxUint256, zeroAddress } from "viem";
import type { MarketSuite, OnchainSDK } from "../../../onchain/index.js";
import type { AdapterPluginDefinition } from "../plugins/adapters/defineAdapterPlugin.js";
import { CuratorSession } from "../session/CuratorSession.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import type { MarketState } from "../state/market/types.js";

export const POOL: Address = "0x1111111111111111111111111111111111111111";
export const CM: Address = "0x2222222222222222222222222222222222222222";
export const CM2: Address = "0x2222222222222222222222222222222222222223";
export const CONFIGURATOR: Address =
  "0x3333333333333333333333333333333333333333";
export const ADDRESS_PROVIDER: Address =
  "0x4444444444444444444444444444444444444444";
export const TIMELOCK: Address = "0x5555555555555555555555555555555555555555";
export const GOVERNOR: Address = "0x6666666666666666666666666666666666666666";
export const TREASURY: Address = "0x7777777777777777777777777777777777777777";
export const PF_COMPRESSOR: Address =
  "0x8888888888888888888888888888888888888888";
export const BCR: Address = "0x9999999999999999999999999999999999999999";
export const CONTRACTS_REGISTER: Address =
  "0x9999999999999999999999999999999999999998";
export const USDC: Address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const WETH: Address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const WBTC: Address = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
export const FEED_USDC: Address = "0x1010101010101010101010101010101010101010";
export const FEED_WETH: Address = "0x2020202020202020202020202020202020202020";
export const FEED_WBTC: Address = "0x3030303030303030303030303030303030303030";

export const SOURCE_BLOCK = 21_000_000n;
export const SOURCE_BLOCK_HASH: Hex = `0x${"ab".repeat(32)}`;
/** 2024-06-01T00:00:00Z — deliberately far in the past of any `Date.now()`. **/
export const SOURCE_TIMESTAMP = 1_717_200_000;
export const LATEST_BLOCK = 21_000_050n;

export const DECIMALS: Record<string, number> = {
  [USDC]: 6,
  [WETH]: 18,
  [WBTC]: 8,
};

/** A call the stub client answered. **/
export type StubCall =
  | {
      kind: "readContract";
      functionName: string;
      address: string | undefined;
      blockNumber: bigint | undefined;
      args: readonly unknown[] | undefined;
    }
  | {
      kind: "multicall";
      blockNumber: bigint | undefined;
      functions: string[];
    };

type ReadContractArgs = ReadContractParameters & { blockNumber?: bigint };
type MulticallContract = MulticallParameters["contracts"][number] & {
  address?: Address;
  functionName: string;
};
type MulticallResult =
  | { status: "success"; result: unknown }
  | { status: "failure"; error: Error };

export interface StubClientOverrides {
  /** Answer of a `readContract`; `undefined` falls through to the default. **/
  readContract?: (args: ReadContractArgs) => unknown;
  /** Result of one multicall contract; `undefined` falls through. **/
  multicall?: (contract: MulticallContract) => MulticallResult | undefined;
  /** Client members to replace. **/
  client?: Record<string, unknown>;
}

/** A viem public client that records what it was asked. **/
export type StubClient = PublicClient<Transport, Chain> & {
  calls: StubCall[];
  unexpected: string[];
};

/**
 * A viem-shaped read client whose answers are the ones the real contracts would
 * give. It records every call so tests can assert which block was read at and
 * that a supplied state really did avoid a fetch.
 **/
export function createStubClient(
  overrides: StubClientOverrides = {},
): StubClient {
  const calls: StubCall[] = [];
  const unexpected: string[] = [];

  async function readContract(args: ReadContractArgs): Promise<unknown> {
    calls.push({
      kind: "readContract",
      functionName: args.functionName,
      address: args.address?.toLowerCase(),
      blockNumber: args.blockNumber,
      args: args.args,
    });
    const custom = overrides.readContract?.(args);
    if (custom !== undefined) return custom;
    const address = args.address?.toLowerCase() ?? "";
    switch (args.functionName) {
      case "admin":
        if (address === CONFIGURATOR) return TIMELOCK;
        if (address === TIMELOCK) return GOVERNOR;
        throw new Error(`unexpected admin() on ${address}`);
      case "emergencyAdmin":
        return TREASURY;
      case "acl":
        return ADDRESS_PROVIDER;
      case "addressProvider":
        return ADDRESS_PROVIDER;
      case "getAddressOrRevert":
        return BCR;
      case "previewCreateCreditSuite":
        return CM2;
      case "previewCreateMarket":
        return POOL;
      case "treasury":
        return TREASURY;
      case "version":
        return 310n;
      case "decimals":
        if (DECIMALS[address] === undefined) {
          throw new Error(`no decimals for ${address}`);
        }
        return DECIMALS[address];
      case "balanceOf":
        return 10n ** 30n;
      case "getPeripheryContracts":
        return [];
      case "contractsRegister":
        return CONTRACTS_REGISTER;
      case "getPools":
        // No markets unless a test says otherwise: no treasury tokens.
        return [];
      case "loadPriceFeedTree":
        return [];
      case "contractType":
        // Ordinary ERC-20s revert, which is how RWA classification bails out.
        throw new Error(`no contractType on ${address}`);
      default:
        unexpected.push(`readContract:${args.functionName}`);
        throw new Error(`unexpected readContract ${args.functionName}`);
    }
  }

  function multicallResult(contract: MulticallContract): MulticallResult {
    const custom = overrides.multicall?.(contract);
    if (custom !== undefined) return custom;
    const address = contract.address?.toLowerCase() ?? "";
    switch (contract.functionName) {
      case "decimals":
        return DECIMALS[address] === undefined
          ? { status: "failure", error: new Error("no decimals") }
          : { status: "success", result: DECIMALS[address] };
      case "balanceOf":
        return { status: "success", result: 1_000_000n };
      case "ltParams":
        // [token, ltFinal(bps), rampStart, rampDuration]
        return { status: "success", result: [address, 8000, 0, 0] };
      case "contractType":
        return { status: "failure", error: new Error("no contractType") };
      case "pool":
        return { status: "success", result: POOL };
      case "getRoleHolders":
        return { status: "success", result: [] };
      case "asset":
        return { status: "success", result: USDC };
      case "tokenInsuranceAmount":
        return { status: "success", result: 0n };
      case "queueAdmins":
        return { status: "success", result: [TIMELOCK] };
      case "executionAdmins":
        return { status: "success", result: [TIMELOCK] };
      case "vetoAdmin":
        return { status: "success", result: TIMELOCK };
      case "defaultSplit":
        return {
          status: "success",
          result: { receivers: [TREASURY], proportions: [10_000n] },
        };
      case "activeProposals":
        return { status: "success", result: [] };
      default:
        unexpected.push(`multicall:${contract.functionName}`);
        return { status: "failure", error: new Error("unexpected") };
    }
  }

  async function multicall(
    args: MulticallParameters & { blockNumber?: bigint },
  ): Promise<unknown[]> {
    const contracts = args.contracts as readonly MulticallContract[];
    calls.push({
      kind: "multicall",
      blockNumber: args.blockNumber,
      functions: contracts.map(c => c.functionName),
    });
    const results = contracts.map(multicallResult);
    if (args.allowFailure === false) {
      return results.map(result => {
        if (result.status !== "success") throw result.error;
        return result.result;
      });
    }
    return results;
  }

  const client = {
    calls,
    unexpected,
    chain: { id: 1 },
    transport: { url: "http://unused.invalid" },
    getChainId: async () => 1,
    getBlockNumber: async () => LATEST_BLOCK,
    getBlock: async ({ blockNumber }: { blockNumber?: bigint } = {}) => ({
      number: blockNumber ?? LATEST_BLOCK,
      hash: SOURCE_BLOCK_HASH,
      timestamp:
        blockNumber === SOURCE_BLOCK
          ? BigInt(SOURCE_TIMESTAMP)
          : BigInt(SOURCE_TIMESTAMP + 600),
    }),
    getCode: async () => "0x60",
    readContract,
    multicall,
    ...overrides.client,
  };
  return client as unknown as StubClient;
}

export interface StubSdkArgs {
  client?: PublicClient<Transport, Chain>;
  /** The suite `marketRegister.findByPool` answers with, possibly set later. **/
  marketSuite?: { suite?: MarketSuite } | MarketSuite;
  currentBlock?: bigint;
}

/** The slice of `OnchainSDK` the GIP SDK actually uses, with real behaviour. **/
export function createStubSdk({
  client,
  marketSuite,
  currentBlock = SOURCE_BLOCK,
}: StubSdkArgs = {}): OnchainSDK {
  const sdk = {
    attached: true,
    client: client ?? { chain: { id: 1 } },
    currentBlock,
    tokensMeta: {
      has: (token: string) => DECIMALS[token.toLowerCase()] !== undefined,
      decimals: (token: string) => {
        const decimals = DECIMALS[token.toLowerCase()];
        if (decimals === undefined) {
          throw new Error(`token ${token} is not in the registry`);
        }
        return decimals;
      },
      upsert: () => {},
    },
    addressProvider: {
      address: ADDRESS_PROVIDER,
      mustGetLatest: () => [PF_COMPRESSOR],
      getAddressOrRevert: async () => BCR,
    },
    marketRegister: {
      findByPool: (pool: Address) => {
        const suite =
          marketSuite && "suite" in marketSuite
            ? marketSuite.suite
            : marketSuite;
        if (!suite) {
          throw new Error(`market suite for ${pool} was not stubbed`);
        }
        return suite;
      },
    },
  };
  return sdk as unknown as OnchainSDK;
}

export function marketState(overrides: Partial<MarketState> = {}): MarketState {
  return {
    minorVersion: 310,
    address: POOL,
    symbol: "dUSDC",
    name: "Gearbox USDC",
    underlyingAsset: USDC,
    underlyingPriceFeed: FEED_USDC,
    totalDebtLimit: 1_000_000,
    creditManagerDebtLimit: { [CM]: 500_000 },
    assets: {
      [WETH]: {
        address: WETH,
        quotaLimit: 100_000,
        quotaIncreaseFee: 0.01,
        mainPriceFeed: FEED_WETH,
        reservePriceFeed: zeroAddress,
      },
    },
    creditManagers: {
      [CM]: {
        address: CM,
        name: "USDC CM",
        isExpired: false,
        expirable: false,
        expirationDate: 0,
        feeInterest: 20,
        maxEnabledTokens: 4,
        collateralTokens: {
          [USDC]: {
            liquidationThresholdFinal: 100,
            rampStart: 0,
            rampDuration: 0,
            isForbidden: false,
          },
          [WETH]: {
            liquidationThresholdFinal: 85,
            rampStart: 0,
            rampDuration: 0,
            isForbidden: false,
          },
        },
        adapters: {},
        degenNFT: zeroAddress,
        minDebt: 1_000,
        maxDebt: 100_000,
        maxDebtPerBlockMultiplier: 2,
        paused: false,
        feeLiquidation: 2,
        feeLiquidationExpired: 0.01,
        feeLiquidationPremium: 2.5,
        feeLiquidationPremiumExpired: 2,
      },
    },
    treasury: { address: TREASURY, type: "TREASURY", balances: {} },
    rateKeeper: { type: "TUMBLER", epochSeconds: 604_800, rates: {} },
    lossPolicy: { type: "ALIAS", enabled: true, aliases: {}, mode: 0 },
    interestRateModel: {
      type: "LINEAR",
      params: {
        U_1: 70,
        U_2: 90,
        R_base: 0,
        R_slope1: 5,
        R_slope2: 20,
        R_slope3: 100,
        isBorrowingMoreU2Forbidden: true,
      },
    },
    paused: false,
    periphery: [],
    ...overrides,
  };
}

export function configuratorState(
  overrides: Partial<ConfiguratorState> = {},
): ConfiguratorState {
  return {
    address: CONFIGURATOR,
    version: 310,
    admin: TIMELOCK,
    emergencyAdmin: TREASURY,
    pausableAdmins: [],
    unpausableAdmins: [],
    lossLiquidators: [],
    emergencyLiquidators: [],
    governor: {
      address: GOVERNOR,
      queueAdmins: [TIMELOCK],
      executionAdmins: [TIMELOCK],
      vetoAdmin: TIMELOCK,
    },
    treasury: {
      address: TREASURY,
      defaultSplit: { recievers: [TREASURY], proportions: [100] },
      activeProposals: [],
    },
    shutdown: false,
    ...overrides,
  };
}

export interface MarketSuiteOptions {
  client?: PublicClient<Transport, Chain>;
  expirationDate?: number;
  expirable?: boolean;
}

/**
 * A credit-manager-scoped market suite shaped the way `getMarketState` reads it,
 * so the fetch path exercises the real reader instead of a stand-in.
 **/
export function createMarketSuite({
  client,
  expirationDate = 0,
  expirable = false,
}: MarketSuiteOptions = {}): MarketSuite {
  const creditManager = {
    address: CM,
    name: "USDC CM",
    feeInterest: 2_000,
    maxEnabledTokens: 4,
    underlying: USDC,
    collateralTokens: [USDC, WETH],
    liquidationThresholds: { mustGet: () => 10_000 },
    liquidationDiscount: 9_750,
    liquidationDiscountExpired: 9_800,
    feeLiquidation: 200,
    feeLiquidationExpired: 1,
    adapters: new Map(),
  };
  const suite = {
    sdk: { client },
    treasury: TREASURY,
    pool: {
      underlying: USDC,
      pool: {
        version: 310,
        address: POOL,
        symbol: "dUSDC",
        name: "Gearbox USDC",
        underlying: USDC,
        totalDebtLimit: maxUint256,
        creditManagerDebtParams: new Map([[CM, { limit: 500_000_000_000n }]]),
        isPaused: false,
      },
      rateKeeper: { contractType: "RATE_KEEPER::TUMBLER" },
      tumbler: { rates: new Map([[WETH, 100n]]), epochLength: 604_800n },
      interestRateModel: { contractType: "IRM::LINEAR" },
      linearModel: {
        U1: 7_000,
        U2: 9_000,
        Rbase: 0,
        Rslope1: 500,
        Rslope2: 2_000,
        Rslope3: 10_000,
        isBorrowingMoreU2Forbidden: true,
      },
      pqk: {
        quotas: new Map([
          [WETH, { limit: 100_000_000_000n, quotaIncreaseFee: 100 }],
        ]),
      },
    },
    priceOracle: {
      mainPriceFeeds: new Map([
        [USDC, { address: FEED_USDC }],
        [WETH, { address: FEED_WETH }],
      ]),
      reservePriceFeeds: new Map(),
    },
    // A loss policy of a type the reader does not decode: its state is empty.
    lossPolicy: { contractType: "" },
    creditManagers: [
      {
        sdk: { client },
        creditManager,
        forbiddenTokens: [],
        creditFacade: {
          expirable,
          expirationDate,
          isPaused: false,
          degenNFT: zeroAddress,
          minDebt: 1_000_000_000n,
          maxDebt: 100_000_000_000n,
          maxDebtPerBlockMultiplier: 2,
        },
      },
    ],
  };
  return suite as unknown as MarketSuite;
}

export interface TestSdkOptions {
  client?: StubClient;
  /** Stub client answers; ignored when `client` is given. **/
  stub?: StubClientOverrides;
  /** The OnchainSDK to reuse; `null` creates the session without one. **/
  sdk?: OnchainSDK | null;
  sdkCurrentBlock?: bigint;
  /** The suite the stub SDK serves; `null` serves none. **/
  marketSuite?: MarketSuite | null;
  marketSuiteOptions?: Omit<MarketSuiteOptions, "client">;
  tokenDecimals?: Record<string, number>;
  plugins?: readonly AdapterPluginDefinition[];
}

export interface TestSdk {
  sdk: CuratorSession;
  client: StubClient;
  onchain: OnchainSDK | undefined;
  marketSuite: MarketSuite | undefined;
}

/** A chain-mode session over the stub client and, by default, a stub SDK. **/
export async function createTestSdk(
  options: TestSdkOptions = {},
): Promise<TestSdk> {
  const client = options.client ?? createStubClient(options.stub);
  // The suite is built lazily against the SDK's pinned read client, exactly the
  // client a real `OnchainSDK` would be reading through here.
  const holder: { suite?: MarketSuite } = {};
  const sdk =
    options.sdk === null
      ? undefined
      : (options.sdk ??
        createStubSdk({
          client,
          marketSuite: holder,
          currentBlock: options.sdkCurrentBlock,
        }));
  const session = await CuratorSession.create({
    client,
    marketConfigurator: CONFIGURATOR,
    blockNumber: SOURCE_BLOCK,
    sdk,
    tokenDecimals: options.tokenDecimals,
    plugins: options.plugins,
  });
  if (options.marketSuite !== null) {
    holder.suite =
      options.marketSuite ??
      createMarketSuite({
        client: session.readClient,
        ...options.marketSuiteOptions,
      });
  }
  return { sdk: session, client, onchain: sdk, marketSuite: holder.suite };
}
