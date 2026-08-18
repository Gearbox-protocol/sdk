import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  DataResponse,
  Opportunity,
  OpportunityFilter,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  Timestamp,
} from "../../model/index.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import { chains } from "../../sdk/index.js";
import {
  AllSourcesFailedError,
  SourceUnavailableError,
} from "../errors/index.js";
import { OpportunitiesNamespace } from "./OpportunitiesNamespace.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;
const NOW = 1_700_000_000 as Timestamp;
const BLOCK = 100;

const onchainSource = {
  list: vi.fn(),
  getPool: vi.fn(),
  getStrategy: vi.fn(),
};
const offchainSource = {
  list: vi.fn(),
  getPool: vi.fn(),
  getStrategy: vi.fn(),
  getCharts: vi.fn(),
};

function namespace(): OpportunitiesNamespace {
  return new OpportunitiesNamespace(
    { opportunities: onchainSource } as unknown as MultichainSDK,
    { opportunities: offchainSource } as unknown as GearboxAPI,
    { maxOffchainLagSeconds: 120 },
  );
}

function list(chainId: number, name: string): DataResponse<Opportunity[]> {
  return {
    data: [{ chainId, name } as Opportunity],
    meta: {
      chains: [
        {
          chainId,
          status: "success",
          source: "onchain",
          blockNumber: BLOCK,
          timestamp: NOW,
        },
      ],
    },
  };
}

function poolKey(chainId: number): PoolOpportunityKey {
  return { kind: "pool", chainId, pool: "0x1" } as PoolOpportunityKey;
}

function detail(chainId: number): DataResponse<PoolOpportunityDetail> {
  return {
    data: { chainId } as PoolOpportunityDetail,
    meta: {
      chains: [
        {
          chainId,
          status: "success",
          source: "offchain",
          blockNumber: BLOCK,
          timestamp: NOW,
        },
      ],
    },
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  onchainSource.list.mockResolvedValue({ data: [], meta: { chains: [] } });
  offchainSource.list.mockResolvedValue({ data: [], meta: { chains: [] } });
});

describe("a read reaches both sources as it was written", () => {
  it("asks both sources for the same unfiltered list", async () => {
    await namespace().list();

    expect(onchainSource.list).toHaveBeenCalledWith(undefined);
    expect(offchainSource.list).toHaveBeenCalledWith(undefined);
  });

  it("hands both sources the filter untouched, chains included", async () => {
    // each source intersects the named chains with the ones it covers itself,
    // so the namespace has nothing to rewrite
    const filter: OpportunityFilter = {
      chainIds: [MAINNET, 424_242],
      kind: "pool",
    };
    await namespace().list(filter);

    expect(onchainSource.list).toHaveBeenCalledWith(filter);
    expect(offchainSource.list).toHaveBeenCalledWith(filter);
  });
});

describe("a source that fails degrades the read instead of failing it", () => {
  it("serves the list from the source that answered", async () => {
    onchainSource.list.mockResolvedValue(list(MAINNET, "from the chain"));
    offchainSource.list.mockRejectedValue(new Error("backend is down"));

    const { data, meta } = await namespace().list();

    expect(data).toEqual([{ chainId: MAINNET, name: "from the chain" }]);
    expect(meta.chains).toEqual([
      {
        chainId: MAINNET,
        status: "success",
        source: "onchain",
        blockNumber: BLOCK,
        timestamp: NOW,
      },
    ]);
  });

  it("carries the reason each source gave when both failed", async () => {
    const noRpc = new Error("no RPC");
    const backendDown = new Error("backend is down");
    onchainSource.list.mockRejectedValue(noRpc);
    offchainSource.list.mockRejectedValue(backendDown);

    const failure = await namespace()
      .list()
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(AllSourcesFailedError);
    expect((failure as AllSourcesFailedError).errors).toEqual([
      noRpc,
      backendDown,
    ]);
  });

  it("fails a list whose every chain errored", async () => {
    const errored: DataResponse<Opportunity[]> = {
      data: [],
      meta: {
        chains: [
          {
            chainId: MAINNET,
            status: "error",
            source: "onchain",
            error: new Error("not attached"),
          },
        ],
      },
    };
    onchainSource.list.mockResolvedValue(errored);
    offchainSource.list.mockRejectedValue(new Error("backend is down"));

    await expect(namespace().list()).rejects.toBeInstanceOf(
      AllSourcesFailedError,
    );
  });
});

describe("a mode with one source has nothing to degrade to", () => {
  function offchainOnly(): OpportunitiesNamespace {
    return new OpportunitiesNamespace(
      undefined,
      { opportunities: offchainSource } as unknown as GearboxAPI,
      { maxOffchainLagSeconds: 120 },
    );
  }

  it("raises the backend's own error rather than wrapping it", async () => {
    const transport = new Error("the backend answered 503");
    offchainSource.list.mockRejectedValue(transport);

    await expect(offchainOnly().list()).rejects.toBe(transport);
  });

  it("names the missing source instead of handing out an undefined branch", () => {
    // the branch is not gated by mode, so this access is what the type system
    // would otherwise have rejected
    expect(() => offchainOnly().onchain).toThrow(SourceUnavailableError);
    expect(offchainOnly().offchain).toBe(offchainSource);
  });
});

describe("a detail read has no partial answer", () => {
  it("serves it from the backend when the chain cannot", async () => {
    onchainSource.getPool.mockRejectedValue(new Error("market not loaded"));
    offchainSource.getPool.mockResolvedValue(detail(MAINNET));

    const { data, meta } = await namespace().getPool(poolKey(MAINNET));

    expect(data).toEqual({ chainId: MAINNET });
    expect(meta.chains).toHaveLength(1);
    expect(meta.chains[0]?.source).toBe("offchain");
  });

  it("fails when neither source can serve it", async () => {
    const notLoaded = new Error("market not loaded");
    const backendDown = new Error("backend is down");
    onchainSource.getPool.mockRejectedValue(notLoaded);
    offchainSource.getPool.mockRejectedValue(backendDown);

    const failure = await namespace()
      .getPool(poolKey(PLASMA))
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(AllSourcesFailedError);
    expect((failure as AllSourcesFailedError).errors).toEqual([
      notLoaded,
      backendDown,
    ]);
  });
});

describe("filtering an already-read list", () => {
  const response: DataResponse<Opportunity[]> = {
    data: [
      { chainId: MAINNET, kind: "pool" } as Opportunity,
      { chainId: PLASMA, kind: "pool" } as Opportunity,
    ],
    meta: {
      chains: [
        {
          chainId: MAINNET,
          status: "success",
          source: "onchain",
          blockNumber: BLOCK,
          timestamp: NOW,
        },
        {
          chainId: PLASMA,
          status: "success",
          source: "offchain",
          blockNumber: BLOCK,
          timestamp: NOW,
        },
      ],
    },
  };

  it("drops the chains the filter excludes from the metadata too", () => {
    const filtered = namespace().filter(response, { chainIds: [MAINNET] });

    expect(filtered?.data).toEqual([{ chainId: MAINNET, kind: "pool" }]);
    // the part a consumer cannot do by filtering the rows itself
    expect(filtered?.meta.chains).toEqual([
      {
        chainId: MAINNET,
        status: "success",
        source: "onchain",
        blockNumber: BLOCK,
        timestamp: NOW,
      },
    ]);
  });

  it("keeps every chain when no chain is named", () => {
    expect(namespace().filter(response, { kind: "pool" })).toEqual(response);
  });

  it("leaves a read still in flight pending", () => {
    expect(
      namespace().filter(undefined, { chainIds: [MAINNET] }),
    ).toBeUndefined();
  });
});
