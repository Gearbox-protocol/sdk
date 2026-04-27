import {
  type Address,
  type Chain,
  createTestClient,
  createWalletClient,
  erc20Abi,
  type Hex,
  http,
  type PrivateKeyAccount,
  parseEther,
  parseUnits,
  publicActions,
  type Transport,
  type WalletClient,
  walletActions,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { dealActions } from "viem-deal";
import {
  KYC_UNDERLYING_DEFAULT,
  KYC_UNDERLYING_ON_DEMAND,
  type KYCOnDemandTokenMeta,
  MAX_UINT256,
  OnchainSDK,
  PoolService,
  type SecuritizeRegisterMessage,
  type SecuritizeRegisterVaultMessage,
} from "../../sdk/index.js";

/**
 * Live Gearbox anvil instance attached to the Securitize KYC market.
 * Used both as the SDK RPC and the test client transport.
 */
export const KYC_RPC_URL = "https://anvil.gearbox.foundation/rpc/Securitize";

export const KYC_MARKET_CONFIGURATOR: Address =
  "0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad";
export const KYC_FACTORY: Address =
  "0x867b5b0cd9999959f696cef4ecf7777a39516d27";

export const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

/**
 * Anvil test client extended with `viem-deal` actions and public/wallet
 * actions, used for cheats (`anvil_setBalance`, `viem-deal` storage overrides
 * for ERC20 minting), reads, and admin-impersonated writes.
 */
export type SecuritizeAnvilClient = ReturnType<
  typeof createSecuritizeAnvilClient
>;

/** Wallet client backed by a generated private key for an investor in a single test. */
export type InvestorWallet = WalletClient<Transport, Chain, PrivateKeyAccount>;

/**
 * Reads the Securitize admin private key from `E2E_SECURITIZE_ADMIN_PRIVATE_KEY`.
 * Throws a descriptive error if missing — the e2e `describe` blocks are skipped
 * on CI so this is only enforced for local opt-in runs.
 */
export function requireSecuritizeAdminPrivateKey(): Hex {
  const key = process.env.E2E_SECURITIZE_ADMIN_PRIVATE_KEY;
  if (!key) {
    throw new Error(
      "E2E_SECURITIZE_ADMIN_PRIVATE_KEY env var is required to run Securitize KYC e2e tests.\n" +
        "Set it in sdk/.env or your shell before running `pnpm test:e2e`.",
    );
  }
  if (!key.startsWith("0x")) {
    return `0x${key}` as Hex;
  }
  return key as Hex;
}

/**
 * Creates an `OnchainSDK` instance attached to the Securitize anvil with the
 * single Gearbox market configurator + KYC factory loaded.
 */
export async function attachSecuritizeSDK(): Promise<OnchainSDK> {
  const sdk = new OnchainSDK("Mainnet", {
    rpcURLs: [KYC_RPC_URL],
    timeout: 120_000,
  });
  await sdk.attach({
    marketConfigurators: [KYC_MARKET_CONFIGURATOR],
    kycFactories: [KYC_FACTORY],
    ignoreUpdateablePrices: true,
  });
  await sdk.tokensMeta.loadTokenData();
  await sdk.marketRegister.loadZappers();
  return sdk;
}

/** Anvil test client wired against the live Securitize anvil URL. */
export function createSecuritizeAnvilClient(chain: Chain) {
  return createTestClient({
    mode: "anvil",
    transport: http(KYC_RPC_URL, { timeout: 120_000 }),
    chain,
    pollingInterval: 100,
  })
    .extend(publicActions)
    .extend(walletActions)
    .extend(dealActions);
}

/**
 * Generates a fresh investor wallet, funds it with 1 ETH for gas, and returns
 * a `WalletClient` ready to sign txs on the Securitize anvil.
 */
export async function createInvestorWallet(
  anvil: SecuritizeAnvilClient,
  chain: Chain,
): Promise<InvestorWallet> {
  const account = privateKeyToAccount(generatePrivateKey());
  await anvil.setBalance({
    address: account.address,
    value: parseEther("1"),
  });
  return createWalletClient({
    chain,
    transport: http(KYC_RPC_URL, { timeout: 120_000 }),
    account,
    pollingInterval: 100,
  });
}

/**
 * Signs a list of `RegisterVault` EIP-712 messages (returned by
 * `sdk.accounts.getOpenAccountRequirements`) and converts them into the
 * `SecuritizeRegisterMessage[]` shape consumed by `kycOptions.signaturesToCache`.
 */
export async function signRegisterVaultMessages(
  wallet: InvestorWallet,
  messages: SecuritizeRegisterVaultMessage[],
): Promise<SecuritizeRegisterMessage[]> {
  const signed: SecuritizeRegisterMessage[] = [];
  for (const m of messages) {
    const signature = await wallet.signTypedData({
      account: wallet.account,
      ...m,
    });
    signed.push({
      token: m.message.token,
      signature: { deadline: m.message.deadline, signature },
    });
  }
  return signed;
}

export const POOL_LIQUIDITY_USDC = parseUnits("1000000", 6);

/**
 * Seeds liquidity for a Securitize pool, mirroring the `setUp()` of the
 * matching Solidity attach test:
 *
 * - `KYC_UNDERLYING::DEFAULT` (e.g. dcUSDC): a fresh wallet is funded with USDC
 *   and deposits via the pool's ERC4626 zapper (same code path as
 *   `IERC20ZapperDeposits.deposit(1_000_000e6, depositor)`).
 * - `KYC_UNDERLYING::ON_DEMAND` (e.g. ocUSDC): the `MonopolizedOnDemandLP`
 *   depositor (baked into the LP at deploy time) is impersonated via anvil,
 *   funded with USDC, and approves the LP for `POOL_LIQUIDITY_USDC` so the
 *   pool can pull on demand on each borrow.
 */
export async function seedSecuritizePoolLiquidity(
  sdk: OnchainSDK,
  anvil: SecuritizeAnvilClient,
  pool: Address,
): Promise<void> {
  const market = sdk.marketRegister.findByPool(pool);
  const underlying = market.pool.underlying;
  const meta = sdk.tokensMeta.mustGet(underlying);
  if (!sdk.tokensMeta.isKYCUnderlying(meta)) {
    throw new Error(
      `Pool ${pool} underlying ${underlying} is not a KYC underlying`,
    );
  }

  switch (meta.contractType) {
    case KYC_UNDERLYING_DEFAULT:
      await seedDefaultPool(sdk, anvil, pool);
      return;
    case KYC_UNDERLYING_ON_DEMAND:
      await seedOnDemandPool(anvil, meta);
      return;
  }
}

async function seedDefaultPool(
  sdk: OnchainSDK,
  anvil: SecuritizeAnvilClient,
  pool: Address,
): Promise<void> {
  const wallet = await createInvestorWallet(anvil, sdk.chain);
  const depositor = wallet.account.address;

  await anvil.deal({
    erc20: USDC,
    account: depositor,
    amount: POOL_LIQUIDITY_USDC,
  });

  const poolService = new PoolService(sdk);
  const depositMeta = poolService.getDepositMetadata(pool, USDC, pool);
  if (depositMeta.type !== "kyc-default") {
    throw new Error(
      `Expected kyc-default deposit metadata for pool ${pool}, got ${depositMeta.type}`,
    );
  }

  let hash = await wallet.writeContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "approve",
    args: [depositMeta.approveTarget, MAX_UINT256],
  });
  await sdk.client.waitForTransactionReceipt({ hash, pollingInterval: 100 });

  const depositCall = poolService.addLiquidity({
    collateral: { token: USDC, balance: POOL_LIQUIDITY_USDC },
    pool,
    wallet: depositor,
    meta: depositMeta,
    referralCode: 0n,
  });
  if (!depositCall) {
    throw new Error(`addLiquidity returned undefined for default pool ${pool}`);
  }

  hash = await wallet.writeContract({
    address: depositCall.target,
    abi: depositCall.abi,
    functionName: depositCall.functionName,
    args: depositCall.args,
    value: depositCall.value,
  });
  const receipt = await sdk.client.waitForTransactionReceipt({
    hash,
    pollingInterval: 100,
  });
  if (receipt.status !== "success") {
    throw new Error(`Failed to seed default pool ${pool}: tx reverted`);
  }
}

async function seedOnDemandPool(
  anvil: SecuritizeAnvilClient,
  meta: KYCOnDemandTokenMeta,
): Promise<void> {
  const liquidityProvider = meta.liquidityProvider.addr;
  const depositor = meta.liquidityProvider.depositor;

  await anvil.impersonateAccount({ address: depositor });
  try {
    await anvil.setBalance({ address: depositor, value: parseEther("1") });
    await anvil.deal({
      erc20: USDC,
      account: depositor,
      amount: POOL_LIQUIDITY_USDC,
    });

    const hash = await anvil.writeContract({
      account: depositor,
      address: USDC,
      abi: erc20Abi,
      functionName: "approve",
      args: [liquidityProvider, POOL_LIQUIDITY_USDC],
      chain: anvil.chain,
    });
    const receipt = await anvil.waitForTransactionReceipt({
      hash,
      pollingInterval: 100,
    });
    if (receipt.status !== "success") {
      throw new Error(
        `Failed to seed on-demand LP ${liquidityProvider}: approve reverted`,
      );
    }
  } finally {
    await anvil.stopImpersonatingAccount({ address: depositor });
  }
}
