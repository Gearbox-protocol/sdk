import type { Address } from "viem";
import type { OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";
import type { CreditAccountSlice } from "../types.js";
import {
  buildMockSdk,
  type MockDelayedVenue,
  type MockQuotaEntry,
} from "./sdk-mock.js";

/**
 * Shared market fixture — token set, prices, decimals, quotas and CM/facade
 * addresses — used by every intent spec.
 *
 * `UND` deliberately has 8 decimals while `ANY`/`ANY2` have 18, so that any
 * decimals-rescaling bug shows up as a wrong amount rather than passing by
 * coincidence. `UND` is priced at 2 and the others at 1 for the same reason.
 */

export const UND_DECIMALS = 8;
export const TOK_DECIMALS = 18;

export const UND = "0x3333333333333333333333333333333333333333" as Address;
export const ANY = "0x1111111111111111111111111111111111111111" as Address;
export const ANY2 = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
export const RWA_ASSET =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
/**
 * Position token that converts 1:1 with `UND` (same decimals, same price).
 *
 * The mock router echoes the input amount as the output amount, so a 1:1 pair is
 * the only way a swap leg's expected amounts stay decimals-correct. Use `POS`
 * for flows whose amounts cross a swap, and `ANY` where they do not.
 */
export const POS = "0x2222222222222222222222222222222222222222" as Address;
/** Second 1:1 token, for flows routing between two non-underlying tokens. */
export const POS2 = "0x4444444444444444444444444444444444444444" as Address;

export const CREDIT_MANAGER =
  "0xdddddddddddddddddddddddddddddddddddddddd" as Address;
export const CREDIT_FACADE =
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address;
export const CREDIT_ACCOUNT =
  "0xacacacacacacacacacacacacacacacacacacacac" as Address;

export const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

export const PRICES: Record<Address, bigint> = {
  [UND]: toBN("2", 8),
  [ANY]: toBN("1", 8),
  [ANY2]: toBN("1", 8),
  [RWA_ASSET]: toBN("2", 8),
  [POS]: toBN("2", 8),
  [POS2]: toBN("2", 8),
};

export const DECIMALS: Record<Address, number> = {
  [UND]: UND_DECIMALS,
  [ANY]: TOK_DECIMALS,
  [ANY2]: TOK_DECIMALS,
  [RWA_ASSET]: UND_DECIMALS,
  [POS]: UND_DECIMALS,
  [POS2]: UND_DECIMALS,
};

export const QUOTAS: Record<Address, MockQuotaEntry> = {
  [ANY]: {
    token: ANY,
    rate: 500n,
    limit: toBN("999999999999999", TOK_DECIMALS),
    isActive: true,
  },
  [ANY2]: {
    token: ANY2,
    rate: 500n,
    limit: toBN("999999999999999", TOK_DECIMALS),
    isActive: true,
  },
  [RWA_ASSET]: {
    token: RWA_ASSET,
    rate: 500n,
    limit: toBN("999999999999999", UND_DECIMALS),
    isActive: true,
  },
  [POS]: {
    token: POS,
    rate: 500n,
    limit: toBN("999999999999999", UND_DECIMALS),
    isActive: true,
  },
  [POS2]: {
    token: POS2,
    rate: 500n,
    limit: toBN("999999999999999", UND_DECIMALS),
    isActive: true,
  },
};

export const LIQUIDATION_THRESHOLDS: Record<Address, number> = {
  [UND]: 9800,
  [ANY]: 9200,
  [ANY2]: 9200,
  [RWA_ASSET]: 9200,
  [POS]: 9200,
  [POS2]: 9200,
};

export const MAX_DEBT = toBN("200000", UND_DECIMALS);

export interface MarketSdkExtras {
  /** RWA markets: underlying → rwa.asset (`tokensMeta.rwaUnderlyings`). */
  rwaAssets?: Record<Address, Address>;
  /** Additional / overriding token prices (PRICE_DECIMALS_POW-scaled). */
  extraPrices?: Record<Address, bigint>;
  /** Reserve feed prices; the fixture market has none by default. */
  reservePrices?: Record<Address, bigint>;
  /** Additional / overriding token decimals. */
  extraDecimals?: Record<Address, number>;
  /** Tokens the registry should report as phantoms. */
  phantoms?: Address[];
  /** Facade `minDebt`; 0n when omitted. */
  minDebt?: bigint;
  /** Accounts `accounts.getCreditAccountData` answers for. */
  creditAccounts?: CreditAccountSlice[];
  /** Redemption venues per source token; omit for a market without any. */
  delayed?: Record<Address, MockDelayedVenue[]>;
  /** Quota params replacing the fixture's, e.g. a token with no room left. */
  quotas?: Record<Address, MockQuotaEntry>;
  /** Facade pause flag. */
  facadePaused?: boolean;
  /** Pool pause flag, which pauses the suite with it. */
  poolPaused?: boolean;
  /** Facade expiry in unix seconds; `0` means never. */
  expirationDate?: number;
  /** "Now" the expiry is judged against. */
  timestamp?: number;
  /** Free liquidity in the pool. */
  availableLiquidity?: bigint;
  /** What is left of this manager's debt limit. */
  debtLimitAvailable?: bigint;
  /** Per-block borrow cap as a multiple of `maxDebt`; `0` switches it off. */
  maxDebtPerBlockMultiplier?: number;
  /** Tokens the facade forbids. */
  forbiddenTokens?: Address[];
}

/** Mock SDK on the shared fixture market. */
export function buildMarketSdk(extras?: MarketSdkExtras): OnchainSDK {
  return buildMockSdk({
    prices: { ...PRICES, ...extras?.extraPrices },
    reservePrices: extras?.reservePrices,
    decimals: { ...DECIMALS, ...extras?.extraDecimals },
    quotas: extras?.quotas ?? QUOTAS,
    liquidationThresholds: LIQUIDATION_THRESHOLDS,
    maxDebt: MAX_DEBT,
    minDebt: extras?.minDebt,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    rwaAssets: extras?.rwaAssets,
    phantoms: extras?.phantoms,
    creditAccounts: extras?.creditAccounts,
    delayed: extras?.delayed,
    facadePaused: extras?.facadePaused,
    poolPaused: extras?.poolPaused,
    expirationDate: extras?.expirationDate,
    timestamp: extras?.timestamp,
    availableLiquidity: extras?.availableLiquidity,
    debtLimitAvailable: extras?.debtLimitAvailable,
    maxDebtPerBlockMultiplier: extras?.maxDebtPerBlockMultiplier,
    forbiddenTokens: extras?.forbiddenTokens,
    strategyTargetCollateral: POS,
  });
}

/** Converts an amount to UND at fixture prices (mirrors the mock oracle). */
export function valueInUnd(
  amount: bigint,
  token: Address,
  overrides?: {
    prices?: Record<Address, bigint>;
    decimals?: Record<Address, number>;
  },
): bigint {
  const prices = { ...PRICES, ...overrides?.prices };
  const decimals = { ...DECIMALS, ...overrides?.decimals };
  return (
    (amount * prices[token] * 10n ** BigInt(UND_DECIMALS)) /
    (prices[UND] * 10n ** BigInt(decimals[token]))
  );
}

/** Token entry for a fixture CA, with quota defaulting to zero. */
export function caToken(
  token: Address,
  balance: bigint,
  quota = 0n,
): CreditAccountSlice["tokens"][number] {
  return { token, balance, quota, mask: 0n, success: true };
}

/** Bare CA slice on the fixture market. */
export function buildFixtureCreditAccount(args: {
  accountDebt: bigint;
  tokens: CreditAccountSlice["tokens"];
}): CreditAccountSlice {
  return {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    accountDebt: args.accountDebt,
    tokens: args.tokens,
  };
}
