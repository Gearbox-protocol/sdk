import { createPublicClient, custom, getAddress, stringToHex } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";
import type { PoolState } from "../../base/index.js";
import { ChainContractsRegister } from "../../base/index.js";
import { RAY } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { PoolV310Contract } from "./PoolV310Contract.js";

const POOL = getAddress("0x1111111111111111111111111111111111111111");
const UNDERLYING = getAddress("0x2222222222222222222222222222222222222222");

/** A share worth 1.1 underlying, so the two directions cannot be confused. */
const DIESEL_RATE = (11n * RAY) / 10n;

function makePool(over: { dieselRate?: bigint; withdrawFee?: bigint } = {}) {
  const register = new ChainContractsRegister(
    createPublicClient({
      chain: mainnet,
      transport: custom({
        request: async () => {
          throw new Error("not implemented");
        },
      }),
    }),
  );
  return new PoolV310Contract(
    { register } as unknown as OnchainSDK,
    {
      baseParams: {
        addr: POOL,
        version: 310n,
        contractType: stringToHex("POOL", { size: 32 }),
        serializedParams: "0x",
      },
      name: "Test Pool",
      symbol: "dUND",
      decimals: 18,
      underlying: UNDERLYING,
      dieselRate: over.dieselRate ?? DIESEL_RATE,
      withdrawFee: over.withdrawFee ?? 0n,
      creditManagerDebtParams: [],
    } as unknown as PoolState,
  );
}

describe("PoolV310Contract.sharesToUnderlying", () => {
  it("values shares at the pool's rate, as a position is valued", () => {
    expect(makePool().sharesToUnderlying(120n)).toBe(132n);
  });

  it("leaves the withdrawal fee alone: this values shares, it does not redeem them", () => {
    expect(makePool({ withdrawFee: 100n }).sharesToUnderlying(120n)).toBe(132n);
  });

  it("values nothing at nothing, on a pool that has no rate yet", () => {
    const empty = makePool({ dieselRate: 0n });

    expect(empty.sharesToUnderlying(0n)).toBe(0n);
    expect(empty.sharesToUnderlying(100n)).toBe(100n);
  });
});

describe("PoolV310Contract.underlyingToShares", () => {
  it("rounds down as previewDeposit", () => {
    expect(makePool().underlyingToShares(100n)).toBe(90n);
  });

  it("rounds up when asked, as previewWithdraw's conversion", () => {
    expect(makePool().underlyingToShares(100n, true)).toBe(91n);
  });

  it("mints one-for-one into an empty pool", () => {
    const empty = makePool({ dieselRate: 0n });

    expect(empty.underlyingToShares(100n)).toBe(100n);
    expect(empty.underlyingToShares(100n, true)).toBe(100n);
  });

  it("does not take the withdrawal fee off the conversion", () => {
    expect(makePool({ withdrawFee: 100n }).underlyingToShares(100n)).toBe(90n);
    expect(makePool({ withdrawFee: 100n }).underlyingToShares(100n, true)).toBe(
      91n,
    );
  });
});
