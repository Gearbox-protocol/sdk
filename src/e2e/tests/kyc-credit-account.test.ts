import {
  type Address,
  erc20Abi,
  type Hex,
  parseEventLogs,
  parseUnits,
} from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iCreditFacadeV310Abi } from "../../abi/310/generated.js";
import { claimDSToken, registerInvestor } from "../../dev/claimDSToken.js";
import type { AnvilClient } from "../../dev/createAnvilClient.js";
import {
  chains,
  KYC_FACTORY_SECURITIZE,
  MAX_UINT256,
  type OnchainSDK,
  sendRawTx,
} from "../../sdk/index.js";
import {
  attachSecuritizeSDK,
  createInvestorWallet,
  createSecuritizeAnvilClient,
  KYC_FACTORY,
  KYC_MARKET_CONFIGURATOR,
  requireSecuritizeAdminPrivateKey,
  type SecuritizeAnvilClient,
  seedSecuritizePoolLiquidity,
  signRegisterVaultMessages,
  USDC,
} from "../helpers/securitize.js";

// Pools (from advanced_parse/snapshot.yaml). dcUSDC is default-liquidity,
// ocUSDC is on-demand-liquidity. Each pool has two credit managers (ACRED and
// STAC), and both DS tokens have a SECURITIZE_ONRAMP adapter so the leverage
// flow runs unconditionally.
const DC_USDC: Address = "0xA052899a26a7847E694631B53D1c4C83d0FE1529"; // PoolV3 (Mock dcUSDC)
const OC_USDC: Address = "0x4284dC6CdDC8Da0fE9aa369ab682706912605954"; // PoolV3 (Mock ocUSDC)

const CREDIT_MANAGERS = [
  {
    liquidity: "default",
    pool: DC_USDC,
    label: "ACRED / dcUSDC",
    creditManager: "0x9c7A1F5a3451Ea09dA54c9b11B0a62B4BF605e55", // CreditManagerV310 (Mock dcUSDC, ACRED)
    dsToken: "0x17418038ecF73BA4026c4f428547BF099706F27B", // ACRED
  },
  {
    liquidity: "default",
    pool: DC_USDC,
    label: "STAC / dcUSDC",
    creditManager: "0x354F7385374c2364238151a9174282147971e877", // CreditManagerV310 (Mock dcUSDC, STAC)
    dsToken: "0x51C2d74017390CbBd30550179A16A1c28F7210fc", // STAC
  },
  {
    liquidity: "on-demand",
    pool: OC_USDC,
    label: "ACRED / ocUSDC",
    creditManager: "0xBCb204ff9C28B9c8DA2B1ba1C8790ecAaD971661", // CreditManagerV310 (Mock ocUSDC, ACRED)
    dsToken: "0x17418038ecF73BA4026c4f428547BF099706F27B", // ACRED
  },
  {
    liquidity: "on-demand",
    pool: OC_USDC,
    label: "STAC / ocUSDC",
    creditManager: "0x0d79D92c0163177b1c9d34178996EaBa0124F785", // CreditManagerV310 (Mock ocUSDC, STAC)
    dsToken: "0x51C2d74017390CbBd30550179A16A1c28F7210fc", // STAC
  },
] as const satisfies ReadonlyArray<{
  liquidity: "default" | "on-demand";
  pool: Address;
  label: string;
  creditManager: Address;
  dsToken: Address;
}>;

/**
 * SDK e2e mirroring `SecuritizeDefaultLiquidity.attach.t.sol` and
 * `SecuritizeOnDemandLiquidity.attach.t.sol`. Drives `sdk.accounts.openCA`
 * against both the dcUSDC (default liquidity) and ocUSDC (on-demand liquidity)
 * pools with `kycOptions` for the Securitize KYC factory. The SDK-side flow is
 * identical for both pools; the on-demand vs default difference is enforced by
 * the underlying pool/liquidity-provider contracts.
 */
describe.skipIf(!!process.env.CI)("kyc credit account (securitize)", () => {
  let sdk: OnchainSDK;
  let anvil: SecuritizeAnvilClient;
  let adminPrivateKey: Hex;

  beforeAll(async () => {
    adminPrivateKey = requireSecuritizeAdminPrivateKey();
    sdk = await attachSecuritizeSDK();
    anvil = createSecuritizeAnvilClient(chains.Mainnet);
    await seedSecuritizePoolLiquidity(sdk, anvil, DC_USDC);
    await seedSecuritizePoolLiquidity(sdk, anvil, OC_USDC);
  }, 240_000);

  it.each(
    CREDIT_MANAGERS,
  )("borrowing via securitize factory: $label", async info => {
    const { creditManager, dsToken, label, pool } = info;
    const factory = sdk.kyc.factories[0];

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
      marketConfigurators: [KYC_MARKET_CONFIGURATOR],
      kycFactories: [KYC_FACTORY],
    });

    const approvalTarget = await factory.getApprovalAddress({
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
    const unwrapCalls = await sdk.accounts.getKYCUnwrapCalls(
      debt,
      creditManager,
    );
    if (!unwrapCalls) {
      throw new Error(`getKYCUnwrapCalls returned undefined for ${label}`);
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
      kycOptions: {
        type: KYC_FACTORY_SECURITIZE,
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
    const factory = sdk.kyc.factories[0];

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

    const approvalTarget = await factory.getApprovalAddress({
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
    const unwrapCalls = await sdk.accounts.getKYCUnwrapCalls(
      debt,
      creditManager,
    );
    if (!unwrapCalls) {
      throw new Error(`getKYCUnwrapCalls returned undefined for ${label}`);
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
      kycOptions: {
        type: KYC_FACTORY_SECURITIZE,
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
