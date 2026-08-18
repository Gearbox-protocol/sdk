import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type { MultichainSDK } from "../../sdk/index.js";
import { SimulateApi } from "./SimulateApi.js";

const CHAIN_ID = 1;
const POOL = "0x1000000000000000000000000000000000000001" as Address;
const UNDERLYING = "0x2000000000000000000000000000000000000002" as Address;
const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

/** A share worth 1.1 underlying, so the two directions cannot be confused. */
const TOTAL_SUPPLY = 1_000_000n;
const TOTAL_ASSETS = 1_100_000n;

function buildApi() {
  const pools = {
    getWithdrawalTokensOut: vi.fn(() => [UNDERLYING]),
    getWithdrawalMetadata: vi.fn(() => ({})),
    simulateWithdraw: vi.fn((props: { amount: bigint; tokenIn?: Address }) => ({
      tokenIn: { token: props.tokenIn ?? POOL, balance: props.amount },
      tokenOut: { token: UNDERLYING, balance: props.amount },
    })),
    removeLiquidity: vi.fn(() => ({ calls: [], tx: {} })),
  };
  const api = new SimulateApi({
    chain: () => ({
      pools,
      marketRegister: {
        findByPool: () => ({
          pool: {
            pool: {
              totalSupply: TOTAL_SUPPLY,
              totalAssets: TOTAL_ASSETS,
            },
          },
        }),
      },
    }),
  } as unknown as MultichainSDK);
  return { api, pools };
}

describe("SimulateApi.withdraw", () => {
  it("converts amount from tokenOut down to shares before simulateWithdraw", () => {
    const { api, pools } = buildApi();

    const result = api.withdraw(
      { chainId: CHAIN_ID, pool: POOL },
      { amount: 110n, wallet: WALLET, tokenOut: UNDERLYING },
    );

    expect(result).toMatchObject({ ok: true });
    expect(pools.simulateWithdraw).toHaveBeenCalledWith({
      pool: POOL,
      amount: 100n,
      tokenIn: POOL,
      tokenOut: UNDERLYING,
    });
    expect(pools.removeLiquidity).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 100n }),
    );
  });

  it("still defaults tokenIn to the pool when only amount is named", () => {
    const { api, pools } = buildApi();

    api.withdraw(
      { chainId: CHAIN_ID, pool: POOL },
      { amount: 110n, wallet: WALLET },
    );

    expect(pools.getWithdrawalTokensOut).toHaveBeenCalledWith(POOL, POOL);
    expect(pools.simulateWithdraw).toHaveBeenCalledWith({
      pool: POOL,
      amount: 100n,
      tokenIn: POOL,
      tokenOut: UNDERLYING,
    });
  });
});
