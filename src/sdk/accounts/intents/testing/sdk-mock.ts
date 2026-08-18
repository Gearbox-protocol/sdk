import type { Address } from "viem";
import { vi } from "vitest";
import type {
  EncodableCreditAccountOperation,
  MultiCall,
  OnchainSDK,
} from "../../../index.js";

/**
 * Test kit for intent-service specs.
 *
 * The service resolves all market data through `OnchainSDK`
 * (`marketRegister`, `tokensMeta`, `accounts`). `buildMockSdk` builds a mock
 * from plain records; assemble mocks ECHO recognizable sentinel calls derived
 * from their inputs, so `result.instant.calls` pins down which ops reached the
 * assembler and in which order.
 */

/** Fixture `claimableWithdrawal.claimCalls` content; echoes through claim ops. */
export const MOCK_CLAIM_CALL: MultiCall = {
  target: "0x1111111111111111111111111111111111111111" as Address,
  callData: "0x",
};

/** Recognizable router call embedded in close path results. */
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

/** Returned by the `assembleCloseCreditAccountCalls` mock. */
export const MOCK_CLOSE_CALL: MultiCall = {
  target: "0x5555555555555555555555555555555555555555" as Address,
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
  /**
   * Close resume: router `findBestClosePath` result. When set, the mock
   * provides `routerFor` and `assembleCloseCreditAccountCalls`.
   */
  closePath?: {
    amount: bigint;
    minAmount: bigint;
    underlyingBalance: bigint;
    calls: MultiCall[];
  };
  /** RWA markets: underlying → rwa.asset (`tokensMeta.rwaUnderlyings`). */
  rwaAssets?: Record<Address, Address>;
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

  const liquidationThresholds = {
    entries: () => Object.entries(args.liquidationThresholds),
    get: (token: Address) =>
      args.liquidationThresholds[token.toLowerCase() as Address] ??
      args.liquidationThresholds[token],
  };

  const market = {
    priceOracle: {
      convert,
      convertToUSD: (token: Address, amount: bigint) => {
        const from = token.toLowerCase() as Address;
        const price = args.prices[from] ?? args.prices[token];
        if (price === undefined) {
          throw new Error(`mock priceOracle: missing price for ${from}`);
        }
        return (amount * price) / 10n ** BigInt(decimalsOf(from));
      },
    },
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
    findBestClosePath: vi.fn(async () => {
      if (!args.closePath) {
        throw new Error("mock router: closePath not configured");
      }
      return args.closePath;
    }),
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
      }: {
        expectedBalances: Array<{ balance: bigint }>;
        leftoverBalances: Array<{ balance: bigint }>;
      }) => {
        const spent =
          expectedBalances.reduce((acc, a) => acc + a.balance, 0n) -
          leftoverBalances.reduce((acc, a) => acc + a.balance, 0n);
        return {
          amount: spent,
          minAmount: spent,
          calls: [MOCK_ROUTER_CALL],
          minAssets: [],
          averageAssets: [],
        };
      },
    ),
  };

  return {
    tokensMeta: {
      get: (token: Address) => ({ decimals: decimalsOf(token) }),
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
      assembleCaOperations: vi.fn(
        ({ operations }: { operations: EncodableCreditAccountOperation[] }) =>
          operations.flatMap(echoEncodableOpCalls),
      ),
      prepareIncreaseDebt: vi.fn(() => CA_OP_CALLS.increaseDebt),
      prepareChangeDebt: vi.fn(() => CA_OP_CALLS.decreaseDebt),
      prepareAddCollateral: vi.fn(() => [CA_OP_CALLS.addCollateral]),
      prepareWithdrawToken: vi.fn(() => CA_OP_CALLS.withdrawCollateral),
      prepareUpdateQuotas: vi.fn(() => [CA_OP_CALLS.changeQuota]),
      assembleClaimDelayedCalls: vi.fn(
        ({ claimableNow }: { claimableNow: { claimCalls: MultiCall[] } }) => [
          ...claimableNow.claimCalls,
        ],
      ),
      assembleCloseCreditAccountCalls: vi.fn(async () => [MOCK_CLOSE_CALL]),
      assembleRWAWrapCalls: vi.fn(async () => [MOCK_RWA_WRAP_CALL]),
      assembleRWAUnwrapCalls: vi.fn(async () => [MOCK_RWA_UNWRAP_CALL]),
    },
  } as unknown as OnchainSDK;
}
