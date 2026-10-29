import type { Address, Hex } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GearboxPermissionless } from "../GearboxPermissionless.js";
import { TIMELOCK_EVENTS_CHUNK_SIZE } from "./PermissionlessConfigurators.js";

const BASE_URL = "https://api.gear-dev.dev";
const CHAIN = 1;
const CONFIGURATOR = "0x0000000000000000000000000000000000000c01" as Address;
const TIMELOCK = "0x0000000000000000000000000000000000000a01" as Address;
const SAFE = "0x0000000000000000000000000000000000000b01" as Address;
const POOL = "0x0000000000000000000000000000000000000f01" as Address;
const WETH = "0x00000000000000000000000000000000000000aa" as Address;

const CONFIGURATOR_ROW = {
  chainId: CHAIN,
  address: CONFIGURATOR,
  name: "kpk",
  admin: TIMELOCK,
  treasury: SAFE,
  owner: SAFE,
  governor: true,
  public: true,
  marketsQty: 2,
  status: "active",
  createBlock: 100,
  shutdownBlock: null,
};

const MARKET_ROW = {
  chainId: CHAIN,
  address: POOL,
  marketConfigurator: CONFIGURATOR,
  underlyingToken: WETH,
  name: "Diesel WETH",
  symbol: "dWETH",
  decimals: 18,
  status: "shutdown",
  createBlock: 100,
  shutdownBlock: 200,
};

const hash = (n: number): Hex => `0x${n.toString(16).padStart(64, "0")}`;

let fetchMock: MockInstance<typeof fetch>;

function respond(payload: unknown): void {
  fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    return new Response(JSON.stringify({ data: payload }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

function client(): GearboxPermissionless {
  return new GearboxPermissionless({ baseUrl: BASE_URL });
}

function requested(call = 0): URL {
  return new URL(String(fetchMock.mock.calls[call]?.[0]));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("configurators.list", () => {
  beforeEach(() => respond([CONFIGURATOR_ROW]));

  it("reads the listed configurators of a chain", async () => {
    const list = await client().configurators.list({ chainId: CHAIN });

    expect(list).toEqual([CONFIGURATOR_ROW]);
    expect(requested().pathname).toBe("/curators/list");
    expect(requested().searchParams.get("chainId")).toBe("1");
  });

  it("reads every chain without a chain id", async () => {
    await client().configurators.list();

    expect(requested().searchParams.has("chainId")).toBe(false);
  });
});

describe("configurators.details", () => {
  it("reads one configurator by chain and address", async () => {
    respond({ ...CONFIGURATOR_ROW, public: false });

    const configurator = await client().configurators.details({
      chainId: CHAIN,
      address: CONFIGURATOR,
    });

    expect(configurator.public).toBe(false);
    expect(requested().pathname).toBe(`/curators/1/${CONFIGURATOR}`);
  });

  it("rejects a payload with a broken lifecycle", async () => {
    respond({ ...CONFIGURATOR_ROW, status: "active", createBlock: null });

    await expect(
      client().configurators.details({ chainId: CHAIN, address: CONFIGURATOR }),
    ).rejects.toThrow();
  });
});

describe("configurators.markets", () => {
  it("reads the configurator's markets", async () => {
    respond([MARKET_ROW]);

    const markets = await client().configurators.markets({
      chainId: CHAIN,
      address: CONFIGURATOR,
    });

    expect(markets).toEqual([MARKET_ROW]);
    expect(requested().pathname).toBe(`/curators/1/${CONFIGURATOR}/markets`);
  });
});

describe("configurators.timelockEvents", () => {
  it("asks for each hash once, in chunks", async () => {
    respond([]);
    const hashes = Array.from(
      { length: TIMELOCK_EVENTS_CHUNK_SIZE + 1 },
      (_, i) => hash(i + 1),
    );

    await client().configurators.timelockEvents({
      chainId: CHAIN,
      txHashes: [...hashes, hashes[0].toUpperCase().replace("0X", "0x") as Hex],
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const asked = [0, 1].flatMap(call =>
      (requested(call).searchParams.get("txHashes") ?? "").split(","),
    );
    expect(asked).toHaveLength(hashes.length);
    expect(requested().pathname).toBe("/curators/timelock-transactions");
    expect(requested().searchParams.get("chainId")).toBe("1");
  });

  it("returns the events the backend has", async () => {
    const event = {
      chainId: CHAIN,
      marketConfigurator: CONFIGURATOR,
      txHash: hash(1),
      status: "ExecuteTransaction",
      blockNumber: 300,
      logId: 4,
      eta: 1_700_000_000,
    };
    respond([event]);

    const events = await client().configurators.timelockEvents({
      chainId: CHAIN,
      txHashes: [hash(1), hash(2)],
    });

    expect(events).toEqual([event]);
  });

  it("makes no request for no hashes", async () => {
    respond([]);

    const events = await client().configurators.timelockEvents({
      chainId: CHAIN,
      txHashes: [],
    });

    expect(events).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
