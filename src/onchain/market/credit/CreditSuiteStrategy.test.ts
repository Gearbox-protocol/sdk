import { type Address, getAddress, isAddressEqual } from "viem";
import { describe, expect, it, vi } from "vitest";
import { KYC_REGISTRATION_LINKS, type Token } from "../../../model/index.js";
import { AddressMap } from "../../utils/index.js";
import type { IDegenNFT } from "../rwa/types.js";
import { CreditSuite } from "./CreditSuite.js";
import { CreditSuiteStrategy } from "./CreditSuiteStrategy.js";

const CM = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
const TARGET = getAddress("0x5555555555555555555555555555555555555555");

/**
 * `maxBorrowAmount` decides which limit a caller is told about, so the quota
 * term has to be able to win, a tie has to keep the market's own limit, and a
 * capacity under `minDebt` has to come back as nothing.
 *
 * The suite is a plain object carrying the real
 * {@link CreditSuite.maxBorrowAmount}: it reads a handful of fields, and a
 * real suite needs a loaded market to exist.
 */
interface MaxBorrowOfArgs {
  availableLiquidity: bigint;
  maxDebt: bigint;
  multiplier: number;
  managerAvailable?: bigint;
  quotaAvailable: bigint;
  minDebt?: bigint;
}

function maxBorrowOf(args: MaxBorrowOfArgs) {
  const suite = {
    creditManager: { address: CM },
    maxBorrowAmount: CreditSuite.prototype.maxBorrowAmount,
    creditFacade: {
      maxDebt: args.maxDebt,
      minDebt: args.minDebt ?? 0n,
      maxDebtPerBlockMultiplier: args.multiplier,
    },
    market: {
      toUnderlyingAmount: (value: bigint) => ({ value }),
      pool: {
        pool: {
          availableLiquidity: args.availableLiquidity,
          creditManagerDebtParams: {
            get: () =>
              args.managerAvailable === undefined
                ? undefined
                : { available: args.managerAvailable },
          },
        },
        pqk: {
          quotaAvailable: () => args.quotaAvailable,
        },
      },
    },
  } as unknown as CreditSuite;
  return new CreditSuiteStrategy(suite, TARGET).maxBorrowAmount();
}

describe("CreditSuiteStrategy.maxBorrowAmount", () => {
  it("reports the target collateral's remaining quota when it is the tightest", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 1000n,
        maxDebt: 1000n,
        multiplier: 1,
        managerAvailable: 500n,
        quotaAvailable: 12n,
      }),
    ).toEqual({ amount: { value: 12n }, limit: "quotaAvailable" });
  });

  it("keeps maxDebt when it ties with the remaining quota", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 1000n,
        maxDebt: 40n,
        multiplier: 1,
        managerAvailable: 500n,
        quotaAvailable: 40n,
      }),
    ).toEqual({ amount: { value: 40n }, limit: "maxDebt" });
  });

  it("is zero with the quota cause when the target's quota is exhausted and there is no floor", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 1000n,
        maxDebt: 1000n,
        multiplier: 1,
        managerAvailable: 1000n,
        quotaAvailable: 0n,
      }),
    ).toEqual({ amount: { value: 0n }, limit: "quotaAvailable" });
  });

  it("is zero with the minDebt cause when exhausted quota sits under the floor", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 1000n,
        maxDebt: 1000n,
        multiplier: 1,
        managerAvailable: 1000n,
        quotaAvailable: 0n,
        minDebt: 1n,
      }),
    ).toEqual({ amount: { value: 0n }, limit: "minDebt" });
  });

  it("is zero when the tightest term is under minDebt, and keeps it when equal", () => {
    const under = {
      availableLiquidity: 100n,
      maxDebt: 1000n,
      multiplier: 1,
      managerAvailable: 500n,
      quotaAvailable: 1000n,
    };
    expect(maxBorrowOf({ ...under, minDebt: 101n })).toEqual({
      amount: { value: 0n },
      limit: "minDebt",
    });
    expect(maxBorrowOf({ ...under, minDebt: 100n })).toEqual({
      amount: { value: 100n },
      limit: "poolAvailableLiquidity",
    });
  });

  it("keeps the frozen block's cause ahead of the floor", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 1000n,
        maxDebt: 1000n,
        multiplier: 0,
        managerAvailable: 1000n,
        quotaAvailable: 1000n,
        minDebt: 1n,
      }),
    ).toEqual({ amount: { value: 0n }, limit: "debtPerBlockLimit" });
  });
});

interface ListedStrategyArgs {
  availableLiquidity: bigint;
  multiplier?: number;
  qualifies?: boolean;
}

interface ListedStrategy {
  strategy: CreditSuiteStrategy;
  isStrategyCollateral: ReturnType<typeof vi.fn>;
}

function listedStrategy(args: ListedStrategyArgs): ListedStrategy {
  const isStrategyCollateral = vi.fn(() => args.qualifies ?? true);
  const suite = {
    creditManager: { address: CM },
    maxBorrowAmount: CreditSuite.prototype.maxBorrowAmount,
    isStrategyCollateral,
    creditFacade: {
      maxDebt: 10_000_000n,
      minDebt: 0n,
      maxDebtPerBlockMultiplier: args.multiplier ?? 1,
    },
    market: {
      toUnderlyingAmount: (value: bigint) => ({ value }),
      pool: {
        pool: {
          availableLiquidity: args.availableLiquidity,
          creditManagerDebtParams: { get: () => undefined },
        },
        pqk: { quotaAvailable: () => 10_000_000n },
      },
    },
  } as unknown as CreditSuite;
  return {
    strategy: new CreditSuiteStrategy(suite, TARGET),
    isStrategyCollateral,
  };
}

describe("CreditSuiteStrategy.isListed", () => {
  it("is listed above the pool's seed amount when the target qualifies", () => {
    const { strategy, isStrategyCollateral } = listedStrategy({
      availableLiquidity: 100_001n,
    });
    expect(strategy.isListed).toBe(true);
    expect(isStrategyCollateral).toHaveBeenCalledWith(TARGET, true);
  });

  it("is not listed when it lends exactly the pool's seed amount", () => {
    const { strategy } = listedStrategy({ availableLiquidity: 100_000n });
    expect(strategy.isListed).toBe(false);
  });

  it("is not listed while borrowing is frozen for the block", () => {
    const { strategy } = listedStrategy({
      availableLiquidity: 1_000_000n,
      multiplier: 0,
    });
    expect(strategy.isListed).toBe(false);
  });

  it("is not listed when the target fails the full collateral check", () => {
    const { strategy } = listedStrategy({
      availableLiquidity: 1_000_000n,
      qualifies: false,
    });
    expect(strategy.isListed).toBe(false);
  });
});

const WALLET = getAddress("0x4444444444444444444444444444444444444444");
const TOKEN: Token = {
  chainId: 1,
  address: TARGET,
  symbol: "mGLO",
  name: "Midas Global",
  decimals: 18,
};

/**
 * The suite's own {@link CreditSuite.degenNFT} is tested with the suite; here
 * it only hands over whatever NFT the case names.
 */
function kycStrategy(
  nft: IDegenNFT | undefined,
  target: Address = TARGET,
  token?: Token,
): CreditSuiteStrategy {
  const suite = {
    degenNFT: async () => nft,
    sdk: {
      tokensMeta: {
        getToken: (address: Address) =>
          token && isAddressEqual(address, token.address) ? token : undefined,
      },
    },
  } as unknown as CreditSuite;
  return new CreditSuiteStrategy(suite, target);
}

describe("CreditSuiteStrategy.kycRequirement", () => {
  it("is null when the suite has no KYC gate", async () => {
    await expect(kycStrategy(undefined).kycRequirement()).resolves.toBeNull();
  });

  it.each([
    {
      name: "Midas mToken",
      protocol: "midas" as const,
      tokens: [TARGET],
      token: TOKEN,
      expectedToken: TOKEN,
    },
    {
      name: "Securitize target is DS",
      protocol: "securitize" as const,
      tokens: [TARGET],
      token: TOKEN,
      expectedToken: TOKEN,
    },
    {
      name: "Securitize target is not DS → first DS token",
      protocol: "securitize" as const,
      tokens: [TARGET],
      target: getAddress("0x6666666666666666666666666666666666666666"),
      token: TOKEN,
      expectedToken: TOKEN,
    },
    {
      name: "token unknown to registry",
      protocol: "midas" as const,
      tokens: [TARGET],
      token: undefined,
      expectedToken: undefined,
    },
  ])("$name", async ({ protocol, tokens, target, token, expectedToken }) => {
    const nft = {
      protocol,
      registrationLink: KYC_REGISTRATION_LINKS[protocol],
      getTokens: vi.fn(async () => tokens),
    } as unknown as IDegenNFT;
    await expect(
      kycStrategy(nft, target, token).kycRequirement(),
    ).resolves.toEqual({
      protocol,
      token: expectedToken,
      registrationLink: KYC_REGISTRATION_LINKS[protocol],
    });
  });
});

describe("CreditSuiteStrategy.isEligible", () => {
  it.each([
    {
      name: "no NFT → true",
      nft: false,
      registered: undefined,
      expected: true,
    },
    { name: "registered", nft: true, registered: true, expected: true },
    { name: "not registered", nft: true, registered: false, expected: false },
  ])("$name", async ({ nft, registered, expected }) => {
    const gate = nft
      ? ({
          getOpenAccountRequirements: vi.fn(async () => ({})),
          isRegistered: vi.fn(() => registered),
        } as unknown as IDegenNFT)
      : undefined;
    await expect(kycStrategy(gate).isEligible(WALLET)).resolves.toBe(expected);
  });

  it("asks the gate about the strategy's own target", async () => {
    const getOpenAccountRequirements = vi.fn(async () => ({}));
    const gate = {
      getOpenAccountRequirements,
      isRegistered: () => true,
    } as unknown as IDegenNFT;
    await kycStrategy(gate).isEligible(WALLET);
    expect(getOpenAccountRequirements).toHaveBeenCalledWith(WALLET, {
      tokenOutAddress: TARGET,
    });
  });
});

const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const DCUSDC = getAddress("0xDc00000000000000000000000000000000000001");
const COLLATERAL_A = getAddress("0xAa00000000000000000000000000000000000001");
const COLLATERAL_B = getAddress("0xBb00000000000000000000000000000000000002");
const COLLATERAL_C = getAddress("0xCc00000000000000000000000000000000000003");
const COLLATERAL_X = getAddress("0xDd00000000000000000000000000000000000004");
const PHANTOM = getAddress("0xEe00000000000000000000000000000000000005");
const MAIN_PRICE = 100_000_000n;

interface DepositPrice {
  price: bigint;
  success: boolean;
  updatedAt: bigint;
}

interface DepositSuiteArgs {
  collaterals: Address[];
  contractTypes?: Array<[Address, string]>;
  main?: Array<[Address, DepositPrice]>;
  reserve?: Array<[Address, DepositPrice]>;
}

interface DepositOrderCase {
  name: string;
  collaterals: Address[];
  contractTypes?: Array<[Address, string]>;
  unpriced?: Address[];
  expected: string[];
}

interface DepositPriceCase {
  name: string;
  main: bigint | null;
  reserve: bigint | null;
  failed?: boolean;
  kept: boolean;
}

function depositPrice(price: bigint, success = true): DepositPrice {
  return { price, success, updatedAt: 0n };
}

function depositSuite(args: DepositSuiteArgs): CreditSuite {
  const symbols = new Map<Address, string>([
    [USDC, "USDC"],
    [DCUSDC, "dcUSDC"],
    [TARGET, "TARGET"],
    [COLLATERAL_A, "A"],
    [COLLATERAL_B, "B"],
    [COLLATERAL_C, "C"],
    [COLLATERAL_X, "X"],
    [PHANTOM, "PHANTOM"],
  ]);
  const contractTypes = new AddressMap<string>(args.contractTypes);
  return {
    market: {
      underlying: DCUSDC,
      unwrappedUnderlying: USDC,
      isUnderlyingLike: (token: Address) =>
        isAddressEqual(token, USDC) || isAddressEqual(token, DCUSDC),
      priceOracle: {
        mainPrices: new AddressMap(args.main),
        reservePrices: new AddressMap(args.reserve),
      },
    },
    creditManager: { collateralTokens: args.collaterals },
    sdk: {
      tokensMeta: {
        mustGet: (token: Address) => ({
          contractType: contractTypes.get(token),
        }),
        mustGetToken: (token: Address) => {
          const address = getAddress(token);
          const symbol = symbols.get(address);
          if (!symbol) {
            throw new Error(`token ${token} not found`);
          }
          return { chainId: 1, address, symbol, name: symbol, decimals: 18 };
        },
      },
    },
  } as unknown as CreditSuite;
}

function depositSymbols(args: DepositSuiteArgs): string[] {
  return new CreditSuiteStrategy(
    depositSuite(args),
    TARGET,
  ).allowedDepositTokens.map(token => token.symbol);
}

function pricedCollaterals(
  collaterals: Address[],
  unpriced: Address[] = [],
): Array<[Address, DepositPrice]> {
  return collaterals
    .filter(token => !unpriced.some(skip => isAddressEqual(skip, token)))
    .map(token => [token, depositPrice(MAIN_PRICE)]);
}

describe("CreditSuiteStrategy.allowedDepositTokens", () => {
  it.each<DepositOrderCase>([
    {
      name: "keeps manager order after the underlying and the target",
      collaterals: [COLLATERAL_A, COLLATERAL_B, COLLATERAL_C],
      expected: ["USDC", "TARGET", "A", "B", "C"],
    },
    {
      name: "leaves the wrapped underlying out of the rest",
      collaterals: [DCUSDC, COLLATERAL_A],
      expected: ["USDC", "TARGET", "A"],
    },
    {
      name: "does not repeat the unwrapped underlying",
      collaterals: [USDC, COLLATERAL_A],
      expected: ["USDC", "TARGET", "A"],
    },
    {
      name: "does not repeat the target",
      collaterals: [TARGET, COLLATERAL_A],
      expected: ["USDC", "TARGET", "A"],
    },
    {
      name: "excludes phantom tokens",
      collaterals: [PHANTOM, COLLATERAL_A],
      contractTypes: [[PHANTOM, "PHANTOM_TOKEN::CONVEX"]],
      expected: ["USDC", "TARGET", "A"],
    },
    {
      name: "is the underlying and the target when nothing else qualifies",
      collaterals: [DCUSDC, USDC, TARGET],
      expected: ["USDC", "TARGET"],
    },
    {
      name: "keeps an unpriced target",
      collaterals: [COLLATERAL_A],
      unpriced: [TARGET],
      expected: ["USDC", "TARGET", "A"],
    },
  ])("$name", ({ collaterals, contractTypes, unpriced, expected }) => {
    expect(
      depositSymbols({
        collaterals,
        contractTypes,
        main: pricedCollaterals(collaterals, unpriced),
      }),
    ).toEqual(expected);
  });

  it.each<DepositPriceCase>([
    {
      name: "keeps a rest token with only a main price",
      main: MAIN_PRICE,
      reserve: null,
      kept: true,
    },
    {
      name: "keeps a rest token with only a reserve price",
      main: null,
      reserve: MAIN_PRICE,
      kept: true,
    },
    {
      name: "keeps a rest token with both prices",
      main: MAIN_PRICE,
      reserve: MAIN_PRICE,
      kept: true,
    },
    {
      name: "keeps a rest token with a zero main price and a reserve price",
      main: 0n,
      reserve: MAIN_PRICE,
      kept: true,
    },
    {
      name: "keeps a rest token with a main price and a zero reserve price",
      main: MAIN_PRICE,
      reserve: 0n,
      kept: true,
    },
    {
      name: "drops a rest token with no prices",
      main: null,
      reserve: null,
      kept: false,
    },
    {
      name: "drops a rest token with both prices zero",
      main: 0n,
      reserve: 0n,
      kept: false,
    },
    {
      name: "drops a rest token with a zero main price and no reserve",
      main: 0n,
      reserve: null,
      kept: false,
    },
    {
      name: "drops a rest token with no main price and a zero reserve",
      main: null,
      reserve: 0n,
      kept: false,
    },
    {
      name: "drops a rest token whose main answer failed",
      main: 0n,
      reserve: null,
      failed: true,
      kept: false,
    },
  ])("$name", ({ main, reserve, failed, kept }) => {
    const mainEntries: Array<[Address, DepositPrice]> =
      main === null
        ? []
        : [[COLLATERAL_X, depositPrice(main, failed ? false : true)]];
    const reserveEntries: Array<[Address, DepositPrice]> =
      reserve === null ? [] : [[COLLATERAL_X, depositPrice(reserve)]];
    const expected = kept ? ["USDC", "TARGET", "X"] : ["USDC", "TARGET"];
    expect(
      depositSymbols({
        collaterals: [TARGET, COLLATERAL_X],
        main: mainEntries,
        reserve: reserveEntries,
      }),
    ).toEqual(expected);
  });
});
