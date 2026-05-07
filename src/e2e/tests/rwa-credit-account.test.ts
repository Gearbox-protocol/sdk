import {
  type Address,
  erc20Abi,
  type Hex,
  http,
  parseEventLogs,
  parseUnits,
} from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import { claimDSToken, registerInvestor } from "../../dev/claimDSToken.js";
import {
  type AnvilClient,
  createAnvilClient,
} from "../../dev/createAnvilClient.js";
import {
  chains,
  MAX_UINT256,
  OnchainSDK,
  RWA_FACTORY_SECURITIZE,
  sendRawTx,
} from "../../sdk/index.js";
import {
  createInvestorWallet,
  RWA_FACTORY,
  RWA_MARKET_CONFIGURATOR,
  RWA_RPC_URL,
  seedSecuritizePoolLiquidity,
  signRegisterVaultMessages,
  USDC,
} from "../helpers/securitize.js";

const DEFAULT_POOL: Address = "0xA052899a26a7847E694631B53D1c4C83d0FE1529";
const ON_DEMAND_POOL: Address = "0x4284dC6CdDC8Da0fE9aa369ab682706912605954";

const CREDIT_MANAGERS = [
  {
    liquidity: "default",
    pool: DEFAULT_POOL,
    label: "ACRED default",
    creditManager: "0x9c7A1F5a3451Ea09dA54c9b11B0a62B4BF605e55", // CreditManagerV310 (Mock dcUSDC, ACRED)
    dsToken: "0x17418038ecF73BA4026c4f428547BF099706F27B", // ACRED
  },
  {
    liquidity: "default",
    pool: DEFAULT_POOL,
    label: "STAC default",
    creditManager: "0x354F7385374c2364238151a9174282147971e877", // CreditManagerV310 (Mock dcUSDC, STAC)
    dsToken: "0x51C2d74017390CbBd30550179A16A1c28F7210fc", // STAC
  },
  {
    liquidity: "on-demand",
    pool: ON_DEMAND_POOL,
    label: "ACRED on-demand",
    creditManager: "0xBCb204ff9C28B9c8DA2B1ba1C8790ecAaD971661", // CreditManagerV310 (Mock ocUSDC, ACRED)
    dsToken: "0x17418038ecF73BA4026c4f428547BF099706F27B", // ACRED
  },
  {
    liquidity: "on-demand",
    pool: ON_DEMAND_POOL,
    label: "STAC on-demand",
    creditManager: "0x0d79D92c0163177b1c9d34178996EaBa0124F785", // CreditManagerV310 (Mock ocUSDC, STAC)
    dsToken: "0x51C2d74017390CbBd30550179A16A1c28F7210fc", // STAC
  },
] as const;

describe.skipIf(!!process.env.CI)("rwa credit account (securitize)", () => {
  let sdk: OnchainSDK;
  const anvil = createAnvilClient({
    chain: chains.Mainnet,
    transport: http(RWA_RPC_URL, { timeout: 120_000 }),
    pollingInterval: 100,
  });
  const adminPrivateKey = process.env.E2E_SECURITIZE_ADMIN_PRIVATE_KEY as Hex;

  beforeAll(async () => {
    sdk = new OnchainSDK("Mainnet", {
      rpcURLs: [RWA_RPC_URL],
      timeout: 120_000,
    });
    await sdk.attach({
      marketConfigurators: [RWA_MARKET_CONFIGURATOR],
      rwaFactories: [RWA_FACTORY],
      ignoreUpdateablePrices: true,
    });
    await sdk.tokensMeta.loadTokenData();
    await sdk.marketRegister.loadZappers();
    await seedSecuritizePoolLiquidity(sdk, anvil, DEFAULT_POOL);
    await seedSecuritizePoolLiquidity(sdk, anvil, ON_DEMAND_POOL);
  }, 240_000);

  it.each(
    CREDIT_MANAGERS,
  )("borrowing via securitize factory: $label", async info => {
    const { creditManager, dsToken, label, pool } = info;

    const wallet = await createInvestorWallet(anvil, sdk.chain);
    const investor = wallet.account.address;

    const market = sdk.marketRegister.findByPool(pool);
    const usdAmount = 60_000n * 10n ** 8n;
    const dsAmount = market.priceOracle.convertFromUSD(dsToken, usdAmount);

    await claimDSToken({
      anvil: anvil as unknown as AnvilClient,
      claimer: investor,
      adminPrivateKey,
      token: dsToken,
      usdAmount: "60000",
      marketConfigurators: [RWA_MARKET_CONFIGURATOR],
      rwaFactories: [RWA_FACTORY],
    });

    const approvalTarget = await sdk.accounts.getApprovalAddress({
      creditManager,
      borrower: investor,
    });
    let hash = await wallet.writeContract({
      address: dsToken,
      abi: erc20Abi,
      functionName: "approve",
      args: [approvalTarget, MAX_UINT256],
    });
    await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });

    const requirements = await sdk.accounts.getOpenAccountRequirements(
      investor,
      creditManager,
      { tokenOutAddress: dsToken },
    );
    if (!requirements) {
      throw new Error(
        `getOpenAccountRequirements returned undefined for ${label}`,
      );
    }
    const signaturesToCache = await signRegisterVaultMessages(
      wallet,
      requirements.requiredSignatures,
    );

    const debt = parseUnits("50000", 6);
    const unwrapCalls = await sdk.accounts.getRWAUnwrapCalls(
      debt,
      creditManager,
    );
    if (!unwrapCalls) {
      throw new Error(`getRWAUnwrapCalls returned undefined for ${label}`);
    }

    const { tx } = await sdk.accounts.openCA({
      creditManager,
      collateral: [{ token: dsToken, balance: dsAmount }],
      debt,
      calls: unwrapCalls,
      withdrawToken: USDC,
      averageQuota: [{ token: dsToken, balance: parseUnits("55000", 6) }],
      minQuota: [{ token: dsToken, balance: parseUnits("55000", 6) }],
      to: investor,
      ethAmount: 0n,
      permits: {},
      referralCode: 0n,
      rwaOptions: {
        type: RWA_FACTORY_SECURITIZE,
        tokensToRegister: [dsToken],
        signaturesToCache,
      },
    });
    hash = await sendRawTx(wallet, { tx });
    const receipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(receipt.status, `borrowing flow failed for ${label}`).toBe(
      "success",
    );

    const logs = parseEventLogs({
      abi: iCreditFacadeV310Abi,
      logs: receipt.logs,
      eventName: "OpenCreditAccount",
    });
    expect(logs.length, `OpenCreditAccount not emitted for ${label}`).toBe(1);
  }, 300_000);

  it.each(
    CREDIT_MANAGERS,
  )("leverage via securitize factory: $label", async info => {
    const { creditManager, dsToken, label } = info;
    const cm = sdk.marketRegister.findCreditManager(creditManager);

    const wallet = await createInvestorWallet(anvil, sdk.chain);
    const investor = wallet.account.address;

    await registerInvestor({
      anvil: anvil as unknown as AnvilClient,
      claimer: investor,
      adminPrivateKey,
      token: dsToken,
    });

    const usdcAmount = parseUnits("10000", 6);
    await anvil.deal({
      erc20: USDC,
      account: investor,
      amount: usdcAmount,
    });

    const approvalTarget = await sdk.accounts.getApprovalAddress({
      creditManager,
      borrower: investor,
    });
    let hash = await wallet.writeContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "approve",
      args: [approvalTarget, MAX_UINT256],
    });
    await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });

    const requirements = await sdk.accounts.getOpenAccountRequirements(
      investor,
      creditManager,
      { tokenOutAddress: dsToken },
    );
    if (!requirements) {
      throw new Error(
        `getOpenAccountRequirements returned undefined for ${label}`,
      );
    }
    const signaturesToCache = await signRegisterVaultMessages(
      wallet,
      requirements.requiredSignatures,
    );

    const debt = parseUnits("50000", 6);
    const unwrapCalls = await sdk.accounts.getRWAUnwrapCalls(
      debt,
      creditManager,
    );
    if (!unwrapCalls) {
      throw new Error(`getRWAUnwrapCalls returned undefined for ${label}`);
    }

    const strategy = await sdk.routerFor(cm).findOpenStrategyPath({
      creditManager: cm.creditManager,
      expectedBalances: [{ token: USDC, balance: usdcAmount + debt }],
      leftoverBalances: [{ token: USDC, balance: 1n }],
      slippage: 50,
      target: dsToken,
    });

    const { tx } = await sdk.accounts.openCA({
      creditManager,
      collateral: [{ token: USDC, balance: usdcAmount }],
      debt,
      calls: [...unwrapCalls, ...strategy.calls],
      averageQuota: [{ token: dsToken, balance: parseUnits("55000", 6) }],
      minQuota: [{ token: dsToken, balance: parseUnits("55000", 6) }],
      to: investor,
      ethAmount: 0n,
      permits: {},
      referralCode: 0n,
      rwaOptions: {
        type: RWA_FACTORY_SECURITIZE,
        tokensToRegister: [dsToken],
        signaturesToCache,
      },
    });
    hash = await sendRawTx(wallet, { tx });
    const receipt = await sdk.client.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    expect(receipt.status, `leverage flow failed for ${label}`).toBe("success");

    const logs = parseEventLogs({
      abi: iCreditFacadeV310Abi,
      logs: receipt.logs,
      eventName: "OpenCreditAccount",
    });
    expect(logs.length, `OpenCreditAccount not emitted for ${label}`).toBe(1);
  }, 300_000);
});
