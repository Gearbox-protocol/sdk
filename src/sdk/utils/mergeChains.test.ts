import { describe, expect, it } from "vitest";
import type {
  ChainId,
  ChainMetadata,
  DataResponse,
  DataSource,
  Timestamp,
} from "../../model/index.js";
import {
  DEFAULT_MAX_OFFCHAIN_LAG,
  mergeChainList,
  mergeChainOne,
} from "./mergeChains.js";

interface Row {
  chainId: ChainId;
  name: string;
}

const NOW = 1_700_000_000 as Timestamp;

function succeeded(
  chainId: ChainId,
  source: DataSource,
  timestamp: Timestamp,
): ChainMetadata {
  return { chainId, status: "success", source, blockNumber: 100, timestamp };
}

function failed(chainId: ChainId, source: DataSource): ChainMetadata {
  return {
    chainId,
    status: "error",
    source,
    error: new Error(`${source} down`),
  };
}

function response(
  chains: ChainMetadata[],
  ...rows: Row[]
): DataResponse<Row[]> {
  return { data: rows, meta: { chains } };
}

function row(chainId: ChainId, name: string): Row {
  return { chainId, name };
}

function sourceOf(response: DataResponse<unknown>, chainId: ChainId): unknown {
  return response.meta.chains.find(chain => chain.chainId === chainId)?.source;
}

describe("mergeChainList decides each chain on its own", () => {
  it("serves a chain from the backend while it is inside the lag", () => {
    const merged = mergeChainList(
      response([succeeded(1, "onchain", NOW)], row(1, "onchain row")),
      response(
        [succeeded(1, "offchain", (NOW - 30) as Timestamp)],
        row(1, "offchain row"),
      ),
    );

    expect(merged?.data).toEqual([row(1, "offchain row")]);
    expect(sourceOf(merged as DataResponse<Row[]>, 1)).toBe("offchain");
  });

  it("serves it from the chain once the backend falls further behind", () => {
    const behind = (NOW - DEFAULT_MAX_OFFCHAIN_LAG - 1) as Timestamp;
    const merged = mergeChainList(
      response([succeeded(1, "onchain", NOW)], row(1, "onchain row")),
      response([succeeded(1, "offchain", behind)], row(1, "offchain row")),
    );

    expect(merged?.data).toEqual([row(1, "onchain row")]);
    expect(sourceOf(merged as DataResponse<Row[]>, 1)).toBe("onchain");
  });

  it("takes the only source that answered, however far behind it is", () => {
    const ancient = (NOW - 10_000) as Timestamp;
    const backendOnly = mergeChainList(
      response([failed(1, "onchain")]),
      response([succeeded(1, "offchain", ancient)], row(1, "offchain row")),
    );
    expect(backendOnly?.data).toEqual([row(1, "offchain row")]);
    expect(sourceOf(backendOnly as DataResponse<Row[]>, 1)).toBe("offchain");

    const chainOnly = mergeChainList(
      response([succeeded(1, "onchain", NOW)], row(1, "onchain row")),
      response([failed(1, "offchain")]),
    );
    expect(chainOnly?.data).toEqual([row(1, "onchain row")]);
    expect(sourceOf(chainOnly as DataResponse<Row[]>, 1)).toBe("onchain");
  });

  it("reports a chain no source served, and keeps the others", () => {
    const merged = mergeChainList(
      response(
        [succeeded(1, "onchain", NOW), failed(2, "onchain")],
        row(1, "onchain row"),
      ),
      response(
        [succeeded(1, "offchain", NOW), failed(2, "offchain")],
        row(1, "offchain row"),
      ),
    );

    expect(merged?.data).toEqual([row(1, "offchain row")]);
    const chain2 = merged?.meta.chains.find(chain => chain.chainId === 2);
    expect(chain2?.status).toBe("error");
    // no source won it, so the entry names none and carries both reasons
    expect(chain2?.source).toBeUndefined();
    expect((chain2 as { error: AggregateError }).error.errors).toHaveLength(2);
  });

  it("keeps a chain only one source reported as that source's failure", () => {
    const merged = mergeChainList(
      response([failed(1, "onchain")]),
      response([]),
    );

    const chain = merged?.meta.chains[0];
    expect(chain?.status).toBe("error");
    expect(chain?.source).toBe("onchain");
    expect(merged?.data).toEqual([]);
  });

  it("takes chains neither source shares from whichever has them", () => {
    const merged = mergeChainList(
      response([succeeded(1, "onchain", NOW)], row(1, "onchain row")),
      response([succeeded(2, "offchain", NOW)], row(2, "offchain row")),
    );

    expect(merged?.data).toEqual([
      row(1, "onchain row"),
      row(2, "offchain row"),
    ]);
    expect(sourceOf(merged as DataResponse<Row[]>, 1)).toBe("onchain");
    expect(sourceOf(merged as DataResponse<Row[]>, 2)).toBe("offchain");
  });
});

describe("mergeChainList tolerates a source that has not answered yet", () => {
  it("paints the backend's answer while the chain is still in flight", () => {
    const merged = mergeChainList(
      undefined,
      response([succeeded(1, "offchain", NOW)], row(1, "offchain row")),
    );

    expect(merged?.data).toEqual([row(1, "offchain row")]);
  });

  it("paints the chain's answer while the backend is still in flight", () => {
    const merged = mergeChainList(
      response([succeeded(1, "onchain", NOW)], row(1, "onchain row")),
      undefined,
    );

    expect(merged?.data).toEqual([row(1, "onchain row")]);
  });

  it("reports the failure of the source that did answer", () => {
    const merged = mergeChainList(undefined, response([failed(1, "offchain")]));

    expect(merged?.data).toEqual([]);
    expect(merged?.meta.chains[0]?.status).toBe("error");
  });

  it("stays pending while neither source has answered", () => {
    expect(mergeChainList(undefined, undefined)).toBeUndefined();
  });
});

describe("mergeChainOne applies the same rule to one entity", () => {
  const onchain: DataResponse<string> = {
    data: "from the chain",
    meta: { chains: [succeeded(1, "onchain", NOW)] },
  };

  it("returns the winner whole, so entity and block agree", () => {
    const offchain: DataResponse<string> = {
      data: "from the backend",
      meta: { chains: [succeeded(1, "offchain", (NOW - 5) as Timestamp)] },
    };

    expect(mergeChainOne(onchain, offchain)).toBe(offchain);
  });

  it("falls back to the chain when the backend is too far behind", () => {
    const offchain: DataResponse<string> = {
      data: "from the backend",
      meta: {
        chains: [
          succeeded(
            1,
            "offchain",
            (NOW - DEFAULT_MAX_OFFCHAIN_LAG - 1) as Timestamp,
          ),
        ],
      },
    };

    expect(mergeChainOne(onchain, offchain)).toBe(onchain);
  });

  it("takes the only source that served it", () => {
    const offchain: DataResponse<string> = {
      data: "from the backend",
      meta: { chains: [failed(1, "offchain")] },
    };

    expect(mergeChainOne(onchain, offchain)).toBe(onchain);
    expect(mergeChainOne(undefined, offchain)).toBeUndefined();
  });

  it("has nothing to answer with when no source served it", () => {
    expect(
      mergeChainOne<string>(
        { data: "stale", meta: { chains: [failed(1, "onchain")] } },
        { data: "stale", meta: { chains: [failed(1, "offchain")] } },
      ),
    ).toBeUndefined();
    expect(mergeChainOne(undefined, undefined)).toBeUndefined();
  });
});
