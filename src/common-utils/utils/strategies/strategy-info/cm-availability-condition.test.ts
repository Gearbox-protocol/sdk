import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { toBN } from "../../../../onchain/index.js";
import {
  buildCreditManager,
  buildPool,
  mockToken1,
} from "../../../test-utils/index.js";
import { cmAvailabilityCondition } from "./cm-availability-condition.js";
import type { PoolSlice } from "./types.js";

/**
 * Ordering is judged on what the managers actually are, not on a mocked check:
 * the ladder these fixtures run through is the real one, so a change in what it
 * refuses shows up here as a reordering rather than as a passing mock.
 */

const ROOM = toBN("1000000", 18);

/** A manager the market has room for at both ends of its band. */
const openable = (address: string, over: Record<string, unknown> = {}) =>
  buildCreditManager({
    address,
    minDebt: toBN("100", 18),
    maxDebt: toBN("10000", 18),
    totalDebtLimit: ROOM,
    totalDebt: 0n,
    availableToBorrow: ROOM,
    ...over,
  });

const A = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const B = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const DEGEN_NFT = "0xdddddddddddddddddddddddddddddddddddddddd" as Address;

const pool = buildPool({
  totalDebtLimit: ROOM,
  totalBorrowed: 0n,
});
const pools: Record<Address, PoolSlice> = { [pool.address]: pool };

const order = (
  cmA: ReturnType<typeof openable>,
  cmB: ReturnType<typeof openable>,
  withPools: Record<Address, PoolSlice> | null = pools,
) => cmAvailabilityCondition(mockToken1, cmA, cmB, withPools);

describe("cmAvailabilityCondition", () => {
  it("keeps the order when both managers are equally open", () => {
    expect(order(openable(A), openable(B))).toBe(0);
  });

  it("puts the manager that can open its minimum first", () => {
    // B's own debt limit is already spent, so even its minimum does not fit.
    const spent = openable(B, { totalDebt: ROOM });

    expect(order(openable(A), spent)).toBe(-1);
    expect(order(spent, openable(A))).toBe(1);
  });

  it("prefers a manager with no degen NFT when both can be opened", () => {
    const gated = openable(A, { isDegenMode: true, degenNFT: DEGEN_NFT });

    expect(order(gated, openable(B))).toBe(1);
    expect(order(openable(B), gated)).toBe(-1);
  });

  it("falls through to the maximum debt when everything else ties", () => {
    // Both can open their minimum; only A's maximum runs past what is left.
    const narrow = openable(A, { totalDebtLimit: toBN("1000", 18) });

    expect(order(narrow, openable(B))).toBe(1);
  });

  it("reads a missing pool as no pool limit rather than as a refusal", () => {
    expect(order(openable(A), openable(B), null)).toBe(0);
  });
});
