import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type { TokenAmount } from "../../model/index.js";
import type { OnchainSDK, RawTx } from "../../onchain/index.js";
import type {
  LpSimulate,
  OpenStrategySimulate,
  StrategySimulate,
} from "../prepare/index.js";
import { ExecuteApi } from "./ExecuteApi.js";

const CHAIN_ID = 1;
const POOL = "0x1000000000000000000000000000000000000001" as Address;
const UNDERLYING = "0x2000000000000000000000000000000000000002" as Address;
const DIESEL = "0x3000000000000000000000000000000000000003" as Address;
const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;
const CREDIT_MANAGER = "0x4000000000000000000000000000000000000004" as Address;
const CREDIT_ACCOUNT = "0x5000000000000000000000000000000000000005" as Address;

const rawTx = (tag: string): RawTx => ({
  to: POOL,
  value: "0",
  signature: tag,
  callData: `0x${tag}`,
  contractMethod: { name: tag, inputs: [], payable: false },
  contractInputsValues: {},
});

const DEPOSIT_META = { type: "classic", zapper: undefined } as const;
const WITHDRAW_META = { type: "classic", zapper: undefined } as const;
const CALL = { target: POOL, callData: "0xdead" as const };

/** A priced amount of `address`, which is what the simulations report in. */
const amount = (address: Address, value: bigint): TokenAmount => ({
  token: {
    chainId: CHAIN_ID,
    address,
    symbol: "TKN",
    name: "Token",
    decimals: 18,
  },
  value,
  valueUsd: null,
});

function mockChain(overrides?: {
  addLiquidity?: unknown;
  account?: unknown;
  requirements?: unknown;
}) {
  const txs = {
    deposit: rawTx("deposit"),
    withdraw: rawTx("withdraw"),
    open: rawTx("open"),
    update: rawTx("multicall"),
  };
  const account = { creditAccount: CREDIT_ACCOUNT, tokens: [] };
  const sdk = {
    pools: {
      getDepositMetadata: vi.fn(() => DEPOSIT_META),
      getWithdrawalMetadata: vi.fn(() => WITHDRAW_META),
      addLiquidity: vi.fn(() =>
        "addLiquidity" in (overrides ?? {})
          ? overrides?.addLiquidity
          : { tx: txs.deposit, calls: [CALL] },
      ),
      removeLiquidity: vi.fn(() => ({ tx: txs.withdraw, calls: [CALL] })),
    },
    accounts: {
      openCA: vi.fn(async () => txs.open),
      getCreditAccountData: vi.fn(async () =>
        "account" in (overrides ?? {}) ? overrides?.account : account,
      ),
      executeCaUpdate: vi.fn(async () => txs.update),
      getOpenAccountRequirements: vi.fn(async () =>
        "requirements" in (overrides ?? {})
          ? overrides?.requirements
          : undefined,
      ),
    },
  };
  const execute = new ExecuteApi(() => sdk as unknown as OnchainSDK);
  return { execute, sdk, txs, account };
}

describe("buildTx — pool", () => {
  const sim: Extract<LpSimulate, { ok: true }> = {
    ok: true,
    operations: [],
    preview: {
      tokenIn: amount(UNDERLYING, 1_000n),
      tokenOut: amount(DIESEL, 990n),
    },
    calls: [],
  };

  it("deposit: metadata resolved inside, the tx is PoolService.addLiquidity's", async () => {
    const { execute, sdk, txs } = mockChain();

    const tx = await execute.buildTx({
      kind: "pool",
      chainId: CHAIN_ID,
      pool: POOL,
      wallet: WALLET,
      op: "deposit",
      sim,
    });

    expect(tx).toBe(txs.deposit);
    expect(sdk.pools.getDepositMetadata).toHaveBeenCalledWith(
      POOL,
      UNDERLYING,
      DIESEL,
    );
    expect(sdk.pools.addLiquidity).toHaveBeenCalledWith({
      pool: POOL,
      wallet: WALLET,
      collateral: {
        token: sim.preview.tokenIn.token.address,
        balance: sim.preview.tokenIn.value,
      },
      meta: DEPOSIT_META,
    });
  });

  it("withdraw: the tx is PoolService.removeLiquidity's on the underlying the sim priced", async () => {
    const { execute, sdk, txs } = mockChain();
    const withdrawSim: Extract<LpSimulate, { ok: true }> = {
      ok: true,
      operations: [],
      preview: {
        tokenIn: amount(DIESEL, 500n),
        tokenOut: amount(UNDERLYING, 505n),
      },
      calls: [],
    };

    const tx = await execute.buildTx({
      kind: "pool",
      chainId: CHAIN_ID,
      pool: POOL,
      wallet: WALLET,
      op: "withdraw",
      sim: withdrawSim,
    });

    expect(tx).toBe(txs.withdraw);
    expect(sdk.pools.getWithdrawalMetadata).toHaveBeenCalledWith(
      POOL,
      DIESEL,
      UNDERLYING,
    );
    expect(sdk.pools.removeLiquidity).toHaveBeenCalledWith({
      pool: POOL,
      wallet: WALLET,
      amount: 505n,
      permit: undefined,
      meta: WITHDRAW_META,
      mode: "withdraw",
    });
  });

  it("redeem: the tx is PoolService.removeLiquidity's on the shares the sim priced", async () => {
    const { execute, sdk, txs } = mockChain();
    const redeemSim: Extract<LpSimulate, { ok: true }> = {
      ok: true,
      operations: [],
      preview: {
        tokenIn: amount(DIESEL, 500n),
        tokenOut: amount(UNDERLYING, 505n),
      },
      calls: [],
    };

    const tx = await execute.buildTx({
      kind: "pool",
      chainId: CHAIN_ID,
      pool: POOL,
      wallet: WALLET,
      op: "redeem",
      sim: redeemSim,
    });

    expect(tx).toBe(txs.withdraw);
    expect(sdk.pools.removeLiquidity).toHaveBeenCalledWith({
      pool: POOL,
      wallet: WALLET,
      amount: 500n,
      permit: undefined,
      meta: WITHDRAW_META,
      mode: "redeem",
    });
  });

  it("an unknown route surfaces the SDK's own metadata error, no tx", async () => {
    const { execute, sdk } = mockChain();
    const boom = new Error("no deposit route");
    sdk.pools.getDepositMetadata.mockImplementation(() => {
      throw boom;
    });

    await expect(
      execute.buildTx({
        kind: "pool",
        chainId: CHAIN_ID,
        pool: POOL,
        wallet: WALLET,
        op: "deposit",
        sim,
      }),
    ).rejects.toBe(boom);
    expect(sdk.pools.addLiquidity).not.toHaveBeenCalled();
  });

  it("a pool that takes no deposit transaction (RWA on-demand) throws instead of returning nothing", async () => {
    const { execute } = mockChain({ addLiquidity: undefined });

    await expect(
      execute.buildTx({
        kind: "pool",
        chainId: CHAIN_ID,
        pool: POOL,
        wallet: WALLET,
        op: "deposit",
        sim,
      }),
    ).rejects.toThrow(/takes no deposit transaction/);
  });
});

describe("buildTx — open", () => {
  const preview = {
    creditManager: CREDIT_MANAGER,
    name: "Test CM",
    totalDebt: amount(UNDERLYING, 2_000n),
    netValue: amount(UNDERLYING, 1_000n),
    totalValue: amount(UNDERLYING, 3_000n),
    leverage: 3,
    safeHealthFactor: 0,
    priceImpact: undefined,
    averageAssets: [],
    minAssets: [],
    averageQuota: [{ token: DIESEL, balance: 3_000n }],
    minQuota: [{ token: DIESEL, balance: 2_900n }],
    calls: [CALL],
    healthFactor: 0,
    borrowRate: { total: 0, totalOnDebt: 0, base: 0, quotas: [] },
    timeToLiquidation: null,
    liquidationPrice: null,
  };
  const sim: Extract<OpenStrategySimulate, { ok: true }> = {
    ok: true,
    preview,
  };
  const collateral = [{ token: UNDERLYING, balance: 1_000n }];

  it("hands the preview's debt, path and quotas to openCA, with the wallet's collateral", async () => {
    const { execute, sdk, txs } = mockChain();

    const tx = await execute.buildTx({
      kind: "open",
      chainId: CHAIN_ID,
      creditManager: CREDIT_MANAGER,
      wallet: WALLET,
      sim,
      collateral,
      ethAmount: 0n,
    });

    expect(tx).toBe(txs.open);
    expect(sdk.accounts.openCA).toHaveBeenCalledWith({
      creditManager: CREDIT_MANAGER,
      to: WALLET,
      collateral,
      ethAmount: 0n,
      debt: preview.totalDebt.value,
      calls: preview.calls,
      averageQuota: preview.averageQuota,
      minQuota: preview.minQuota,
      permits: {},
      referralCode: 0n,
    });
  });

  it("throws on a failed simulation", async () => {
    const { execute, sdk } = mockChain();

    await expect(
      execute.buildTx({
        kind: "open",
        chainId: CHAIN_ID,
        creditManager: CREDIT_MANAGER,
        wallet: WALLET,
        sim: { ok: false, reason: "debtOutOfRange" } as never,
        collateral,
        ethAmount: 0n,
      }),
    ).rejects.toThrow(/failed open simulation/);
    expect(sdk.accounts.openCA).not.toHaveBeenCalled();
  });

  it("attaches RWA requirements and the caller's cached signatures when a target token is named", async () => {
    const requirements = {
      type: "RWA_FACTORY::SECURITIZE",
      tokensToRegister: [DIESEL],
      securitizeTokensToRegister: [],
      requiredSignatures: [],
    };
    const { execute, sdk } = mockChain({ requirements });
    const signature = {
      token: DIESEL,
      signature: { deadline: 1n, signature: "0xsign" as const },
    };

    await execute.buildTx({
      kind: "open",
      chainId: CHAIN_ID,
      creditManager: CREDIT_MANAGER,
      wallet: WALLET,
      sim,
      collateral,
      ethAmount: 0n,
      targetToken: DIESEL,
      signaturesToCache: [signature],
    });

    expect(sdk.accounts.getOpenAccountRequirements).toHaveBeenCalledWith(
      WALLET,
      CREDIT_MANAGER,
      { tokenOutAddress: DIESEL },
    );
    expect(sdk.accounts.openCA).toHaveBeenCalledWith(
      expect.objectContaining({
        rwaOptions: {
          type: "RWA_FACTORY::SECURITIZE",
          tokensToRegister: [DIESEL],
          signaturesToCache: [signature],
        },
      }),
    );
  });

  it("asks for requirements but passes no rwaOptions when the market is not RWA-gated", async () => {
    const { execute, sdk } = mockChain();

    await execute.buildTx({
      kind: "open",
      chainId: CHAIN_ID,
      creditManager: CREDIT_MANAGER,
      wallet: WALLET,
      sim,
      collateral,
      ethAmount: 0n,
      targetToken: DIESEL,
    });

    expect(sdk.accounts.getOpenAccountRequirements).toHaveBeenCalled();
    expect(sdk.accounts.openCA).toHaveBeenCalledWith(
      expect.objectContaining({ rwaOptions: undefined }),
    );
  });

  it("skips the requirements call without a target token", async () => {
    const { execute, sdk } = mockChain();

    await execute.buildTx({
      kind: "open",
      chainId: CHAIN_ID,
      creditManager: CREDIT_MANAGER,
      wallet: WALLET,
      sim,
      collateral,
      ethAmount: 0n,
    });

    expect(sdk.accounts.getOpenAccountRequirements).not.toHaveBeenCalled();
  });
});

describe("buildTx — account", () => {
  const sim: Extract<StrategySimulate, { ok: true }> = {
    ok: true,
    operations: [],
    preview: {
      creditManager: CREDIT_MANAGER,
      name: "Test CM",
      totalValue: amount(UNDERLYING, 3_000n),
      totalDebt: amount(UNDERLYING, 2_000n),
      netValue: amount(UNDERLYING, 1_000n),
      leverage: 2,
      assets: [],
      quotas: [],
      priceImpact: undefined,
      healthFactor: 0,
      borrowRate: { total: 0, totalOnDebt: 0, base: 0, quotas: [] },
      timeToLiquidation: null,
      liquidationPrice: null,
    },
    calls: [CALL, { target: POOL, callData: "0xbeef" }],
  };

  it("submits the simulation's own multicall through executeCaUpdate on the re-read account", async () => {
    const { execute, sdk, txs, account } = mockChain();

    const tx = await execute.buildTx({
      kind: "account",
      chainId: CHAIN_ID,
      creditAccount: CREDIT_ACCOUNT,
      wallet: WALLET,
      sim,
    });

    expect(tx).toBe(txs.update);
    expect(sdk.accounts.getCreditAccountData).toHaveBeenCalledWith(
      CREDIT_ACCOUNT,
    );
    expect(sdk.accounts.executeCaUpdate).toHaveBeenCalledWith(
      account,
      sim.calls,
      { ethAmount: 0n },
    );
  });

  it("attaches the native value the collateral step recorded", async () => {
    const { execute, sdk, account } = mockChain();

    await execute.buildTx({
      kind: "account",
      chainId: CHAIN_ID,
      creditAccount: CREDIT_ACCOUNT,
      wallet: WALLET,
      sim: {
        ...sim,
        operations: [
          {
            type: "addCollateral",
            token: POOL,
            amount: 1_000n,
            value: 1_000n,
            calls: [CALL],
          },
        ],
      },
    });

    expect(sdk.accounts.executeCaUpdate).toHaveBeenCalledWith(
      account,
      sim.calls,
      { ethAmount: 1_000n },
    );
  });

  it("throws when the account is gone", async () => {
    const { execute } = mockChain({ account: undefined });

    await expect(
      execute.buildTx({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount: CREDIT_ACCOUNT,
        wallet: WALLET,
        sim,
      }),
    ).rejects.toThrow(/credit account not found/);
  });

  it("throws on a failed simulation", async () => {
    const { execute, sdk } = mockChain();

    await expect(
      execute.buildTx({
        kind: "account",
        chainId: CHAIN_ID,
        creditAccount: CREDIT_ACCOUNT,
        wallet: WALLET,
        sim: { ok: false, reason: "debtOutOfRange" } as never,
      }),
    ).rejects.toThrow(/failed account simulation/);
    expect(sdk.accounts.executeCaUpdate).not.toHaveBeenCalled();
  });
});
