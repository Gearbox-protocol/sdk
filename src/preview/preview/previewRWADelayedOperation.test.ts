import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom, type Hex } from "viem";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AdaptersPlugin } from "../../plugins/adapters/index.js";
import {
  type Asset,
  type CreditAccountData,
  json_parse,
  OnchainSDK,
  type RedemptionLog,
  RedemptionLoggerV310Contract,
} from "../../sdk/index.js";
import { previewOperation } from "./previewOperation.js";
import {
  type AdjustCreditAccountPreview,
  type CloseCreditAccountPreview,
  type DelayedCreditAccountOperationPreview,
  type OpenCreditAccountPreview,
  PREVIEW_DUST,
} from "./types.js";

// Integration-style tests for delayed RWA operations: two 5-transaction
// scenarios executed against the Securitize anvil Mainnet fork by
// `generate-rwa-delayed-fixtures.ts`, with credit account snapshots
// taken between the transactions (see __fixtures__/rwa-delayed).
//
// Each scenario opens an account with 20k USDC at 5x leverage (buys ACRED),
// then runs a delayed withdrawal of 2000 units of the withdraw token at
// fixed leverage (WITHDRAW_COLLATERAL intent -> claim with the resume tail),
// then a delayed close (CLOSE_ACCOUNT intent -> final claim + close):
// 1. "withdraw-usdc":  dcUSDC credit manager, withdraws USDC;
// 2. "withdraw-rlusd": dcRLUSD credit manager, withdraws RLUSD (the claim
//    proceeds are in USDC and are partially swapped into RLUSD).
//
// The SDK state fixture is a `dehydrate` snapshot of the same fork.
const FIXTURES = resolve(import.meta.dirname, "../__fixtures__");

// Securitize DSToken collateral of both markets
const ACRED: Address = "0x17418038ecF73BA4026c4f428547BF099706F27B";
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const RLUSD: Address = "0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD";
// Delayed-withdrawal phantom token of the redemption gateway (srpACRED_USDC),
// shared by both markets
const PHANTOM: Address = "0xe4a38b653B2580C9D72a50F190Ddd6E2d2D2a412";

const STATE_FIXTURE = resolve(FIXTURES, "Mainnet-25590929-securitize.json");

interface ScenarioSpec {
  name: "withdraw-usdc" | "withdraw-rlusd";
  /**
   * Token withdrawn to the wallet by the WITHDRAW_COLLATERAL flow, and
   * received by the wallet when the account is closed
   */
  withdrawToken: Address;
  /**
   * 2000 units of `withdrawToken`
   */
  withdrawAmount: bigint;
}

const SCENARIOS: ScenarioSpec[] = [
  {
    name: "withdraw-usdc",
    withdrawToken: USDC,
    withdrawAmount: 2000n * 10n ** 6n,
  },
  {
    name: "withdraw-rlusd",
    withdrawToken: RLUSD,
    withdrawAmount: 2000n * 10n ** 18n,
  },
];

interface SavedTx {
  to: Address;
  calldata: Hex;
}

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
  claim: WalletReceivedEntry;
  close: WalletReceivedEntry;
}

/**
 * All fixtures of one scenario, loaded from
 * `__fixtures__/rwa-delayed/{scenario}`.
 */
interface ScenarioFixtures {
  txs: SavedTxs;
  afterOpen: CreditAccountData<true>;
  afterRequest: CreditAccountData<true>;
  afterClaim: CreditAccountData<true>;
  afterCloseRequest: CreditAccountData<true>;
  afterClose: CreditAccountData<true>;
  /**
   * Investor wallet balance deltas of the withdrawn asset across the claim
   * (tx 3) and close (tx 5) transactions
   */
  walletReceived: WalletReceived;
  redemptionLogs: RedemptionLog[];
}

function readScenarioJson<T>(scenario: string, file: string): T {
  return json_parse(
    readFileSync(resolve(FIXTURES, "rwa-delayed", scenario, file), "utf-8"),
  ) as T;
}

function loadScenario(scenario: string): ScenarioFixtures {
  return {
    txs: readScenarioJson<SavedTxs>(scenario, "txs.json"),
    afterOpen: readScenarioJson<CreditAccountData<true>>(
      scenario,
      "after_open.json",
    ),
    afterRequest: readScenarioJson<CreditAccountData<true>>(
      scenario,
      "after_request.json",
    ),
    afterClaim: readScenarioJson<CreditAccountData<true>>(
      scenario,
      "after_claim.json",
    ),
    afterCloseRequest: readScenarioJson<CreditAccountData<true>>(
      scenario,
      "after_close_request.json",
    ),
    afterClose: readScenarioJson<CreditAccountData<true>>(
      scenario,
      "after_close.json",
    ),
    walletReceived: readScenarioJson<WalletReceived>(
      scenario,
      "wallet_received.json",
    ),
    redemptionLogs: [
      readScenarioJson<RedemptionLog>(scenario, "redemption_log_withdraw.json"),
      readScenarioJson<RedemptionLog>(scenario, "redemption_log_close.json"),
    ],
  };
}

const FIXTURES_BY_SCENARIO: Record<string, ScenarioFixtures> =
  Object.fromEntries(SCENARIOS.map(s => [s.name, loadScenario(s.name)]));

/**
 * Redemption logs snapshotted from the fork after each withdrawal request,
 * keyed by lowercased redeemer address. Claim previews read the recorded
 * `DelayedIntent` from the `RedemptionLogger` contract, so the mocked
 * `getRedemptionLog` serves these snapshots instead.
 */
const REDEMPTION_LOGS: Record<string, RedemptionLog> = Object.fromEntries(
  Object.values(FIXTURES_BY_SCENARIO)
    .flatMap(f => f.redemptionLogs)
    .map(log => [log.redeemer.toLowerCase(), log]),
);

let sdk: OnchainSDK<{ adapters: AdaptersPlugin }>;

beforeAll(() => {
  // Claim previews read the recorded intent through the redemption logger
  // contract: serve the snapshotted logs from its mocked on-chain read,
  // keeping the real intent decoding (`getDelayedIntent`) under test.
  // Every claim in the scenarios targets a redeemer with a snapshotted log,
  // so an unknown redeemer is a test failure.
  vi.spyOn(
    RedemptionLoggerV310Contract.prototype,
    "getRedemptionLog",
  ).mockImplementation(async redeemer => {
    const log = REDEMPTION_LOGS[redeemer.toLowerCase()];
    if (!log) {
      throw new Error(
        `unexpected redemption log read for redeemer ${redeemer}`,
      );
    }
    return log;
  });

  // The preview must run fully offline: any RPC request is a test failure
  sdk = new OnchainSDK(
    "Mainnet",
    {
      transport: custom({
        request: async ({ method }) => {
          throw new Error(
            `offline: unexpected RPC request ${method} in RWA delayed preview test`,
          );
        },
      }),
    },
    { plugins: { adapters: new AdaptersPlugin(true) } },
  );
  sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
});

afterAll(() => {
  vi.restoreAllMocks();
});

function findBalance(ca: CreditAccountData, token: Address): bigint {
  return ca.tokens.find(t => t.token === token)?.balance ?? 0n;
}

function findQuota(ca: CreditAccountData, token: Address): bigint {
  return ca.tokens.find(t => t.token === token)?.quota ?? 0n;
}

/**
 * Tokens of the input account snapshot that an operation leaves untouched:
 * everything except `touched`, dust filtered out. Untouched tokens keep
 * their exact input balances in preview outputs.
 */
function untouchedAssets(ca: CreditAccountData, touched: Address[]): Asset[] {
  return ca.tokens
    .filter(t => !touched.includes(t.token) && t.balance > PREVIEW_DUST)
    .map(({ token, balance }) => ({ token, balance }));
}

describe.each(SCENARIOS)("RWA delayed scenario $name", spec => {
  const {
    txs,
    afterOpen,
    afterRequest,
    afterClaim,
    afterCloseRequest,
    walletReceived,
  } = FIXTURES_BY_SCENARIO[spec.name];
  // RWA accounts are owned by a per-account proxy vault: the actual EOA
  // behind the account (the tx sender and the intents' `to`) is `investor`
  const investor = afterOpen.investor as Address;

  // Tx 1: open with 20k USDC collateral at 5x leverage; the router swaps
  // the collateral and the borrowed vault shares into ACRED.
  it("previews the account opening with 20k USDC at 5x leverage", async () => {
    const preview = (await previewOperation({
      sdk,
      to: txs.open.to,
      calldata: txs.open.calldata,
      sender: investor,
      value: 0n,
    })) as OpenCreditAccountPreview;

    expect(preview).toMatchObject({
      operation: "RWAOpenCreditAccount",
      error: undefined,
      collateral: [{ token: USDC, balance: 20_000_000000n }],
      collateralValue: expect.toBeWithinBps(
        afterOpen.totalValue - afterOpen.debt,
      ),
      debt: afterOpen.debt,
      // the desired ACRED quota carries a safety buffer above the position
      // value and does not match the on-chain quota exactly
      quotas: [
        {
          token: ACRED,
          balance: expect.toBeWithinBps(findQuota(afterOpen, ACRED), 500n),
        },
      ],
      // the min guaranteed post-open assets: the ACRED position only
      assets: [
        {
          token: ACRED,
          balance: expect.toBeWithinBpsBelow(findBalance(afterOpen, ACRED)),
        },
      ],
      // The min guaranteed ACRED position must not exceed the actual
      // on-chain result, and must be within slippage of it
      target: {
        token: ACRED,
        balance: expect.toBeWithinBpsBelow(findBalance(afterOpen, ACRED)),
      },
    });
  });

  // Tx 2: delayed withdrawal request carrying the WITHDRAW_COLLATERAL
  // intent: enough ACRED to fund the withdrawal plus the leverage-keeping
  // debt repayment is sent to redemption (phantom token minted), debt is
  // untouched until the withdrawal is claimed.
  it("previews the delayed withdrawal request and its resume", async () => {
    const preview = (await previewOperation(
      {
        sdk,
        to: txs.request.to,
        calldata: txs.request.calldata,
        sender: investor,
        value: 0n,
      },
      { creditAccount: afterOpen },
    )) as DelayedCreditAccountOperationPreview;

    expect(preview).toMatchObject({
      operation: "DelayedCreditAccountOperation",
      // The decoded intent carries the new sourceToken/debtRepaid fields
      intent: {
        type: "WITHDRAW_COLLATERAL",
        to: investor,
        withdrawToken: spec.withdrawToken,
        withdrawAmount: spec.withdrawAmount,
        sourceToken: ACRED,
        debtRepaid: expect.toSatisfy((v: bigint) => v > 0n),
      },
      // Instant preview vs the actual state after the request tx: the
      // request only moves ACRED into the phantom token, debt is untouched.
      // The phantom balance is a min guarantee, the quota is set explicitly
      // by the tx and must match exactly
      instantPreview: {
        operation: "AdjustCreditAccount",
        error: undefined,
        // the request moves nothing to or from the wallet
        collateralAdded: [],
        collateralWithdrawn: [],
        // debt is untouched until the withdrawal is claimed
        debt: afterOpen.debt,
        debtChange: 0n,
        // min guaranteed account value vs the actual post-request state
        totalValue: expect.toBeWithinBps(afterRequest.totalValue),
        assets: expect.toEqualUnordered([
          {
            token: PHANTOM,
            balance: expect.toBeWithinBpsBelow(
              findBalance(afterRequest, PHANTOM),
            ),
          },
          { token: ACRED, balance: findBalance(afterRequest, ACRED) },
        ]),
        quotas: expect.toEqualUnordered([
          { token: PHANTOM, balance: findQuota(afterRequest, PHANTOM) },
          // the desired ACRED quota carries a safety buffer and does not
          // match the on-chain value exactly
          { token: ACRED, balance: expect.anything() },
        ]),
      },
      // Delayed preview vs the actual state after the claim tx (the
      // resume): the full withdrawal amount goes to the wallet, the claim
      // remainder repays debt capped by the intent's debtRepaid. The account
      // ends up where the delayed preview predicted: same ACRED position
      // (the claim doesn't touch it), debt within swap slippage of the
      // oracle-estimated repayment, phantom token gone
      delayedPreview: {
        operation: "AdjustCreditAccount",
        error: undefined,
        // the resume adds nothing from the wallet
        collateralAdded: [],
        collateralWithdrawn: [
          { token: spec.withdrawToken, balance: spec.withdrawAmount },
        ],
        // oracle estimate of the post-claim account value vs the actual
        // state after the claim tx
        totalValue: expect.toBeWithinBps(afterClaim.totalValue),
        debt: expect.toBeWithinBps(afterClaim.debt),
        debtChange: expect.toSatisfy((v: bigint) => v < 0n),
        // the claim zeroes the phantom quota: only the (buffered, see
        // instantPreview) ACRED quota is left
        quotas: expect.toEqualUnordered([
          { token: ACRED, balance: expect.anything() },
        ]),
        assets: expect.toEqualUnordered([
          { token: ACRED, balance: findBalance(afterClaim, ACRED) },
        ]),
      },
    });

    // the intent lives on the outer delayed preview only: the inner
    // adjustment previews carry no intent of their own
    expect(preview.instantPreview.intent).toBeUndefined();
    expect(preview.delayedPreview.intent).toBeUndefined();
  });

  // Tx 3: the claim with the intent's resume tail. Not a delayed operation
  // itself: a regular adjustment whose intent is read back from the
  // redemption logger.
  it("previews the claim tx with the WITHDRAW_COLLATERAL resume tail", async () => {
    const preview = (await previewOperation(
      {
        sdk,
        to: txs.claim.to,
        calldata: txs.claim.calldata,
        sender: investor,
        value: 0n,
      },
      { creditAccount: afterRequest },
    )) as AdjustCreditAccountPreview;

    expect(preview).toMatchObject({
      operation: "AdjustCreditAccount",
      // the intent recorded by the request tx, served by the redemption
      // logger
      intent: {
        type: "WITHDRAW_COLLATERAL",
        to: investor,
        withdrawToken: spec.withdrawToken,
        withdrawAmount: spec.withdrawAmount,
        sourceToken: ACRED,
        debtRepaid: expect.toSatisfy((v: bigint) => v > 0n),
      },
      // the claim adds nothing from the wallet
      collateralAdded: [],
      // the withdrawal leaves with the exact calldata amount (min guarantee
      // for the RLUSD swap), within slippage of the requested 2000
      collateralWithdrawn: [
        {
          token: spec.withdrawToken,
          balance: expect.toBeWithinBps(spec.withdrawAmount),
        },
      ],
      // Cross-check against the actual state after the claim tx: the debt
      // may only grow by the interest accrued between the snapshots, the
      // ACRED quota is untouched by the claim and must match exactly
      debt: expect.toBeWithinBpsBelow(afterClaim.debt, 1n),
      // the claim remainder repays debt
      debtChange: expect.toSatisfy((v: bigint) => v < 0n),
      // min guaranteed account value vs the actual post-claim state
      totalValue: expect.toBeWithinBps(afterClaim.totalValue),
      quotas: expect.toEqualUnordered([
        { token: ACRED, balance: findQuota(afterClaim, ACRED) },
      ]),
      assets: expect.toEqualUnordered([
        { token: ACRED, balance: findBalance(afterClaim, ACRED) },
      ]),
    });
  });

  // Tx 4: delayed close request: all remaining ACRED goes to redemption
  // with a CLOSE_ACCOUNT intent, the ACRED quota is zeroed.
  it("previews the delayed close request and its resume", async () => {
    const preview = (await previewOperation(
      {
        sdk,
        to: txs.closeRequest.to,
        calldata: txs.closeRequest.calldata,
        sender: investor,
        value: 0n,
      },
      { creditAccount: afterClaim },
    )) as DelayedCreditAccountOperationPreview;

    expect(preview).toMatchObject({
      operation: "DelayedCreditAccountOperation",
      intent: { type: "CLOSE_ACCOUNT", to: investor },
      // Instant preview vs the actual state after the request: ACRED fully
      // redeemed, the phantom balance is a min guarantee, the phantom quota
      // is set explicitly by the tx and must match exactly
      instantPreview: {
        operation: "AdjustCreditAccount",
        error: undefined,
        // the request moves nothing to or from the wallet
        collateralAdded: [],
        collateralWithdrawn: [],
        // debt is untouched until the withdrawal is claimed
        debt: afterClaim.debt,
        debtChange: 0n,
        // min guaranteed account value vs the actual post-request state
        totalValue: expect.toBeWithinBps(afterCloseRequest.totalValue),
        // ACRED fully redeemed into the phantom token, the residues left by
        // the claim tx are untouched
        assets: expect.toEqualUnordered([
          {
            token: PHANTOM,
            balance: expect.toBeWithinBpsBelow(
              findBalance(afterCloseRequest, PHANTOM),
            ),
          },
          ...untouchedAssets(afterClaim, [ACRED, PHANTOM]),
        ]),
        quotas: expect.toEqualUnordered([
          { token: PHANTOM, balance: findQuota(afterCloseRequest, PHANTOM) },
        ]),
      },
      // Delayed preview: a closure that pays the wallet the leftover after
      // the full debt repayment, denominated in the unwrapped underlying;
      // the wallet actually received the predicted leftover, within slippage
      delayedPreview: {
        operation: "CloseCreditAccount",
        error: undefined,
        // a zero-debt closure: the account stays open but is emptied
        permanent: false,
        receivedAmount: {
          token: spec.withdrawToken,
          balance: expect.toBeWithinBps(walletReceived.close.amount),
        },
      },
    });

    // the intent lives on the outer delayed preview only: the inner
    // instant/close previews carry no intent of their own
    expect(preview.instantPreview.intent).toBeUndefined();
    expect(preview.delayedPreview.intent).toBeUndefined();
  });

  // Tx 5: the final claim + close: claim USDC, sweep everything into the
  // underlying, repay the whole debt and withdraw the leftover.
  it("previews the final claim tx as a closure", async () => {
    const preview = (await previewOperation(
      {
        sdk,
        to: txs.close.to,
        calldata: txs.close.calldata,
        sender: investor,
        value: 0n,
      },
      { creditAccount: afterCloseRequest },
    )) as CloseCreditAccountPreview;

    // decreaseDebt(MAX) + withdrawCollateral(MAX) and no new withdrawal
    // request: a zero-debt closure (the account stays open but empty)
    expect(preview).toMatchObject({
      operation: "CloseCreditAccount",
      error: undefined,
      // zero-debt closure via a plain multicall, not the facade
      // closeCreditAccount entry point
      permanent: false,
      // the intent recorded by the close request, from the redemption logger
      intent: { type: "CLOSE_ACCOUNT", to: investor },
      // this preview replays the actual calldata, whose router bracket
      // carries slippage-adjusted minimum amounts: the prediction is a min
      // guarantee below the actual wallet delta (slippage + the vault NAV
      // round trip)
      receivedAmount: {
        token: spec.withdrawToken,
        balance: expect.toBeWithinBpsBelow(walletReceived.close.amount, 300n),
      },
    });
  });
});
