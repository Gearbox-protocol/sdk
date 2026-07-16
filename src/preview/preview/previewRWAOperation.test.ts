import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom, encodeFunctionData, zeroAddress } from "viem";
import { beforeAll, expect, it } from "vitest";
import { iCreditFacadeMulticallV310Abi } from "../../abi/310/generated.js";
import { ierc4626AdapterAbi } from "../../abi/ierc4626Adapter.js";
import { iSecuritizeRWAFactoryAbi } from "../../abi/rwa/iSecuritizeRWAFactory.js";
import { AdaptersPlugin } from "../../plugins/adapters/index.js";
import {
  type CreditAccountData,
  json_parse,
  MAX_UINT256,
  OnchainSDK,
} from "../../sdk/index.js";
import { previewOperation } from "./previewOperation.js";

// Scoped snapshot of the Securitize anvil Mainnet fork (RWA markets only),
// replayed via `hydrate` so parsing and multicall replay run fully offline.
// RWA wrap/unwrap calls are applied 1:1 without any RPC traffic.
// Regenerate with `tsx scripts/generate-rwa-pool-fixture.ts`.
const FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25432463-securitize.json",
);

const SENDER: Address = "0xf13df765f3047850Cede5aA9fDF20a12A75f7F70";
// Securitize RWA factory and one of its credit managers, hardcoded from the
// fixture (see checkPrerequisites.test.ts which targets the same market).
const FACTORY: Address = "0xc6f7B95f6fb8394541D9Ac8B0Abc94Bf6E84F703";
const CREDIT_MANAGER: Address = "0x025512D771f778fad99aB30b7A7363E7C8DE078D";
// ERC4626 wrap/unwrap adapter of the credit manager, its vault is the market
// underlying (RWA_UNDERLYING::DEFAULT) and its asset is USDC.
const ADAPTER: Address = "0x04Ac894088FdD6FD622d9fe7c39192baFaEA15db";
const VAULT: Address = "0x50A9C808cd114E8fEA72f03aE2B1A8825677D56D";
const USDC: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// Securitize DSToken collateral of the market
const DS_TOKEN: Address = "0x17418038ecF73BA4026c4f428547BF099706F27B";

const CREDIT_ACCOUNT: Address = "0x1234123412341234123412341234123412341234";

let sdk: OnchainSDK<{ adapters: AdaptersPlugin }>;
let creditFacade: Address;

beforeAll(() => {
  // The preview must run fully offline: any RPC request is a test failure.
  sdk = new OnchainSDK(
    "Mainnet",
    {
      transport: custom({
        request: async ({ method }) => {
          throw new Error(
            `offline: unexpected RPC request ${method} in RWA preview test`,
          );
        },
      }),
    },
    { plugins: { adapters: new AdaptersPlugin(true) } },
  );
  sdk.hydrate(json_parse(readFileSync(FIXTURE, "utf-8")));
  creditFacade =
    sdk.marketRegister.findCreditManager(CREDIT_MANAGER).creditFacade.address;
});

function facadeCall(
  functionName:
    | "addCollateral"
    | "increaseDebt"
    | "updateQuota"
    | "withdrawCollateral",
  args: readonly unknown[],
) {
  return {
    target: creditFacade,
    callData: encodeFunctionData({
      abi: iCreditFacadeMulticallV310Abi,
      functionName,
      args,
    } as never),
  };
}

/** RWA unwrap entry, exactly what `getRWAUnwrapCalls` emits. */
function unwrapCall(shares: bigint) {
  return {
    target: ADAPTER,
    callData: encodeFunctionData({
      abi: ierc4626AdapterAbi,
      functionName: "redeem",
      args: [shares, zeroAddress, zeroAddress],
    }),
  };
}

it("previews RWA account opening with an unwrap call", async () => {
  const debt = 50_000_000_000n; // 50k underlying (vault shares)
  const dsAmount = 55_000_000_000n;

  // The borrowing flow assembled by `openCA` + `getRWAUnwrapCalls`: post
  // DSToken collateral, borrow vault shares, unwrap them to USDC and withdraw
  // the USDC to the investor.
  const calldata = encodeFunctionData({
    abi: iSecuritizeRWAFactoryAbi,
    functionName: "openCreditAccount",
    args: [
      CREDIT_MANAGER,
      [
        facadeCall("increaseDebt", [debt]),
        facadeCall("addCollateral", [DS_TOKEN, dsAmount]),
        facadeCall("updateQuota", [DS_TOKEN, 55_000_000_000n, 0n]),
        unwrapCall(debt),
        facadeCall("withdrawCollateral", [USDC, MAX_UINT256, SENDER]),
      ],
      [],
      [],
    ],
  });

  const preview = await previewOperation({
    sdk,
    to: FACTORY,
    calldata,
    sender: SENDER,
    value: 0n,
  });

  expect(preview).toMatchObject({
    operation: "RWAOpenCreditAccount",
    creditManager: CREDIT_MANAGER,
    debt,
    collateral: [{ token: DS_TOKEN, balance: dsAmount }],
    quotas: [{ token: DS_TOKEN, balance: 55_000_000_000n }],
    target: { token: DS_TOKEN, balance: dsAmount },
    assets: [{ token: DS_TOKEN, balance: dsAmount }],
  });
});

it("previews an unwrap-and-withdraw multicall on an existing RWA account", async () => {
  const shares = 20_000_000_000n; // 20k vault shares to unwrap

  const calldata = encodeFunctionData({
    abi: iSecuritizeRWAFactoryAbi,
    functionName: "multicall",
    args: [
      CREDIT_ACCOUNT,
      [
        unwrapCall(shares),
        facadeCall("withdrawCollateral", [USDC, MAX_UINT256, SENDER]),
      ],
      [],
      [],
    ],
  });

  // Minimal hand-crafted pre-state: only debt/accrued and token balances are
  // read by the multicall replay.
  const creditAccount = {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade,
    underlying: VAULT,
    owner: SENDER,
    debt: 5_000_000_000n,
    accruedInterest: 0n,
    accruedFees: 0n,
    tokens: [
      { token: VAULT, balance: 30_000_000_000n, quota: 0n },
      { token: DS_TOKEN, balance: 100_000_000n, quota: 10_000_000_000n },
    ],
  } as unknown as CreditAccountData;

  const preview = await previewOperation(
    { sdk, to: FACTORY, calldata, sender: SENDER, value: 0n },
    { creditAccount },
  );

  expect(preview).toMatchObject({
    operation: "AdjustCreditAccount",
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    collateralAdded: [],
    // The withdrawn USDC comes entirely from the 1:1 unwrap.
    collateralWithdrawn: [{ token: USDC, balance: shares }],
    debt: 5_000_000_000n,
    debtChange: 0n,
    assetsChange: [{ token: VAULT, balance: -shares }],
  });
});
