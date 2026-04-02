import {
  type Address,
  createTestClient,
  erc20Abi,
  http,
  parseEventLogs,
  parseUnits,
} from "viem";
import { dealActions } from "viem-deal";
import { beforeAll, describe, expect, it } from "vitest";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import {
  createCreditAccountService,
  GearboxSDK,
  MAX_UINT256,
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
const PMUSD: Address = "0xC0c17dD08263C16f6b64E772fB9B723Bf1344DdF";

describe("open credit account", () => {
  let sdk: GearboxSDK;

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    sdk = await GearboxSDK.attach({
      rpcURLs: [ANVIL_URL],
      timeout: 120_000,
      blockNumber: BLOCK,
      ignoreUpdateablePrices: false,
      redstone: {
        historicTimestamp: true,
        gateways: REDSTONE_GATEWAYS,
      },
      pyth: {
        historicTimestamp: true,
        apiProxy: PYTH_API_PROXY,
      },
    });
  });

  it("should open, add collateral and close credit account", async () => {
    const wallet = getAnvilWallet(sdk);
    const borrower = wallet.account;
    const cm = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);

    const anvil = createTestClient({
      mode: "anvil",
      transport: http(ANVIL_URL),
      chain: sdk.chain,
      pollingInterval: 100,
    }).extend(dealActions);

    await anvil.deal({
      erc20: USDC,
      account: borrower.address,
      amount: parseUnits("1500", 6),
    });

    let hash = await wallet.writeContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "approve",
      args: [cm.creditManager.address, MAX_UINT256],
    });
    await sdk.client.waitForTransactionReceipt({ hash, pollingInterval: 100 });

    const debt = parseUnits("1000", 6);
    const collateralAmount = parseUnits("1000", 6);
    const totalOnAccount = debt + collateralAmount;

    const expectedBalances = [
      { token: cm.underlying, balance: totalOnAccount },
    ];
    const leftoverBalances = [{ token: cm.underlying, balance: 1n }];

    const strategy = await sdk.routerFor(cm).findOpenStrategyPath({
      creditManager: cm.creditManager,
      expectedBalances,
      leftoverBalances,
      slippage: 50,
      target: TARGET_TOKEN,
    });

    const service = createCreditAccountService(sdk, 310);
    const { tx } = await service.openCA({
      creditManager: cm.creditManager.address,
      averageQuota: [{ token: TARGET_TOKEN, balance: 1050000000n }],
      minQuota: [{ token: TARGET_TOKEN, balance: 1050000000n }],
      collateral: [{ token: cm.underlying, balance: collateralAmount }],
      debt,
      calls: strategy.calls,
      ethAmount: 0n,
      permits: {},
      to: borrower.address,
      referralCode: 0n,
    });
    hash = await sendRawTx(wallet, { tx });
    const receipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });

    const logs = parseEventLogs({
      abi: iCreditFacadeV310Abi,
      logs: receipt.logs,
      eventName: "OpenCreditAccount",
    });
    expect(logs).toMatchObject([
      {
        address: "0x79e4b64a72c7d2cc2b3437a2ff3ffae9f4cc1118",
        args: {
          caller: borrower.address,
          creditAccount: "0x48d0821Eeac443A9f26B36820ccb17953F67bC0e",
          onBehalfOf: borrower.address,
          referralCode: 0n,
        },
      },
    ]);

    // --- Add collateral (pmUSD) ---
    const creditAccount = logs[0].args.creditAccount;
    const caData = await service.getCreditAccountData(creditAccount);
    if (!caData) {
      throw new Error("credit account not found after open");
    }

    const pmUsdAmount = parseUnits("500", 18);
    await anvil.deal({
      erc20: PMUSD,
      account: borrower.address,
      amount: pmUsdAmount,
    });

    hash = await wallet.writeContract({
      address: PMUSD,
      abi: erc20Abi,
      functionName: "approve",
      args: [cm.creditManager.address, MAX_UINT256],
    });
    await sdk.client.waitForTransactionReceipt({ hash, pollingInterval: 100 });

    const { tx: addCollateralTx } = await service.addCollateral({
      creditAccount: caData,
      asset: { token: PMUSD, balance: pmUsdAmount },
      permit: undefined,
      ethAmount: 0n,
      averageQuota: [],
      minQuota: [],
    });
    hash = await sendRawTx(wallet, { tx: addCollateralTx });
    const addCollateralReceipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(addCollateralReceipt.status).toBe("success");

    // --- Close credit account ---
    const refreshedCaData = await service.getCreditAccountData(creditAccount);
    if (!refreshedCaData)
      throw new Error("credit account not found after addCollateral");

    const closePath = await sdk.routerFor(cm).findBestClosePath({
      creditAccount: refreshedCaData,
      creditManager: cm.creditManager,
      slippage: 50,
    });

    const { tx: closeTx } = await service.closeCreditAccount({
      operation: "close",
      creditAccount: refreshedCaData,
      assetsToWithdraw: [cm.underlying],
      to: borrower.address,
      slippage: 50n,
      closePath,
    });
    hash = await sendRawTx(wallet, { tx: closeTx, gas: 2_000_000n });
    const closeReceipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });

    const closeLogs = parseEventLogs({
      abi: iCreditFacadeV310Abi,
      logs: closeReceipt.logs,
      eventName: "CloseCreditAccount",
    });
    expect(closeLogs).toMatchObject([
      {
        args: {
          creditAccount: creditAccount,
          borrower: borrower.address,
        },
      },
    ]);
  });
});
