import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type Address,
  custom,
  encodeFunctionData,
  type Hex,
  numberToHex,
  parseEther,
  toFunctionSelector,
  toHex,
} from "viem";
import { beforeAll, beforeEach, expect, it, vi } from "vitest";

import {
  iCreditFacadeMulticallV310Abi,
  iCreditFacadeV310Abi,
} from "../../abi/310/generated.js";
import { AdaptersPlugin } from "../../plugins/adapters/index.js";
import { json_parse, NATIVE_ADDRESS, OnchainSDK } from "../../sdk/index.js";
import { checkPrerequisites } from "./checkPrerequisites.js";

// Scoped (KPK market configurator only) snapshot of the Gearbox anvil Mainnet
// fork, replayed via `hydrate` so calldata parsing runs fully offline. Same
// fixture as previewAdjustCreditAccount.test.ts.
const STATE_FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25475508-adjust-credit-account.json",
);

// KPK WETH strategy credit facade
const FACADE: Address = "0x9515AB9BB73A9642F1a93Ba7C2790e9d08227f9a";
const CREDIT_ACCOUNT: Address = "0xE22cEd1808c22455747F366Cf94d45B3201302d3";
const OWNER: Address = "0xC32FEB4DBd127a1993478Ad6E5250710f838b908";
const SPENDER: Address = "0x0000000000000000000000000000000000000001";

const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CBETH: Address = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";

const BALANCE_OF_SELECTOR = toFunctionSelector("balanceOf(address)");
const ALLOWANCE_SELECTOR = toFunctionSelector("allowance(address,address)");

/** Stubbed on-chain reads answered by the offline transport. */
interface OnchainState {
  /** Native balance of any queried address. */
  native: bigint;
  /** ERC-20 balance of any queried (token, owner) pair. */
  erc20: bigint;
  /** ERC-20 allowance of any queried (token, owner, spender) triple. */
  allowance: bigint;
}

let sdk: OnchainSDK<{ adapters: AdaptersPlugin }>;
let onchain: OnchainState;

beforeAll(() => {
  // The transport answers only the reads issued by balance/allowance
  // prerequisites; everything else (hydration, calldata parsing, prerequisite
  // building) must stay offline.
  sdk = new OnchainSDK(
    "Mainnet",
    {
      transport: custom({
        request: async ({ method, params }) => {
          if (method === "eth_getBalance") {
            return numberToHex(onchain.native);
          }
          if (method === "eth_call") {
            const [call] = params as [{ to: Address; data: Hex }];
            const selector = call.data.slice(0, 10).toLowerCase();
            if (selector === BALANCE_OF_SELECTOR) {
              return toHex(onchain.erc20, { size: 32 });
            }
            if (selector === ALLOWANCE_SELECTOR) {
              return toHex(onchain.allowance, { size: 32 });
            }
          }
          throw new Error(`offline: unexpected RPC request ${method}`);
        },
      }),
    },
    { plugins: { adapters: new AdaptersPlugin(true) } },
  );
  sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
  vi.spyOn(sdk.accounts, "getApprovalAddress").mockResolvedValue(SPENDER);
});

beforeEach(() => {
  onchain = { native: 0n, erc20: 0n, allowance: 0n };
});

interface CollateralInput {
  token: Address;
  amount: bigint;
}

/** `multicall(creditAccount, [addCollateral(token, amount), ...])` calldata. */
function multicallCalldata(collateral: CollateralInput[]): Hex {
  return encodeFunctionData({
    abi: iCreditFacadeV310Abi,
    functionName: "multicall",
    args: [
      CREDIT_ACCOUNT,
      collateral.map(({ token, amount }) => ({
        target: FACADE,
        callData: encodeFunctionData({
          abi: iCreditFacadeMulticallV310Abi,
          functionName: "addCollateral",
          args: [token, amount],
        }),
      })),
    ],
  });
}

function check(collateral: CollateralInput[], value: bigint) {
  return checkPrerequisites({
    sdk,
    to: FACADE,
    calldata: multicallCalldata(collateral),
    sender: OWNER,
    value,
  });
}

it("requires full WETH allowance and balance without attached value", async () => {
  onchain = { native: 0n, erc20: parseEther("1"), allowance: parseEther("1") };
  const results = await check([{ token: WETH, amount: parseEther("1") }], 0n);
  expect(results).toEqual([
    {
      kind: "allowance",
      satisfied: true,
      detail: {
        token: WETH,
        owner: OWNER,
        spender: SPENDER,
        required: parseEther("1"),
        actual: parseEther("1"),
      },
    },
    {
      kind: "balance",
      satisfied: true,
      detail: {
        token: WETH,
        owner: OWNER,
        required: parseEther("1"),
        actual: parseEther("1"),
      },
    },
  ]);
});

it("replaces the WETH balance requirement with native when value covers the collateral", async () => {
  // The reported bug scenario: addCollateral(WETH, x) fully funded by
  // tx.value — the wallet holds no WETH at all, only native ETH.
  onchain = { native: parseEther("2"), erc20: 0n, allowance: parseEther("1") };
  const results = await check(
    [{ token: WETH, amount: parseEther("1") }],
    parseEther("1"),
  );
  expect(results).toEqual([
    {
      kind: "balance",
      satisfied: true,
      detail: {
        token: NATIVE_ADDRESS,
        owner: OWNER,
        required: parseEther("1"),
        actual: parseEther("2"),
      },
    },
    {
      kind: "allowance",
      satisfied: true,
      detail: {
        token: WETH,
        owner: OWNER,
        spender: SPENDER,
        required: parseEther("1"),
        actual: parseEther("1"),
      },
    },
  ]);
});

it("splits the WETH balance requirement when value partially covers the collateral", async () => {
  onchain = {
    native: parseEther("0.4"),
    erc20: parseEther("0.6"),
    allowance: parseEther("1"),
  };
  const results = await check(
    [{ token: WETH, amount: parseEther("1") }],
    parseEther("0.4"),
  );
  expect(results).toEqual([
    {
      kind: "balance",
      satisfied: true,
      detail: {
        token: NATIVE_ADDRESS,
        owner: OWNER,
        required: parseEther("0.4"),
        actual: parseEther("0.4"),
      },
    },
    {
      kind: "allowance",
      satisfied: true,
      detail: {
        token: WETH,
        owner: OWNER,
        required: parseEther("1"),
        actual: parseEther("1"),
        spender: SPENDER,
      },
    },
    {
      kind: "balance",
      satisfied: true,
      detail: {
        token: WETH,
        owner: OWNER,
        required: parseEther("0.6"),
        actual: parseEther("0.6"),
      },
    },
  ]);
});

it("is unsatisfied when the wallet cannot cover the attached value", async () => {
  onchain = {
    native: parseEther("0.5"),
    erc20: 0n,
    allowance: parseEther("1"),
  };
  const results = await check(
    [{ token: WETH, amount: parseEther("1") }],
    parseEther("1"),
  );
  expect(results).toMatchObject([
    {
      kind: "balance",
      satisfied: false,
      detail: {
        token: NATIVE_ADDRESS,
        required: parseEther("1"),
        actual: parseEther("0.5"),
      },
    },
    { kind: "allowance", satisfied: true },
  ]);
});

it("does not offset non-WETH collateral by the attached value", async () => {
  onchain = {
    native: parseEther("1"),
    erc20: parseEther("2"),
    allowance: parseEther("2"),
  };
  const results = await check(
    [{ token: CBETH, amount: parseEther("2") }],
    parseEther("1"),
  );
  expect(results).toHaveLength(3);
  expect(results).toMatchObject([
    {
      kind: "balance",
      satisfied: true,
      detail: { token: NATIVE_ADDRESS, required: parseEther("1") },
    },
    {
      kind: "allowance",
      satisfied: true,
      detail: { token: CBETH, required: parseEther("2") },
    },
    {
      kind: "balance",
      satisfied: true,
      detail: { token: CBETH, required: parseEther("2") },
    },
  ]);
});
