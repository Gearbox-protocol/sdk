import { readFileSync } from "node:fs";
import path from "node:path";
import type { Address, Hex } from "viem";
import { createPublicClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { beforeAll, describe, expect, it } from "vitest";

import { createAdapter } from "../plugins/adapters/index.js";
import { ContractRegister } from "./ContractRegister.js";
import { parseCreditAccountTransaction } from "./parseCreditAccountTransaction.js";

const FIXTURES_DIR = path.resolve(__dirname, "__fixtures__");
const INPUTS_DIR = path.join(FIXTURES_DIR, "inputs");
const EXPECTED_DIR = path.join(FIXTURES_DIR, "expected");
const CONTRACTS_PATH = path.join(FIXTURES_DIR, "contracts.json");

interface ContractEntry {
  address: Address;
  contractType: Hex;
  version: string;
}

const client = createPublicClient({
  chain: mainnet,
  transport: custom({
    request: () => {
      throw new Error("not implemented");
    },
  }),
});

function buildRegister(): ContractRegister {
  const register = new ContractRegister(client);
  register.registerFactory((options, args) =>
    createAdapter(options, { baseParams: args }),
  );

  const contracts: ContractEntry[] = JSON.parse(
    readFileSync(CONTRACTS_PATH, "utf-8"),
  );
  for (const entry of contracts) {
    try {
      register.createContract({
        addr: entry.address,
        version: BigInt(entry.version),
        contractType: entry.contractType,
      });
    } catch {
      // unknown contract types are expected for non-adapter/non-facade contracts
    }
  }

  return register;
}

async function testFixture(
  fixture: string,
  register: ContractRegister,
): Promise<void> {
  const inputJson = JSON.parse(
    readFileSync(path.join(INPUTS_DIR, fixture), "utf-8"),
  );

  const actual = parseCreditAccountTransaction({
    trace: inputJson.trace,
    receipt: inputJson.receipt,
    pool: inputJson.pool,
    creditFacade: inputJson.creditFacade,
    creditAccount: inputJson.creditAccount,
    register: register.register,
  });

  await expect(actual).toMatchFileSnapshot(
    path.join(EXPECTED_DIR, fixture.replace(".json", ".snapshot")),
  );
}

describe("parseCreditAccountTransaction integration", () => {
  let register: ContractRegister;

  beforeAll(() => {
    register = buildRegister();
  });

  it("should parse OpenCreditAccount with AddCollateral, IncreaseBorrowedAmount, UpdateQuota, WithdrawCollateral, and AdapterCall", async () => {
    // interesting tx because it's inside migration tx
    await testFixture(
      "0x1b0a4a7e337c1c2cc0ef459e76337a807a57e9ecae1be81bb8ec833b554c9699_0x9d7ab1290d7a3ee662f545ac29091c4c61f81f14.json",
      register,
    );
  });

  it("should parse BotMulticall with DecreaseBorrowedAmount and DirectTokenTransfer", async () => {
    await testFixture(
      "0x3df2f68621486ac4110cbcee7a94d4575ac402b6f52071cf9772877a663fd886_0xfc408a4994c622afc7afb474dc02ebc8cdf3c584.json",
      register,
    );
  });

  it("should parse MultiCall", async () => {
    await testFixture(
      "0x00112a2e446ed22c623e4c178c147b8a8fb5dec7a99244f34f2ce084ed64b716_0x45c364c22d918da683cdf59eea0501170ee2b3c7.json",
      register,
    );
  });

  it("should parse PartiallyLiquidateCreditAccount", async () => {
    await testFixture(
      "0x05e8cd0d741b5e51204a484c917897644cf6f1056a8dae38eddf12c393a98d1c_0xafaf7cfb3e97621bf7eb5b0154e6f623c3034d94.json",
      register,
    );
  });

  it("should parse CloseCreditAccount", async () => {
    await testFixture(
      "0x07394438d57f658dc03b7eba7e1dafe747dd93ce34a39a6f9a7e13c980d55a7b_0x91c6f58d5301e2308e6b30d6872de68f71234531.json",
      register,
    );
  });

  it("should parse LiquidateCreditAccount", async () => {
    await testFixture(
      "0x73b80d27b4155b9102059aea61bed4e5e108ab25a30b1c06abb174eeae70b295_0xf2365b21c6f4cc73d38b6fb5de9ab506a4a5dff9.json",
      register,
    );
  });

  it("should handle phantom token withdrawal (no adapter calls)", async () => {
    await testFixture(
      "0x05ab6e36adf378e14caeadedf72668139801079606fc6ca825c689ac93d999e3_0x8071e781b7c524dd36a83e9efcca02a47bae5bec.json",
      register,
    );
  });
});
