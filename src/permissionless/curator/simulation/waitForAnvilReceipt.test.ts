import type { Hash, TransactionReceipt } from "viem";
import {
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
} from "viem";
import { describe, expect, it } from "vitest";
import type { AnvilClient } from "../../../dev/createAnvilClient.js";
import { waitForAnvilReceipt } from "./waitForAnvilReceipt.js";

const hash: Hash = `0x${"12".repeat(32)}`;
const receipt = { status: "success", blockNumber: 2n } as TransactionReceipt;

/** An Anvil client whose receipt lookups answer from `answers`, in order. **/
function anvil(answers: (TransactionReceipt | Error)[]): {
  client: AnvilClient;
  lookups: () => number;
} {
  let lookups = 0;
  const client = {
    getTransactionReceipt: async () => {
      const answer = answers[Math.min(lookups, answers.length - 1)];
      lookups += 1;
      if (answer instanceof Error) throw answer;
      return answer;
    },
  } as unknown as AnvilClient;
  return { client, lookups: () => lookups };
}

describe("waitForAnvilReceipt", () => {
  it("looks the receipt up again until the node has it", async () => {
    const notFound = new TransactionReceiptNotFoundError({ hash });
    const node = anvil([notFound, notFound, receipt]);
    await expect(waitForAnvilReceipt(node.client, hash)).resolves.toBe(receipt);
    expect(node.lookups()).toBe(3);
  });

  it("passes on any other error", async () => {
    const node = anvil([new Error("connection refused")]);
    await expect(waitForAnvilReceipt(node.client, hash)).rejects.toThrow(
      "connection refused",
    );
    expect(node.lookups()).toBe(1);
  });

  it("times out when the receipt never appears", async () => {
    const node = anvil([new TransactionReceiptNotFoundError({ hash })]);
    await expect(waitForAnvilReceipt(node.client, hash, 250)).rejects.toThrow(
      WaitForTransactionReceiptTimeoutError,
    );
  });
});
