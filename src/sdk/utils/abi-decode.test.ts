import type { AbiStateMutability } from "abitype";
import type {
  Abi,
  ContractFunctionArgs,
  ContractFunctionName,
  DecodeFunctionDataReturnType,
} from "viem";
import {
  decodeFunctionData,
  encodeFunctionData,
  parseAbi,
  zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import { functionArgsToRecord } from "./abi-decode.js";

function encodeAndDecode<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined,
>(
  abi: abi,
  functionName: functionName,
  args: ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName extends ContractFunctionName<abi>
      ? functionName
      : ContractFunctionName<abi>
  >,
): DecodeFunctionDataReturnType<abi> {
  const calldata = encodeFunctionData({
    abi,
    functionName,
    args,
  } as any);
  return decodeFunctionData({ abi, data: calldata });
}

describe("functionArgsToRecord", () => {
  it("preserves scalar arg types", () => {
    const abi = parseAbi([
      "function scalarArgs(uint256 amount, address token, bool flag)",
    ]);
    const decoded = encodeAndDecode(abi, "scalarArgs", [
      42n,
      zeroAddress,
      true,
    ]);
    const result = functionArgsToRecord(
      abi,
      decoded.functionName,
      decoded.args,
    );

    expect(result).toEqual({
      amount: 42n,
      token: zeroAddress,
      flag: true,
    });
  });

  it("preserves tuple as nested object", () => {
    const abi = parseAbi([
      "struct Data { uint256 amount; address token; }",
      "function tupleArg(Data data)",
    ]);
    const decoded = encodeAndDecode(abi, "tupleArg", [
      { amount: 100n, token: zeroAddress },
    ]);
    const result = functionArgsToRecord(
      abi,
      decoded.functionName,
      decoded.args,
    );

    expect(result).toEqual({
      data: { amount: 100n, token: zeroAddress },
    });
  });

  it("preserves array of tuples", () => {
    const abi = parseAbi([
      "struct MultiCall { address target; bytes callData; }",
      "function tupleArrayArg(MultiCall[] calls)",
    ]);
    const calls = [
      { target: zeroAddress, callData: "0xdeadbeef" as const },
      { target: zeroAddress, callData: "0xcafebabe" as const },
    ];
    const decoded = encodeAndDecode(abi, "tupleArrayArg", [calls]);
    const result = functionArgsToRecord(
      abi,
      decoded.functionName,
      decoded.args,
    );

    expect(result).toEqual({
      calls: [
        { target: zeroAddress, callData: "0xdeadbeef" },
        { target: zeroAddress, callData: "0xcafebabe" },
      ],
    });
  });

  it("preserves deeply nested tuples", () => {
    const abi = parseAbi([
      "struct Inner { uint256 value; address addr; }",
      "struct Outer { uint256 id; Inner inner; }",
      "function nestedTupleArg(Outer outer)",
    ]);
    const decoded = encodeAndDecode(abi, "nestedTupleArg", [
      { id: 1n, inner: { value: 99n, addr: zeroAddress } },
    ]);
    const result = functionArgsToRecord(
      abi,
      decoded.functionName,
      decoded.args,
    );

    expect(result).toEqual({
      outer: { id: 1n, inner: { value: 99n, addr: zeroAddress } },
    });
  });

  it("returns empty record for no-arg function", () => {
    const abi = parseAbi(["function noArgs()"]);
    const decoded = encodeAndDecode(abi, "noArgs", []);
    const result = functionArgsToRecord(
      abi,
      decoded.functionName,
      decoded.args,
    );

    expect(result).toEqual({});
  });

  it("uses numeric index keys for unnamed inputs", () => {
    const abi = parseAbi(["function unnamedInputs(uint256, address)"]);
    const decoded = encodeAndDecode(abi, "unnamedInputs", [7n, zeroAddress]);
    const result = functionArgsToRecord(
      abi,
      decoded.functionName,
      decoded.args,
    );

    expect(result).toEqual({ "0": 7n, "1": zeroAddress });
  });
});
