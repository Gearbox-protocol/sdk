import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import type { Token } from "../model/index.js";
import { toTurtleRewards } from "./toTurtleRewards.js";
import type { TurtleMerkleProof, TurtleWalletStream } from "./turtle-api.js";
import type { RewardsSdk } from "./types.js";

const POOL: Address = "0xbD8EC7444dB271635584Cc38F5d06c72eAB762f5";
const GEAR: Address = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";
const CONTRACT: Address = "0xf5a6A90a91b4C60122537aA0DB6a2be13a58E305";
const E18 = 10n ** 18n;

const POOL_TOKEN: Token = {
  chainId: 1,
  address: POOL,
  symbol: "KPKfrxUSD",
  name: "frxUSD Market",
  decimals: 18,
};

function buildSdk(known: Record<string, Token> = {}): RewardsSdk {
  return {
    chainId: 1,
    marketRegister: { pools: [{ pool: { address: POOL } }] },
    tokensMeta: {
      getToken: (address: Address) =>
        address.toLowerCase() === POOL.toLowerCase()
          ? POOL_TOKEN
          : known[address.toLowerCase()],
    },
  } as unknown as RewardsSdk;
}

function stream(
  streamId: string,
  overrides: Partial<TurtleWalletStream["stream"]> = {},
  accrued = "9",
): TurtleWalletStream {
  return {
    streamId,
    snapshots: [{ rewardsAccumulated: accrued }],
    stream: {
      orgId: "org",
      contractAddress: CONTRACT,
      customArgs: {
        targetToken: {
          address: POOL.toLowerCase() as Address,
          chain: { chainId: "1" },
        },
      },
      point: null,
      rewardToken: {
        address: GEAR.toLowerCase() as Address,
        symbol: "GEAR",
        name: "Gearbox",
        decimals: 18,
      },
      lastSnapshot: { rewardTokenPrice: "0.5" },
      ...overrides,
    },
  };
}

function pointStream(streamId: string, accrued: string): TurtleWalletStream {
  return stream(
    streamId,
    {
      contractAddress: null,
      rewardToken: null,
      point: { id: "pts", name: "Gearbox Points", decimals: 2 },
    },
    accrued,
  );
}

function proof(streamId: string, amount: string): TurtleMerkleProof {
  return { streamId, chainId: 1, contractAddress: CONTRACT, amount };
}

describe("toTurtleRewards", () => {
  it("claims what is committed minus what is claimed, priced by Turtle", () => {
    const rewards = toTurtleRewards(
      buildSdk(),
      { streams: [stream("a")], proofs: [proof("a", (5n * E18).toString())] },
      new Map([["a", E18]]),
    );

    expect(rewards).toEqual([
      {
        source: "turtle",
        chainId: 1,
        pool: POOL,
        poolToken: POOL_TOKEN,
        amount: {
          token: {
            chainId: 1,
            address: GEAR,
            symbol: "GEAR",
            name: "Gearbox",
            decimals: 18,
          },
          value: 4n * E18,
          valueUsd: 2,
        },
      },
    ]);
  });

  it("merges streams paying the same token into the same pool, at the last price", () => {
    const rewards = toTurtleRewards(
      buildSdk(),
      {
        streams: [
          stream("a"),
          stream("b", { lastSnapshot: { rewardTokenPrice: "2" } }),
        ],
        proofs: [proof("a", String(3n * E18)), proof("b", String(4n * E18))],
      },
      new Map([
        ["a", 0n],
        ["b", 1n],
      ]),
    );

    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toMatchObject({
      amount: { value: 7n * E18 - 1n, valueUsd: 14 },
    });
  });

  it("prefers the registry's reward token", () => {
    const registered: Token = { ...POOL_TOKEN, address: GEAR, symbol: "gGEAR" };

    const [reward] = toTurtleRewards(
      buildSdk({ [GEAR.toLowerCase()]: registered }),
      { streams: [stream("a")], proofs: [proof("a", "1")] },
      new Map([["a", 0n]]),
    );

    expect(reward).toMatchObject({ amount: { token: registered } });
  });

  it("prices at null when Turtle has no price", () => {
    const [reward] = toTurtleRewards(
      buildSdk(),
      {
        streams: [stream("a", { lastSnapshot: null })],
        proofs: [proof("a", "1")],
      },
      new Map([["a", 0n]]),
    );

    expect(reward).toMatchObject({ amount: { valueUsd: null } });
  });

  it.each([
    ["fully claimed", [proof("a", "5")], 5n],
    ["over-claimed", [proof("a", "5")], 6n],
    ["not committed yet", [], 0n],
    ["with a non-numeric amount", [proof("a", "lots")], 0n],
  ])("leaves out a stream %s", (_, proofs, claimed) => {
    expect(
      toTurtleRewards(
        buildSdk(),
        { streams: [stream("a")], proofs },
        new Map([["a", claimed]]),
      ),
    ).toEqual([]);
  });

  it.each([
    [
      "another chain",
      { targetToken: { address: POOL, chain: { chainId: "10" } } },
    ],
    [
      "an unknown pool",
      { targetToken: { address: CONTRACT, chain: { chainId: "1" } } },
    ],
    ["nothing", {}],
  ])("leaves out a stream targeting %s", (_, customArgs) => {
    expect(
      toTurtleRewards(
        buildSdk(),
        { streams: [stream("a", { customArgs })], proofs: [proof("a", "5")] },
        new Map([["a", 0n]]),
      ),
    ).toEqual([]);
  });

  it("lists points at the latest snapshot, scaled by the point's decimals", () => {
    const rewards = toTurtleRewards(
      buildSdk(),
      {
        streams: [pointStream("p1", "12550"), pointStream("p2", "50")],
        proofs: [],
      },
      new Map(),
    );

    expect(rewards).toEqual([
      {
        source: "turtle",
        chainId: 1,
        pool: POOL,
        poolToken: POOL_TOKEN,
        points: {
          id: "pts",
          name: "Gearbox Points",
          multiplier: null,
          value: 126,
        },
      },
    ]);
  });

  it("leaves out points with nothing accrued", () => {
    expect(
      toTurtleRewards(
        buildSdk(),
        { streams: [pointStream("p", "0")], proofs: [] },
        new Map(),
      ),
    ).toEqual([]);
  });
});
