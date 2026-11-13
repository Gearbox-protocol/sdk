import { type Address, isAddressEqual } from "viem";
import { describe, expect, it, vi } from "vitest";
import type { WithdrawableAsset } from "../accounts/withdrawal-compressor/types.js";
import { AaveHorizonBridgeAdapterContract } from "../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import { AaveV3PoolAdapterContract } from "../market/adapters/contracts/AaveV3PoolAdapterContract.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { projectAavePosition } from "./projectAavePosition.js";
import type { AccountSnapshot } from "./types.js";

const CREDIT_MANAGER = "0x0000000000000000000000000000000000000c00" as Address;
const UND = "0x0000000000000000000000000000000000000001" as Address;
const RWA = "0x0000000000000000000000000000000000000002" as Address;
const A_RWA = "0x0000000000000000000000000000000000000003" as Address;
const POOL = "0x0000000000000000000000000000000000000a00" as Address;
const PROVIDER = "0x0000000000000000000000000000000000000b00" as Address;
const ORACLE = "0x0000000000000000000000000000000000000d00" as Address;
const OWNER = "0x0000000000000000000000000000000000000e00" as Address;
const BRIDGE = "0x0000000000000000000000000000000000000f00" as Address;

const RWA_RESERVE_ID = 3;

/** Aave's reserve configuration bitmap: LTV, liquidation threshold, decimals. */
const configuration = (ltv: bigint, lt: bigint, decimals: bigint) => ({
  data: ltv | (lt << 16n) | (decimals << 48n),
});

interface AaveState {
  wrappedUnderlying?: Address;
  /** `getUserAccountData`: collateral, debt, LT and LTV the owner has already. */
  account?: [bigint, bigint, bigint, bigint];
  eMode?: bigint;
  eModeConfig?: { ltv: number; liquidationThreshold: number };
  eModeBitmap?: bigint;
  /** The credit manager's rate on the debt while the mint settles, in bps. */
  gearboxRate?: number;
  /** What the withdrawal compressor lists for the credit manager. */
  delayed?: WithdrawableAsset[];
}

function stubSdk(
  state: AaveState = {},
  adapters: unknown[] = [poolAdapter(), bridgeAdapter()],
): OnchainSDK {
  const [collateralBase, debtBase, lt, ltv] = state.account ?? [0n, 0n, 0n, 0n];
  const answer = (c: {
    address: Address;
    functionName: string;
    args?: readonly unknown[];
  }): unknown => {
    switch (c.functionName) {
      case "getReserveData":
        return isAddressEqual(c.args?.[0] as Address, RWA)
          ? {
              configuration: configuration(8800n, 9000n, 6n),
              id: RWA_RESERVE_ID,
              aTokenAddress: A_RWA,
              currentVariableBorrowRate: 0n,
            }
          : {
              configuration: configuration(0n, 0n, 6n),
              id: 1,
              currentVariableBorrowRate: 65n * 10n ** 24n,
            };
      case "getUserAccountData":
        expect(c.args).toEqual([OWNER]);
        return [collateralBase, debtBase, 0n, lt, ltv, 0n];
      case "getUserEMode":
        return state.eMode ?? 0n;
      case "ADDRESSES_PROVIDER":
        return PROVIDER;
      case "getPriceOracle":
        expect(c.address).toBe(PROVIDER);
        return ORACLE;
      case "getAssetsPrices":
        expect(c.address).toBe(ORACLE);
        expect(c.args).toEqual([[RWA, UND]]);
        return [105_000_000n, 100_000_000n];
      case "getEModeCategoryCollateralConfig":
        return { ...state.eModeConfig, liquidationBonus: 10_100 };
      case "getEModeCategoryCollateralBitmap":
        return state.eModeBitmap ?? 0n;
      default:
        throw new Error(`unexpected read ${c.functionName}`);
    }
  };
  return {
    timestamp: 1_000n,
    withdrawalCompressor: state.delayed && {
      state: {},
      getWithdrawableAssets: (creditManager: Address) => {
        expect(creditManager).toBe(CREDIT_MANAGER);
        return state.delayed;
      },
    },
    client: {
      multicall: vi.fn(
        async ({ contracts }: { contracts: Parameters<typeof answer>[0][] }) =>
          contracts.map(c => {
            expect(c.address).toBe(POOL);
            return answer(c);
          }),
      ),
      readContract: vi.fn(async (c: Parameters<typeof answer>[0]) => answer(c)),
    },
    marketRegister: {
      findCreditManager: () => ({
        creditManager: { adapters: { values: () => adapters } },
      }),
      findByCreditManager: () => ({
        underlying: state.wrappedUnderlying ?? UND,
        unwrappedUnderlying: UND,
        toUnderlyingAmount: (value: bigint) => ({ value }),
        priceOracle: {
          toTokenAmount: (token: Address, value: bigint) => ({ token, value }),
        },
      }),
    },
    positions: {
      metrics: () => ({
        borrowRate: { totalOnDebt: state.gearboxRate ?? 0 },
      }),
    },
  } as unknown as OnchainSDK;
}

function poolAdapter(): AaveV3PoolAdapterContract {
  return Object.create(AaveV3PoolAdapterContract.prototype, {
    targetContract: { value: POOL },
    isAssetAllowed: { value: (t: Address) => isAddressEqual(t, RWA) },
  });
}

function bridgeAdapter(aToken = A_RWA): AaveHorizonBridgeAdapterContract {
  return Object.create(AaveHorizonBridgeAdapterContract.prototype, {
    bridge: { value: BRIDGE },
    isATokenAllowed: { value: (t: Address) => isAddressEqual(t, aToken) },
    isDebtTokenAllowed: { value: (t: Address) => isAddressEqual(t, UND) },
  });
}

/** 1000 RWA at $1.05 against 750 of a $1 underlying, both 6 decimals. */
const snapshot: AccountSnapshot = {
  creditManager: CREDIT_MANAGER,
  assets: [{ token: RWA, balance: 1_000_000_000n }],
  quotas: [{ token: RWA, balance: 1_000_000_000n }],
  totalDebt: 750_000_000n,
  totalValue: 1_050_000_000n,
};

describe("projectAavePosition", () => {
  it("reads the unwrapped RWA debt reserve instead of the Gearbox wrapper", async () => {
    const sdk = stubSdk({
      wrappedUnderlying: "0x0000000000000000000000000000000000000004",
    });
    const result = await projectAavePosition(sdk, snapshot, OWNER);
    expect(result).toBeDefined();
    expect(result?.aave.totalDebt.value).toBe(snapshot.totalDebt);
    expect(sdk.client.multicall).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: expect.arrayContaining([
          expect.objectContaining({
            functionName: "getReserveData",
            args: [UND],
          }),
        ]),
      }),
    );
  });

  it("weighs a wallet new to Aave at the reserve's LTV and threshold, on Aave's prices and rate", async () => {
    const projected = await projectAavePosition(stubSdk(), snapshot, OWNER);

    expect(projected?.aave).toMatchObject({
      totalValue: { value: 1_050_000_000n },
      totalDebt: { value: 750_000_000n },
      netValue: { value: 300_000_000n },
      assets: [{ token: RWA, value: 1_000_000_000n }],
      // 1050 × 90% / 750
      healthFactor: 12_600,
      // 750 / (1000 × 90%), in the underlying at 8 decimals
      liquidationPrice: 83_333_333n,
      // 6.5% on the debt, 650 × 750 / 1050 on the position
      borrowRate: { base: 650, totalOnDebt: 650, total: 464, quotas: [] },
      leverage: 3.5,
      bridge: BRIDGE,
    });
    // 1050 × 88%
    expect(projected?.maxDebt).toBe(924_000_000n);
  });

  it("counts what the wallet already holds and owes on Aave, at its eMode category's terms", async () => {
    const sdk = stubSdk({
      // $500 at 80% LT and 75% LTV, $100 owed
      account: [50_000_000_000n, 10_000_000_000n, 8000n, 7500n],
      eMode: 1n,
      eModeConfig: { ltv: 9000, liquidationThreshold: 9200 },
      eModeBitmap: 1n << BigInt(RWA_RESERVE_ID),
    });

    const projected = await projectAavePosition(sdk, snapshot, OWNER);

    // (500 × 80% + 1050 × 92%) / (100 + 750)
    expect(projected?.aave.healthFactor).toBe(16_070);
    // (850 × 1 − 500 × 80%) / (1000 × 92%)
    expect(projected?.aave.liquidationPrice).toBe(48_913_043n);
    // 500 × 75% + 1050 × 90% − 100
    expect(projected?.maxDebt).toBe(1_220_000_000n);
  });

  it("keeps the reserve's own terms where the wallet's eMode category does not list the RWA", async () => {
    const sdk = stubSdk({
      eMode: 1n,
      eModeConfig: { ltv: 9000, liquidationThreshold: 9200 },
      eModeBitmap: 1n,
    });

    const projected = await projectAavePosition(sdk, snapshot, OWNER);

    expect(projected?.aave.healthFactor).toBe(12_600);
    expect(projected?.maxDebt).toBe(924_000_000n);
  });

  it("is on Aave at once where the RWA is already on the account", async () => {
    const projected = await projectAavePosition(
      stubSdk({ gearboxRate: 1000, delayed: [] }),
      snapshot,
      OWNER,
    );

    expect(projected?.aave).toMatchObject({
      mintDuration: 0,
      mintPeriodInterest: { value: 0n },
      totalDebt: { value: 750_000_000n },
      estLiveAt: 1_000,
    });
  });

  it("waits out the delayed mint the compressor lists, the Gearbox debt accruing meanwhile", async () => {
    const PHANTOM = "0x0000000000000000000000000000000000000004" as Address;
    const sdk = stubSdk({
      gearboxRate: 1000,
      delayed: [
        {
          creditManager: CREDIT_MANAGER,
          token: UND,
          withdrawalPhantomToken: PHANTOM,
          underlying: RWA,
          withdrawalLength: 432_000n,
        },
      ],
    });
    const minting = {
      ...snapshot,
      assets: [{ token: PHANTOM, balance: 1_000_000_000n }],
    };

    const projected = await projectAavePosition(sdk, minting, OWNER);

    if (!projected) throw new Error("unreachable");
    const { mintDuration, mintPeriodInterest, totalDebt, estLiveAt, assets } =
      projected.aave;
    expect(mintDuration).toBe(432_000);
    expect(estLiveAt).toBe(1_000 + 432_000);
    expect(mintPeriodInterest.value).toBe(
      (750_000_000n * 1000n * 432_000n) / (10_000n * 365n * 24n * 3600n),
    );
    expect(totalDebt.value).toBe(750_000_000n + mintPeriodInterest.value);
    // the phantom claims into the RWA one for one, and the RWA is what Aave holds
    expect(assets).toEqual([{ token: RWA, value: 1_000_000_000n }]);
  });

  it("is undefined where no pool adapter lists an asset of the account", async () => {
    const sdk = stubSdk({}, [bridgeAdapter()]);

    expect(await projectAavePosition(sdk, snapshot, OWNER)).toBeUndefined();
    expect(sdk.client.multicall).not.toHaveBeenCalled();
  });

  it("is undefined where no bridge adapter takes the RWA's aToken", async () => {
    const other = "0x00000000000000000000000000000000000000ff" as Address;
    const sdk = stubSdk({}, [poolAdapter(), bridgeAdapter(other)]);

    expect(await projectAavePosition(sdk, snapshot, OWNER)).toBeUndefined();
  });
});
