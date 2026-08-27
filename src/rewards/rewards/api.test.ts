import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";

import type { Token } from "../../model/index.js";
import { getMerklRewards, type MerklRewardsSdk } from "./api.js";

const mockedAxiosGet = vi.mocked(axios.get);

const ACCOUNT: Address = "0x1234567890123456789012345678901234567890";

/**
 * Checksummed on purpose. Merkl names a pool in whatever case its campaign was
 * registered with and this code lowercases before matching, so a fixture of
 * repeated digits — where `toLowerCase` is a no-op — could not fail.
 */
const POOL: Address = "0x9396DCbf78fc526bb003665337C5E73b699571EF";
const REWARD_TOKEN: Address = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";

const POOL_TOKEN: Token = {
  chainId: 1,
  address: POOL,
  symbol: "dWBTC-V3-0",
  name: "WBTC",
  decimals: 8,
};

/**
 * The registry is a class with private state, so a fixture cannot satisfy it
 * structurally — the repo's own `buildMockSdk` casts for the same reason.
 */
function buildSdk(known: Record<string, Token> = {}): MerklRewardsSdk {
  return {
    chainId: 1,
    marketRegister: { pools: [{ pool: { address: POOL } }] },
    tokensMeta: {
      getToken: (address: Address) =>
        known[address.toLowerCase()] ??
        (address.toLowerCase() === POOL.toLowerCase() ? POOL_TOKEN : undefined),
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
  token: Partial<{ address: Address; symbol: string; decimals: number }> = {},
) {
  return {
    data: [
      {
        chain: { id: 1, name: "Ethereum", icon: "" },
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
              chainId: 1,
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
    ],
    status: 200,
    headers: {},
  };
}

describe("getMerklRewards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asks Merkl about the SDK's own chain", async () => {
    mockedAxiosGet.mockResolvedValueOnce({
      data: [],
      status: 200,
      headers: {},
    });

    await getMerklRewards({ sdk: buildSdk(), account: ACCOUNT });

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining(`/v4/users/${ACCOUNT}/rewards?chainId=1`),
      { headers: undefined },
    );
  });

  it("passes the api key through as a header", async () => {
    mockedAxiosGet.mockResolvedValueOnce({
      data: [],
      status: 200,
      headers: {},
    });

    await getMerklRewards({
      sdk: buildSdk(),
      account: ACCOUNT,
      apiKey: "test-api-key",
    });

    expect(mockedAxiosGet).toHaveBeenCalledWith(expect.any(String), {
      headers: { "X-API-Key": "test-api-key" },
    });
  });

  /**
   * A campaign names the pool in a lowercased `reason`, while the registry
   * holds it checksummed. Match on the wrong case and every row silently
   * disappears — with no error anywhere.
   */
  it("matches a lowercased reason against the checksummed pool", async () => {
    mockedAxiosGet.mockResolvedValueOnce(
      merklResponse([{ amount: "1000000", claimed: "0" }]),
    );

    const rewards = await getMerklRewards({
      sdk: buildSdk(),
      account: ACCOUNT,
    });

    expect(rewards).toHaveLength(1);
    expect(rewards[0]?.pool).toBe(POOL);
    expect(rewards[0]?.poolToken).toEqual(POOL_TOKEN);
    expect(rewards[0]?.chainId).toBe(1);
    expect(rewards[0]?.amount).toBe(1_000000n);
  });

  it("denominates the incentive token from Merkl when the registry has none", async () => {
    mockedAxiosGet.mockResolvedValueOnce(
      merklResponse([{ amount: "1000000" }]),
    );

    const [reward] = await getMerklRewards({
      sdk: buildSdk(),
      account: ACCOUNT,
    });

    // Checksummed, as `Token.address` is documented to be — Merkl sends
    // whatever case it likes.
    expect(reward?.rewardToken).toEqual({
      chainId: 1,
      address: REWARD_TOKEN,
      symbol: "MERKL",
      name: "MERKL",
      decimals: 6,
    });
  });

  it("prefers the registry's token over Merkl's fields", async () => {
    const known: Token = {
      chainId: 1,
      address: REWARD_TOKEN,
      symbol: "GEAR",
      name: "Gearbox",
      decimals: 18,
    };
    mockedAxiosGet.mockResolvedValueOnce(
      merklResponse([{ amount: "1000000" }]),
    );

    const [reward] = await getMerklRewards({
      sdk: buildSdk({ [REWARD_TOKEN.toLowerCase()]: known }),
      account: ACCOUNT,
    });

    expect(reward?.rewardToken).toBe(known);
  });

  /**
   * The registry checksums a key before looking it up and throws on a
   * malformed one, so an unparseable reason must be dropped before it gets
   * there rather than taking the whole read down.
   */
  it("skips a reason that names no address", async () => {
    mockedAxiosGet.mockResolvedValueOnce(
      merklResponse([
        { reason: "no-address-here", amount: "1000000" },
        { reason: "", amount: "1000000" },
      ]),
    );

    await expect(
      getMerklRewards({ sdk: buildSdk(), account: ACCOUNT }),
    ).resolves.toEqual([]);
  });

  it("skips a pool this chain does not have", async () => {
    mockedAxiosGet.mockResolvedValueOnce(
      merklResponse([
        {
          reason: "erc20_0x000000000000000000000000000000000000dead",
          amount: "1000000",
        },
      ]),
    );

    const rewards = await getMerklRewards({
      sdk: buildSdk(),
      account: ACCOUNT,
    });

    expect(rewards).toEqual([]);
  });

  it("sums several breakdowns of one campaign token", async () => {
    mockedAxiosGet.mockResolvedValueOnce(
      merklResponse([{ amount: "1000000" }, { amount: "2500000" }]),
    );

    const [reward] = await getMerklRewards({
      sdk: buildSdk(),
      account: ACCOUNT,
    });

    expect(reward?.amount).toBe(3_500000n);
  });

  it("leaves out what is already claimed", async () => {
    mockedAxiosGet.mockResolvedValueOnce(
      merklResponse([
        { amount: "1000000", claimed: "400000" },
        { amount: "1000000", claimed: "1000000" },
      ]),
    );

    const [reward] = await getMerklRewards({
      sdk: buildSdk(),
      account: ACCOUNT,
    });

    expect(reward?.amount).toBe(600000n);
  });

  /**
   * Both domains failing is the only failure a caller can observe, and it
   * arrives through the callback rather than a rejection.
   */
  it("reports a transport failure and yields nothing", async () => {
    const reportError = vi.fn();
    mockedAxiosGet
      .mockRejectedValueOnce(new Error("primary down"))
      .mockRejectedValueOnce(new Error("fallback down"));

    const rewards = await getMerklRewards({
      sdk: buildSdk(),
      account: ACCOUNT,
      reportError,
    });

    expect(rewards).toEqual([]);
    expect(reportError).toHaveBeenCalledWith(expect.any(Error), "merkleXYZLm");
  });
});
