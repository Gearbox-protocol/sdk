import type { Address, Hex } from "viem";
import { createPublicClient, custom, encodeFunctionData, parseAbi } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";

const { BaseContract, ContractParseError } = await import("./BaseContract.js");

const client = createPublicClient({
  chain: mainnet,
  transport: custom({
    request: async () => {
      throw new Error("not implemented");
    },
  }),
});

const CONTRACT_ADDR = "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa" as Address;
const TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" as Address;

const abi = parseAbi([
  "function doStuff(uint256 amount, address token)",
  "function noArgs()",
]);

const contract = new BaseContract(
  { client },
  {
    abi,
    addr: CONTRACT_ADDR,
    name: "TestContract",
    version: 300,
    contractType: "TEST_CT",
  },
);

describe("BaseContract.parseFunctionDataV2", () => {
  it("parses known function with preserved types (strict=false)", () => {
    const calldata = encodeFunctionData({
      abi,
      functionName: "doStuff",
      args: [42n, TOKEN_ADDR],
    });

    expect(contract.parseFunctionDataV2(calldata)).toEqual({
      functionName: "doStuff(uint256,address)",
      rawArgs: { amount: 42n, token: TOKEN_ADDR },
      chainId: 1,
      target: CONTRACT_ADDR,
      contractType: "TEST_CT",
      version: 300,
      label: "TestContract",
    });
  });

  it("parses known function with preserved types (strict=true)", () => {
    const calldata = encodeFunctionData({
      abi,
      functionName: "doStuff",
      args: [100n, TOKEN_ADDR],
    });

    expect(contract.parseFunctionDataV2(calldata, true)).toEqual({
      functionName: "doStuff(uint256,address)",
      rawArgs: { amount: 100n, token: TOKEN_ADDR },
      chainId: 1,
      target: CONTRACT_ADDR,
      contractType: "TEST_CT",
      version: 300,
      label: "TestContract",
    });
  });

  it("returns fallback for unknown selector (strict=false)", () => {
    const calldata =
      "0xdeadbeef0000000000000000000000000000000000000000000000000000000000000001" as Hex;

    expect(contract.parseFunctionDataV2(calldata)).toEqual({
      functionName: "unknown function 0xdeadbeef",
      rawArgs: {
        _data:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
      target: CONTRACT_ADDR,
      chainId: 1,
      contractType: "TEST_CT",
      version: 300,
      label: "TestContract",
    });
  });

  it("throws ContractParseError for unknown selector (strict=true)", () => {
    const calldata =
      "0xdeadbeef0000000000000000000000000000000000000000000000000000000000000001" as Hex;

    expect(() => contract.parseFunctionDataV2(calldata, true)).toThrow(
      ContractParseError,
    );
  });

  it("parses no-arg function", () => {
    const calldata = encodeFunctionData({
      abi,
      functionName: "noArgs",
    });

    expect(contract.parseFunctionDataV2(calldata)).toEqual({
      functionName: "noArgs()",
      rawArgs: {},
      chainId: 1,
      target: CONTRACT_ADDR,
      contractType: "TEST_CT",
      version: 300,
      label: "TestContract",
    });
  });
});
