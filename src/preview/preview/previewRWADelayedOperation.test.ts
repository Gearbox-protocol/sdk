import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type Address,
  custom,
  decodeFunctionData,
  encodeFunctionResult,
  type Hex,
  zeroAddress,
} from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iRedemptionLoggerV310Abi } from "../../abi/iRedemptionLoggerV310.js";
import { AdaptersPlugin } from "../../plugins/adapters/index.js";
import {
  type Asset,
  type CreditAccountData,
  json_parse,
  OnchainSDK,
  type RedemptionLog,
} from "../../sdk/index.js";
import { previewOperation } from "./previewOperation.js";
import type {
  AdjustCreditAccountPreview,
  CloseCreditAccountPreview,
  DelayedCreditAccountOperationPreview,
  OpenCreditAccountPreview,
} from "./types.js";

// Integration-style tests for delayed RWA operations: two 5-transaction
// scenarios executed against the Securitize anvil Mainnet fork by
// `scripts/generate-rwa-delayed-fixtures.ts`, with credit account snapshots
// taken between the transactions (see __fixtures__/rwa-delayed). The
// multicall composition of every transaction is identical to what the
// frontend generates (verified against manually generated reference
// transactions by `scripts/compare-rwa-delayed-txs.ts`).
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
// Regenerate everything with `tsx scripts/generate-rwa-delayed-fixtures.ts`.
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
  { name: "withdraw-usdc", withdrawToken: USDC, withdrawAmount: 2000_000000n },
  {
    name: "withdraw-rlusd",
    withdrawToken: RLUSD,
    withdrawAmount: 2000_000000000000000000n,
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
 * `DelayedIntent` from the `RedemptionLogger` contract, so the offline
 * transport serves these snapshots instead.
 */
const REDEMPTION_LOGS: Record<string, RedemptionLog> = Object.fromEntries(
  Object.values(FIXTURES_BY_SCENARIO)
    .flatMap(f => f.redemptionLogs)
    .map(log => [log.redeemer.toLowerCase(), log]),
);

interface EthCallParams {
  data?: Hex;
}

let sdk: OnchainSDK<{ adapters: AdaptersPlugin }>;

beforeAll(() => {
  // The preview must run fully offline: the only allowed RPC request is the
  // `redemptionLogs` eth_call of the redemption logger, answered from the
  // snapshots above; anything else is a test failure.
  sdk = new OnchainSDK(
    "Mainnet",
    {
      transport: custom({
        request: async ({ method, params }) => {
          if (method === "eth_call") {
            const [call] = params as [EthCallParams];
            try {
              const { functionName, args } = decodeFunctionData({
                abi: iRedemptionLoggerV310Abi,
                data: call.data ?? "0x",
              });
              if (functionName === "redemptionLogs") {
                const [redeemer] = args;
                const log = REDEMPTION_LOGS[redeemer.toLowerCase()] ?? {
                  creditAccount: zeroAddress,
                  redeemer: zeroAddress,
                  extraData: "0x",
                };
                return encodeFunctionResult({
                  abi: iRedemptionLoggerV310Abi,
                  functionName: "redemptionLogs",
                  result: log,
                });
              }
            } catch {
              // not a redemption logger call: fall through to the error
            }
          }
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

function findBalance(ca: CreditAccountData, token: Address): bigint {
  return ca.tokens.find(t => t.token === token)?.balance ?? 0n;
}

function findQuota(ca: CreditAccountData, token: Address): bigint {
  return ca.tokens.find(t => t.token === token)?.quota ?? 0n;
}

function findAsset(assets: Asset[], token: Address): bigint {
  return assets.find(a => a.token === token)?.balance ?? 0n;
}

/**
 * Asserts that `actual` deviates from the oracle-estimated `predicted` value
 * by at most `bps` basis points: previews estimate router swaps with oracle
 * conversions, real swaps add slippage and fees.
 */
function expectWithinBps(actual: bigint, predicted: bigint, bps = 100n): void {
  const diff = actual >= predicted ? actual - predicted : predicted - actual;
  expect(diff * 10_000n).toBeLessThanOrEqual(predicted * bps);
}

describe.each(SCENARIOS)("RWA delayed scenario $name", spec => {
  const fx = () => FIXTURES_BY_SCENARIO[spec.name];
  // RWA accounts are owned by a per-account proxy vault: the actual EOA
  // behind the account (the tx sender and the intents' `to`) is `investor`
  const investor = (): Address => {
    const address = fx().afterOpen.investor;
    if (!address) {
      throw new Error("expected an investor on the RWA account snapshot");
    }
    return address;
  };

  // Tx 1: open with 20k USDC collateral at 5x leverage; the router swaps
  // the collateral and the borrowed vault shares into ACRED.
  it("previews the account opening with 20k USDC at 5x leverage", async () => {
    const { txs, afterOpen } = fx();
    const preview = (await previewOperation({
      sdk,
      to: txs.open.to,
      calldata: txs.open.calldata,
      sender: investor(),
      value: 0n,
    })) as OpenCreditAccountPreview;

    expect(preview.operation).toBe("RWAOpenCreditAccount");
    expect(preview.creditManager).toBe(afterOpen.creditManager);
    expect(preview.collateral).toEqual([
      { token: USDC, balance: 20_000_000000n },
    ]);
    const target = preview.target;
    if (!target) {
      throw new Error("expected a target asset on the open preview");
    }
    expect(target.token).toBe(ACRED);

    // The min guaranteed ACRED position must not exceed the actual on-chain
    // result, and must be within slippage of it
    const actualAcred = findBalance(afterOpen, ACRED);
    expect(actualAcred).toBeGreaterThanOrEqual(target.balance);
    expectWithinBps(actualAcred, target.balance);
  });

  // Tx 2: delayed withdrawal request carrying the WITHDRAW_COLLATERAL
  // intent: enough ACRED to fund the withdrawal plus the leverage-keeping
  // debt repayment is sent to redemption (phantom token minted), debt is
  // untouched until the withdrawal is claimed.
  it("previews the delayed withdrawal request and its resume", async () => {
    const { txs, afterOpen, afterRequest, afterClaim, walletReceived } = fx();
    const preview = (await previewOperation(
      {
        sdk,
        to: txs.request.to,
        calldata: txs.request.calldata,
        sender: investor(),
        value: 0n,
      },
      { creditAccount: afterOpen },
    )) as DelayedCreditAccountOperationPreview;

    expect(preview.operation).toBe("DelayedCreditAccountOperation");
    expect(preview.creditAccount).toBe(afterOpen.creditAccount);
    expect(preview.creditManager).toBe(afterOpen.creditManager);

    // The decoded intent carries the new sourceToken/debtRepaid fields
    expect(preview.intent).toMatchObject({
      type: "WITHDRAW_COLLATERAL",
      to: investor(),
      withdrawToken: spec.withdrawToken,
      withdrawAmount: spec.withdrawAmount,
      sourceToken: ACRED,
    });
    if (preview.intent?.type !== "WITHDRAW_COLLATERAL") {
      throw new Error("expected WITHDRAW_COLLATERAL intent");
    }
    expect(preview.intent.debtRepaid).toBeGreaterThan(0n);

    // Instant preview vs the actual state after the request tx: the request
    // only moves ACRED into the phantom token, debt is untouched. The
    // phantom balance is a min guarantee, the quota is set explicitly by the
    // tx and must match exactly
    const instant = preview.instantPreview as AdjustCreditAccountPreview;
    expect(instant.operation).toBe("AdjustCreditAccount");
    expect(instant.error).toBeUndefined();
    expect(instant.debtChange).toBe(0n);
    const actualPhantom = findBalance(afterRequest, PHANTOM);
    expect(actualPhantom).toBeGreaterThanOrEqual(
      findAsset(instant.assets, PHANTOM),
    );
    expectWithinBps(actualPhantom, findAsset(instant.assets, PHANTOM), 1n);
    expect(findQuota(afterRequest, PHANTOM)).toBe(
      findAsset(instant.quotas, PHANTOM),
    );
    expect(findAsset(instant.assets, ACRED)).toBe(
      findBalance(afterRequest, ACRED),
    );

    // Delayed preview vs the actual state after the claim tx (the resume):
    // the full withdrawal amount goes to the wallet, the claim remainder
    // repays debt capped by the intent's debtRepaid
    const delayed = preview.delayedPreview as AdjustCreditAccountPreview;
    expect(delayed.operation).toBe("AdjustCreditAccount");
    expect(delayed.error).toBeUndefined();
    expect(delayed.collateralWithdrawn).toEqual([
      { token: spec.withdrawToken, balance: spec.withdrawAmount },
    ]);
    // the wallet actually received the withdrawal, within slippage
    expect(walletReceived.claim.token).toBe(spec.withdrawToken);
    expectWithinBps(walletReceived.claim.amount, spec.withdrawAmount);
    // the account ends up where the delayed preview predicted: same ACRED
    // position (the claim doesn't touch it), debt within swap slippage of
    // the oracle-estimated repayment, phantom token gone
    expect(findAsset(delayed.assets, ACRED)).toBe(
      findBalance(afterClaim, ACRED),
    );
    expect(findAsset(delayed.assets, PHANTOM)).toBe(0n);
    expect(findBalance(afterClaim, PHANTOM)).toBe(0n);
    expectWithinBps(afterClaim.debt, delayed.debt);
    expect(delayed.debtChange).toBeLessThan(0n);
  });

  // Tx 3: the claim with the intent's resume tail. Not a delayed operation
  // itself: a regular adjustment whose intent is read back from the
  // redemption logger.
  it("previews the claim tx with the WITHDRAW_COLLATERAL resume tail", async () => {
    const { txs, afterRequest, afterClaim } = fx();
    const preview = (await previewOperation(
      {
        sdk,
        to: txs.claim.to,
        calldata: txs.claim.calldata,
        sender: investor(),
        value: 0n,
      },
      { creditAccount: afterRequest },
    )) as AdjustCreditAccountPreview;

    expect(preview.operation).toBe("AdjustCreditAccount");
    // the intent recorded by the request tx, served by the redemption logger
    expect(preview.intent).toMatchObject({
      type: "WITHDRAW_COLLATERAL",
      to: investor(),
      withdrawToken: spec.withdrawToken,
      withdrawAmount: spec.withdrawAmount,
      sourceToken: ACRED,
    });

    // the withdrawal leaves with the exact calldata amount (min guarantee
    // for the RLUSD swap), within slippage of the requested 2000
    expect(preview.collateralWithdrawn).toHaveLength(1);
    expect(preview.collateralWithdrawn[0].token).toBe(spec.withdrawToken);
    expectWithinBps(
      preview.collateralWithdrawn[0].balance,
      spec.withdrawAmount,
    );

    // Cross-check against the actual state after the claim tx: the debt may
    // only grow by the interest accrued between the snapshots, the ACRED
    // quota is untouched by the claim and must match exactly
    expect(afterClaim.debt).toBeGreaterThanOrEqual(preview.debt);
    expectWithinBps(afterClaim.debt, preview.debt, 1n);
    expect(findQuota(afterClaim, ACRED)).toBe(findAsset(preview.quotas, ACRED));
    expect(findBalance(afterClaim, ACRED)).toBe(
      findAsset(preview.assets, ACRED),
    );
  });

  // Tx 4: delayed close request: all remaining ACRED goes to redemption
  // with a CLOSE_ACCOUNT intent, the ACRED quota is zeroed.
  it("previews the delayed close request and its resume", async () => {
    const { txs, afterClaim, afterCloseRequest, walletReceived } = fx();
    const preview = (await previewOperation(
      {
        sdk,
        to: txs.closeRequest.to,
        calldata: txs.closeRequest.calldata,
        sender: investor(),
        value: 0n,
      },
      { creditAccount: afterClaim },
    )) as DelayedCreditAccountOperationPreview;

    expect(preview.operation).toBe("DelayedCreditAccountOperation");
    expect(preview.intent).toEqual({ type: "CLOSE_ACCOUNT", to: investor() });

    // Instant preview vs the actual state after the request: ACRED fully
    // redeemed, phantom quota set explicitly
    const instant = preview.instantPreview as AdjustCreditAccountPreview;
    expect(instant.error).toBeUndefined();
    expect(findAsset(instant.assets, ACRED)).toBe(0n);
    expect(findBalance(afterCloseRequest, ACRED)).toBeLessThanOrEqual(1n);
    const actualPhantom = findBalance(afterCloseRequest, PHANTOM);
    expect(actualPhantom).toBeGreaterThanOrEqual(
      findAsset(instant.assets, PHANTOM),
    );
    expect(findQuota(afterCloseRequest, PHANTOM)).toBe(
      findAsset(instant.quotas, PHANTOM),
    );

    // Delayed preview: a closure that pays the wallet the leftover after
    // the full debt repayment, denominated in the unwrapped underlying
    const delayed = preview.delayedPreview as CloseCreditAccountPreview;
    expect(delayed.operation).toBe("CloseCreditAccount");
    expect(delayed.error).toBeUndefined();
    expect(delayed.receivedAmount.token).toBe(spec.withdrawToken);
    // the wallet actually received the predicted leftover, within slippage
    expect(walletReceived.close.token).toBe(spec.withdrawToken);
    expectWithinBps(
      walletReceived.close.amount,
      delayed.receivedAmount.balance,
    );
  });

  // Tx 5: the final claim + close: claim USDC, sweep everything into the
  // underlying, repay the whole debt and withdraw the leftover.
  it("previews the final claim tx as a closure", async () => {
    const { txs, afterCloseRequest, afterClose, walletReceived } = fx();
    const preview = (await previewOperation(
      {
        sdk,
        to: txs.close.to,
        calldata: txs.close.calldata,
        sender: investor(),
        value: 0n,
      },
      { creditAccount: afterCloseRequest },
    )) as CloseCreditAccountPreview;

    // decreaseDebt(MAX) + withdrawCollateral(MAX) and no new withdrawal
    // request: a zero-debt closure (the account stays open but empty)
    expect(preview.operation).toBe("CloseCreditAccount");
    // the intent recorded by the close request, from the redemption logger
    expect(preview.intent).toEqual({ type: "CLOSE_ACCOUNT", to: investor() });
    expect(preview.receivedAmount.token).toBe(spec.withdrawToken);
    // this preview replays the actual calldata, whose router bracket carries
    // slippage-adjusted minimum amounts: the prediction is a min guarantee
    // below the actual wallet delta (slippage + the vault NAV round trip)
    expect(walletReceived.close.amount).toBeGreaterThanOrEqual(
      preview.receivedAmount.balance,
    );
    expectWithinBps(
      walletReceived.close.amount,
      preview.receivedAmount.balance,
      300n,
    );

    // the account is actually empty after the close tx
    expect(afterClose.debt).toBe(0n);
    for (const t of afterClose.tokens) {
      expect(t.balance).toBeLessThanOrEqual(1n);
    }
  });
});
