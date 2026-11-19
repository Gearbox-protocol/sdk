import {
  type Address,
  custom,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  stringToHex,
} from "viem";
import { describe, expect, it } from "vitest";
import { iSecuritizeRWAFactoryAbi } from "../../abi/rwa/iSecuritizeRWAFactory.js";
import type {
  PreviewOperationInput,
  SecuritizeRegisterMessage,
} from "../../model/index.js";
import { RWA_FACTORY_SECURITIZE } from "../../model/index.js";
import {
  BaseContract,
  OnchainSDK,
  SecuritizeRWAFactory,
} from "../../onchain/index.js";
import { ExecuteApi } from "./ExecuteApi.js";

const FACTORY: Address = "0x1111111111111111111111111111111111111111";
const TARGET: Address = "0x2222222222222222222222222222222222222222";
const TOKEN_A = getAddress("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd");
const TOKEN_B: Address = "0x4444444444444444444444444444444444444444";
const calls = [{ target: TARGET, callData: "0x12345678" as const }];
const first: SecuritizeRegisterMessage = {
  token: TOKEN_A,
  signature: { deadline: 100n, signature: "0xabcd" },
};
const second: SecuritizeRegisterMessage = {
  token: TOKEN_B,
  signature: { deadline: 200n, signature: "0xef01" },
};

function setup() {
  const sdk = new OnchainSDK("Mainnet", {
    transport: custom({
      request: async () => {
        throw new Error("unexpected RPC");
      },
    }),
  });
  new SecuritizeRWAFactory(sdk, {
    baseParams: {
      addr: FACTORY,
      version: 311n,
      contractType: stringToHex(RWA_FACTORY_SECURITIZE, { size: 32 }),
      serializedParams: encodeAbiParameters(
        [
          { type: "address" },
          { type: "address" },
          {
            type: "tuple[]",
            components: [
              { name: "token", type: "address" },
              { name: "registrar", type: "address" },
              { name: "operators", type: "address[]" },
            ],
          },
        ],
        [TARGET, TARGET, []],
      ),
    },
    tokens: [],
    extraDetails: "0x",
  });
  new BaseContract(sdk, {
    addr: TARGET,
    abi: iSecuritizeRWAFactoryAbi,
    contractType: "POOL",
  });
  return new ExecuteApi(chainId => {
    if (chainId !== 1) throw new Error("unsupported chain");
    return sdk;
  });
}

function txOf(
  functionName: "openCreditAccount" | "multicall",
  existing: SecuritizeRegisterMessage[] = [],
): PreviewOperationInput {
  return {
    chainId: 1,
    sender: TARGET,
    to: FACTORY,
    value: 123n,
    calldata: encodeFunctionData({
      abi: iSecuritizeRWAFactoryAbi,
      functionName,
      args: [TARGET, calls, [TOKEN_A, TOKEN_B], existing],
    }),
  };
}

function signaturesOf(tx: PreviewOperationInput) {
  const decoded = decodeFunctionData({
    abi: iSecuritizeRWAFactoryAbi,
    data: tx.calldata,
  });
  if (
    decoded.functionName !== "openCreditAccount" &&
    decoded.functionName !== "multicall"
  )
    throw new Error("unexpected method");
  return decoded.args[3];
}

describe("ExecuteApi.withSecuritizeSignatures", () => {
  it.each(["openCreditAccount", "multicall"] as const)(
    "changes only signatures in %s, without RPC or mutation",
    functionName => {
      const api = setup();
      const tx = Object.freeze(txOf(functionName, [first]));
      const before = structuredClone(tx);
      const result = api.withSecuritizeSignatures({ tx, signatures: [second] });
      const expected = encodeFunctionData({
        abi: iSecuritizeRWAFactoryAbi,
        functionName,
        args: [TARGET, calls, [TOKEN_A, TOKEN_B], [first, second]],
      });
      expect(result).toEqual({ ...before, calldata: expected });
      expect(tx).toEqual(before);
      expect(result).not.toBe(tx);
      expect(
        api.withSecuritizeSignatures({ tx: result, signatures: [second] }),
      ).toEqual(result);
    },
  );

  it("merges partial signatures across consecutive signing steps", () => {
    const api = setup();
    const one = api.withSecuritizeSignatures({
      tx: txOf("openCreditAccount"),
      signatures: [first],
    });
    expect(signaturesOf(one)).toEqual([
      first,
      { token: TOKEN_B, signature: { deadline: 0n, signature: "0x" } },
    ]);
    const two = api.withSecuritizeSignatures({ tx: one, signatures: [second] });
    expect(signaturesOf(two)).toEqual([first, second]);
  });

  it("replaces an existing signature using case-insensitive token addresses", () => {
    const replacement: SecuritizeRegisterMessage = {
      token: getAddress(TOKEN_A.toLowerCase()),
      signature: { deadline: 300n, signature: "0x1234" },
    };
    const result = setup().withSecuritizeSignatures({
      tx: txOf("multicall", [first, second]),
      signatures: [
        { ...replacement, token: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" },
      ],
    });
    expect(signaturesOf(result)).toEqual([replacement, second]);
  });

  it("ignores cached signatures for tokens not requested by the transaction", () => {
    const result = setup().withSecuritizeSignatures({
      tx: txOf("openCreditAccount", [first, second]),
      signatures: [{ token: TARGET, signature: first.signature }],
    });
    expect(signaturesOf(result)).toEqual([first, second]);
  });

  it("rejects a registered target that is not a Securitize factory", () => {
    expect(() =>
      setup().withSecuritizeSignatures({
        tx: { ...txOf("multicall"), to: TARGET },
        signatures: [],
      }),
    ).toThrow("not a Securitize RWA factory");
  });

  it("rejects an unregistered target", () => {
    expect(() =>
      setup().withSecuritizeSignatures({
        tx: { ...txOf("multicall"), to: TOKEN_B },
        signatures: [],
      }),
    ).toThrow();
  });

  it("rejects unsupported chain and malformed calldata", () => {
    const api = setup();
    expect(() =>
      api.withSecuritizeSignatures({
        tx: { ...txOf("multicall"), chainId: 42161 },
        signatures: [],
      }),
    ).toThrow("unsupported chain");
    expect(() =>
      api.withSecuritizeSignatures({
        tx: { ...txOf("multicall"), calldata: "0x1234" },
        signatures: [],
      }),
    ).toThrow();
  });

  it("rejects another method on a registered factory", () => {
    const tx = {
      ...txOf("multicall"),
      calldata: encodeFunctionData({
        abi: iSecuritizeRWAFactoryAbi,
        functionName: "getWallet",
        args: [TARGET],
      }),
    };
    expect(() =>
      setup().withSecuritizeSignatures({ tx, signatures: [] }),
    ).toThrow("expected openCreditAccount or multicall");
  });
});
