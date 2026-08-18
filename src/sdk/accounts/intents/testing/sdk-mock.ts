import type { Address } from "viem";
import { vi } from "vitest";
import type {
  CreditAccountDataPayload,
  EncodableCreditAccountOperation,
  MultiCall,
  OnchainSDK,
} from "../../../index.js";
import type { CreditAccountSlice } from "../types.js";

/**
 * Test kit for intent-service specs.
 *
 * The service resolves all market data through `OnchainSDK`
 * (`marketRegister`, `tokensMeta`, `accounts`). `buildMockSdk` builds a mock
 * from plain records; assemble mocks ECHO recognizable sentinel calls derived
 * from their inputs, so `result.calls` pins down which ops reached the
 * assembler and in which order.
 */

/** Recognizable router call embedded in routed leg results. */
export const MOCK_ROUTER_CALL: MultiCall = {
  target: "0x9999999999999999999999999999999999999999" as Address,
  callData: "0x",
};

/** Returned by the `getRWAWrapCalls` mock; passes through per wrap op. */
export const MOCK_RWA_WRAP_CALL: MultiCall = {
  target: "0x8888888888888888888888888888888888888888" as Address,
  callData: "0x",
};

/** Router-produced call for an RWA underlying → asset unwrap leg. */
export const MOCK_RWA_UNWRAP_CALL: MultiCall = {
  target: "0x7777777777777777777777777777777777777777" as Address,
  callData: "0x",
};

/** Fixture `claimableWithdrawal.claimCalls` content; echoes through claim ops. */
export const MOCK_CLAIM_CALL: MultiCall = {
  target: "0x1111111111111111111111111111111111111111" as Address,
  callData: "0x",
};

/** Fixture `requestableWithdrawal.requestCalls`; echoes through request ops. */
export const MOCK_REQUEST_CALL: MultiCall = {
  target: "0x2222222222222222222222222222222222222222" as Address,
  callData: "0x",
};

/** One sentinel call per plain encodable op type. */
export const CA_OP_CALLS = {
  addCollateral: {
    target: "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1" as Address,
    callData: "0x",
  },
  increaseDebt: {
    target: "0xd1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1" as Address,
    callData: "0x",
  },
  decreaseDebt: {
    target: "0xd2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2" as Address,
    callData: "0x",
  },
  withdrawCollateral: {
    target: "0xc1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1" as Address,
    callData: "0x",
  },
  changeQuota: {
    target: "0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2" as Address,
    callData: "0x",
  },
} as const satisfies Record<string, MultiCall>;

function echoEncodableOpCalls(
  op: EncodableCreditAccountOperation,
): MultiCall[] {
  if ("calls" in op) {
    return [...op.calls];
  }
  return [CA_OP_CALLS[op.type]];
}

export interface MockQuotaEntry {
  token: Address;
  rate: bigint;
  limit: bigint;
  totalQuoted?: bigint;
  quotaIncreaseFee?: bigint;
  isActive: boolean;
}

interface BuildMockSdkArgs {
  /** Price per token (PRICE_DECIMALS_POW-scaled), like legacy `prices`. */
  prices: Record<Address, bigint>;
  /** Token decimals; used by `tokensMeta` and the price conversion. */
  decimals: Record<Address, number>;
  /** Pool quota params (AddressMap values shape). */
  quotas: Record<Address, MockQuotaEntry>;
  liquidationThresholds: Record<Address, number>;
  maxDebt: bigint;
  /** Facade `minDebt`; defaults to 0n so debt-range checks stay opt-in. */
  minDebt?: bigint;
  /** Pool base rate in ray; feeds `borrowApyBps` of position metrics. */
  baseInterestRate?: bigint;
  /** Credit manager interest fee in Bps; feeds position metrics. */
  feeInterest?: number;
  creditManager: Address;
  creditFacade: Address;
  /** Market underlying token (`market.pool.underlying`). */
  underlying: Address;
  /** RWA markets: underlying → rwa.asset (`tokensMeta.rwaUnderlyings`). */
  rwaAssets?: Record<Address, Address>;
  /** Tokens reported as phantoms by `tokensMeta.get(...).contractType`. */
  phantoms?: Address[];
  /**
   * Redemption venues the mock compressor reports, keyed by source token. An
   * empty array stands for "this token has no delayed route"; several entries
   * stand for the ambiguous config the engine refuses.
   */
  delayed?: Record<Address, MockDelayedVenue[]>;
  /**
   * Accounts `accounts.getCreditAccountData` knows, keyed by address. What the
   * simulate layer reads on its own instead of taking a slice from the caller;
   * `accountDebt` lands as the principal with no interest or fees accrued.
   */
  creditAccounts?: CreditAccountSlice[];
}

/** One redemption venue of the mock compressor. */
export interface MockDelayedVenue {
  withdrawalPhantomToken: Address;
  /** Claim target; defaults to the market underlying. */
  underlying?: Address;
  /**
   * What the request produces. Defaults to the whole `amount` as a delayed
   * output on the phantom token, i.e. a venue with no instant liquidity.
   */
  outputs?: (amount: bigint) => Array<{
    token: Address;
    amount: bigint;
    isDelayed: boolean;
  }>;
  /** Unix seconds reported as `claimableAt`. */
  claimableAt?: bigint;
}

/**
 * Mock `OnchainSDK` covering exactly what the intent-service touches:
 * price conversion, quota params, CM/facade lookup and call assembly.
 * Conversion mirrors the legacy price-based math:
 * `amount * price[from] * 10^dec(to) / (price[to] * 10^dec(from))`.
 */
export function buildMockSdk(args: BuildMockSdkArgs): OnchainSDK {
  const decimalsOf = (token: Address): number =>
    args.decimals[token.toLowerCase() as Address] ?? 18;

  const convert = (token: Address, to: Address, amount: bigint): bigint => {
    const from = token.toLowerCase() as Address;
    const target = to.toLowerCase() as Address;
    const fromPrice = args.prices[from];
    const toPrice = args.prices[target];
    if (fromPrice === undefined || toPrice === undefined) {
      throw new Error(
        `mock priceOracle: missing price for ${from} or ${target}`,
      );
    }
    return (
      (amount * fromPrice * 10n ** BigInt(decimalsOf(target))) /
      (toPrice * 10n ** BigInt(decimalsOf(from)))
    );
  };

  const quotas = {
    values: () =>
      Object.values(args.quotas).map(q => ({
        cumulativeIndexLU: 0n,
        totalQuoted: 0n,
        quotaIncreaseFee: 0n,
        ...q,
      })),
  };

  const quotaOf = (token: Address): MockQuotaEntry | undefined =>
    args.quotas[token.toLowerCase() as Address] ?? args.quotas[token];

  const priceOf = (token: Address) => {
    const price =
      args.prices[token.toLowerCase() as Address] ?? args.prices[token];
    return price === undefined ? undefined : { success: true, price };
  };

  const liquidationThresholds = {
    entries: () => Object.entries(args.liquidationThresholds),
    get: (token: Address) =>
      args.liquidationThresholds[token.toLowerCase() as Address] ??
      args.liquidationThresholds[token],
  };

  const market = {
    priceOracle: { convert, mainPrices: { get: priceOf } },
    pool: {
      pqk: {
        quotas,
        quotaRate: (token: Address) => Number(quotaOf(token)?.rate ?? 0n),
        hasActiveQuota: (token: Address) => {
          const q = quotaOf(token);
          return !!q?.isActive && q.limit > 0n;
        },
      },
      pool: { baseInterestRate: args.baseInterestRate ?? 0n },
      underlying: args.underlying,
    },
  };

  const creditManagerSuite = {
    creditManager: {
      address: args.creditManager,
      liquidationThresholds,
      collateralTokens: [],
      feeInterest: args.feeInterest ?? 0,
    },
    creditFacade: {
      address: args.creditFacade,
      maxDebt: args.maxDebt,
      minDebt: args.minDebt ?? 0n,
    },
  };

  const routeCalls = (tokenIn: Address, tokenOut: Address): MultiCall[] => {
    const underlying = args.underlying.toLowerCase();
    const asset =
      args.rwaAssets?.[args.underlying.toLowerCase() as Address]?.toLowerCase();
    const from = tokenIn.toLowerCase();
    const to = tokenOut.toLowerCase();
    if (asset && from === asset && to === underlying) {
      return [MOCK_RWA_WRAP_CALL];
    }
    if (asset && from === underlying && to === asset) {
      return [MOCK_RWA_UNWRAP_CALL];
    }
    return [MOCK_ROUTER_CALL];
  };

  const router = {
    findOneTokenPath: vi.fn(
      async ({
        amount,
        tokenIn,
        tokenOut,
      }: {
        amount: bigint;
        tokenIn: Address;
        tokenOut: Address;
      }) => ({
        amount,
        minAmount: amount,
        calls: routeCalls(tokenIn, tokenOut),
      }),
    ),
    findManyToOnePath: vi.fn(
      async ({
        expectedBalances,
        leftoverBalances,
        target,
      }: {
        expectedBalances: Array<{ token: Address; balance: bigint }>;
        leftoverBalances: Array<{ token: Address; balance: bigint }>;
        target: Address;
      }) => {
        const spent =
          expectedBalances.reduce((acc, a) => acc + a.balance, 0n) -
          leftoverBalances.reduce((acc, a) => acc + a.balance, 0n);
        const tokenIn = expectedBalances[0]?.token ?? target;
        return {
          amount: spent,
          minAmount: spent,
          calls: routeCalls(tokenIn, target),
        };
      },
    ),
    findOpenStrategyPath: vi.fn(
      async ({
        expectedBalances,
        leftoverBalances,
        target,
      }: {
        expectedBalances: Array<{ token: Address; balance: bigint }>;
        leftoverBalances: Array<{ token: Address; balance: bigint }>;
        target: Address;
      }) => {
        const targetLc = target.toLowerCase() as Address;
        const leftover = new Map(
          leftoverBalances.map(a => [
            a.token.toLowerCase() as Address,
            a.balance,
          ]),
        );

        // Mirrors `balancesAfterOpen`: everything above its leftover is routed
        // into the target, the target's own balance is left alone, and the
        // conversion goes through the oracle so decimals stay honest.
        const balances: Record<Address, bigint> = {};
        let amount = 0n;
        for (const a of expectedBalances) {
          const token = a.token.toLowerCase() as Address;
          if (token === targetLc) {
            balances[token] = (balances[token] ?? 0n) + a.balance;
            continue;
          }
          const keep = leftover.get(token) ?? 0n;
          const spend = a.balance > keep ? a.balance - keep : 0n;
          balances[token] = a.balance - spend;
          amount += convert(token, targetLc, spend);
        }
        balances[targetLc] = (balances[targetLc] ?? 0n) + amount;

        return {
          amount,
          minAmount: amount,
          balances,
          minBalances: { ...balances },
          calls: [MOCK_ROUTER_CALL],
        };
      },
    ),
  };

  const phantoms = new Set(
    (args.phantoms ?? []).map(t => t.toLowerCase() as Address),
  );

  const venuesOf = (token: Address): MockDelayedVenue[] =>
    args.delayed?.[token.toLowerCase() as Address] ?? [];

  const withdrawalCompressor = args.delayed
    ? {
        findWithdrawableAssets: vi.fn(
          async (creditManager: Address, token: Address) =>
            venuesOf(token).map(v => ({
              creditManager,
              token,
              withdrawalPhantomToken: v.withdrawalPhantomToken,
              underlying: v.underlying ?? args.underlying,
              withdrawalLength: 172_800n,
            })),
        ),
      }
    : undefined;

  const previewDelayedWithdrawal = vi.fn(
    async ({
      token,
      amount,
      withdrawalPhantomToken,
    }: {
      token: Address;
      amount: bigint;
      withdrawalPhantomToken?: Address;
    }) => {
      const venue =
        venuesOf(token).find(
          v => v.withdrawalPhantomToken === withdrawalPhantomToken,
        ) ?? venuesOf(token)[0];
      if (!venue) {
        throw new Error(`mock compressor: ${token} has no delayed route`);
      }
      return {
        token,
        amountIn: amount,
        outputs: venue.outputs?.(amount) ?? [
          {
            token: venue.withdrawalPhantomToken,
            amount,
            isDelayed: true,
          },
        ],
        requestCalls: [MOCK_REQUEST_CALL],
        claimableAt: venue.claimableAt ?? 172_800n,
      };
    },
  );

  return {
    withdrawalCompressor,
    tokensMeta: {
      get: (token: Address) => ({
        decimals: decimalsOf(token),
        contractType: phantoms.has(token.toLowerCase() as Address)
          ? "PHANTOM_TOKEN::SECURITIZE_RD"
          : undefined,
      }),
      rwaUnderlyings: {
        get: (token: Address) => {
          const asset = args.rwaAssets?.[token.toLowerCase() as Address];
          return asset ? { asset } : undefined;
        },
      },
    },
    marketRegister: {
      findByCreditManager: vi.fn(() => market),
      findCreditManager: vi.fn(() => creditManagerSuite),
    },
    routerFor: vi.fn(() => router),
    accounts: {
      getCreditAccountData: vi.fn(
        async (
          address: Address,
        ): Promise<CreditAccountDataPayload | undefined> => {
          const slice = args.creditAccounts?.find(
            ca => ca.creditAccount.toLowerCase() === address.toLowerCase(),
          );
          return slice ? payloadOf(slice) : undefined;
        },
      ),
      assembleCaOperations: vi.fn(
        ({ operations }: { operations: EncodableCreditAccountOperation[] }) =>
          operations.flatMap(echoEncodableOpCalls),
      ),
      prepareIncreaseDebt: vi.fn(() => CA_OP_CALLS.increaseDebt),
      prepareChangeDebt: vi.fn(() => CA_OP_CALLS.decreaseDebt),
      prepareAddCollateral: vi.fn(() => [CA_OP_CALLS.addCollateral]),
      prepareWithdrawToken: vi.fn(() => CA_OP_CALLS.withdrawCollateral),
      prepareUpdateQuotas: vi.fn(() => [CA_OP_CALLS.changeQuota]),
      assembleRWAWrapCalls: vi.fn(async () => [MOCK_RWA_WRAP_CALL]),
      assembleRWAUnwrapCalls: vi.fn(async () => [MOCK_RWA_UNWRAP_CALL]),
      previewDelayedWithdrawal,
      assembleStartDelayedWithdrawalCalls: vi.fn(
        ({ preview }: { preview: { requestCalls: MultiCall[] } }) => [
          ...preview.requestCalls,
        ],
      ),
      assembleClaimDelayedCalls: vi.fn(
        ({ claimableNow }: { claimableNow: { claimCalls: MultiCall[] } }) => [
          ...claimableNow.claimCalls,
        ],
      ),
    },
  } as unknown as OnchainSDK;
}

/** A full account payload carrying exactly what the slice builder reads back. */
function payloadOf(slice: CreditAccountSlice): CreditAccountDataPayload {
  return {
    creditAccount: slice.creditAccount,
    creditManager: slice.creditManager,
    creditFacade: slice.creditFacade,
    underlying: slice.underlying,
    owner: slice.creditAccount,
    expirationDate: 0,
    enabledTokensMask: slice.enabledTokensMask,
    debt: slice.accountDebt,
    accruedInterest: 0n,
    accruedFees: 0n,
    totalDebtUSD: slice.totalDebtUSD,
    totalValueUSD: 0n,
    twvUSD: 0n,
    totalValue: 0n,
    healthFactor: 0n,
    success: true,
    tokens: slice.tokens,
  };
}
