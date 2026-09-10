import { type Address, getAddress } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type Curator,
  KYC_REGISTRATION_LINKS,
  type Token,
  type UnderlyingToken,
} from "../../../model/index.js";
import type { CreditSuiteState } from "../../base/index.js";
import { ADDRESS_0X0 } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { createDegenNFT } from "../rwa/createDegenNFT.js";
import type { IDegenNFT } from "../rwa/types.js";
import { CreditSuite } from "./CreditSuite.js";
import createCreditConfigurator from "./createCreditConfigurator.js";
import createCreditFacade from "./createCreditFacade.js";
import createCreditManager from "./createCreditManager.js";
import type {
  ICreditConfiguratorContract,
  ICreditFacadeContract,
  ICreditManagerContract,
  LiquidationFees,
} from "./types.js";

vi.mock("./createCreditConfigurator.js", () => ({ default: vi.fn() }));
vi.mock("./createCreditFacade.js", () => ({ default: vi.fn() }));
vi.mock("./createCreditManager.js", () => ({ default: vi.fn() }));
vi.mock("../rwa/createDegenNFT.js", () => ({ createDegenNFT: vi.fn() }));

const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const CBETH = getAddress("0xBe9895146f7AF43049ca1c1AE358B0541Ea49704");
const UNKNOWN_ACCOUNT = getAddress(
  "0x0000000000000000000000000000000000000001",
);
// Hardcoded Mainnet override in `chains.ts`.
const OVERRIDE_ACCOUNT = getAddress(
  "0x56631dcb1ea548d2629e82e01375090ed1f81b7e",
);
const OVERRIDE_TARGET = getAddress(
  "0x1a711a5bc48b5c1352c1882fa65dc14b5b9e829d",
);

function token(address: Token["address"], symbol: string): Token {
  return {
    chainId: 1,
    address,
    symbol,
    name: symbol,
    decimals: 18,
  };
}

const UNDERLYING: UnderlyingToken = {
  ...token(WETH, "WETH"),
  wrappedAddress: null,
};

function suite(strategyTarget: Token["address"] | undefined): CreditSuite {
  const known = new Map([
    [CBETH, token(CBETH, "cbETH")],
    [OVERRIDE_TARGET, token(OVERRIDE_TARGET, "stETH")],
  ]);
  const s = {
    chainId: 1,
    strategyTargetCollateral: strategyTarget,
    underlyingToken: UNDERLYING,
    tokensMeta: {
      mustGetToken: (addr: Token["address"]) => {
        const t = known.get(getAddress(addr));
        if (!t) {
          throw new Error(`token ${addr} not found`);
        }
        return t;
      },
    },
  };
  return Object.assign(s, {
    accountTargetCollateral: CreditSuite.prototype.accountTargetCollateral,
    accountStrategyName: CreditSuite.prototype.accountStrategyName,
  }) as unknown as CreditSuite;
}

describe("CreditSuite.accountTargetCollateral", () => {
  it("falls back to the suite's strategy target", () => {
    expect(suite(CBETH).accountTargetCollateral(UNKNOWN_ACCOUNT)).toEqual(
      token(CBETH, "cbETH"),
    );
  });

  it("prefers a hardcoded per-account override", () => {
    expect(suite(CBETH).accountTargetCollateral(OVERRIDE_ACCOUNT)).toEqual(
      token(OVERRIDE_TARGET, "stETH"),
    );
  });

  it("is null when neither an override nor a suite target exists", () => {
    expect(
      suite(undefined).accountTargetCollateral(UNKNOWN_ACCOUNT),
    ).toBeNull();
  });
});

describe("CreditSuite.accountStrategyName", () => {
  it("joins the account target and the underlying", () => {
    expect(suite(CBETH).accountStrategyName(UNKNOWN_ACCOUNT)).toBe(
      "cbETH / WETH",
    );
  });

  it("is the underlying symbol when no target can be resolved", () => {
    expect(suite(undefined).accountStrategyName(UNKNOWN_ACCOUNT)).toBe("WETH");
  });
});

const CREDIT_MANAGER = getAddress("0x1000000000000000000000000000000000000001");
const CURATOR: Curator = {
  address: getAddress("0x2000000000000000000000000000000000000002"),
  name: "Chaos Labs",
  url: null,
};

interface MarketSuiteExtra {
  strategyName?: string;
}

/**
 * The three getters the market half is read off. `liquidationFees` is the pair
 * in effect right now — the suite resolves its own expiration behind it, so a
 * caller here cannot pick the wrong one.
 */
function marketSuite(
  fees: LiquidationFees,
  extra: MarketSuiteExtra = { strategyName: "wstETH / WETH" },
): CreditSuite {
  const s = {
    strategyName: extra.strategyName,
    underlyingToken: UNDERLYING,
    creditManager: { address: CREDIT_MANAGER },
    market: { curator: CURATOR },
    liquidationFees: () => fees,
  };
  return Object.assign(s, {
    totalLiquidationDiscount: CreditSuite.prototype.totalLiquidationDiscount,
    creditOperationMarket: CreditSuite.prototype.creditOperationMarket,
  }) as unknown as CreditSuite;
}

describe("CreditSuite.totalLiquidationDiscount", () => {
  it("is the premium the liquidator keeps plus the protocol's fee", () => {
    // the manager reports the complement of a 3% premium; a 1.5% fee rides on
    // top of it, so a screen labels the pair 4.5%
    expect(
      marketSuite({
        liquidationDiscount: 9700,
        feeLiquidation: 150,
      }).totalLiquidationDiscount(),
    ).toBe(450);
  });

  it("follows the fees the suite reports, which is where expiration is resolved", () => {
    // an expired facade liquidates on harsher terms, and `liquidationFees`
    // hands those over without the caller asking
    expect(
      marketSuite({
        liquidationDiscount: 9600,
        feeLiquidation: 200,
      }).totalLiquidationDiscount(),
    ).toBe(600);
  });

  it("is not the manager's own figure", () => {
    const fees: LiquidationFees = {
      liquidationDiscount: 9700,
      feeLiquidation: 150,
    };
    expect(marketSuite(fees).totalLiquidationDiscount()).not.toBe(
      fees.liquidationDiscount,
    );
  });
});

describe("CreditSuite.creditOperationMarket", () => {
  it("names the market a result acts on, curator and discount included", () => {
    expect(
      marketSuite({
        liquidationDiscount: 9700,
        feeLiquidation: 150,
      }).creditOperationMarket(),
    ).toEqual({
      creditManager: CREDIT_MANAGER,
      name: "wstETH / WETH",
      underlyingToken: UNDERLYING,
      curator: CURATOR,
      liquidationDiscount: 450,
    });
  });

  it("falls back to the underlying symbol when the suite has no strategy", () => {
    expect(
      marketSuite(
        { liquidationDiscount: 9700, feeLiquidation: 150 },
        { strategyName: undefined },
      ).creditOperationMarket(),
    ).toMatchObject({
      name: "WETH",
      underlyingToken: UNDERLYING,
    });
  });
});

const CM = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;

/**
 * `maxBorrowAmount` decides which limit a caller is told about, so each of its
 * three terms has to be able to win, and the tie has to keep the earlier one.
 *
 * The method is borrowed onto a plain object rather than run on a constructed
 * suite: it reads four fields, and a real suite needs a loaded market to exist.
 */
function maxBorrowOf(args: {
  availableLiquidity: bigint;
  maxDebt: bigint;
  multiplier: number;
  managerAvailable?: bigint;
}) {
  const suite = {
    creditManager: { address: CM },
    creditFacade: {
      maxDebt: args.maxDebt,
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
      },
    },
  } as unknown as CreditSuite;
  return CreditSuite.prototype.maxBorrowAmount.call(suite);
}

describe("CreditSuite.maxBorrowAmount", () => {
  it("reports the pool's available liquidity when it is the tightest", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 100n,
        maxDebt: 1000n,
        multiplier: 1,
        managerAvailable: 500n,
      }),
    ).toEqual({ amount: { value: 100n }, limit: "poolAvailableLiquidity" });
  });

  it("reports the facade's per-account maxDebt when it is the tightest", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 1000n,
        maxDebt: 50n,
        multiplier: 2,
        managerAvailable: 500n,
      }),
    ).toEqual({ amount: { value: 50n }, limit: "maxDebt" });
  });

  it("reports the manager's remaining allowance when it is the tightest", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 1000n,
        maxDebt: 1000n,
        multiplier: 1,
        managerAvailable: 7n,
      }),
    ).toEqual({ amount: { value: 7n }, limit: "managerDebtAvailable" });
  });

  it("keeps the earlier term when two limits tie", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 100n,
        maxDebt: 100n,
        multiplier: 1,
        managerAvailable: 100n,
      }),
    ).toEqual({ amount: { value: 100n }, limit: "poolAvailableLiquidity" });
  });

  it("omits the manager's allowance when the pool reports none for it", () => {
    expect(
      maxBorrowOf({ availableLiquidity: 1000n, maxDebt: 40n, multiplier: 1 }),
    ).toEqual({ amount: { value: 40n }, limit: "maxDebt" });
  });

  it("is zero when borrowing is switched off for the block", () => {
    expect(
      maxBorrowOf({
        availableLiquidity: 1000n,
        maxDebt: 1000n,
        multiplier: 0,
        managerAvailable: 1000n,
      }),
    ).toEqual({ amount: { value: 0n }, limit: "debtPerBlockLimit" });
  });
});

describe("CreditSuite.strategyOpportunity", () => {
  it("is absent while borrowing is frozen", () => {
    const suite = {
      maxBorrowAmount: () => ({
        amount: { value: 0n },
        limit: "debtPerBlockLimit",
      }),
    } as unknown as CreditSuite;
    expect(
      CreditSuite.prototype.strategyOpportunity.call(suite),
    ).toBeUndefined();
  });
});

const DEGEN = getAddress("0x1111111111111111111111111111111111111111");
const WALLET = getAddress("0x4444444444444444444444444444444444444444");
const TARGET = getAddress("0x5555555555555555555555555555555555555555");
const TOKEN: Token = {
  chainId: 1,
  address: TARGET,
  symbol: "mGLO",
  name: "Midas Global",
  decimals: 18,
};

const create = vi.mocked(createDegenNFT);

beforeEach(() => {
  create.mockReset();
});

function kycSuite(degenNFT: Address, token?: Token): CreditSuite {
  vi.mocked(createCreditFacade).mockReturnValue({
    degenNFT,
  } as unknown as ICreditFacadeContract);
  vi.mocked(createCreditManager).mockReturnValue(
    {} as unknown as ICreditManagerContract,
  );
  vi.mocked(createCreditConfigurator).mockReturnValue(
    {} as unknown as ICreditConfiguratorContract,
  );
  const sdk = {
    client: {},
    tokensMeta: {
      getToken: vi.fn((address: Address) =>
        token && address.toLowerCase() === token.address.toLowerCase()
          ? token
          : undefined,
      ),
    },
  } as unknown as OnchainSDK;
  return new CreditSuite(sdk, {
    creditManager: { name: "TestCM", pool: ADDRESS_0X0 },
  } as unknown as CreditSuiteState);
}

describe("CreditSuite.degenNFT", () => {
  it("returns undefined without RPC when the facade has no degen NFT", async () => {
    await expect(kycSuite(ADDRESS_0X0).degenNFT()).resolves.toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });

  it("loads once and reuses the cached promise", async () => {
    const nft = { protocol: "midas" } as IDegenNFT;
    create.mockResolvedValue(nft);
    const suite = kycSuite(DEGEN);
    await expect(suite.degenNFT()).resolves.toBe(nft);
    await expect(suite.degenNFT()).resolves.toBe(nft);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(expect.anything(), DEGEN);
  });
});

describe("CreditSuite.kycRequirement", () => {
  it("returns null without RPC when the facade has no degen NFT", async () => {
    await expect(
      kycSuite(ADDRESS_0X0).kycRequirement(WALLET, TARGET),
    ).resolves.toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it("returns null when the degen NFT is not a KYC gate", async () => {
    create.mockResolvedValue(undefined);
    await expect(
      kycSuite(DEGEN).kycRequirement(WALLET, TARGET),
    ).resolves.toBeNull();
  });

  it.each([
    {
      name: "eligible",
      eligible: true,
      token: TOKEN,
      expected: null,
    },
    {
      name: "not eligible, token known",
      eligible: false,
      token: TOKEN,
      expected: {
        protocol: "midas" as const,
        token: TOKEN,
        registrationLink: KYC_REGISTRATION_LINKS.midas,
      },
    },
    {
      name: "not eligible, token unknown",
      eligible: false,
      token: undefined,
      expected: {
        protocol: "midas" as const,
        token: undefined,
        registrationLink: KYC_REGISTRATION_LINKS.midas,
      },
    },
  ])("$name", async ({ eligible, token, expected }) => {
    const checkKyc = vi.fn(async () => ({
      eligible,
      token: TARGET,
    }));
    create.mockResolvedValue({
      protocol: "midas",
      checkKyc,
    } as unknown as IDegenNFT);
    await expect(
      kycSuite(DEGEN, token).kycRequirement(WALLET, TARGET),
    ).resolves.toEqual(expected);
    expect(checkKyc).toHaveBeenCalledWith(WALLET, TARGET);
  });
});
