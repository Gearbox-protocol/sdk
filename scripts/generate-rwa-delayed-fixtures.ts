/**
 * Generates fixtures for delayed RWA (Securitize) operation preview tests
 * (see previewRWADelayedOperation.test.ts) by replaying two scenarios on the
 * public Securitize anvil Mainnet fork:
 *
 * 1. "close":    open a credit account with 20 ACRED collateral at 5x
 *                leverage -> delayed withdraw-all with CLOSE_ACCOUNT intent ->
 *                claim + full debt repay + withdraw-all;
 * 2. "withdraw": same open -> delayed withdrawal of 2 ACRED while maintaining
 *                leverage (8 ACRED redeemed, proceeds repay debt) ->
 *                claim + partial debt repay + withdraw 2 ACRED to the wallet.
 *
 * The multicall composition of every transaction mirrors what the frontend
 * generates: the open tx unwraps the borrowed vault shares via the
 * router-emitted redeemDiff inside the slippage-checked block.
 *
 * Produces, under src/preview/__fixtures__:
 * - Mainnet-{block}-securitize.json: serialized `sdk.state` snapshot
 *   (including withdrawable assets of the withdrawal compressor);
 * - rwa-delayed/{close,withdraw}/after_*.json: credit account snapshots
 *   taken between the transactions;
 * - rwa-delayed/{close,withdraw}/withdrawals_{pending,claimable}.json:
 *   `getCurrentWithdrawals` snapshots taken after the withdrawal request
 *   and after the withdrawal is forced claimable;
 * - rwa-delayed/{close,withdraw}/txs.json: raw calldata of the open /
 *   request / claim transactions;
 * - rwa-delayed/{close,withdraw}/redemption_log.json: RedemptionLogger entry
 *   of the claimed redeemer, for stubbing the logger in claim-preview tests.
 *
 * The Securitize anvil RPC is public and the registry admin key is a
 * well-known anvil key, so no env vars are required.
 *
 * Usage:
 *   tsx scripts/generate-rwa-delayed-fixtures.ts
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
  type TransactionReceipt,
  type Transport,
  type WalletClient,
} from "viem";
import { iCreditFacadeV310Abi } from "../src/abi/310/generated.js";
import { claimDSToken } from "../src/dev/claimDSToken.js";
import {
  type AnvilClient,
  createAnvilClient,
} from "../src/dev/createAnvilClient.js";
import { makePendingWithdrawalsClaimable } from "../src/dev/withdrawalUtils.js";
import {
  createInvestorWallet,
  seedSecuritizePoolLiquidity,
  signRegisterVaultMessages,
} from "../src/e2e/helpers/securitize.js";
import {
  AbstractAdapterContract,
  AdaptersPlugin,
} from "../src/plugins/adapters/index.js";
import {
  type ClaimableWithdrawal,
  type CreditAccountData,
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
  sendRawTx,
} from "../src/sdk/index.js";

const RPC_URL = "https://anvil.gearbox.foundation/rpc/Securitize";
const MARKET_CONFIGURATOR: Address =
  "0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad";
const RWA_FACTORY: Address = "0xc6f7b95f6fb8394541d9ac8b0abc94bf6e84f703";
// CreditManagerV310 (Mock dcUSDC, ACRED) of the Securitize RWA factory
const CREDIT_MANAGER: Address = "0x025512D771f778fad99aB30b7A7363E7C8DE078D";
// Securitize DSToken collateral of the market (6 decimals)
const ACRED: Address = "0x17418038ecF73BA4026c4f428547BF099706F27B";
// Well-known anvil key used as the Securitize registry admin on the fork
const SECURITIZE_ADMIN_PRIVATE_KEY: Hex =
  "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a";

const DEST_DIR = resolve(import.meta.dirname, "../src/preview/__fixtures__");

// Scenario: "open credit account with 20 ACRED collateral and 5x leverage",
// then "withdraw 2 ACRED from this account while maintaining leverage"
const COLLATERAL_ACRED = 20_000_000n; // 20 ACRED
const LEVERAGE = 5n;
const WITHDRAW_ACRED = 2_000_000n; // 2 ACRED
// Withdrawing 2 ACRED of net value at 5x leverage shrinks the total position
// by 2 * 5 = 10 ACRED: 2 ACRED go to the wallet at claim time, the other
// 2 * (5 - 1) = 8 ACRED are redeemed and their proceeds repay debt
const REDEEM_ACRED = WITHDRAW_ACRED * (LEVERAGE - 1n); // 8 ACRED
const SLIPPAGE = 50;

type SecuritizeSDK = OnchainSDK<{ adapters: AdaptersPlugin }>;
type InvestorWallet = WalletClient<Transport, Chain, PrivateKeyAccount>;
type ScenarioName = "close" | "withdraw";

interface SavedTx {
  to: Address;
  calldata: Hex;
}

interface SetupSdkResult {
  sdk: SecuritizeSDK;
  anvil: AnvilClient;
  /**
   * Pool of the hardcoded credit manager, used for liquidity seeding
   */
  pool: Address;
}

interface InvestorContext {
  wallet: InvestorWallet;
  investor: Address;
}

interface OpenLeveragedAccountProps {
  sdk: SecuritizeSDK;
  wallet: InvestorWallet;
  investor: Address;
}

interface OpenLeveragedAccountResult {
  creditAccount: Address;
  tx: SavedTx;
}

interface RequestDelayedWithdrawalProps {
  sdk: SecuritizeSDK;
  wallet: InvestorWallet;
  /**
   * Fresh credit account snapshot (after opening)
   */
  creditAccount: CreditAccountData<true>;
  /**
   * Amount of ACRED to send to redemption
   */
  amount: bigint;
  intent: DelayedIntent;
}

interface ClaimWithResumeTailProps {
  sdk: SecuritizeSDK;
  wallet: InvestorWallet;
  /**
   * Fresh credit account snapshot (after the withdrawal request)
   */
  creditAccount: CreditAccountData<true>;
  scenario: ScenarioName;
  investor: Address;
}

interface ClaimWithResumeTailResult {
  tx: SavedTx;
  /**
   * Redeemer contract the withdrawal was claimed from
   */
  redeemer: Address;
}

/**
 * The credit facade rounds quota changes down to a multiple of
 * PERCENTAGE_FACTOR; the min quota bound must not exceed the rounded value,
 * otherwise the quota keeper reverts with QuotaIsOutOfBoundsException.
 */
function roundQuota(quota: bigint): bigint {
  return (quota / PERCENTAGE_FACTOR) * PERCENTAGE_FACTOR;
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

  const market = sdk.marketRegister.findByCreditManager(CREDIT_MANAGER);
  return { sdk, anvil, pool: market.pool.pool.address };
}

/**
 * Creates a fresh investor wallet with 1 ETH for gas and mints ACRED to it,
 * registering the wallet in the Securitize registry (fake KYC) on the way.
 */
async function setupInvestor(
  sdk: SecuritizeSDK,
  anvil: AnvilClient,
): Promise<InvestorContext> {
  const wallet = await createInvestorWallet(anvil, sdk.chain);
  const investor = wallet.account.address;
  // 100k USD worth of ACRED is enough for 20 ACRED collateral in both
  // scenarios
  await claimDSToken({
    anvil,
    claimer: investor,
    adminPrivateKey: SECURITIZE_ADMIN_PRIVATE_KEY,
    token: ACRED,
    usdAmount: "100000",
    marketConfigurators: [MARKET_CONFIGURATOR],
    rwaFactories: [RWA_FACTORY],
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

/**
 * Opens a credit account with 20 ACRED collateral at 5x leverage: borrows
 * dcUSDC worth 80 ACRED and swaps it into ACRED via the router path. The
 * borrowed amount is routed in the vault-share token so the router emits the
 * unwrap (redeemDiff into USDC) inside its slippage-checked block, matching
 * the multicall composition the frontend generates.
 */
async function openLeveragedAccount({
  sdk,
  wallet,
  investor,
}: OpenLeveragedAccountProps): Promise<OpenLeveragedAccountResult> {
  const cm = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
  const market = sdk.marketRegister.findByCreditManager(CREDIT_MANAGER);

  const approvalTarget = await sdk.accounts.getApprovalAddress({
    creditManager: CREDIT_MANAGER,
    borrower: investor,
  });
  const approveHash = await wallet.writeContract({
    address: ACRED,
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
    CREDIT_MANAGER,
    { tokenOutAddress: ACRED },
  );
  if (!requirements) {
    throw new Error("getOpenAccountRequirements returned undefined");
  }
  const signaturesToCache = await signRegisterVaultMessages(
    wallet,
    requirements.requiredSignatures,
  );

  // Debt in dcUSDC vault shares worth 80 ACRED (mock vault is 1:1 with USDC).
  // The borrowed amount is passed to the router in the vault-share token, the
  // same way the frontend does: the router itself emits the unwrap
  // (redeemDiff) inside the storeExpectedBalances/compareBalances block
  const borrowedAcred = COLLATERAL_ACRED * (LEVERAGE - 1n);
  const debt = market.priceOracle.convert(ACRED, cm.underlying, borrowedAcred);

  const strategy = await sdk.routerFor(cm).findOpenStrategyPath({
    creditManager: cm.creditManager,
    expectedBalances: [
      { token: ACRED, balance: COLLATERAL_ACRED },
      { token: cm.underlying, balance: debt },
    ],
    leftoverBalances: [{ token: ACRED, balance: COLLATERAL_ACRED }],
    slippage: SLIPPAGE,
    target: ACRED,
  });

  // Quota for the whole 100 ACRED position, denominated in the underlying
  const quota = roundQuota(
    market.priceOracle.convert(
      ACRED,
      cm.underlying,
      COLLATERAL_ACRED * LEVERAGE,
    ),
  );
  const quotas = [{ token: ACRED, balance: quota }];

  const { tx } = await sdk.accounts.openCA({
    creditManager: CREDIT_MANAGER,
    collateral: [{ token: ACRED, balance: COLLATERAL_ACRED }],
    debt,
    calls: strategy.calls,
    averageQuota: quotas,
    minQuota: quotas,
    to: investor,
    ethAmount: 0n,
    permits: {},
    referralCode: 0n,
    rwaOptions: {
      type: RWA_FACTORY_SECURITIZE,
      tokensToRegister: [ACRED],
      signaturesToCache,
    },
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
 * Builds and sends the delayed withdrawal request tx: the intent is
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
  // The phantom quota is set slightly below the expected output (the preview
  // itself is a min guarantee); the ACRED quota is reduced by the redeemed
  // value, or removed entirely when closing
  const acredQuotaDelta =
    intent.type === "CLOSE_ACCOUNT"
      ? MIN_INT96
      : -market.priceOracle.convert(ACRED, cm.underlying, preview.amountIn);
  const quotas = [
    { token: phantomToken, balance: roundQuota((phantomOut * 90n) / 100n) },
    { token: ACRED, balance: acredQuotaDelta },
  ];

  const { tx } = await sdk.accounts.startDelayedWithdrawal({
    creditAccount,
    preview,
    minQuota: quotas,
    averageQuota: quotas,
  });
  await sendTx(sdk, wallet, tx, "request");

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

/**
 * Builds and sends the claim tx with the intent's resume tail:
 * - "close":    claim USDC -> deposit into the vault -> repay the whole debt
 *               -> withdraw all remaining underlying to the investor;
 * - "withdraw": claim USDC -> deposit into the vault -> repay debt with the
 *               entire claimed amount (maintaining leverage) -> withdraw
 *               2 ACRED to the investor.
 */
async function claimWithResumeTail({
  sdk,
  wallet,
  creditAccount,
  scenario,
  investor,
}: ClaimWithResumeTailProps): Promise<ClaimWithResumeTailResult> {
  const cm = sdk.marketRegister.findCreditManager(creditAccount.creditManager);
  const market = sdk.marketRegister.findByCreditManager(
    creditAccount.creditManager,
  );

  const { claimableNow } = await sdk.accounts.getPendingWithdrawals({
    creditAccount: creditAccount.creditAccount,
  });
  if (claimableNow.length !== 1) {
    throw new Error(
      `expected exactly 1 claimable withdrawal, got ${claimableNow.length}`,
    );
  }
  const claimable: ClaimableWithdrawal = claimableNow[0];
  const claimedUnderlying = claimable.outputs
    .filter(o => !o.isDelayed)
    .reduce((sum, o) => sum + o.amount, 0n);
  if (claimedUnderlying === 0n) {
    throw new Error("claimable withdrawal has no instant outputs");
  }

  const claimCalls = sdk.accounts.assembleClaimDelayedCalls({
    creditFacade: cm.creditFacade.address,
    claimableNow: claimable,
  });

  // Deposit the claimed USDC back into the dcUSDC vault so it can repay debt
  const wrapCalls = await sdk.accounts.getRWAWrapCalls(
    claimedUnderlying,
    creditAccount.creditManager,
  );
  if (!wrapCalls) {
    throw new Error("getRWAWrapCalls returned undefined");
  }

  let tail: EncodableCreditAccountOperation[];
  if (scenario === "close") {
    tail = [
      { type: "wrapRwaCollateral", calls: wrapCalls },
      // all quotas must be zeroed before debt can be decreased to zero,
      // otherwise the credit manager reverts with
      // DebtToZeroWithActiveQuotasException
      {
        type: "changeQuota",
        quotaIncrease: [],
        quotaDecrease: [
          { token: claimable.withdrawalPhantomToken, balance: MIN_INT96 },
        ],
      },
      { type: "decreaseDebt", amount: MAX_UINT256 },
      {
        type: "withdrawCollateral",
        token: cm.underlying,
        amount: MAX_UINT256,
        to: investor,
      },
    ];
  } else {
    tail = [
      { type: "wrapRwaCollateral", calls: wrapCalls },
      { type: "decreaseDebt", amount: claimedUnderlying },
      {
        type: "withdrawCollateral",
        token: ACRED,
        amount: WITHDRAW_ACRED,
        to: investor,
      },
      {
        type: "changeQuota",
        quotaIncrease: [],
        quotaDecrease: [
          {
            token: ACRED,
            balance: -roundQuota(
              market.priceOracle.convert(ACRED, cm.underlying, WITHDRAW_ACRED),
            ),
          },
          { token: claimable.withdrawalPhantomToken, balance: MIN_INT96 },
        ],
      },
    ];
  }
  const tailCalls = sdk.accounts.assembleCaOperations({
    operations: tail,
    creditFacade: cm.creditFacade.address,
  });

  const { tx } = await sdk.accounts.executeCaUpdate(creditAccount, [
    ...claimCalls,
    ...tailCalls,
  ]);
  await sendTx(sdk, wallet, tx, "claim");

  const redeemer = resolveClaimRedeemer(sdk, claimable.claimCalls);
  return { tx: { to: tx.to, calldata: tx.callData }, redeemer };
}

/**
 * Runs one scenario end to end and writes all its fixtures into
 * DEST_DIR/rwa-delayed/{scenario}.
 */
async function runScenario(
  { sdk, anvil }: SetupSdkResult,
  { wallet, investor }: InvestorContext,
  scenario: ScenarioName,
): Promise<void> {
  console.log(`\n=== scenario: ${scenario} ===`);
  const dir = resolve(DEST_DIR, "rwa-delayed", scenario);
  mkdirSync(dir, { recursive: true });

  // Step 1: open with 20 ACRED collateral at 5x leverage
  const { creditAccount, tx: openTx } = await openLeveragedAccount({
    sdk,
    wallet,
    investor,
  });
  const afterOpen = await snapshotAccount(
    sdk,
    creditAccount,
    resolve(dir, "after_open.json"),
  );

  // Step 2: delayed withdrawal request carrying the intent
  const isClose = scenario === "close";
  const acredBalance =
    afterOpen.tokens.find(t => t.token === ACRED)?.balance ?? 0n;
  if (acredBalance === 0n) {
    throw new Error("no ACRED on the credit account after opening");
  }
  const intent: DelayedIntent = isClose
    ? { type: "CLOSE_ACCOUNT", to: investor }
    : {
        type: "WITHDRAW_COLLATERAL",
        to: investor,
        withdrawToken: ACRED,
        withdrawAmount: WITHDRAW_ACRED,
      };
  const requestTx = await requestDelayedWithdrawal({
    sdk,
    wallet,
    creditAccount: afterOpen,
    amount: isClose ? acredBalance : REDEEM_ACRED,
    intent,
  });
  const afterRequest = await snapshotAccount(
    sdk,
    creditAccount,
    resolve(dir, isClose ? "after_close.json" : "after_withdraw.json"),
  );
  await snapshotCurrentWithdrawals(
    sdk,
    creditAccount,
    resolve(dir, "withdrawals_pending.json"),
  );

  // Step 3: make the pending withdrawal claimable via anvil cheatcodes.
  // No time warp: warping the shared fork ~90 days forward makes RedStone
  // feeds permanently stale and breaks the whole testnet. Dealing stablecoins
  // to the redeemer is enough for the Securitize flow.
  await makePendingWithdrawalsClaimable(anvil, creditAccount, {});
  await snapshotCurrentWithdrawals(
    sdk,
    creditAccount,
    resolve(dir, "withdrawals_claimable.json"),
  );

  // Step 4: claim with the intent's resume tail
  const { tx: claimTx, redeemer } = await claimWithResumeTail({
    sdk,
    wallet,
    creditAccount: afterRequest,
    scenario,
    investor,
  });
  await snapshotAccount(sdk, creditAccount, resolve(dir, "after_claim.json"));

  // Step 5: snapshot the redemption log of the claimed redeemer
  if (!sdk.redemptionLogger) {
    throw new Error("redemption logger is not deployed");
  }
  const log = await sdk.redemptionLogger.getRedemptionLog(redeemer);
  writeFileSync(resolve(dir, "redemption_log.json"), json_stringify(log));
  console.log(`redemption log of redeemer ${redeemer} saved`);

  writeFileSync(
    resolve(dir, "txs.json"),
    json_stringify({ open: openTx, request: requestTx, claim: claimTx }),
  );
  console.log(`txs saved: ${resolve(dir, "txs.json")}`);
}

async function main(): Promise<void> {
  const setup = await setupSdk();
  const investorCtx = await setupInvestor(setup.sdk, setup.anvil);
  await seedSecuritizePoolLiquidity(setup.sdk, setup.anvil, setup.pool);

  await runScenario(setup, investorCtx, "close");
  await runScenario(setup, investorCtx, "withdraw");

  console.log("\ndone");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
