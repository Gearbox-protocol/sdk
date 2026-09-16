import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type Address,
  custom,
  encodeFunctionData,
  type Hex,
  parseEther,
} from "viem";
import { beforeAll, expect, it } from "vitest";
import {
  iCreditFacadeMulticallV310Abi,
  iCreditFacadeV310Abi,
} from "../../../abi/310/generated.js";
import {
  type CreditAccountData,
  json_parse,
  MAX_UINT256,
  OnchainSDK,
} from "../../index.js";
import { previewOperation } from "./previewOperation.js";

const STATE_FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25475508-adjust-credit-account.json",
);
const ACCOUNT_FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25475508-adjust-credit-account-data.json",
);

const FACADE: Address = "0x9515AB9BB73A9642F1a93Ba7C2790e9d08227f9a";
const CREDIT_MANAGER: Address = "0x79C6C1ce5B12abCC3E407ce8C160eE1160250921";
const CREDIT_ACCOUNT: Address = "0xE22cEd1808c22455747F366Cf94d45B3201302d3";
const OWNER: Address = "0xC32FEB4DBd127a1993478Ad6E5250710f838b908";

const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CBETH: Address = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";

const LEFTOVER_CBETH = 43_980_602_426_604_052_631n;
const DEBT = parseEther("10");
const QUOTA = parseEther("50");

const und = (value: unknown) => ({
  token: expect.objectContaining({ address: WETH }),
  value,
});

let sdk: OnchainSDK;
let creditAccount: CreditAccountData;
let emptied: CreditAccountData;
let leftoverNetValue: bigint;

beforeAll(() => {
  sdk = new OnchainSDK("Mainnet", {
    transport: custom({
      request: async () => {
        throw new Error("offline: preview test must not hit RPC");
      },
    }),
  });
  sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
  creditAccount = json_parse(readFileSync(ACCOUNT_FIXTURE, "utf-8"));
  emptied = {
    ...creditAccount,
    debt: 0n,
    accruedInterest: 0n,
    accruedFees: 0n,
    tokens: creditAccount.tokens.map(t => ({ ...t, quota: 0n })),
  };
  leftoverNetValue = sdk.marketRegister
    .findByCreditManager(CREDIT_MANAGER)
    .priceOracle.safeConvert(CBETH, WETH, LEFTOVER_CBETH).value;
});

function facadeCall(
  functionName:
    | "increaseDebt"
    | "updateQuota"
    | "addCollateral"
    | "withdrawCollateral",
  args: readonly unknown[],
) {
  return {
    target: FACADE,
    callData: encodeFunctionData({
      abi: iCreditFacadeMulticallV310Abi,
      functionName,
      args,
    } as never),
  };
}

function multicall(calls: ReturnType<typeof facadeCall>[]): Hex {
  return encodeFunctionData({
    abi: iCreditFacadeV310Abi,
    functionName: "multicall",
    args: [CREDIT_ACCOUNT, calls],
  });
}

async function preview(calldata: Hex, account: CreditAccountData) {
  const answer = await previewOperation(
    sdk,
    { chainId: sdk.chainId, to: FACADE, calldata, sender: OWNER, value: 0n },
    undefined,
    account,
  );
  if (!answer.ok) {
    throw new Error(`preview refused: ${answer.error.code}`);
  }
  return answer.data;
}

it("classifies borrowing on a zero-debt account as OpenCreditAccount", async () => {
  const calldata = multicall([
    facadeCall("increaseDebt", [DEBT]),
    facadeCall("updateQuota", [CBETH, QUOTA, 0n]),
  ]);

  const result = await preview(calldata, emptied);
  expect(result).toMatchObject({
    operation: "OpenCreditAccount",
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    collateralAdded: [],
    totalDebt: und(DEBT),
    targetCollateral: {
      token: expect.objectContaining({ address: CBETH }),
      value: LEFTOVER_CBETH,
    },
    quotas: [
      {
        token: expect.objectContaining({ address: CBETH }),
        value: QUOTA,
      },
    ],
    estNetValue: und(leftoverNetValue),
    estAssets: [
      {
        token: expect.objectContaining({ address: CBETH }),
        value: LEFTOVER_CBETH,
      },
      {
        token: expect.objectContaining({ address: WETH }),
        value: DEBT,
      },
    ],
  });
});

it("includes addCollateral in a reopening preview", async () => {
  const added = parseEther("1");
  const calldata = multicall([
    facadeCall("addCollateral", [WETH, added]),
    facadeCall("increaseDebt", [DEBT]),
    facadeCall("updateQuota", [CBETH, QUOTA, 0n]),
  ]);

  const result = await preview(calldata, emptied);
  expect(result).toMatchObject({
    operation: "OpenCreditAccount",
    creditAccount: CREDIT_ACCOUNT,
    collateralAdded: [
      {
        token: expect.objectContaining({ address: WETH }),
        value: added,
      },
    ],
    totalDebt: und(DEBT),
    estNetValue: und(leftoverNetValue + added),
    estAssets: [
      {
        token: expect.objectContaining({ address: CBETH }),
        value: LEFTOVER_CBETH,
      },
      {
        token: expect.objectContaining({ address: WETH }),
        value: DEBT + added,
      },
    ],
  });
});

it("previews withdrawing leftovers from a zero-debt account as an adjustment", async () => {
  const calldata = multicall([
    facadeCall("withdrawCollateral", [CBETH, MAX_UINT256, OWNER]),
  ]);

  await expect(preview(calldata, emptied)).resolves.toMatchObject({
    operation: "AdjustCreditAccount",
    creditAccount: CREDIT_ACCOUNT,
    collateralWithdrawn: [
      {
        token: expect.objectContaining({ address: CBETH }),
        value: LEFTOVER_CBETH,
      },
    ],
    totalDebt: und(0n),
  });
});

it("previews increaseDebt on a debt-carrying account as an adjustment", async () => {
  const calldata = multicall([facadeCall("increaseDebt", [DEBT])]);

  await expect(preview(calldata, creditAccount)).resolves.toMatchObject({
    operation: "AdjustCreditAccount",
    creditAccount: CREDIT_ACCOUNT,
    totalDebtChange: und(DEBT),
  });
});
