import type { Address } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DataResponse, Opportunity } from "../model/index.js";
import type { NetworkType, OnchainSDK } from "../sdk/index.js";
import { MultichainSDK, SdkNotAttachedError } from "../sdk/index.js";
import { GearboxSDK } from "./GearboxSDK.js";
import { jsonResponse, offchainSuccess } from "./testing/offchainFailures.js";

/**
 * The SDK's loading policy (plan §3.1): attach on the first async read,
 * revalidate the touched chains by state age. Over a real `MultichainSDK`
 * whose network calls are stubbed: `attach` / `syncState` are spies, the
 * chain timestamps are pinned, and the on-chain reads answer canned data.
 */

const NOW = 1_800_000_000;
const MAX_AGE = 30;
const POOL = "0x2222222222222222222222222222222222222222" as Address;
const RPC = "http://127.0.0.1:1";

const answered = (
  chainId: number,
  timestamp: number,
): DataResponse<Opportunity[]> => ({
  data: [],
  meta: {
    chains: [
      {
        chainId,
        status: "success",
        source: "onchain",
        blockNumber: 100,
        timestamp,
      },
    ],
  },
});

/** A deferred: `promise` settles when `resolve` / `reject` is called. */
function deferred<T = void>() {
  let resolve: (v: T) => void = () => {};
  let reject: (e: unknown) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function build(networks: NetworkType[] = ["Mainnet"]) {
  const sdk = new GearboxSDK({
    mode: "onchain",
    networks,
    onchain: {
      chains: Object.fromEntries(
        networks.map(n => [n, { rpcURLs: [RPC], timeout: 1_000 }]),
      ),
    },
    maxStateAgeSeconds: MAX_AGE,
  });
  const attach = vi.spyOn(sdk.onchain, "attach").mockResolvedValue(undefined);
  const chains = new Map<NetworkType, ReturnType<typeof stubChain>>();
  for (const network of networks) {
    chains.set(network, stubChain(sdk.onchain.chain(network)));
  }
  const list = vi
    .spyOn(sdk.opportunities.onchain, "list")
    .mockResolvedValue(answered(1, NOW));
  const getPool = vi.spyOn(sdk.opportunities.onchain, "getPool");
  return { sdk, attach, chains, list, getPool };
}

/**
 * Same on-chain stubbing as {@link build}, plus a healthy backend the merge
 * can fall back to.
 **/
function buildBoth(networks: NetworkType[] = ["Mainnet"]) {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    jsonResponse({
      data: [],
      meta: { chains: [offchainSuccess(1)] },
    }),
  );
  const sdk = new GearboxSDK({
    mode: "both",
    networks,
    onchain: {
      chains: Object.fromEntries(
        networks.map(n => [n, { rpcURLs: [RPC], timeout: 1_000 }]),
      ),
    },
    offchain: { baseUrl: "https://api.gearbox.fi" },
    maxStateAgeSeconds: MAX_AGE,
  });
  const attach = vi.spyOn(sdk.onchain, "attach").mockResolvedValue(undefined);
  const chains = new Map<NetworkType, ReturnType<typeof stubChain>>();
  for (const network of networks) {
    chains.set(network, stubChain(sdk.onchain.chain(network)));
  }
  const list = vi
    .spyOn(sdk.opportunities.onchain, "list")
    .mockResolvedValue(answered(1, NOW));
  return { sdk, attach, chains, list, fetchMock };
}

/** Pins a chain's loaded state at `NOW` and turns its sync into a spy. */
function stubChain(chain: OnchainSDK) {
  const timestamp = vi
    .spyOn(chain, "timestamp", "get")
    .mockReturnValue(BigInt(NOW));
  vi.spyOn(chain, "currentBlock", "get").mockReturnValue(100n);
  const syncState = vi.spyOn(chain, "syncState").mockResolvedValue(true);
  return {
    syncState,
    /** Ages the loaded state by `seconds`. */
    age: (seconds: number) => timestamp.mockReturnValue(BigInt(NOW - seconds)),
  };
}

describe("GearboxSDK loading", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW * 1000, toFake: ["Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("two concurrent first reads attach once, and both answer", async () => {
    const { sdk, attach, list } = build();
    const gate = deferred();
    attach.mockReturnValue(gate.promise);

    const reads = Promise.all([
      sdk.opportunities.list(),
      sdk.opportunities.list(),
    ]);
    await Promise.resolve();
    expect(attach).toHaveBeenCalledTimes(1);
    expect(list).not.toHaveBeenCalled();

    gate.resolve();
    const [a, b] = await reads;
    expect(a.data).toEqual([]);
    expect(b.data).toEqual([]);
    expect(list).toHaveBeenCalledTimes(2);
    expect(sdk.attached).toBe(true);
  });

  it("a read inside maxStateAgeSeconds syncs nothing", async () => {
    const { sdk, chains } = build();
    chains.get("Mainnet")?.age(MAX_AGE);

    await sdk.opportunities.list();

    expect(chains.get("Mainnet")?.syncState).not.toHaveBeenCalled();
  });

  it("a rejected attach is not cached: the next read retries", async () => {
    const { sdk, attach } = build();
    attach.mockRejectedValueOnce(new Error("rpc down"));

    await expect(sdk.opportunities.list()).rejects.toThrow("rpc down");
    expect(sdk.attached).toBe(false);

    await expect(sdk.opportunities.list()).resolves.toBeDefined();
    expect(attach).toHaveBeenCalledTimes(2);
    expect(sdk.attached).toBe(true);
  });

  it("two stale reads while a sync is in flight share it, and both wait for it", async () => {
    const { sdk, chains, list } = build();
    const chain = chains.get("Mainnet");
    if (!chain) throw new Error("unreachable");
    chain.age(MAX_AGE + 1);
    const gate = deferred<boolean>();
    chain.syncState.mockReturnValue(gate.promise);

    const reads = Promise.all([
      sdk.opportunities.list(),
      sdk.opportunities.list(),
    ]);
    await vi.advanceTimersByTimeAsync(0);
    expect(chain.syncState).toHaveBeenCalledTimes(1);
    expect(list).not.toHaveBeenCalled();

    gate.resolve(true);
    await reads;
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("revalidates only the chain the read touches", async () => {
    const { sdk, chains, getPool } = build(["Mainnet", "Optimism"]);
    chains.get("Mainnet")?.age(MAX_AGE + 1);
    chains.get("Optimism")?.age(MAX_AGE + 1);
    getPool.mockResolvedValue({
      data: {} as never,
      meta: answered(1, NOW).meta,
    });

    await sdk.opportunities.getPool({ chainId: 1, pool: POOL });

    expect(chains.get("Mainnet")?.syncState).toHaveBeenCalledTimes(1);
    expect(chains.get("Optimism")?.syncState).not.toHaveBeenCalled();
  });

  it("an unnamed read syncs every stale chain; a chain-scoped one only its own", async () => {
    const { sdk, chains, list } = build(["Mainnet", "Optimism"]);
    chains.get("Mainnet")?.age(MAX_AGE + 1);
    chains.get("Optimism")?.age(MAX_AGE + 1);

    await sdk.opportunities.list();
    expect(chains.get("Mainnet")?.syncState).toHaveBeenCalledTimes(1);
    expect(chains.get("Optimism")?.syncState).toHaveBeenCalledTimes(1);

    chains.get("Mainnet")?.syncState.mockClear();
    chains.get("Optimism")?.syncState.mockClear();
    await sdk.opportunities.list({ chainIds: [10] });
    expect(chains.get("Mainnet")?.syncState).not.toHaveBeenCalled();
    expect(chains.get("Optimism")?.syncState).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("a simulation attaches on first use and revalidates only its chain", async () => {
    const { sdk, attach, chains } = build(["Mainnet", "Optimism"]);
    chains.get("Mainnet")?.age(MAX_AGE + 1);
    chains.get("Optimism")?.age(MAX_AGE + 1);
    const getCreditAccountData = vi.fn(async () => undefined);
    for (const network of ["Mainnet", "Optimism"] as const) {
      Object.defineProperty(sdk.onchain.chain(network), "accounts", {
        value: { getCreditAccountData },
      });
    }

    await expect(
      sdk.opportunities.prepare.addCollateral(
        { chainId: 1, creditAccount: POOL },
        { token: POOL, amount: 1n },
      ),
    ).rejects.toThrow(/credit account not found/);

    expect(attach).toHaveBeenCalledTimes(1);
    expect(chains.get("Mainnet")?.syncState).toHaveBeenCalledTimes(1);
    expect(chains.get("Optimism")?.syncState).not.toHaveBeenCalled();
  });

  it("a sync that finds no newer block (`false`) is not an error; a fresh state is not synced again", async () => {
    const { sdk, chains } = build();
    const chain = chains.get("Mainnet");
    if (!chain) throw new Error("unreachable");
    chain.age(MAX_AGE + 1);
    chain.syncState.mockResolvedValue(false);

    await expect(sdk.opportunities.list()).resolves.toBeDefined();
    expect(chain.syncState).toHaveBeenCalledTimes(1);

    // once the state is inside the window again, no read syncs
    chain.age(0);
    await sdk.opportunities.list();
    expect(chain.syncState).toHaveBeenCalledTimes(1);
  });

  it("a failed sync serves the previous state, with its old block and timestamp", async () => {
    const { sdk, chains, list } = build();
    const chain = chains.get("Mainnet");
    if (!chain) throw new Error("unreachable");
    chain.age(MAX_AGE + 1);
    chain.syncState.mockRejectedValue(new Error("rpc down"));
    // let the real multichain service run: its meta comes from the chain's
    // (pinned, old) block and timestamp, not from a canned answer
    list.mockRestore();
    Object.defineProperty(sdk.onchain.chain("Mainnet"), "opportunities", {
      value: { list: vi.fn(async () => []) },
    });

    const response = await sdk.opportunities.list();

    expect(chain.syncState).toHaveBeenCalledTimes(1);
    expect(response.meta.chains[0]).toMatchObject({
      status: "success",
      blockNumber: 100,
      timestamp: NOW - MAX_AGE - 1,
    });
  });

  it("an injected, already-attached MultichainSDK is not attached again", async () => {
    const injected = Object.create(MultichainSDK.prototype) as MultichainSDK;
    const attach = vi.fn(async () => undefined);
    const chain = {
      chainId: 1,
      timestamp: BigInt(NOW),
      currentBlock: 100n,
      syncState: vi.fn(async () => true),
    };
    Object.defineProperties(injected, {
      attach: { value: attach },
      chains: { value: new Map([["Mainnet", chain]]) },
      chain: { value: () => chain },
      opportunities: {
        value: { list: vi.fn(async () => answered(1, NOW)) },
      },
      positions: { value: {} },
    });

    const sdk = new GearboxSDK({
      mode: "onchain",
      networks: ["Mainnet"],
      onchain: injected,
      maxStateAgeSeconds: MAX_AGE,
    });
    expect(sdk.attached).toBe(true);
    await sdk.opportunities.list();
    expect(attach).not.toHaveBeenCalled();
    expect(chain.syncState).not.toHaveBeenCalled();

    // but its state is revalidated by age like a self-built one
    chain.timestamp = BigInt(NOW - MAX_AGE - 1);
    await sdk.opportunities.list();
    expect(chain.syncState).toHaveBeenCalledTimes(1);
  });

  it("the raw `.onchain` branch attaches and revalidates too — the app's split read path", async () => {
    const { sdk, attach, chains, list } = build();
    const chain = chains.get("Mainnet");
    if (!chain) throw new Error("unreachable");
    chain.age(MAX_AGE + 1);

    const response = await sdk.opportunities.onchain.list();

    expect(attach).toHaveBeenCalledTimes(1);
    expect(chain.syncState).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledTimes(1);
    expect(response.data).toEqual([]);
  });

  it("in both mode a rejected attach falls back to a healthy backend", async () => {
    const { sdk, attach } = buildBoth();
    attach.mockRejectedValue(new Error("rpc down"));

    const response = await sdk.opportunities.list();

    expect(
      response.meta.chains.every(chain => chain.source === "offchain"),
    ).toBe(true);
    expect(sdk.attached).toBe(false);
  });

  it("in both mode a failed sync serves the previous on-chain state when the backend is down", async () => {
    const { sdk, chains, list, fetchMock } = buildBoth();
    const chain = chains.get("Mainnet");
    if (!chain) throw new Error("unreachable");
    chain.age(MAX_AGE + 1);
    chain.syncState.mockRejectedValue(new Error("rpc down"));
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    list.mockRestore();
    Object.defineProperty(sdk.onchain.chain("Mainnet"), "opportunities", {
      value: { list: vi.fn(async () => []) },
    });

    const response = await sdk.opportunities.list();

    expect(chain.syncState).toHaveBeenCalledTimes(1);
    expect(response.meta.chains[0]).toMatchObject({
      status: "success",
      source: "onchain",
      blockNumber: 100,
      timestamp: NOW - MAX_AGE - 1,
    });
  });

  it("the sync LP simulation before attach throws SdkNotAttachedError, as before", () => {
    const { sdk } = build();
    expect(() =>
      sdk.opportunities.prepare.deposit(
        { chainId: 1, pool: POOL },
        { amount: 1n, wallet: POOL },
      ),
    ).toThrow(SdkNotAttachedError);
  });
});
