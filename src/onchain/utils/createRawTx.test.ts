import { parseAbi, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { createRawTx } from "./createRawTx.js";

const abi = parseAbi([
  "function setLimit(address token, uint96 limit)",
  "function deposit(uint256 amount) payable",
  "function setTokens(address[] tokens)",
]);

describe("createRawTx", () => {
  it("records bigint args as decimal strings", () => {
    const tx = createRawTx(zeroAddress, {
      abi,
      functionName: "setLimit",
      args: [zeroAddress, 1_000_000_000_000_000_000_000n],
    });
    expect(tx.contractInputsValues).toEqual({
      token: zeroAddress,
      limit: "1000000000000000000000",
    });
  });

  it("serializes array args as JSON", () => {
    const tx = createRawTx(zeroAddress, {
      abi,
      functionName: "setTokens",
      args: [[zeroAddress]],
    });
    expect(JSON.parse(tx.contractInputsValues.tokens)).toEqual([zeroAddress]);
  });

  it("marks payable functions as payable", () => {
    const payable = createRawTx(zeroAddress, {
      abi,
      functionName: "deposit",
      args: [1n],
    });
    const nonpayable = createRawTx(zeroAddress, {
      abi,
      functionName: "setLimit",
      args: [zeroAddress, 1n],
    });
    expect(payable.contractMethod.payable).toBe(true);
    expect(nonpayable.contractMethod.payable).toBe(false);
  });
});
