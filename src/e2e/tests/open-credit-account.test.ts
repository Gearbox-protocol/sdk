import {
  type Address,
  erc20Abi,
  http,
  parseEther,
  parseEventLogs,
  parseUnits,
} from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import { createAnvilClient } from "../../dev/createAnvilClient.js";
import {
  createCreditAccountService,
  GearboxSDK,
  MAX_UINT256,
  PERCENTAGE_FACTOR,
  sendRawTx,
} from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import {
  getAnvilWallet,
  PYTH_API_PROXY,
  REDSTONE_GATEWAYS,
  useFixture,
} from "../helpers.js";

const BLOCK = 24_728_000n;
const CREDIT_MANAGER: Address = "0x748a02cc6dd9090bd6bbcd1fd45790b50524ae87";
const TARGET_TOKEN: Address = "0x1774A6b4aba3B999461a1682f6776cAc66dD1987"; // stkcvxpmcrvUSD
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_WHALE: Address = "0xe1940f578743367F38D3f25c2D2d32D6636929B6";

function calcQuota(amount: bigint, debt: bigint, lt: bigint): bigint {
  let quota = (amount * lt) / PERCENTAGE_FACTOR;
  quota = debt < quota ? debt : quota;
  quota = (quota * (PERCENTAGE_FACTOR + 500n)) / PERCENTAGE_FACTOR;
  return (quota / PERCENTAGE_FACTOR) * PERCENTAGE_FACTOR;
}

describe.skip("open credit account", () => {
  let sdk: GearboxSDK;

  // useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    sdk = await GearboxSDK.attach({
      rpcURLs: [ANVIL_URL],
      timeout: 120_000,
      blockNumber: BLOCK,
      ignoreUpdateablePrices: false,
      redstone: {
        historicTimestamp: true,
        ignoreMissingFeeds: true,
        // gateways: REDSTONE_GATEWAYS,
      },
      pyth: {
        historicTimestamp: true,
        ignoreMissingFeeds: true,
        // apiProxy: PYTH_API_PROXY,
      },
    });
  });

  it("should open a credit account with USDC collateral targeting stkcvxpmcrvUSD", async () => {
    const wallet = getAnvilWallet(sdk);
    const borrower = wallet.account;
    const cm = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const anvil = createAnvilClient({
      transport: http(ANVIL_URL),
      chain: sdk.chain,
    });

    // Transfer USDC from whale via impersonation
    const transferAmount = parseUnits("1500", 6);
    await anvil.impersonateAccount({ address: USDC_WHALE });
    await anvil.setBalance({
      address: USDC_WHALE,
      value: parseEther("1"),
    });
    const dealHash = await anvil.writeContract({
      account: USDC_WHALE,
      address: USDC,
      abi: erc20Abi,
      functionName: "transfer",
      args: [borrower.address, transferAmount],
      chain: anvil.chain,
    });
    await anvil.waitForTransactionReceipt({ hash: dealHash });
    await anvil.stopImpersonatingAccount({ address: USDC_WHALE });

    // Approve credit manager to spend USDC
    let hash = await wallet.writeContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "approve",
      args: [cm.creditManager.address, MAX_UINT256],
    });
    await sdk.client.waitForTransactionReceipt({ hash });

    const debt = parseUnits("1000", 6);
    const collateralAmount = parseUnits("1000", 6);
    const totalOnAccount = debt + collateralAmount;

    // Build expected balances for the router: underlying gets full amount, others get dust
    const expectedBalances = cm.creditManager.collateralTokens.map(token => ({
      token: token as Address,
      balance:
        token.toLowerCase() === cm.underlying.toLowerCase()
          ? totalOnAccount
          : 1n,
    }));
    const leftoverBalances = cm.creditManager.collateralTokens.map(token => ({
      token: token as Address,
      balance: 1n,
    }));

    const strategy = await sdk.routerFor(cm).findOpenStrategyPath({
      creditManager: cm.creditManager,
      expectedBalances,
      leftoverBalances,
      slippage: 50,
      target: TARGET_TOKEN,
    });

    // Calculate quota for target token (adapted from AccountOpener)
    const market = sdk.marketRegister.findByCreditManager(
      cm.creditManager.address,
    );
    const lt = BigInt(
      cm.creditManager.liquidationThresholds.mustGet(TARGET_TOKEN),
    );

    const avgInUnderlying = market.priceOracle.convert(
      TARGET_TOKEN,
      cm.underlying,
      strategy.amount,
    );
    const avgQuota = calcQuota(avgInUnderlying, debt, lt);

    const minInUnderlying = market.priceOracle.convert(
      TARGET_TOKEN,
      cm.underlying,
      strategy.minAmount,
    );
    const minQuota = calcQuota(minInUnderlying, debt, lt);

    // Build and send the openCreditAccount transaction
    const service = createCreditAccountService(sdk, 310);
    const { tx } = await service.openCA({
      creditManager: cm.creditManager.address,
      averageQuota: [{ token: TARGET_TOKEN, balance: avgQuota }],
      minQuota: [{ token: TARGET_TOKEN, balance: minQuota }],
      collateral: [{ token: cm.underlying, balance: collateralAmount }],
      debt,
      calls: strategy.calls,
      ethAmount: 0n,
      permits: {},
      to: borrower.address,
      referralCode: 0n,
    });

    hash = await sendRawTx(wallet, { tx });
    const receipt = await sdk.client.waitForTransactionReceipt({ hash });
    expect(receipt.status).toBe("success");

    const logs = parseEventLogs({
      abi: iCreditFacadeV310Abi,
      logs: receipt.logs,
      eventName: "OpenCreditAccount",
    });
    expect(logs).toHaveLength(1);
    expect(logs[0].args.onBehalfOf.toLowerCase()).toBe(
      borrower.address.toLowerCase(),
    );
  });
});
