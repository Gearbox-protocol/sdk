import type { Address } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Token } from "../model/index.js";
import type { MultichainSDK, NetworkType } from "../onchain/index.js";
import { chains } from "../onchain/index.js";
import { MerklRequestFailedError } from "./errors.js";
import { MERKL_API_KEY_HEADER } from "./merkl-api.js";
import { getMerklRewardsMultichain } from "./multichain.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;

/** Lowercased on purpose, and with hex letters: `getAddress` must reshape it. */
const WALLET: Address = "0xabcdef0123456789abcdef0123456789abcdef01";
const WALLET_CHECKSUMMED = "0xabCDeF0123456789AbcdEf0123456789aBCDEF01";

const POOL: Address = "0x9396DCbf78fc526bb003665337C5E73b699571EF";
const REWARD_TOKEN: Address = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";

const mockedFetch = vi.fn();

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
    logger: undefined,
  };
}

function multichainSdk(
  entries: Array<[NetworkType, ReturnType<typeof chainSdk>]>,
): MultichainSDK {
  return {
    chains: new Map(entries),
    logger: undefined,
  } as unknown as MultichainSDK;
}

/** One claimable row, as Merkl answers it for `POOL`. */
function merklBody(amount: string) {
  return [
    {
      chain: { id: 1, name: "Ethereum", icon: "" },
      rewards: [
        {
          root: WALLET,
          recipient: WALLET,
          amount: "0",
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

describe("getMerklRewardsMultichain", () => {
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
  it("calls a chain with no rewards a success that contributed no rows", async () => {
    respondByChain({ [MAINNET]: [] });

    const { data, meta } = await getMerklRewardsMultichain({
      sdk: multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
      wallet: WALLET,
    });

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

    const { data, meta } = await getMerklRewardsMultichain({
      sdk: multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
      wallet: WALLET,
    });

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

    const { meta } = await getMerklRewardsMultichain({
      sdk: multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
      wallet: WALLET,
    });

    const failed = meta.chains[0];
    expect(failed?.status).toBe("error");
    const error = failed?.status === "error" ? failed.error : undefined;
    expect(error).toBeInstanceOf(MerklRequestFailedError);
    expect((error as MerklRequestFailedError).chainId).toBe(MAINNET);
    expect((error as Error).message).toContain("merkl down");
  });

  it("checksums the wallet before Merkl sees it", async () => {
    respondByChain({ [MAINNET]: [] });

    await getMerklRewardsMultichain({
      sdk: multichainSdk([["Mainnet", chainSdk("Mainnet", 100n)]]),
      wallet: WALLET,
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/v4/users/${WALLET_CHECKSUMMED}/rewards`),
      expect.anything(),
    );
  });

  it("forwards the api key to every chain it asks", async () => {
    respondByChain({ [MAINNET]: [], [PLASMA]: [] });

    await getMerklRewardsMultichain({
      sdk: multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
      wallet: WALLET,
      apiKey: "k",
    });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    for (const [, init] of mockedFetch.mock.calls) {
      expect(init.headers).toEqual({ [MERKL_API_KEY_HEADER]: "k" });
    }
  });

  it("concatenates the rows of every chain that answered", async () => {
    respondByChain({
      [MAINNET]: merklBody("1000"),
      [PLASMA]: merklBody("2000"),
    });

    const { data } = await getMerklRewardsMultichain({
      sdk: multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
      wallet: WALLET,
    });

    expect(data.map(r => r.chainId)).toEqual([MAINNET, PLASMA]);
  });

  it("narrows the fan-out to the chains it was given", async () => {
    respondByChain({ [MAINNET]: merklBody("1000"), [PLASMA]: [] });

    const { meta } = await getMerklRewardsMultichain({
      sdk: multichainSdk([
        ["Mainnet", chainSdk("Mainnet", 100n)],
        ["Plasma", chainSdk("Plasma", 200n)],
      ]),
      wallet: WALLET,
      chainIds: [MAINNET],
    });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(meta.chains.map(c => c.chainId)).toEqual([MAINNET]);
  });
});
