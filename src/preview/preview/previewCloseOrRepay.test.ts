import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom, type Hex } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { AdaptersPlugin } from "../../plugins/adapters/index.js";
import {
  type CreditAccountData,
  json_parse,
  OnchainSDK,
} from "../../sdk/index.js";
import { previewOperation } from "./previewOperation.js";

const FIXTURES = resolve(import.meta.dirname, "../__fixtures__");

describe("close/repay with withdrawals (WETH strategy)", () => {
  const STATE_FIXTURE = resolve(
    FIXTURES,
    "Mainnet-25475508-adjust-credit-account.json",
  );
  const ACCOUNT_FIXTURE = resolve(
    FIXTURES,
    "Mainnet-close-credit-account-data.json",
  );

  // KPK WETH strategy credit facade all transactions call
  const FACADE: Address = "0x9515AB9BB73A9642F1a93Ba7C2790e9d08227f9a";
  const CREDIT_MANAGER: Address = "0x79C6C1ce5B12abCC3E407ce8C160eE1160250921";
  const CREDIT_ACCOUNT: Address = "0xE22cEd1808c22455747F366Cf94d45B3201302d3";
  const OWNER: Address = "0xC32FEB4DBd127a1993478Ad6E5250710f838b908";

  const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const WEETH: Address = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee";

  let sdk: OnchainSDK<{ adapters: AdaptersPlugin }>;
  let creditAccount: CreditAccountData;

  beforeAll(() => {
    sdk = new OnchainSDK(
      "Mainnet",
      {
        transport: custom({
          request: async () => {
            throw new Error("offline: preview test must not hit RPC");
          },
        }),
      },
      { plugins: { adapters: new AdaptersPlugin(true) } },
    );
    sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
    creditAccount = json_parse(readFileSync(ACCOUNT_FIXTURE, "utf-8"));
  });

  // transactions are generated against the anvil Mainnet fork using frontend
  // UI, but never sent
  function preview(calldata: Hex) {
    return previewOperation(
      { sdk, to: FACADE, calldata, sender: OWNER, value: 0n },
      { creditAccount },
    );
  }

  it("previews closing the account", async () => {
    // bracketed weETH -> WETH swap + updateQuota(weETH, MIN_INT96)
    // + decreaseDebt(MAX_UINT256) + withdrawCollateral(WETH, MAX_UINT256):
    // full repay with only underlying withdrawn, classified as a close
    const CLOSE: Hex =
      "0xebe4107c000000000000000000000000e22ced1808c22455747f366cf94d45b3201302d30000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000004c00000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000842f2ca49b00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000002b51db7edcde16a8d000000000000000000000000000000000000000000000000000000000000000000000000000000006543cf9374823d122960b6a06aa354f415fe394e0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008432fe0e160000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004f42aeb00000000000000000000000000000000000000000000000000000000000000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000064712c10ad000000000000000000000000cd5fe23c85820f7b72d0926fc9b05b43e359b7eeffffffffffffffffffffffffffffffffffffffff8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000242a7ba1f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000641f1088a0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000c32feb4dbd127a1993478ad6e5250710f838b90800000000000000000000000000000000000000000000000000000000";

    await expect(preview(CLOSE)).resolves.toEqual({
      operation: "CloseCreditAccount",
      permanent: false,
      creditManager: CREDIT_MANAGER,
      creditAccount: CREDIT_ACCOUNT,
      receivedAmount: {
        token: WETH,
        balance: 9_944_275_431_253_841_336n, // ~49.9 WETH - 40 weETH
      },
    });
  });

  it("previews repaying the account", async () => {
    // addCollateral(~40.0001 WETH) + updateQuota(weETH, MIN_INT96)
    // + decreaseDebt(MAX_UINT256) + withdrawCollateral(weETH, MAX_UINT256)
    // + withdrawCollateral(WETH, MAX_UINT256): collateral returned in-kind,
    // classified as a repay
    const REPAY: Hex =
      "0xebe4107c000000000000000000000000e22ced1808c22455747f366cf94d45b3201302d30000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000446d75b9ee000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000022b1cedf8fdaa66f4000000000000000000000000000000000000000000000000000000000000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000064712c10ad000000000000000000000000cd5fe23c85820f7b72d0926fc9b05b43e359b7eeffffffffffffffffffffffffffffffffffffffff8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000242a7ba1f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000641f1088a0000000000000000000000000cd5fe23c85820f7b72d0926fc9b05b43e359b7eeffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000c32feb4dbd127a1993478ad6e5250710f838b908000000000000000000000000000000000000000000000000000000000000000000000000000000009515ab9bb73a9642f1a93ba7c2790e9d08227f9a000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000641f1088a0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000c32feb4dbd127a1993478ad6e5250710f838b90800000000000000000000000000000000000000000000000000000000";

    await expect(preview(REPAY)).resolves.toEqual({
      operation: "RepayCreditAccount",
      permanent: false,
      creditManager: CREDIT_MANAGER,
      creditAccount: CREDIT_ACCOUNT,
      collateralAdded: [{ token: WETH, balance: 40_000_107_644_061_378_292n }],
      debtRepaid: 40_000_002_243_344_061_653n,
      collateralWithdrawn: [
        // entire weETH balance returned in-kind
        { token: WEETH, balance: 45_511_693_717_367_280_721n },
        // WETH added from the wallet minus the fully repaid total debt
        { token: WETH, balance: 105_400_717_316_639n },
      ],
    });
  });
});

// Wallet-funded full repay without withdrawals: frontend-generated txs that
// add collateral from the wallet, wrap into the market underlying when
// needed, zero quotas, and decreaseDebt(MAX). There is no withdrawCollateral
// call — leftover unwrap stays on the account. Classified as RepayCreditAccount.
interface WalletFundedRepayScenario {
  name: "repay-usdc" | "repay-rlusd";
  /** Token transferred from the wallet to repay the debt */
  repayToken: Address;
  /**
   * Exact repay-token amount added as collateral in the repay multicall
   * calldata (`addCollateral(repayToken, …)`)
   */
  repayAmount: bigint;
}

const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const RLUSD: Address = "0x8292Bb45bf1Ee4d140127049757C2E0fF06317eD";

const WALLET_FUNDED_REPAY_SCENARIOS: WalletFundedRepayScenario[] = [
  {
    name: "repay-usdc",
    repayToken: USDC,
    repayAmount: 80_000_613807n,
  },
  {
    name: "repay-rlusd",
    repayToken: RLUSD,
    repayAmount: 79988_494408444146292162n,
  },
];

interface SavedTx {
  to: Address;
  calldata: Hex;
}

/**
 * TxDump JSON shape (see `dev/txdiff/types.ts`).
 */
interface TxDumpFile {
  description?: string;
  chainId?: number;
  transactions: Array<{ label: string; to: Address; data: Hex }>;
}

interface WalletFundedRepayFixtures {
  repay: SavedTx;
  afterOpen: CreditAccountData<true>;
}

function loadWalletFundedRepayFixtures(
  scenario: string,
): WalletFundedRepayFixtures {
  const dir = resolve(FIXTURES, "rwa-repay", scenario);
  const dump = json_parse(
    readFileSync(resolve(dir, "txs.json"), "utf-8"),
  ) as TxDumpFile;
  const repayTx = dump.transactions.find(t => t.label === "repay");
  if (!repayTx) {
    throw new Error(`txs.json for ${scenario} is missing label "repay"`);
  }
  return {
    repay: { to: repayTx.to, calldata: repayTx.data },
    afterOpen: json_parse(
      readFileSync(resolve(dir, "after_open.json"), "utf-8"),
    ),
  };
}

describe.each(
  WALLET_FUNDED_REPAY_SCENARIOS,
)("wallet-funded full repay without withdrawals ($name)", spec => {
  const STATE_FIXTURE = resolve(FIXTURES, "Mainnet-25599278-rwa.json");
  const { repay, afterOpen } = loadWalletFundedRepayFixtures(spec.name);
  const investor = afterOpen.investor as Address;

  let sdk: OnchainSDK<{ adapters: AdaptersPlugin }>;

  beforeAll(() => {
    sdk = new OnchainSDK(
      "Mainnet",
      {
        transport: custom({
          request: async ({ method }) => {
            throw new Error(
              `offline: unexpected RPC request ${method} in wallet-funded repay preview test`,
            );
          },
        }),
      },
      { plugins: { adapters: new AdaptersPlugin(true) } },
    );
    sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
  });

  it("previews the full repay as RepayCreditAccount", async () => {
    const preview = await previewOperation(
      {
        sdk,
        to: repay.to,
        calldata: repay.calldata,
        sender: investor,
        value: 0n,
      },
      { creditAccount: afterOpen },
    );

    expect(preview).toMatchObject({
      operation: "RepayCreditAccount",
      permanent: false,
      error: undefined,
      creditManager: afterOpen.creditManager,
      creditAccount: afterOpen.creditAccount,
      // exact calldata amount transferred from the wallet
      collateralAdded: [{ token: spec.repayToken, balance: spec.repayAmount }],
      // nothing is withdrawn to the wallet; leftover unwrap stays on the CA
      collateralWithdrawn: [],
      // interest accrues on top of the snapshot principal between open and
      // repay, so debtRepaid is within a small tolerance of afterOpen.debt
      debtRepaid: expect.toBeWithinBps(afterOpen.debt),
    });
  });
});
