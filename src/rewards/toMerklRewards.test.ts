import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import type { Token } from "../model/index.js";
import type { MerkleXYZUserRewardsV4Response } from "./merkl-api.js";
import type { MerklRewardsSdk } from "./toMerklRewards.js";
import { toMerklRewards } from "./toMerklRewards.js";

const ACCOUNT: Address = "0x1234567890123456789012345678901234567890";

/**
 * Checksummed on purpose. Merkl names a pool in whatever case its campaign was
 * registered with and this code lowercases before matching, so a fixture of
 * repeated digits — where `toLowerCase` is a no-op — could not fail.
 */
const POOL: Address = "0x9396DCbf78fc526bb003665337C5E73b699571EF";
const REWARD_TOKEN: Address = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";

const SDK_CHAIN = 42;
const MERKL_ECHOED_CHAIN = 1;

const POOL_TOKEN: Token = {
  chainId: SDK_CHAIN,
  address: POOL,
  symbol: "dWBTC-V3-0",
  name: "WBTC",
  decimals: 8,
};

/**
 * The registry is a class with private state, so a fixture cannot satisfy it
 * structurally — the repo's own `buildMockSdk` casts for the same reason.
 */
function buildSdk(
  known: Record<string, Token> = {},
  { namesPool = true }: { namesPool?: boolean } = {},
): MerklRewardsSdk {
  return {
    // Deliberately not the `chain.id` Merkl echoes below: a row belongs to the
    // chain we asked about, and picking it off the payload would look right
    // on any fixture where the two agree.
    chainId: SDK_CHAIN,
    marketRegister: { pools: [{ pool: { address: POOL } }] },
    tokensMeta: {
      getToken: (address: Address) =>
        known[address.toLowerCase()] ??
        (namesPool && address.toLowerCase() === POOL.toLowerCase()
          ? POOL_TOKEN
          : undefined),
    },
  } as unknown as MerklRewardsSdk;
}

interface BreakdownOverrides {
  reason?: string;
  amount?: string;
  claimed?: string;
}

function merklResponse(
  breakdowns: BreakdownOverrides[],
  token: Partial<{
    address: Address;
    symbol: string;
    decimals: number;
    price: number;
  }> = {},
): MerkleXYZUserRewardsV4Response {
  return [
    {
      chain: { id: MERKL_ECHOED_CHAIN, name: "Ethereum", icon: "" },
      rewards: [
        {
          root: ACCOUNT,
          recipient: ACCOUNT,
          amount: "0",
          claimed: "0",
          pending: "0",
          proofs: [],
          token: {
            address: REWARD_TOKEN.toLowerCase() as Address,
            chainId: MERKL_ECHOED_CHAIN,
            symbol: "MERKL",
            decimals: 6,
            ...token,
          },
          breakdowns: breakdowns.map(b => ({
            reason: b.reason ?? `erc20_${POOL.toLowerCase()}`,
            amount: b.amount ?? "0",
            claimed: b.claimed ?? "0",
            pending: "0",
            campaignId: ACCOUNT,
          })),
        },
      ],
    },
  ];
}

describe("toMerklRewards", () => {
  /**
   * A campaign names the pool in a lowercased `reason`, while the registry
   * holds it checksummed. Match on the wrong case and every row silently
   * disappears — with no error anywhere.
   */
  it("matches a lowercased reason against the checksummed pool", () => {
    const rewards = toMerklRewards(
      buildSdk(),
      merklResponse([{ amount: "1000000", claimed: "0" }]),
    );

    expect(rewards).toHaveLength(1);
    expect(rewards[0]?.pool).toBe(POOL);
    expect(rewards[0]?.poolToken).toEqual(POOL_TOKEN);
    expect(rewards[0]?.chainId).toBe(SDK_CHAIN);
    expect(rewards[0]?.amount.value).toBe(1_000000n);
  });

  it("denominates the incentive token from Merkl when the registry has none", () => {
    const [reward] = toMerklRewards(
      buildSdk(),
      merklResponse([{ amount: "1000000" }]),
    );

    // Checksummed, as `Token.address` is documented to be — Merkl sends
    // whatever case it likes.
    expect(reward?.amount.token).toEqual({
      chainId: SDK_CHAIN,
      address: REWARD_TOKEN,
      symbol: "MERKL",
      name: "MERKL",
      decimals: 6,
    });
  });

  it("prefers the registry's token over Merkl's fields", () => {
    const known: Token = {
      chainId: SDK_CHAIN,
      address: REWARD_TOKEN,
      symbol: "GEAR",
      name: "Gearbox",
      decimals: 18,
    };

    const [reward] = toMerklRewards(
      buildSdk({ [REWARD_TOKEN.toLowerCase()]: known }),
      merklResponse([{ amount: "1000000" }]),
    );

    expect(reward?.amount.token).toBe(known);
  });

  /**
   * The registry checksums a key before looking it up and throws on a
   * malformed one, so an unparseable reason must be dropped before it gets
   * there rather than taking the whole read down.
   */
  it("skips a reason that names no address", () => {
    expect(
      toMerklRewards(
        buildSdk(),
        merklResponse([
          { reason: "no-address-here", amount: "1000000" },
          { reason: "", amount: "1000000" },
        ]),
      ),
    ).toEqual([]);
  });

  it("skips a pool this chain does not have", () => {
    expect(
      toMerklRewards(
        buildSdk(),
        merklResponse([
          {
            reason: "erc20_0x000000000000000000000000000000000000dead",
            amount: "1000000",
          },
        ]),
      ),
    ).toEqual([]);
  });

  // A reward whose pool the registry cannot name has nothing to denominate it
  // in, so it is dropped rather than shipped with a half-built token.
  it("skips a pool the registry cannot name", () => {
    expect(
      toMerklRewards(
        buildSdk({}, { namesPool: false }),
        merklResponse([{ amount: "1000000" }]),
      ),
    ).toEqual([]);
  });

  it("prices the reward off Merkl, which knows tokens the oracles do not", () => {
    const [reward] = toMerklRewards(
      buildSdk(),
      merklResponse([{ amount: "1500000" }], { price: 2 }),
    );

    // 1.5 tokens at 6 decimals, $2 each.
    expect(reward?.amount.valueUsd).toBe(3);
  });

  /**
   * Merkl omits the key outright for what it does not price — points and the
   * like — so a missing price is `null`, never a zero that would understate a
   * total without saying so.
   */
  it("reports no value for a token Merkl does not price", () => {
    const [reward] = toMerklRewards(
      buildSdk(),
      merklResponse([{ amount: "1000000" }]),
    );

    expect(reward?.amount.valueUsd).toBeNull();
  });

  // Pricing each breakdown and adding the results would round every one; the
  // sum is priced once.
  it("prices the summed amount, not each breakdown", () => {
    const [reward] = toMerklRewards(
      buildSdk(),
      merklResponse([{ amount: "1000000" }, { amount: "2500000" }], {
        price: 10,
      }),
    );

    expect(reward?.amount.value).toBe(3_500000n);
    expect(reward?.amount.valueUsd).toBe(35);
  });

  it("sums several breakdowns of one campaign token", () => {
    const [reward] = toMerklRewards(
      buildSdk(),
      merklResponse([{ amount: "1000000" }, { amount: "2500000" }]),
    );

    expect(reward?.amount.value).toBe(3_500000n);
  });

  // Merkl has been seen to report more claimed than distributed; the row is
  // nothing left to claim, never a negative that would subtract from a total.
  it("clamps a claim larger than the distribution to nothing", () => {
    expect(
      toMerklRewards(
        buildSdk(),
        merklResponse([{ amount: "1000000", claimed: "2500000" }]),
      ),
    ).toEqual([]);
  });

  it("omits a breakdown with nothing left to claim", () => {
    expect(
      toMerklRewards(
        buildSdk(),
        merklResponse([{ amount: "1000000", claimed: "1000000" }]),
      ),
    ).toEqual([]);
  });

  /**
   * A row whose amount cannot be parsed is dropped like any other unusable
   * one. Throwing would sink the whole chain, which the fan-out would then
   * report as Merkl being unreachable — the very conflation this read exists
   * to remove.
   */
  it("skips a breakdown whose amount is not a number, keeping the rest", () => {
    const rewards = toMerklRewards(
      buildSdk(),
      merklResponse([{ amount: "not-a-number" }, { amount: "1000000" }]),
    );

    expect(rewards).toHaveLength(1);
    expect(rewards[0]?.amount.value).toBe(1_000000n);
  });

  it("leaves out what is already claimed", () => {
    const [reward] = toMerklRewards(
      buildSdk(),
      merklResponse([
        { amount: "1000000", claimed: "400000" },
        { amount: "1000000", claimed: "1000000" },
      ]),
    );

    expect(reward?.amount.value).toBe(600000n);
  });
});
