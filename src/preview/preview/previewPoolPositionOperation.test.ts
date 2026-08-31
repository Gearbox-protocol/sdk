import { type Address, getAddress, isAddressEqual, padHex } from "viem";
import { describe, expect, it } from "vitest";
import type { Curator, UnderlyingToken } from "../../model/index.js";
import { type OnchainSDK, RAY } from "../../onchain/index.js";
import type {
  PoolDepositOperation,
  PoolOperation,
  PoolRedeemOperation,
  PoolWithdrawOperation,
} from "../parse/index.js";
import { previewPoolPositionOperation } from "./previewPoolPositionOperation.js";

const addr = (hex: string): Address =>
  getAddress(padHex(hex as Address, { size: 20 }));

const RECEIVER = addr("0xc1");
const OWNER = addr("0x0e");
const POOL = addr("0x90");
const UNDERLYING = addr("0xde");
const DC_USDC = addr("0xdc");
const USDC = addr("0xa0");
const WETH = addr("0xee");
const ZAPPER = addr("0x2a");
const FARM_TOKEN = addr("0xfa");

const CURATOR: Curator = {
  address: addr("0xc0"),
  name: undefined,
  url: null,
};

interface PreviewCall {
  address: Address;
  functionName: string;
  args: readonly unknown[];
}

interface MulticallParams {
  contracts: PreviewCall[];
}

interface FakeMarketArgs {
  dieselRate?: bigint;
  underlying?: Address;
  unwrappedUnderlying?: Address;
}

function underlyingTokenOf(
  unwrapped: Address,
  wrapped: Address,
): UnderlyingToken {
  const isRwa = unwrapped.toLowerCase() !== wrapped.toLowerCase();
  return {
    chainId: 1,
    address: unwrapped,
    symbol: isRwa ? "USDC" : "UND",
    name: isRwa ? "USD Coin" : "Underlying",
    decimals: isRwa ? 6 : 18,
    wrappedAddress: isRwa ? wrapped : null,
  };
}

function fakeMarket(args: FakeMarketArgs = {}) {
  const underlying = args.underlying ?? UNDERLYING;
  const unwrappedUnderlying = args.unwrappedUnderlying ?? underlying;
  const dieselRate = args.dieselRate ?? RAY;
  const underlyingToken = underlyingTokenOf(unwrappedUnderlying, underlying);
  const sharesToUnderlying = (shares: bigint) =>
    dieselRate === 0n ? shares : (shares * dieselRate) / RAY;

  return {
    underlying,
    unwrappedUnderlying,
    underlyingToken,
    curator: CURATOR,
    isUnderlyingLike: (token: Address) =>
      isAddressEqual(token, underlying) ||
      isAddressEqual(token, unwrappedUnderlying),
    pool: { pool: { dieselRate, sharesToUnderlying } },
    priceOracle: {
      toTokenAmount: (token: Address, value: bigint) => ({
        token: {
          chainId: 1,
          address: token,
          symbol: "T",
          name: "Token",
          decimals: 18,
        },
        value,
        valueUsd: null,
      }),
    },
    toUnderlyingAmount: (value: bigint) => ({
      token: underlyingToken,
      value,
      valueUsd: null,
    }),
  };
}

interface FakeSdkArgs {
  previewAmount: bigint;
  shares: bigint;
  market?: ReturnType<typeof fakeMarket>;
}

function fakeSdk(args: FakeSdkArgs): {
  sdk: OnchainSDK;
  calls: PreviewCall[];
} {
  const calls: PreviewCall[] = [];
  const market = args.market ?? fakeMarket();
  const sdk = {
    client: {
      multicall: async (params: MulticallParams) => {
        calls.push(...params.contracts);
        return params.contracts.map(c =>
          c.functionName === "balanceOf" ? args.shares : args.previewAmount,
        );
      },
    },
    marketRegister: { findByPool: () => market },
    tokensMeta: {
      mustGetToken: () => ({
        chainId: 1,
        address: POOL,
        symbol: "dUND",
        name: "Test Pool",
        decimals: 18,
      }),
    },
  } as unknown as OnchainSDK;
  return { sdk, calls };
}

async function preview(operation: PoolOperation, args: FakeSdkArgs) {
  const { sdk, calls } = fakeSdk(args);
  const answer = await previewPoolPositionOperation(
    {
      sdk,
      to: operation.zapper ?? operation.pool,
      calldata: "0x",
      sender: OWNER,
    },
    operation,
  );
  return { answer, calls };
}

function deposit(
  over: Partial<PoolDepositOperation> = {},
): PoolDepositOperation {
  return {
    operation: "Deposit",
    pool: POOL,
    receiver: RECEIVER,
    assets: 10n,
    underlying: UNDERLYING,
    tokenIn: UNDERLYING,
    tokenOut: POOL,
    zapper: undefined,
    ...over,
  };
}

function withdraw(
  over: Partial<PoolWithdrawOperation> = {},
): PoolWithdrawOperation {
  return {
    operation: "Withdraw",
    pool: POOL,
    receiver: RECEIVER,
    owner: OWNER,
    assets: 1n,
    underlying: UNDERLYING,
    tokenIn: POOL,
    tokenOut: UNDERLYING,
    zapper: undefined,
    ...over,
  };
}

function redeem(
  over: Partial<PoolRedeemOperation> = {},
): PoolRedeemOperation {
  return {
    operation: "Redeem",
    pool: POOL,
    receiver: RECEIVER,
    owner: OWNER,
    shares: 10n,
    underlying: UNDERLYING,
    tokenIn: POOL,
    tokenOut: UNDERLYING,
    zapper: undefined,
    ...over,
  };
}

describe("previewPoolPositionOperation", () => {
  it("deposit: current 1 + 10 = 11, in unwrapped underlying", async () => {
    const { answer, calls } = await preview(deposit(), {
      previewAmount: 10n,
      shares: 1n,
    });

    expect(answer).toMatchObject({
      ok: true,
      data: {
        operation: "Deposit",
        curator: CURATOR,
        netValue: {
          value: 11n,
          token: expect.objectContaining({ address: UNDERLYING }),
        },
        tokenIn: { value: 10n },
        tokenOut: { value: 10n },
      },
    });
    expect(calls).toEqual([
      expect.objectContaining({
        address: POOL,
        functionName: "previewDeposit",
        args: [10n],
      }),
      expect.objectContaining({
        address: POOL,
        functionName: "balanceOf",
        args: [RECEIVER],
      }),
    ]);
  });

  it("withdraw: current 11 − 1 = 10", async () => {
    const { answer, calls } = await preview(withdraw(), {
      previewAmount: 1n,
      shares: 11n,
    });

    expect(answer).toMatchObject({
      ok: true,
      data: {
        operation: "Withdraw",
        curator: CURATOR,
        netValue: { value: 10n },
      },
    });
    expect(calls).toEqual([
      expect.objectContaining({
        address: POOL,
        functionName: "previewWithdraw",
        args: [1n],
      }),
      expect.objectContaining({
        address: POOL,
        functionName: "balanceOf",
        args: [OWNER],
      }),
    ]);
  });

  it("RWA names USDC, not dcUSDC, and carries the market curator", async () => {
    const market = fakeMarket({
      underlying: DC_USDC,
      unwrappedUnderlying: USDC,
    });
    const { answer } = await preview(
      deposit({ underlying: DC_USDC, tokenIn: USDC, zapper: ZAPPER }),
      { previewAmount: 10n, shares: 1n, market },
    );

    expect(answer.ok).toBe(true);
    if (!answer.ok) return;
    expect(answer.data.curator).toEqual(CURATOR);
    expect(answer.data.netValue).toEqual({
      token: market.underlyingToken,
      value: 11n,
      valueUsd: null,
    });
    expect(answer.data.netValue.token.address).toBe(USDC);
    expect(answer.data.netValue.token.symbol).toBe("USDC");
    expect(
      "wrappedAddress" in answer.data.netValue.token &&
        answer.data.netValue.token.wrappedAddress,
    ).toBe(DC_USDC);
  });

  it("first deposit (balanceOf = 0) leaves netValue equal to remaining-share worth", async () => {
    const { answer } = await preview(deposit({ assets: 10n }), {
      previewAmount: 10n,
      shares: 0n,
    });

    expect(answer).toMatchObject({
      ok: true,
      data: { netValue: { value: 10n } },
    });
  });

  it("deposit remaining netValue is remaining-share worth, not the asset delta", async () => {
    const dieselRate = (11n * RAY) / 10n;
    const { answer } = await preview(deposit({ assets: 100n }), {
      previewAmount: 90n,
      shares: 0n,
      market: fakeMarket({ dieselRate }),
    });

    expect(answer).toMatchObject({
      ok: true,
      data: { netValue: { value: 99n } },
    });
  });

  it("non-underlying zapper deposit converts minted shares through dieselRate", async () => {
    const { answer } = await preview(
      deposit({
        assets: 1_000n,
        tokenIn: WETH,
        tokenOut: FARM_TOKEN,
        zapper: ZAPPER,
      }),
      { previewAmount: 10n, shares: 1n },
    );

    expect(answer).toMatchObject({
      ok: true,
      // current 1 + minted 10 (not the 1000 WETH zapper input)
      data: { netValue: { value: 11n } },
    });
  });

  it("redeem remaining netValue ignores withdrawFee; tokenOut carries it", async () => {
    const { answer } = await preview(redeem({ shares: 10n }), {
      // previewRedeem after a 1% fee: 10 shares would be worth 10, pays 9
      previewAmount: 9n,
      shares: 100n,
    });

    expect(answer).toMatchObject({
      ok: true,
      data: {
        netValue: { value: 90n },
        tokenIn: { value: 10n },
        tokenOut: { value: 9n },
      },
    });
  });

  it("clamps an oversize withdraw at 0", async () => {
    const { answer } = await preview(withdraw({ assets: 20n }), {
      previewAmount: 20n,
      shares: 5n,
    });

    expect(answer).toMatchObject({
      ok: true,
      data: { netValue: { value: 0n } },
    });
  });

  it("propagates a simulation failure without assembling a preview", async () => {
    const sdk = {
      client: {
        multicall: async () => {
          throw new Error("boom");
        },
      },
      marketRegister: { findByPool: () => fakeMarket() },
      tokensMeta: { mustGetToken: () => ({ name: "Test Pool" }) },
    } as unknown as OnchainSDK;

    const answer = await previewPoolPositionOperation(
      { sdk, to: POOL, calldata: "0x", sender: OWNER },
      deposit(),
    );

    expect(answer).toMatchObject({
      ok: false,
      error: { code: "previewSimulationFailed" },
    });
  });
});
