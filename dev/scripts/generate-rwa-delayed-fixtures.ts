/**
 * Generates fixtures for delayed RWA (Securitize) operation preview tests
 * (see previewRWADelayedOperation.test.ts) by replaying two scenarios on the
 * public Securitize anvil Mainnet fork:
 *
 * 1. "withdraw-usdc":  on the dcUSDC credit manager, open a credit account
 *                      with 20k USDC collateral at 5x leverage (buys ACRED);
 * 2. "withdraw-rlusd": same but on the dcRLUSD credit manager, withdrawing
 *                      RLUSD instead of USDC.
 *
 * Each scenario is a 5-transaction flow that mirrors the frontend:
 *
 * 1. open:          increaseDebt + addCollateral(USDC) + router open path
 *                   (unwrap borrowed vault shares -> [swap] -> buy ACRED)
 *                   + updateQuota(ACRED);
 * 2. request:       delayed withdrawal of enough ACRED to fund a 2000
 *                   USDC/RLUSD withdrawal plus the leverage-maintaining debt
 *                   repayment, carrying a WITHDRAW_COLLATERAL intent with
 *                   the new sourceToken/debtRepaid fields;
 * 3. claim:         claim bracket -> swap claimed USDC into the underlying
 *                   reserving the withdrawal leftover -> decreaseDebt ->
 *                   [swap leftover USDC -> RLUSD] -> withdrawCollateral to
 *                   the wallet -> zero the phantom quota;
 * 4. close request: delayed withdrawal of all remaining ACRED with a
 *                   CLOSE_ACCOUNT intent, zeroing the ACRED quota;
 * 5. close:         claim bracket -> swap all claimed USDC into the
 *                   underlying -> zero phantom quota -> decreaseDebt(MAX) ->
 *                   redeemDiff leftover vault shares -> withdraw everything
 *                   to the wallet.
 *
 * The multicall composition of every transaction mirrors what the frontend
 * generates: swaps that must reserve a leftover use the router open-strategy
 * path with explicit leftoverBalances (RouterIntentQuoteSource leftover
 * branch), full-amount swaps use findOneTokenPath.
 *
 * Produces, under src/preview/__fixtures__:
 * - Mainnet-{block}-securitize.json: serialized `sdk.state` snapshot
 *   (including withdrawable assets of the withdrawal compressor);
 * - rwa-delayed/{scenario}/after_*.json: credit account snapshots taken
 *   between the transactions (after_open / after_request / after_claim /
 *   after_close_request / after_close);
 * - rwa-delayed/{scenario}/withdrawals_{pending,claimable}_{withdraw,close}.json:
 *   `getCurrentWithdrawals` snapshots for both delayed phases;
 * - rwa-delayed/{scenario}/redemption_log_{withdraw,close}.json:
 *   RedemptionLogger entries of the claimed redeemers, for stubbing the
 *   logger in claim-preview tests;
 * - rwa-delayed/{scenario}/txs.json: TxDump of all five transactions
 *   (see `dev/txdiff/types.ts`);
 * - rwa-delayed/{scenario}/wallet_received.json: investor wallet balance
 *   deltas of the withdrawn asset across the claim and close transactions,
 *   for cross-checking `receivedAmount` previews.
 *
 * The Securitize anvil RPC is public and the registry admin key is a
 * well-known anvil key, so no env vars are required.
 *
 * Usage:
 *   pnpm exec tsx dev/scripts/generate-rwa-delayed-fixtures.ts \
 *     > /tmp/rwa-gen.log 2>&1
 *
 * Routine regeneration does not require the original frontend transactions:
 * run `previewRWADelayedOperation.test.ts` and review the fixture git diff.
 *
 * When this generator is created or changed to imitate new frontend
 * transaction assembly, first obtain the frontend transactions in TxDump
 * format and compare them with:
 *   pnpm tx:diff <generated-txs.json> <frontend-txs.json>
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type Address,
  type Chain,
  erc20Abi,
  type Hex,
  http,
  type PrivateKeyAccount,
  parseEventLogs,
  parseUnits,
  type TransactionReceipt,
  type Transport,
  type WalletClient,
} from "viem";
import { iCreditFacadeV310Abi } from "../../src/abi/310/generated.js";
import { registerInvestor } from "../../src/dev/claimDSToken.js";
import {
  type AnvilClient,
  createAnvilClient,
} from "../../src/dev/createAnvilClient.js";
import { makePendingWithdrawalsClaimable } from "../../src/dev/withdrawalUtils.js";
import {
  createInvestorWallet,
  seedSecuritizePoolLiquidity,
  signRegisterVaultMessages,
} from "../../src/e2e/helpers/securitize.js";
import {
  AbstractAdapterContract,
  AdaptersPlugin,
} from "../../src/plugins/adapters/index.js";
import {
  type Asset,
  type ClaimableWithdrawal,
  type CreditAccountData,
  type CreditSuite,
  type DelayedIntent,
  type EncodableCreditAccountOperation,
  json_stringify,
  MAX_UINT256,
  MIN_INT96,
  type MultiCall,
  OnchainSDK,
  PERCENTAGE_FACTOR,
  type RawTx,
  RWA_FACTORY_SECURITIZE,
  type SecuritizeOperationArgs,
  sendRawTx,
} from "../../src/sdk/index.js";

const RPC_URL = "https://anvil.gearbox.foundation/rpc/Securitize";
const MARKET_CONFIGURATOR: Address =
  "0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad";
const RWA_FACTORY: Address = "0xc6f7b95f6fb8394541d9ac8b0abc94bf6e84f703";
// CreditManagerV310 (Mock dcUSDC, ACRED) of the Securitize RWA factory
const CREDIT_MANAGER_DCUSDC: Address =
  "0x025512D771f778fad99aB30b7A7363E7C8DE078D";
// CreditManagerV310 (Mock dcRLUSD, ACRED) of the Securitize RWA factory
const CREDIT_MANAGER_DCRLUSD: Address =
  "0x328BD41b79D23569071DcE7573EfFbb9d046D640";
// Securitize DSToken collateral of both markets (6 decimals)
const ACRED: Address = "0x17418038ecF73BA4026c4f428547BF099706F27B";
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const RLUSD: Address = "0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD";
// Well-known anvil key used as the Securitize registry admin on the fork
const SECURITIZE_ADMIN_PRIVATE_KEY: Hex =
  "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a";

const DEST_DIR = resolve(import.meta.dirname, "../../src/preview/__fixtures__");

// Scenario: "open a credit account depositing 20k USDC at 5x leverage into
// ACRED", then "withdraw 2000 USDC (or RLUSD) while maintaining leverage",
// then "close the account via delayed close + final claim"
const COLLATERAL_USDC = parseUnits("20000", 6);
const LEVERAGE = 5n;
const SLIPPAGE = 50;

type SecuritizeSDK = OnchainSDK<{ adapters: AdaptersPlugin }>;
type InvestorWallet = WalletClient<Transport, Chain, PrivateKeyAccount>;
type ScenarioName = "withdraw-usdc" | "withdraw-rlusd";

interface ScenarioConfig {
  name: ScenarioName;
  creditManager: Address;
  /**
   * Token the investor withdraws to the wallet at claim time (W)
   */
  withdrawToken: Address;
  /**
   * Amount of `withdrawToken` to withdraw (2000 USDC / 2000 RLUSD)
   */
  withdrawAmount: bigint;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    name: "withdraw-usdc",
    creditManager: CREDIT_MANAGER_DCUSDC,
    withdrawToken: USDC,
    withdrawAmount: parseUnits("2000", 6),
  },
  {
    name: "withdraw-rlusd",
    creditManager: CREDIT_MANAGER_DCRLUSD,
    withdrawToken: RLUSD,
    withdrawAmount: parseUnits("2000", 18),
  },
];

interface SavedTx {
  to: Address;
  calldata: Hex;
}

/**
 * Ordered step labels written into txs.json (TxDump format).
 */
const TX_LABELS = [
  "open",
  "request",
  "claim",
  "closeRequest",
  "close",
] as const;

type TxLabel = (typeof TX_LABELS)[number];

interface SavedTxs {
  open: SavedTx;
  request: SavedTx;
  claim: SavedTx;
  closeRequest: SavedTx;
  close: SavedTx;
}

interface WalletReceivedEntry {
  token: Address;
  amount: bigint;
}

interface WalletReceived {
  /**
   * Withdrawn asset delta across the claim tx (tx 3)
   */
  claim: WalletReceivedEntry;
  /**
   * Received asset delta across the final close tx (tx 5)
   */
  close: WalletReceivedEntry;
}

interface SetupSdkResult {
  sdk: SecuritizeSDK;
  anvil: AnvilClient;
}

interface InvestorContext {
  wallet: InvestorWallet;
  investor: Address;
}

interface OpenLeveragedAccountProps {
  sdk: SecuritizeSDK;
  wallet: InvestorWallet;
  investor: Address;
  cfg: ScenarioConfig;
}

interface OpenLeveragedAccountResult {
  creditAccount: Address;
  tx: SavedTx;
}

interface RequestDelayedWithdrawalProps {
  sdk: SecuritizeSDK;
  wallet: InvestorWallet;
  /**
   * Fresh credit account snapshot
   */
  creditAccount: CreditAccountData<true>;
  /**
   * Amount of ACRED to send to redemption
   */
  amount: bigint;
  intent: DelayedIntent;
}

interface ClaimWithResumeProps {
  sdk: SecuritizeSDK;
  wallet: InvestorWallet;
  /**
   * Fresh credit account snapshot (after the withdrawal request)
   */
  creditAccount: CreditAccountData<true>;
  cfg: ScenarioConfig;
  investor: Address;
  /**
   * `debtRepaid` carried by the WITHDRAW_COLLATERAL intent, caps the
   * decreaseDebt of the claim tail
   */
  debtRepaid: bigint;
}

interface ClaimTxResult {
  tx: SavedTx;
  /**
   * Redeemer contract the withdrawal was claimed from
   */
  redeemer: Address;
  /**
   * Investor wallet balance delta of the withdrawn asset across the tx
   */
  received: WalletReceivedEntry;
}

interface FinalClaimCloseProps {
  sdk: SecuritizeSDK;
  wallet: InvestorWallet;
  /**
   * Fresh credit account snapshot (after the close request)
   */
  creditAccount: CreditAccountData<true>;
  investor: Address;
}

/**
 * The credit facade rounds quota changes down to a multiple of
 * PERCENTAGE_FACTOR; the min quota bound must not exceed the rounded value,
 * otherwise the quota keeper reverts with QuotaIsOutOfBoundsException.
 */
function roundQuota(quota: bigint): bigint {
  return (quota / PERCENTAGE_FACTOR) * PERCENTAGE_FACTOR;
}

function minBigint(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

/**
 * Attaches the SDK to the Securitize anvil fork, loads withdrawable assets
 * (so they end up in the state snapshot) and dumps `sdk.state` to DEST_DIR.
 */
async function setupSdk(): Promise<SetupSdkResult> {
  const sdk: SecuritizeSDK = new OnchainSDK(
    "Mainnet",
    { rpcURLs: [RPC_URL], timeout: 120_000 },
    { plugins: { adapters: new AdaptersPlugin(true) } },
  );
  await sdk.attach({
    marketConfigurators: [MARKET_CONFIGURATOR],
    rwaFactories: [RWA_FACTORY],
    ignoreUpdateablePrices: true,
    loadZappers: true,
  });
  await sdk.tokensMeta.loadTokenData();
  if (!sdk.withdrawalCompressor) {
    throw new Error("withdrawal compressor is not available");
  }
  await sdk.withdrawalCompressor.loadWithdrawableAssets();

  const block = sdk.currentBlock;
  mkdirSync(DEST_DIR, { recursive: true });
  const statePath = resolve(DEST_DIR, `Mainnet-${block}-securitize.json`);
  writeFileSync(statePath, json_stringify(sdk.state));
  console.log(`SDK state snapshot (block ${block}): ${statePath}`);

  const anvil = createAnvilClient({
    chain: sdk.chain,
    transport: http(RPC_URL, { timeout: 120_000 }),
    pollingInterval: 100,
  });

  return { sdk, anvil };
}

/**
 * Creates a fresh investor wallet with 1 ETH for gas, registers it in the
 * Securitize registry (fake KYC, no minting - ACRED is bought via the
 * router) and deals it enough USDC for both scenarios.
 */
async function setupInvestor(
  sdk: SecuritizeSDK,
  anvil: AnvilClient,
): Promise<InvestorContext> {
  const wallet = await createInvestorWallet(anvil, sdk.chain);
  const investor = wallet.account.address;
  await registerInvestor({
    anvil,
    claimer: investor,
    adminPrivateKey: SECURITIZE_ADMIN_PRIVATE_KEY,
    token: ACRED,
  });
  // 50k USDC covers 20k collateral in both scenarios
  await anvil.deal({
    erc20: USDC,
    account: investor,
    amount: parseUnits("50000", 6),
  });
  console.log(`investor: ${investor}`);
  return { wallet, investor };
}

/**
 * Sends a raw tx from the investor wallet and asserts success.
 * Gas is estimated upfront and sent with 2x headroom: state on the shared
 * fork drifts between estimation and execution (e.g. NAV rate accrual), and
 * an exact estimate has caused out-of-gas reverts.
 */
async function sendTx(
  sdk: SecuritizeSDK,
  wallet: InvestorWallet,
  tx: RawTx,
  label: string,
): Promise<TransactionReceipt> {
  const gas = await sdk.client.estimateGas({
    account: wallet.account,
    to: tx.to,
    data: tx.callData,
    value: BigInt(tx.value),
  });
  const hash = await sendRawTx(wallet, { tx, gas: gas * 2n });
  const receipt = await sdk.client.waitForTransactionReceipt({
    hash,
    pollingInterval: 100,
  });
  if (receipt.status !== "success") {
    throw new Error(`${label} tx ${hash} reverted`);
  }
  console.log(`${label} tx: ${hash}`);
  return receipt;
}

/**
 * Fetches credit account data and dumps it to a json file.
 */
async function snapshotAccount(
  sdk: SecuritizeSDK,
  creditAccount: Address,
  path: string,
): Promise<CreditAccountData<true>> {
  const ca = await sdk.accounts.getCreditAccountData(creditAccount);
  if (!ca) {
    throw new Error(`credit account ${creditAccount} not found`);
  }
  writeFileSync(path, json_stringify(ca));
  console.log(`account snapshot: ${path}`);
  return ca;
}

/**
 * Fetches current withdrawals of the credit account via the withdrawal
 * compressor and dumps them to a json file.
 */
async function snapshotCurrentWithdrawals(
  sdk: SecuritizeSDK,
  creditAccount: Address,
  path: string,
): Promise<void> {
  if (!sdk.withdrawalCompressor) {
    throw new Error("withdrawal compressor is not available");
  }
  const withdrawals =
    await sdk.withdrawalCompressor.getCurrentWithdrawals(creditAccount);
  writeFileSync(path, json_stringify(withdrawals));
  console.log(`current withdrawals snapshot: ${path}`);
}

async function walletBalance(
  sdk: SecuritizeSDK,
  token: Address,
  owner: Address,
): Promise<bigint> {
  return sdk.client.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  });
}

/**
 * Opens a credit account with 20k USDC collateral at 5x leverage: borrows
 * vault shares worth 80k USDC and swaps everything into ACRED via the
 * router open-strategy path. The router emits the unwrap of the borrowed
 * vault shares (redeemDiff), an optional swap into USDC (dcRLUSD market)
 * and the ACRED buy inside its slippage-checked block, matching the
 * multicall composition the frontend generates.
 */
async function openLeveragedAccount({
  sdk,
  wallet,
  investor,
  cfg,
}: OpenLeveragedAccountProps): Promise<OpenLeveragedAccountResult> {
  const cm = sdk.marketRegister.findCreditManager(cfg.creditManager);
  const market = sdk.marketRegister.findByCreditManager(cfg.creditManager);

  const approvalTarget = await sdk.accounts.getApprovalAddress({
    creditManager: cfg.creditManager,
    borrower: investor,
  });
  const approveHash = await wallet.writeContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "approve",
    args: [approvalTarget, MAX_UINT256],
  });
  await sdk.client.waitForTransactionReceipt({
    hash: approveHash,
    pollingInterval: 100,
  });

  const requirements = await sdk.accounts.getOpenAccountRequirements(
    investor,
    cfg.creditManager,
    { tokenOutAddress: ACRED },
  );
  const rwaOptions: SecuritizeOperationArgs | undefined = requirements
    ? {
        type: RWA_FACTORY_SECURITIZE,
        tokensToRegister: requirements.tokensToRegister,
        signaturesToCache: await signRegisterVaultMessages(
          wallet,
          requirements.requiredSignatures,
        ),
      }
    : undefined;

  // Debt in vault shares worth 80k USDC. The borrowed amount is passed to
  // the router in the vault-share token, the same way the frontend does:
  // the router itself emits the unwrap (redeemDiff) and any USDC conversion
  // inside the storeExpectedBalances/compareBalances block
  const debt = market.priceOracle.convert(
    USDC,
    cm.underlying,
    COLLATERAL_USDC * (LEVERAGE - 1n),
  );

  const strategy = await sdk.routerFor(cm).findOpenStrategyPath({
    creditManager: cm.creditManager,
    expectedBalances: [
      { token: USDC, balance: COLLATERAL_USDC },
      { token: cm.underlying, balance: debt },
    ],
    leftoverBalances: [],
    slippage: SLIPPAGE,
    target: ACRED,
  });

  // Quota for the whole 100k USDC position, denominated in the underlying
  const quota = roundQuota(
    market.priceOracle.convert(USDC, cm.underlying, COLLATERAL_USDC * LEVERAGE),
  );
  const quotas = [{ token: ACRED, balance: quota }];

  const { tx } = await sdk.accounts.openCA({
    creditManager: cfg.creditManager,
    collateral: [{ token: USDC, balance: COLLATERAL_USDC }],
    debt,
    calls: strategy.calls,
    averageQuota: quotas,
    minQuota: quotas,
    to: investor,
    ethAmount: 0n,
    permits: {},
    referralCode: 0n,
    rwaOptions,
  });

  const receipt = await sendTx(sdk, wallet, tx, "open");
  const logs = parseEventLogs({
    abi: iCreditFacadeV310Abi,
    logs: receipt.logs,
    eventName: "OpenCreditAccount",
  });
  if (logs.length !== 1) {
    throw new Error("OpenCreditAccount event not emitted");
  }
  const creditAccount = logs[0].args.creditAccount;
  console.log(`credit account: ${creditAccount}`);

  return { creditAccount, tx: { to: tx.to, calldata: tx.callData } };
}

/**
 * Builds and sends a delayed withdrawal request tx: the intent is
 * abi-encoded into the request's `extraData`, quota deltas move the redeemed
 * ACRED value to the withdrawal phantom token.
 */
async function requestDelayedWithdrawal({
  sdk,
  wallet,
  creditAccount,
  amount,
  intent,
}: RequestDelayedWithdrawalProps): Promise<SavedTx> {
  const cm = sdk.marketRegister.findCreditManager(creditAccount.creditManager);
  const market = sdk.marketRegister.findByCreditManager(
    creditAccount.creditManager,
  );

  const preview = await sdk.accounts.previewDelayedWithdrawal({
    creditAccount: creditAccount.creditAccount,
    token: ACRED,
    amount,
    intent,
  });

  const phantomOutputs = preview.outputs.filter(o => o.isDelayed);
  if (phantomOutputs.length === 0) {
    throw new Error("withdrawal preview has no delayed outputs");
  }
  const phantomToken = phantomOutputs[0].token;
  const phantomOut = phantomOutputs.reduce((sum, o) => sum + o.amount, 0n);

  // Quota deltas: move the redeemed value from ACRED to the phantom token.
  // Quotas are denominated in the pool underlying, so the phantom output
  // (USDC-scale for Securitize) must be converted via the oracle - the
  // scales differ on the dcRLUSD market. The phantom quota is set slightly
  // below the expected output (the preview itself is a min guarantee); the
  // ACRED quota is reduced by the redeemed value, or removed entirely when
  // closing
  const phantomOutInUnderlying = market.priceOracle.convert(
    phantomToken,
    cm.underlying,
    phantomOut,
  );
  const acredQuotaDelta =
    intent.type === "CLOSE_ACCOUNT"
      ? MIN_INT96
      : -market.priceOracle.convert(ACRED, cm.underlying, preview.amountIn);
  const quotas = [
    {
      token: phantomToken,
      balance: roundQuota((phantomOutInUnderlying * 90n) / 100n),
    },
    { token: ACRED, balance: acredQuotaDelta },
  ];

  const { tx } = await sdk.accounts.startDelayedWithdrawal({
    creditAccount,
    preview,
    minQuota: quotas,
    averageQuota: quotas,
  });
  await sendTx(sdk, wallet, tx, intent.type.toLowerCase());

  return { to: tx.to, calldata: tx.callData };
}

/**
 * Resolves the redeemer contract from the claim calls, the same way
 * `detectDelayedClaim` does for parsed multicalls.
 */
function resolveClaimRedeemer(
  sdk: SecuritizeSDK,
  claimCalls: MultiCall[],
): Address {
  for (const call of claimCalls) {
    const contract = sdk.getContract(call.target);
    if (contract instanceof AbstractAdapterContract) {
      const claim = contract.parseDelayedWithdrawalClaim(call.callData);
      if (claim) {
        return claim.redeemer;
      }
    }
  }
  throw new Error("no delayed withdrawal claim found in claim calls");
}

interface ClaimableContext {
  cm: CreditSuite;
  claimable: ClaimableWithdrawal;
  /**
   * Token received instantly by the claim (USDC for Securitize)
   */
  claimToken: Address;
  /**
   * Sum of instant claim outputs in `claimToken`
   */
  claimedAmount: bigint;
  /**
   * Claim bracket: storeExpectedBalances -> claimCalls -> compareBalances
   */
  claimCalls: MultiCall[];
}

async function getClaimableContext(
  sdk: SecuritizeSDK,
  creditAccount: CreditAccountData<true>,
): Promise<ClaimableContext> {
  const cm = sdk.marketRegister.findCreditManager(creditAccount.creditManager);
  const { claimableNow } = await sdk.accounts.getPendingWithdrawals({
    creditAccount: creditAccount.creditAccount,
  });
  if (claimableNow.length !== 1) {
    throw new Error(
      `expected exactly 1 claimable withdrawal, got ${claimableNow.length}`,
    );
  }
  const claimable = claimableNow[0];
  const instant = claimable.outputs.filter(o => !o.isDelayed);
  if (instant.length === 0) {
    throw new Error("claimable withdrawal has no instant outputs");
  }
  const claimToken = instant[0].token;
  if (instant.some(o => o.token !== claimToken)) {
    throw new Error("claimable withdrawal has mixed instant output tokens");
  }
  const claimedAmount = instant.reduce((sum, o) => sum + o.amount, 0n);

  const claimCalls = sdk.accounts.assembleClaimDelayedCalls({
    creditFacade: cm.creditFacade.address,
    claimableNow: claimable,
  });

  return { cm, claimable, claimToken, claimedAmount, claimCalls };
}

/**
 * Builds and sends the claim tx with the WITHDRAW_COLLATERAL resume tail:
 * claim USDC -> swap it into the underlying reserving the withdrawal
 * leftover (open-strategy path with explicit leftoverBalances, like the
 * frontend's leftover branch) -> decreaseDebt capped by the intent's
 * debtRepaid -> [swap the leftover USDC into RLUSD] -> withdraw to the
 * wallet -> zero the phantom quota.
 */
async function claimWithResume({
  sdk,
  wallet,
  creditAccount,
  cfg,
  investor,
  debtRepaid,
}: ClaimWithResumeProps): Promise<ClaimTxResult> {
  const market = sdk.marketRegister.findByCreditManager(
    creditAccount.creditManager,
  );
  const { cm, claimable, claimToken, claimedAmount, claimCalls } =
    await getClaimableContext(sdk, creditAccount);

  // Withdrawal amount converted to the claim token: the exact withdrawal
  // amount when they match (scenario 1), oracle conversion otherwise
  // (scenario 2, RLUSD -> USDC)
  const withdrawInClaimToken =
    cfg.withdrawToken === claimToken
      ? cfg.withdrawAmount
      : market.priceOracle.convert(
          cfg.withdrawToken,
          claimToken,
          cfg.withdrawAmount,
        );

  // Swap the claimed USDC into the underlying, reserving the withdrawal
  // leftover on the account. Same call as the frontend's
  // RouterIntentQuoteSource leftover branch: open-strategy path with
  // explicit leftoverBalances so the router emits diff calls with the
  // correct leftover encoding
  const debtSwap = await sdk.routerFor(cm).findOpenStrategyPath({
    creditManager: cm.creditManager,
    expectedBalances: [{ token: claimToken, balance: claimedAmount }],
    leftoverBalances: [{ token: claimToken, balance: withdrawInClaimToken }],
    slippage: SLIPPAGE,
    target: cm.underlying,
  });

  const operations: EncodableCreditAccountOperation[] = [
    { type: "swap", calls: debtSwap.calls },
    { type: "decreaseDebt", amount: minBigint(debtSwap.minAmount, debtRepaid) },
  ];

  let withdrawAmount = cfg.withdrawAmount;
  if (cfg.withdrawToken !== claimToken) {
    // Swap the reserved USDC leftover into the withdrawal token
    // (full-amount swap -> findOneTokenPath, like the frontend)
    const withdrawSwap = await sdk.routerFor(cm).findOneTokenPath({
      creditAccount,
      creditManager: cm.creditManager,
      tokenIn: claimToken,
      tokenOut: cfg.withdrawToken,
      amount: withdrawInClaimToken,
      slippage: SLIPPAGE,
    });
    operations.push({ type: "swap", calls: withdrawSwap.calls });
    withdrawAmount = withdrawSwap.minAmount;
  }

  operations.push(
    {
      type: "withdrawCollateral",
      token: cfg.withdrawToken,
      amount: withdrawAmount,
      to: investor,
    },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [
        { token: claimable.withdrawalPhantomToken, balance: MIN_INT96 },
      ],
    },
  );

  const tailCalls = sdk.accounts.assembleCaOperations({
    operations,
    creditFacade: cm.creditFacade.address,
  });

  const { tx } = await sdk.accounts.executeCaUpdate(creditAccount, [
    ...claimCalls,
    ...tailCalls,
  ]);

  const balanceBefore = await walletBalance(sdk, cfg.withdrawToken, investor);
  await sendTx(sdk, wallet, tx, "claim");
  const balanceAfter = await walletBalance(sdk, cfg.withdrawToken, investor);

  const redeemer = resolveClaimRedeemer(sdk, claimable.claimCalls);
  return {
    tx: { to: tx.to, calldata: tx.callData },
    redeemer,
    received: {
      token: cfg.withdrawToken,
      amount: balanceAfter - balanceBefore,
    },
  };
}

/**
 * Builds and sends the final claim + close tx, mirroring the frontend's
 * CLOSE_ACCOUNT resume (`resolveCloseOrRepayIntentPreviewAsync`):
 * claim USDC -> `findBestClosePath` over all predicted post-claim balances
 * (leftoverBalances: []) -> `assembleCloseCreditAccountCalls` (router swap
 * bracket -> disable quotas -> decreaseDebt(MAX) -> redeemDiff(1) ->
 * withdrawCollateral(MAX) to the wallet).
 */
async function finalClaimClose({
  sdk,
  wallet,
  creditAccount,
  investor,
}: FinalClaimCloseProps): Promise<ClaimTxResult> {
  const { cm, claimable, claimToken, claimedAmount, claimCalls } =
    await getClaimableContext(sdk, creditAccount);

  // Predicted post-claim balances: the phantom token is burned by the claim,
  // the claim token balance grows by the claimed amount. Everything else
  // (e.g. withdrawal-token dust left by the claim-tail swap of tx 3) is
  // included with leftoverBalances: [], so the close path sweeps it too -
  // same shape as the frontend's `creditAccount.assets` input.
  // The claim token is upserted explicitly: the account snapshot only lists
  // tokens with non-zero balances, and the claim token balance is usually
  // exactly 0 before the claim
  const phantom = claimable.withdrawalPhantomToken;
  const balancesByToken = new Map<Address, bigint>();
  for (const t of creditAccount.tokens) {
    if (t.token !== phantom) {
      balancesByToken.set(t.token, t.balance);
    }
  }
  balancesByToken.set(
    claimToken,
    (balancesByToken.get(claimToken) ?? 0n) + claimedAmount,
  );
  const expectedBalances: Asset[] = [...balancesByToken.entries()]
    .filter(([, balance]) => balance > 1n)
    .map(([token, balance]) => ({ token, balance }));

  // Overlay expected balances onto account tokens (appending tokens missing
  // from the snapshot), the same way the frontend's
  // PathfinderApi.findBestClosePath does before calling the router
  const knownTokens = new Set(creditAccount.tokens.map(t => t.token));
  const caWithClaim: CreditAccountData<true> = {
    ...creditAccount,
    tokens: [
      ...creditAccount.tokens.map(t => {
        const balance = balancesByToken.get(t.token);
        return balance === undefined ? t : { ...t, balance };
      }),
      ...expectedBalances
        .filter(a => !knownTokens.has(a.token))
        .map(a => ({
          token: a.token,
          balance: a.balance,
          quota: 0n,
          mask: 0n,
          success: true,
        })),
    ],
  };

  const closePath = await sdk.routerFor(cm).findBestClosePath({
    creditAccount: caWithClaim,
    creditManager: cm.creditManager,
    slippage: SLIPPAGE,
    balances: {
      expectedBalances,
      leftoverBalances: [],
      tokensToClaim: [],
    },
  });

  // The asset ultimately received by the wallet: the RWA asset of the
  // credit manager's underlying (USDC for dcUSDC, RLUSD for dcRLUSD)
  const meta = sdk.tokensMeta.mustGet(cm.underlying);
  const receivedAsset = sdk.tokensMeta.isRWAUnderlying(meta)
    ? meta.asset
    : cm.underlying;

  // Router swap bracket -> disable remaining quotas (the phantom; ACRED was
  // already zeroed by the close request) -> decreaseDebt(MAX) ->
  // redeemDiff(1) leftover vault shares -> withdrawCollateral(MAX)
  const closeCalls = await sdk.accounts.assembleCloseCreditAccountCalls({
    creditAccount: caWithClaim,
    routerCalls: closePath.calls,
    assetsToWithdraw: [receivedAsset],
    to: investor,
  });

  const { tx } = await sdk.accounts.executeCaUpdate(creditAccount, [
    ...claimCalls,
    ...closeCalls,
  ]);

  const balanceBefore = await walletBalance(sdk, receivedAsset, investor);
  await sendTx(sdk, wallet, tx, "close");
  const balanceAfter = await walletBalance(sdk, receivedAsset, investor);

  const redeemer = resolveClaimRedeemer(sdk, claimable.claimCalls);
  return {
    tx: { to: tx.to, calldata: tx.callData },
    redeemer,
    received: { token: receivedAsset, amount: balanceAfter - balanceBefore },
  };
}

async function saveRedemptionLog(
  sdk: SecuritizeSDK,
  redeemer: Address,
  path: string,
): Promise<void> {
  if (!sdk.redemptionLogger) {
    throw new Error("redemption logger is not deployed");
  }
  const log = await sdk.redemptionLogger.getRedemptionLog(redeemer);
  writeFileSync(path, json_stringify(log));
  console.log(`redemption log of redeemer ${redeemer}: ${path}`);
}

/**
 * Runs one scenario end to end (all 5 transactions) and writes its fixtures
 * into DEST_DIR/rwa-delayed/{scenario}.
 */
async function runScenario(
  { sdk, anvil }: SetupSdkResult,
  { wallet, investor }: InvestorContext,
  cfg: ScenarioConfig,
): Promise<void> {
  console.log(`\n=== scenario: ${cfg.name} ===`);
  const dir = resolve(DEST_DIR, "rwa-delayed", cfg.name);
  mkdirSync(dir, { recursive: true });

  const cm = sdk.marketRegister.findCreditManager(cfg.creditManager);
  const market = sdk.marketRegister.findByCreditManager(cfg.creditManager);

  // Tx 1: open with 20k USDC collateral at 5x leverage
  const { creditAccount, tx: openTx } = await openLeveragedAccount({
    sdk,
    wallet,
    investor,
    cfg,
  });
  const afterOpen = await snapshotAccount(
    sdk,
    creditAccount,
    resolve(dir, "after_open.json"),
  );

  // Tx 2: delayed withdrawal request carrying the WITHDRAW_COLLATERAL
  // intent. Withdrawing W at fixed leverage L shrinks the position by W*L:
  // W goes to the wallet at claim time, W*(L-1) worth of ACRED is redeemed
  // and its proceeds repay debt
  const withdrawInUnderlying = market.priceOracle.convert(
    cfg.withdrawToken,
    cm.underlying,
    cfg.withdrawAmount,
  );
  const debtRepaid = withdrawInUnderlying * (LEVERAGE - 1n);
  const redeemAcred = market.priceOracle.convert(
    cm.underlying,
    ACRED,
    withdrawInUnderlying + debtRepaid,
  );
  const withdrawIntent: DelayedIntent = {
    type: "WITHDRAW_COLLATERAL",
    to: investor,
    withdrawToken: cfg.withdrawToken,
    withdrawAmount: cfg.withdrawAmount,
    sourceToken: ACRED,
    debtRepaid,
  };
  const requestTx = await requestDelayedWithdrawal({
    sdk,
    wallet,
    creditAccount: afterOpen,
    amount: redeemAcred,
    intent: withdrawIntent,
  });
  const afterRequest = await snapshotAccount(
    sdk,
    creditAccount,
    resolve(dir, "after_request.json"),
  );
  await snapshotCurrentWithdrawals(
    sdk,
    creditAccount,
    resolve(dir, "withdrawals_pending_withdraw.json"),
  );

  // Make the pending withdrawal claimable via anvil cheatcodes.
  // No time warp: warping the shared fork ~90 days forward makes RedStone
  // feeds permanently stale and breaks the whole testnet. Dealing stablecoins
  // to the redeemer is enough for the Securitize flow.
  await makePendingWithdrawalsClaimable(anvil, creditAccount, {});
  await snapshotCurrentWithdrawals(
    sdk,
    creditAccount,
    resolve(dir, "withdrawals_claimable_withdraw.json"),
  );

  // Tx 3: claim with the intent's resume tail
  const claimResult = await claimWithResume({
    sdk,
    wallet,
    creditAccount: afterRequest,
    cfg,
    investor,
    debtRepaid,
  });
  const afterClaim = await snapshotAccount(
    sdk,
    creditAccount,
    resolve(dir, "after_claim.json"),
  );
  await saveRedemptionLog(
    sdk,
    claimResult.redeemer,
    resolve(dir, "redemption_log_withdraw.json"),
  );

  // Tx 4: delayed close request for all remaining ACRED
  const acredBalance =
    afterClaim.tokens.find(t => t.token === ACRED)?.balance ?? 0n;
  if (acredBalance <= 1n) {
    throw new Error("no ACRED left on the credit account after the claim");
  }
  const closeIntent: DelayedIntent = { type: "CLOSE_ACCOUNT", to: investor };
  const closeRequestTx = await requestDelayedWithdrawal({
    sdk,
    wallet,
    creditAccount: afterClaim,
    amount: acredBalance,
    intent: closeIntent,
  });
  const afterCloseRequest = await snapshotAccount(
    sdk,
    creditAccount,
    resolve(dir, "after_close_request.json"),
  );
  await snapshotCurrentWithdrawals(
    sdk,
    creditAccount,
    resolve(dir, "withdrawals_pending_close.json"),
  );

  await makePendingWithdrawalsClaimable(anvil, creditAccount, {});
  await snapshotCurrentWithdrawals(
    sdk,
    creditAccount,
    resolve(dir, "withdrawals_claimable_close.json"),
  );

  // Tx 5: final claim + close
  const closeResult = await finalClaimClose({
    sdk,
    wallet,
    creditAccount: afterCloseRequest,
    investor,
  });
  await snapshotAccount(sdk, creditAccount, resolve(dir, "after_close.json"));
  await saveRedemptionLog(
    sdk,
    closeResult.redeemer,
    resolve(dir, "redemption_log_close.json"),
  );

  const saved: SavedTxs = {
    open: openTx,
    request: requestTx,
    claim: claimResult.tx,
    closeRequest: closeRequestTx,
    close: closeResult.tx,
  };
  // TxDump shape shared with frontend dumps and `pnpm tx:diff`
  const txsDump = {
    description: `${cfg.name}: withdraw ${cfg.withdrawAmount} of ${cfg.withdrawToken}`,
    chainId: 1,
    transactions: TX_LABELS.map((label: TxLabel) => ({
      label,
      to: saved[label].to,
      data: saved[label].calldata,
    })),
  };
  writeFileSync(resolve(dir, "txs.json"), json_stringify(txsDump));
  console.log(`txs saved: ${resolve(dir, "txs.json")}`);

  const walletReceived: WalletReceived = {
    claim: claimResult.received,
    close: closeResult.received,
  };
  writeFileSync(
    resolve(dir, "wallet_received.json"),
    json_stringify(walletReceived),
  );
  console.log(`wallet received: ${resolve(dir, "wallet_received.json")}`);
}

async function main(): Promise<void> {
  const setup = await setupSdk();
  const investorCtx = await setupInvestor(setup.sdk, setup.anvil);

  for (const cfg of SCENARIOS) {
    const market = setup.sdk.marketRegister.findByCreditManager(
      cfg.creditManager,
    );
    await seedSecuritizePoolLiquidity(
      setup.sdk,
      setup.anvil,
      market.pool.pool.address,
    );
  }

  for (const cfg of SCENARIOS) {
    await runScenario(setup, investorCtx, cfg);
  }

  console.log("\ndone");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
