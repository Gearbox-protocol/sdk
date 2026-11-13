import { type Address, isAddressEqual } from "viem";
import { describe, expect, it, vi } from "vitest";
import type { CreditAccountData } from "../base/index.js";
import { MAX_UINT256 } from "../constants/math.js";
import { AaveHorizonBridgeAdapterContract } from "../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import { AaveV3PoolAdapterContract } from "../market/adapters/contracts/AaveV3PoolAdapterContract.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { readAavePosition } from "./readAavePosition.js";

const CREDIT_MANAGER = "0x0000000000000000000000000000000000000c00" as Address;
const CREDIT_ACCOUNT = "0x0000000000000000000000000000000000000c01" as Address;
const UND = "0x0000000000000000000000000000000000000001" as Address;
const RWA = "0x0000000000000000000000000000000000000002" as Address;
const A_RWA = "0x0000000000000000000000000000000000000003" as Address;
const WRAPPED_UND = "0x0000000000000000000000000000000000000004" as Address;
const DEBT_UND = "0x0000000000000000000000000000000000000005" as Address;
const POOL = "0x0000000000000000000000000000000000000a00" as Address;
const PROVIDER = "0x0000000000000000000000000000000000000b00" as Address;
const ORACLE = "0x0000000000000000000000000000000000000d00" as Address;
const INVESTOR = "0x0000000000000000000000000000000000000e00" as Address;
const VAULT = "0x0000000000000000000000000000000000000e01" as Address;
const BRIDGE = "0x0000000000000000000000000000000000000f00" as Address;

const decimals6 = { data: 6n << 48n };

interface AaveState {
  supplied?: bigint;
  owed?: bigint;
  /** `getUserAccountData`: collateral, debt, LT and health factor. */
  account?: [bigint, bigint, bigint, bigint];
}

function stubSdk(
  state: AaveState = {},
  adapters: unknown[] = [poolAdapter(), bridgeAdapter()],
): OnchainSDK {
  const [collateralBase, debtBase, lt, hf] = state.account ?? [
    0n,
    0n,
    0n,
    MAX_UINT256,
  ];
  const answer = (c: {
    address: Address;
    functionName: string;
    args?: readonly unknown[];
  }): unknown => {
    switch (c.functionName) {
      case "getReserveData":
        expect(c.address).toBe(POOL);
        return isAddressEqual(c.args?.[0] as Address, RWA)
          ? { configuration: decimals6, aTokenAddress: A_RWA }
          : {
              configuration: decimals6,
              variableDebtTokenAddress: DEBT_UND,
              currentVariableBorrowRate: 65n * 10n ** 24n,
            };
      case "getUserAccountData":
        expect(c.args).toEqual([INVESTOR]);
        return [collateralBase, debtBase, 0n, lt, 0n, hf];
      case "ADDRESSES_PROVIDER":
        expect(c.address).toBe(POOL);
        return PROVIDER;
      case "getPriceOracle":
        expect(c.address).toBe(PROVIDER);
        return ORACLE;
      case "getAssetsPrices":
        expect(c.address).toBe(ORACLE);
        expect(c.args).toEqual([[UND, RWA]]);
        return [100_000_000n, 105_000_000n];
      case "balanceOf":
        expect(c.args).toEqual([INVESTOR]);
        return isAddressEqual(c.address, A_RWA)
          ? (state.supplied ?? 0n)
          : (state.owed ?? 0n);
      default:
        throw new Error(`unexpected read ${c.functionName}`);
    }
  };
  const token = (address: Address) => ({
    address,
    symbol: isAddressEqual(address, RWA) ? "RWA" : "UND",
  });
  return {
    chainId: 1,
    client: {
      multicall: vi.fn(
        async ({ contracts }: { contracts: Parameters<typeof answer>[0][] }) =>
          contracts.map(answer),
      ),
      readContract: vi.fn(async (c: Parameters<typeof answer>[0]) => answer(c)),
    },
    tokensMeta: { mustGetToken: token },
    marketRegister: {
      findCreditManager: () => ({
        creditManager: { adapters: { values: () => adapters } },
        underlyingToken: token(UND),
        accountTargetCollateral: () => null,
      }),
      findByCreditManager: () => ({
        underlying: WRAPPED_UND,
        unwrappedUnderlying: UND,
        isUnderlyingLike: (t: Address) =>
          isAddressEqual(t, UND) || isAddressEqual(t, WRAPPED_UND),
        curator: { name: "curator" },
        toUnderlyingAmount: (value: bigint) => ({ value }),
        priceOracle: {
          toTokenAmount: (t: Address, value: bigint) => ({ token: t, value }),
        },
      }),
    },
  } as unknown as OnchainSDK;
}

function poolAdapter(): AaveV3PoolAdapterContract {
  return Object.create(AaveV3PoolAdapterContract.prototype, {
    targetContract: { value: POOL },
    allowedAssets: { value: [RWA, UND] },
  });
}

function bridgeAdapter(aToken = A_RWA): AaveHorizonBridgeAdapterContract {
  return Object.create(AaveHorizonBridgeAdapterContract.prototype, {
    bridge: { value: BRIDGE },
    isATokenAllowed: { value: (t: Address) => isAddressEqual(t, aToken) },
    isDebtTokenAllowed: { value: (t: Address) => isAddressEqual(t, UND) },
  });
}

/** An RWA account: owned on-chain by its vault, on Aave by its investor. */
const ca = {
  creditManager: CREDIT_MANAGER,
  creditAccount: CREDIT_ACCOUNT,
  owner: VAULT,
  investor: INVESTOR,
} as CreditAccountData<true>;

/** 1000 RWA at $1.05 supplied against 750 of a $1 underlying, both 6 decimals. */
const onAave: AaveState = {
  supplied: 1_000_000_000n,
  owed: 750_000_000n,
  account: [
    105_000_000_000n,
    75_000_000_000n,
    9000n,
    1_260_000_000_000_000_000n,
  ],
};

describe("readAavePosition", () => {
  it("shows the RWA supplied to Aave as the collateral, not its aToken, with Aave's debt, health factor and rate", async () => {
    const position = await readAavePosition(stubSdk(onAave), ca);

    expect(position).toEqual({
      kind: "aave",
      chainId: 1,
      creditManager: CREDIT_MANAGER,
      creditAccount: CREDIT_ACCOUNT,
      underlyingToken: { address: UND, symbol: "UND" },
      name: "RWA / UND",
      curator: { name: "curator" },
      targetCollateral: { address: RWA, symbol: "RWA" },
      leverage: 3.5,
      borrowApy: 650,
      totalDebt: { value: 750_000_000n },
      totalValue: { value: 1_050_000_000n },
      healthFactor: 12_600,
      // 6.5% on the debt, 650 × 750 / 1050 on the position
      borrowRate: { base: 650, totalOnDebt: 650, total: 464, quotas: [] },
      timeToLiquidation: expect.any(BigInt),
      // 750 / (1000 × 90%), in the underlying at 8 decimals
      liquidationPrice: 83_333_333n,
      collaterals: [
        {
          collateral: { token: RWA, value: 1_000_000_000n },
          quota: { token: WRAPPED_UND, value: 0n },
          withdrawals: [],
        },
      ],
      pool: POOL,
      bridge: BRIDGE,
    });
  });

  it("is undefined once the owner neither supplies nor owes anything on the pool", async () => {
    const sdk = stubSdk();

    expect(await readAavePosition(sdk, ca)).toBeUndefined();
    expect(sdk.client.readContract).not.toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "getAssetsPrices" }),
    );
  });

  it("is undefined where the credit manager has no Aave pool adapter", async () => {
    const sdk = stubSdk(onAave, [bridgeAdapter()]);

    expect(await readAavePosition(sdk, ca)).toBeUndefined();
    expect(sdk.client.multicall).not.toHaveBeenCalled();
  });

  it("is undefined where no bridge adapter takes the RWA's aToken", async () => {
    const other = "0x00000000000000000000000000000000000000ff" as Address;
    const sdk = stubSdk(onAave, [poolAdapter(), bridgeAdapter(other)]);

    expect(await readAavePosition(sdk, ca)).toBeUndefined();
  });
});
