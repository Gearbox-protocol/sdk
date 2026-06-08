import { type Address, getAddress, padHex } from "viem";
import { describe, expect, it } from "vitest";
import type { PoolOperation } from "../parse/index.js";
import {
  type BalanceLookup,
  computePoolOpBalanceChanges,
} from "./simulatePoolOpMulticall.js";

const addr = (hex: string): Address =>
  getAddress(padHex(hex as Address, { size: 20 }));

const WALLET = addr("0xa1");
const RECEIVER = addr("0xc1");
const OWNER = addr("0x0e");
const POOL = addr("0x90");
const UNDERLYING = addr("0xde");

/** Builds a {@link BalanceLookup} backed by a literal `(holder, token)` map. */
function lookup(
  entries: Array<{ holder: Address; token: Address; balance: bigint }>,
): BalanceLookup {
  const key = (token: Address, holder: Address) => `${holder}:${token}`;
  const map = new Map<string, bigint>();
  for (const { holder, token, balance } of entries) {
    map.set(key(token, holder), balance);
  }
  return (token, holder) => map.get(key(token, holder)) ?? 0n;
}

describe("computePoolOpBalanceChanges", () => {
  it("Deposit credits shares to the receiver and debits assets from the wallet", () => {
    const op: PoolOperation = {
      operation: "Deposit",
      pool: POOL,
      receiver: RECEIVER,
      assets: 100n,
      underlying: UNDERLYING,
    };
    // previewDeposit(assets) -> shares minted to receiver
    const previewAmount = 90n;
    const before = lookup([
      { holder: WALLET, token: UNDERLYING, balance: 1_000n },
      { holder: RECEIVER, token: POOL, balance: 5n },
    ]);

    expect(
      computePoolOpBalanceChanges(op, WALLET, previewAmount, before),
    ).toEqual([
      {
        address: WALLET,
        changes: [
          { token: UNDERLYING, before: 1_000n, after: 900n, delta: -100n },
        ],
      },
      {
        address: RECEIVER,
        changes: [{ token: POOL, before: 5n, after: 95n, delta: 90n }],
      },
    ]);
  });

  it("Deposit groups both legs under one address when receiver == wallet", () => {
    const op: PoolOperation = {
      operation: "Deposit",
      pool: POOL,
      receiver: WALLET,
      assets: 100n,
      underlying: UNDERLYING,
    };
    const previewAmount = 90n;
    const before = lookup([
      { holder: WALLET, token: UNDERLYING, balance: 1_000n },
      { holder: WALLET, token: POOL, balance: 0n },
    ]);

    expect(
      computePoolOpBalanceChanges(op, WALLET, previewAmount, before),
    ).toEqual([
      {
        address: WALLET,
        changes: [
          { token: UNDERLYING, before: 1_000n, after: 900n, delta: -100n },
          { token: POOL, before: 0n, after: 90n, delta: 90n },
        ],
      },
    ]);
  });

  it("Mint debits the previewed assets and credits the requested shares", () => {
    const op: PoolOperation = {
      operation: "Mint",
      pool: POOL,
      receiver: RECEIVER,
      shares: 50n,
      underlying: UNDERLYING,
    };
    // previewMint(shares) -> assets pulled from wallet
    const previewAmount = 55n;
    const before = lookup([
      { holder: WALLET, token: UNDERLYING, balance: 2_000n },
      { holder: RECEIVER, token: POOL, balance: 0n },
    ]);

    expect(
      computePoolOpBalanceChanges(op, WALLET, previewAmount, before),
    ).toEqual([
      {
        address: WALLET,
        changes: [
          { token: UNDERLYING, before: 2_000n, after: 1_945n, delta: -55n },
        ],
      },
      {
        address: RECEIVER,
        changes: [{ token: POOL, before: 0n, after: 50n, delta: 50n }],
      },
    ]);
  });

  it("Withdraw burns the previewed shares from owner and credits assets to receiver", () => {
    const op: PoolOperation = {
      operation: "Withdraw",
      pool: POOL,
      receiver: RECEIVER,
      owner: OWNER,
      assets: 200n,
      underlying: UNDERLYING,
    };
    // previewWithdraw(assets) -> shares burned from owner
    const previewAmount = 180n;
    const before = lookup([
      { holder: OWNER, token: POOL, balance: 500n },
      { holder: RECEIVER, token: UNDERLYING, balance: 10n },
    ]);

    expect(
      computePoolOpBalanceChanges(op, WALLET, previewAmount, before),
    ).toEqual([
      {
        address: OWNER,
        changes: [{ token: POOL, before: 500n, after: 320n, delta: -180n }],
      },
      {
        address: RECEIVER,
        changes: [{ token: UNDERLYING, before: 10n, after: 210n, delta: 200n }],
      },
    ]);
  });

  it("Redeem burns the requested shares from owner and credits previewed assets to receiver", () => {
    const op: PoolOperation = {
      operation: "Redeem",
      pool: POOL,
      receiver: RECEIVER,
      owner: OWNER,
      shares: 120n,
      underlying: UNDERLYING,
    };
    // previewRedeem(shares) -> assets sent to receiver
    const previewAmount = 130n;
    const before = lookup([
      { holder: OWNER, token: POOL, balance: 300n },
      { holder: RECEIVER, token: UNDERLYING, balance: 0n },
    ]);

    expect(
      computePoolOpBalanceChanges(op, WALLET, previewAmount, before),
    ).toEqual([
      {
        address: OWNER,
        changes: [{ token: POOL, before: 300n, after: 180n, delta: -120n }],
      },
      {
        address: RECEIVER,
        changes: [{ token: UNDERLYING, before: 0n, after: 130n, delta: 130n }],
      },
    ]);
  });
});
