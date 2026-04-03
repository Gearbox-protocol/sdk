import {
  type Address,
  createTestClient,
  encodeFunctionData,
  erc20Abi,
  type Hex,
  http,
  type PublicClient,
  parseUnits,
} from "viem";
import { dealActions } from "viem-deal";
import { beforeAll, describe, expect, it } from "vitest";
import {
  GearboxSDK,
  hexEq,
  MAX_UINT256,
  PoolService,
  type PoolServiceCall,
} from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import {
  getAnvilWallet,
  PYTH_API_PROXY,
  REDSTONE_GATEWAYS,
  useFixture,
} from "../helpers.js";

const BLOCK = 24_736_900n;

// Direct deposit/withdraw: USDC pool with good liquidity (~23k USDC)
const USDC_POOL: Address = "0xC155444481854c60e7a29f4150373f479988F32D";
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// Zapper deposit/withdraw: kpkWETH pool with dWETHV3 -> kpkWETH migration zapper
const KPK_WETH_POOL: Address = "0x9396DCbf78fc526bb003665337C5E73b699571EF";
const D_WETH_V3: Address = "0xda0002859B2d05F66a753d8241fCDE8623f26F4f";
const ZAPPER: Address = "0x5A5F69e134765Cb0169f280c2f2A7d8AdF8eFd29";

async function getBalances(
  client: PublicClient,
  account: Address,
  tokens: Address[],
): Promise<Record<Address, bigint>> {
  const results = await client.multicall({
    contracts: tokens.map(token => ({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [account],
    })),
  });
  return Object.fromEntries(
    tokens.map((token, i) => [token, results[i].result ?? 0n]),
  );
}

function encodePoolCall(call: PoolServiceCall): {
  to: Address;
  data: Hex;
  value?: bigint;
} {
  return {
    to: call.target,
    data: encodeFunctionData({
      abi: call.abi,
      functionName: call.functionName,
      args: call.args,
    }),
    value: call.value,
  };
}

describe("pool deposit and withdraw", () => {
  let sdk: GearboxSDK;

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    sdk = await GearboxSDK.attach({
      rpcURLs: [ANVIL_URL],
      timeout: 120_000,
      blockNumber: BLOCK,
      redstone: {
        historicTimestamp: true,
        gateways: REDSTONE_GATEWAYS,
      },
      pyth: {
        historicTimestamp: true,
        apiProxy: PYTH_API_PROXY,
      },
    });
    await sdk.marketRegister.loadZappers();
  });

  it("should deposit and withdraw directly from pool", async () => {
    const wallet = getAnvilWallet(sdk);
    const account = wallet.account.address;
    const poolService = new PoolService(sdk);

    const anvil = createTestClient({
      mode: "anvil",
      transport: http(ANVIL_URL),
      chain: sdk.chain,
      pollingInterval: 100,
    }).extend(dealActions);

    const depositAmount = parseUnits("100", 6);
    await anvil.deal({
      erc20: USDC,
      account,
      amount: 2n * depositAmount,
    });
    const beforeDeposit = await getBalances(sdk.client, account, [
      USDC,
      USDC_POOL,
    ]);

    // Verify routing: no zappers
    const tokensIn = poolService.getDepositTokensIn(USDC_POOL);
    expect(tokensIn).toEqual([USDC]);
    const tokensOut = poolService.getDepositTokensOut(USDC_POOL, USDC);
    expect(tokensOut).toEqual([USDC_POOL]);

    // Get deposit metadata: direct deposit, no zapper
    const depositMeta = poolService.getDepositMetadata(
      USDC_POOL,
      USDC,
      USDC_POOL,
    );
    expect(depositMeta).toEqual({
      approveTarget: USDC_POOL,
      permissible: false,
      type: "classic",
      zapper: undefined,
    });

    // Approve pool to spend USDC
    let hash = await wallet.writeContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "approve",
      args: [depositMeta.approveTarget, MAX_UINT256],
    });
    await sdk.client.waitForTransactionReceipt({ hash, pollingInterval: 100 });

    // Build and execute deposit
    const depositCall = poolService.addLiquidity({
      collateral: { token: USDC, balance: depositAmount },
      pool: USDC_POOL,
      wallet: account,
      meta: depositMeta,
      referralCode: 0n,
    });
    expect(depositCall).toBeDefined();

    const encoded = encodePoolCall(depositCall!);
    hash = await wallet.sendTransaction(encoded);
    const depositReceipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(depositReceipt.status).toBe("success");

    const afterDeposit = await getBalances(sdk.client, account, [
      USDC,
      USDC_POOL,
    ]);
    expect(afterDeposit).toEqual({
      [USDC]: beforeDeposit[USDC] - depositAmount,
      [USDC_POOL]: 95804878n,
    });
    expect(afterDeposit[USDC_POOL]).toBeGreaterThan(0n);

    const sharesReceived = afterDeposit[USDC_POOL];

    // --- Withdrawal ---
    const withdrawalMeta = poolService.getWithdrawalMetadata(
      USDC_POOL,
      USDC_POOL,
      USDC,
    );
    expect(withdrawalMeta.zapper).toBeUndefined();
    expect(withdrawalMeta.approveTarget).toBeUndefined();

    const withdrawCall = poolService.removeLiquidity({
      pool: USDC_POOL,
      amount: sharesReceived,
      wallet: account,
      permit: undefined,
      meta: withdrawalMeta,
    });

    const withdrawEncoded = encodePoolCall(withdrawCall);
    hash = await wallet.sendTransaction(withdrawEncoded);
    const withdrawReceipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(withdrawReceipt.status).toBe("success");

    const afterWithdraw = await getBalances(sdk.client, account, [
      USDC,
      USDC_POOL,
    ]);
    expect(afterWithdraw).toEqual({
      [USDC_POOL]: 0n,
      [USDC]: 199999999n,
    });
  });

  // TODO: only found migration zappers, cannot withdraw using them
  it("should deposit via zapper and withdraw directly from pool", async () => {
    const wallet = getAnvilWallet(sdk);
    const account = wallet.account.address;
    const poolService = new PoolService(sdk);
    const WETH: Address =
      sdk.marketRegister.findByPool(KPK_WETH_POOL).underlying;

    const anvil = createTestClient({
      mode: "anvil",
      transport: http(ANVIL_URL),
      chain: sdk.chain,
      pollingInterval: 100,
    }).extend(dealActions);

    const zappers = sdk.marketRegister.poolZappers(KPK_WETH_POOL);
    const zapper = zappers.find(z => hexEq(z.baseParams.addr, ZAPPER));
    if (!zapper) {
      throw new Error(`Zapper ${ZAPPER} not found for pool ${KPK_WETH_POOL}`);
    }

    const depositAmount = parseUnits("1", 18);
    await anvil.deal({
      erc20: D_WETH_V3,
      account,
      amount: depositAmount,
    });

    // Approve zapper to spend dWETHV3
    let hash = await wallet.writeContract({
      address: D_WETH_V3,
      abi: erc20Abi,
      functionName: "approve",
      args: [ZAPPER, MAX_UINT256],
    });
    await sdk.client.waitForTransactionReceipt({ hash, pollingInterval: 100 });

    const beforeDeposit = await getBalances(sdk.client, account, [
      D_WETH_V3,
      KPK_WETH_POOL,
    ]);

    // Build deposit call with zapper metadata
    const depositCall = poolService.addLiquidity({
      collateral: { token: D_WETH_V3, balance: depositAmount },
      pool: KPK_WETH_POOL,
      wallet: account,
      meta: {
        zapper,
        approveTarget: ZAPPER,
        permissible: true,
        type: "classic",
      },
      referralCode: 0n,
    });
    if (!depositCall) {
      throw new Error("addLiquidity returned undefined for zapper deposit");
    }

    const encoded = encodePoolCall(depositCall);
    hash = await wallet.sendTransaction({
      to: encoded.to,
      data: encoded.data,
      value: encoded.value,
    });
    const depositReceipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(depositReceipt.status).toBe("success");

    const afterDeposit = await getBalances(sdk.client, account, [
      D_WETH_V3,
      KPK_WETH_POOL,
    ]);
    expect(afterDeposit).toEqual({
      [D_WETH_V3]: beforeDeposit[D_WETH_V3] - depositAmount,
      [KPK_WETH_POOL]: expect.any(BigInt),
    });
    expect(afterDeposit[KPK_WETH_POOL]).toBeGreaterThan(0n);

    const sharesReceived = afterDeposit[KPK_WETH_POOL];

    // --- Direct withdrawal from pool (migration zappers are deposit-only) ---
    const withdrawalMeta = poolService.getWithdrawalMetadata(
      KPK_WETH_POOL,
      KPK_WETH_POOL,
      WETH,
    );
    expect(withdrawalMeta.zapper).toBeUndefined();

    const withdrawCall = poolService.removeLiquidity({
      pool: KPK_WETH_POOL,
      amount: sharesReceived,
      wallet: account,
      permit: undefined,
      meta: withdrawalMeta,
    });

    const withdrawEncoded = encodePoolCall(withdrawCall);
    hash = await wallet.sendTransaction({
      to: withdrawEncoded.to,
      data: withdrawEncoded.data,
      value: withdrawEncoded.value,
      gas: 2_000_000n,
    });
    const withdrawReceipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(withdrawReceipt.status).toBe("success");

    const afterWithdraw = await getBalances(sdk.client, account, [
      WETH,
      KPK_WETH_POOL,
    ]);
    expect(afterWithdraw[KPK_WETH_POOL]).toBe(0n);
    expect(afterWithdraw[WETH]).toBeGreaterThan(0n);
  });
});
