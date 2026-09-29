import type { Address, Hex } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Token } from "../model/index.js";
import type { MultichainSDK, NetworkType } from "../onchain/index.js";
import { chains } from "../onchain/index.js";
import { MerklRequestFailedError, TurtleRequestFailedError } from "./errors.js";
import { MERKL_API_KEY_HEADER } from "./merkl-api.js";
import { RewardsService } from "./RewardsService.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;

/** Lowercased on purpose, and with hex letters: `getAddress` must reshape it. */
const WALLET: Address = "0xabcdef0123456789abcdef0123456789abcdef01";
const WALLET_CHECKSUMMED = "0xabCDeF0123456789AbcdEf0123456789aBCDEF01";

const POOL: Address = "0x9396DCbf78fc526bb003665337C5E73b699571EF";
const REWARD_TOKEN: Address = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";
const PROOF: Hex = `0x${"ab".repeat(32)}`;

const mockedFetch = vi.fn();
const multicall = vi.fn();

/** On-chain state every chain's multicall answers from. */
let merklClaimed: Record<string, bigint>;
let streamClaimed: Record<string, bigint>;
/** A read of this function rejects its whole multicall. */
let failing: string | undefined;

interface Read {
  address: Address;
  functionName: string;
  args?: unknown[];
}

beforeEach(() => {
  merklClaimed = {};
  streamClaimed = {};
  failing = undefined;
  multicall.mockImplementation(async ({ contracts }: { contracts: Read[] }) => {
    if (contracts.some(c => c.functionName === failing)) {
      throw new Error("rpc down");
    }
    return contracts.map(({ address, functionName, args }) => {
      if (functionName === "getClaimedRewards") {
        return streamClaimed[address] ?? 0n;
      }
      return [merklClaimed[String(args?.[1]).toLowerCase()] ?? 0n, 0, PROOF];
    });
  });
});

/**
 * A chain the SDK is attached to, at the block of its loaded snapshot — the
 * shape `MultichainConstruct.test.ts` uses, plus what the mapping reads.
 */
function chainSdk(network: NetworkType, snapshot: bigint) {
  const poolToken: Token = {
    chainId: chains[network].id,
    address: POOL,
    symbol: "dPOOL",
    name: "Pool",
    decimals: 18,
  };
  return {
    chainId: chains[network].id,
    currentBlock: snapshot,
    timestamp: snapshot * 10n,
    marketRegister: { pools: [{ pool: { address: POOL } }] },
    tokensMeta: {
      getToken: (address: Address) =>
        address.toLowerCase() === POOL.toLowerCase() ? poolToken : undefined,
    },
    client: { multicall },
    logger: undefined,
  };
}

function multichainSdk(
  entries: Array<[NetworkType, ReturnType<typeof chainSdk>]>,
): MultichainSDK {
  return {
    chains: new Map(entries),
    chain: (chainId: number) =>
      entries.find(([, sdk]) => sdk.chainId === chainId)?.[1],
    logger: undefined,
  } as unknown as MultichainSDK;
}

/** One claimable reward, as Merkl answers it for `POOL`. */
function merklBody(amount: string) {
  return [
    {
      chain: { id: 1, name: "Ethereum", icon: "" },
      rewards: [
        {
          root: WALLET,
          recipient: WALLET,
          amount,
          claimed: "0",
          pending: "0",
          proofs: [],
          token: {
            address: REWARD_TOKEN,
            chainId: 1,
            symbol: "GEAR",
            decimals: 18,
          },
          breakdowns: [
            {
              reason: `erc20_${POOL.toLowerCase()}`,
              amount,
              claimed: "0",
              pending: "0",
              campaignId: WALLET,
            },
          ],
        },
      ],
    },
  ];
}

function answers(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}

/** Routes each attempt by the chain id in its query string. */
function respondByChain(byChain: Record<number, unknown | Error>) {
  mockedFetch.mockImplementation(async (url: string) => {
    const chainId = Number(new URL(url).searchParams.get("chainId"));
    const outcome = byChain[chainId];
    if (outcome instanceof Error) throw outcome;
    return answers(outcome ?? []);
  });
}

describe("RewardsService.list on Merkl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockedFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * The distinction the single-chain read could not make: nothing to claim is
   * a success, not a silence that looks like one.
   */
  it("calls a chain with no rewards a success that contributed no rewards", async () => {
    respondByChain({ [MAINNET]: [] });

    const { data, meta } = await new RewardsService(
      multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
    ).list(WALLET);

    expect(data).toEqual([]);
    expect(meta.chains).toEqual([
      {
        chainId: MAINNET,
        status: "success",
        source: "onchain",
        blockNumber: 100,
        timestamp: 1000,
      },
    ]);
  });

  /**
   * The other half of the same distinction — and the failing chain is first,
   * so a fan-out that stopped at the first rejection, or that mismatched the
   * settled results with their chains, would show up here.
   */
  it("reports the chain Merkl could not answer for and keeps the rest", async () => {
    respondByChain({
      [MAINNET]: new Error("merkl down"),
      [PLASMA]: merklBody("1000"),
    });

    const { data, meta } = await new RewardsService(
      multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
    ).list(WALLET);

    expect(data).toHaveLength(1);
    expect(data[0]?.chainId).toBe(PLASMA);
    expect(meta.chains.map(c => [c.chainId, c.status])).toEqual([
      [MAINNET, "error"],
      [PLASMA, "success"],
    ]);
  });

  /**
   * A consumer reports what went wrong off `meta`, so the cause has to survive
   * the fan-out intact rather than be replaced by a generic error.
   */
  it("hands the failure itself to the chain's metadata entry", async () => {
    respondByChain({ [MAINNET]: new Error("merkl down") });

    const { meta } = await new RewardsService(
      multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
    ).list(WALLET);

    const failed = meta.chains[0];
    expect(failed?.status).toBe("error");
    const error = failed?.status === "error" ? failed.error : undefined;
    expect(error).toBeInstanceOf(MerklRequestFailedError);
    expect((error as MerklRequestFailedError).chainId).toBe(MAINNET);
    expect((error as Error).message).toContain("merkl down");
  });

  it("checksums the wallet before Merkl sees it", async () => {
    respondByChain({ [MAINNET]: [] });

    await new RewardsService(
      multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
    ).list(WALLET);

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/v4/users/${WALLET_CHECKSUMMED}/rewards`),
      expect.anything(),
    );
  });

  it("forwards the api key to every chain it asks", async () => {
    respondByChain({ [MAINNET]: [], [PLASMA]: [] });

    await new RewardsService(
      multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
      { merklApiKey: "k" },
    ).list(WALLET);

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    for (const [, init] of mockedFetch.mock.calls) {
      expect(init.headers).toEqual({ [MERKL_API_KEY_HEADER]: "k" });
    }
  });

  it("concatenates the rewards of every chain that answered", async () => {
    respondByChain({
      [MAINNET]: merklBody("1000"),
      [PLASMA]: merklBody("2000"),
    });

    const { data } = await new RewardsService(
      multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
    ).list(WALLET);

    expect(data.map(r => r.chainId)).toEqual([MAINNET, PLASMA]);
  });

  it("narrows the fan-out to the chains it was given", async () => {
    respondByChain({ [MAINNET]: merklBody("1000"), [PLASMA]: [] });

    const { meta } = await new RewardsService(
      multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
    ).list(WALLET, [MAINNET]);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(meta.chains.map(c => c.chainId)).toEqual([MAINNET]);
  });
});

describe("RewardsService.list with Turtle", () => {
  const STREAM = "0xf5a6A90a91b4C60122537aA0DB6a2be13a58E305";

  const turtleStreams = {
    streams: [
      {
        streamId: "s",
        snapshots: [],
        stream: {
          orgId: "d171ba3d-ff89-4e6c-8f13-d94840b06edd",
          contractAddress: STREAM,
          customArgs: {
            targetToken: { address: POOL, chain: { chainId: String(MAINNET) } },
          },
          point: null,
          rewardToken: {
            address: REWARD_TOKEN,
            symbol: "GEAR",
            name: "Gearbox",
            decimals: 18,
          },
          lastSnapshot: null,
        },
      },
    ],
  };
  const turtleProofs = {
    proofs: [
      {
        streamId: "s",
        chainId: MAINNET,
        contractAddress: STREAM,
        amount: "700",
        proof: [],
        timestamp: "2026-09-23T00:00:00Z",
      },
    ],
  };

  function respond({
    merkl = {},
    turtle = true,
  }: {
    merkl?: Record<number, unknown>;
    turtle?: boolean | Error;
  }) {
    mockedFetch.mockImplementation(async (url: string) => {
      const { hostname, pathname, searchParams } = new URL(url);
      if (hostname !== "earn.turtle.xyz") {
        const outcome = merkl[Number(searchParams.get("chainId"))];
        if (outcome instanceof Error) throw outcome;
        return answers(outcome ?? []);
      }
      if (turtle instanceof Error) throw turtle;
      return answers(
        pathname.endsWith("merkle_proofs") ? turtleProofs : turtleStreams,
      );
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockedFetch);
    streamClaimed[STREAM] = 200n;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("puts both sources' rewards on the chain, reading claimed at latest", async () => {
    respond({ merkl: { [MAINNET]: merklBody("1000") } });

    const { data, meta } = await new RewardsService(
      multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
      { turtleApiKey: "k" },
    ).list(WALLET);

    expect(data.map(r => [r.source, "amount" in r && r.amount.value])).toEqual([
      ["merkl", 1000n],
      ["turtle", 500n],
    ]);
    expect(meta.chains.map(c => c.status)).toEqual(["success"]);
    expect(multicall).toHaveBeenCalledWith(
      expect.objectContaining({
        blockTag: "latest",
        contracts: [
          expect.objectContaining({
            address: STREAM,
            functionName: "getClaimedRewards",
            args: [WALLET_CHECKSUMMED],
          }),
        ],
      }),
    );
  });

  it("keeps Merkl's rewards when Turtle cannot be reached", async () => {
    respond({
      merkl: { [MAINNET]: merklBody("1000") },
      turtle: new Error("turtle down"),
    });

    const { data, meta } = await new RewardsService(
      multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
      { turtleApiKey: "k" },
    ).list(WALLET);

    expect(data.map(r => r.source)).toEqual(["merkl"]);
    expect(meta.chains.map(c => c.status)).toEqual(["success"]);
  });

  it("keeps Turtle's rewards when Merkl cannot be reached", async () => {
    respond({ merkl: { [MAINNET]: new Error("merkl down") } });

    const { data, meta } = await new RewardsService(
      multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
      { turtleApiKey: "k" },
    ).list(WALLET);

    expect(data.map(r => r.source)).toEqual(["turtle"]);
    expect(meta.chains.map(c => c.status)).toEqual(["success"]);
  });

  it("keeps Merkl's rewards when Turtle's claimed amounts could not be read", async () => {
    respond({ merkl: { [MAINNET]: merklBody("1000") } });
    failing = "getClaimedRewards";

    const { data, meta } = await new RewardsService(
      multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
      { turtleApiKey: "k" },
    ).list(WALLET);

    expect(data.map(r => r.source)).toEqual(["merkl"]);
    expect(meta.chains.map(c => c.status)).toEqual(["success"]);
  });

  it("fails only the chain where every source failed", async () => {
    respond({
      merkl: {
        [MAINNET]: new Error("merkl down"),
        [PLASMA]: merklBody("1000"),
      },
      turtle: new Error("turtle down"),
    });

    const { data, meta } = await new RewardsService(
      multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
      { turtleApiKey: "k" },
    ).list(WALLET);

    expect(data.map(r => r.chainId)).toEqual([PLASMA]);
    expect(meta.chains.map(c => [c.chainId, c.status])).toEqual([
      [MAINNET, "error"],
      [PLASMA, "success"],
    ]);
    const failed = meta.chains[0];
    const error = failed?.status === "error" ? failed.error : undefined;
    expect(error).toBeInstanceOf(AggregateError);
    expect((error as AggregateError).errors).toEqual([
      expect.any(MerklRequestFailedError),
      expect.any(TurtleRequestFailedError),
    ]);
  });

  it("does not ask Turtle without a key", async () => {
    respond({ merkl: { [MAINNET]: merklBody("1000") } });

    const { data } = await new RewardsService(
      multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
    ).list(WALLET);

    expect(data.map(r => r.source)).toEqual(["merkl"]);
    for (const [url] of mockedFetch.mock.calls) {
      expect(url).not.toContain("turtle");
    }
    expect(multicall).not.toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: [
          expect.objectContaining({ functionName: "getClaimedRewards" }),
        ],
      }),
    );
  });
});
