import { beforeEach, describe, expect, it, vi } from "vitest";

import { AxiosCache } from "./AxiosCache.js";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";

const mockedAxiosGet = vi.mocked(axios.get);

function createMockLogger() {
  return {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    child: vi.fn(),
  };
}

describe("AxiosCache", () => {
  beforeEach(() => {
    AxiosCache.clearAll();
    vi.clearAllMocks();
  });

  it("performs HTTP request on first fetch", async () => {
    mockedAxiosGet.mockResolvedValueOnce({
      data: { value: 42 },
      status: 200,
      headers: {},
    });

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      60_000,
    );
    const result = await cache.fetch();

    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
    expect(mockedAxiosGet).toHaveBeenCalledWith("https://example.com/data", {
      headers: {},
      validateStatus: expect.any(Function),
    });
    expect(result).toEqual({ value: 42 });
  });

  it("returns cached data without new HTTP request within TTL", async () => {
    mockedAxiosGet.mockResolvedValueOnce({
      data: { value: 42 },
      status: 200,
      headers: {},
    });

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      60_000,
    );
    await cache.fetch();
    const result = await cache.fetch();

    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ value: 42 });
  });

  it("makes a new HTTP request after TTL expires", async () => {
    mockedAxiosGet
      .mockResolvedValueOnce({
        data: { value: 1 },
        status: 200,
        headers: {},
      })
      .mockResolvedValueOnce({
        data: { value: 2 },
        status: 200,
        headers: {},
      });

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      0,
    );
    await cache.fetch();
    await new Promise(r => setTimeout(r, 10));
    const result = await cache.fetch();

    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ value: 2 });
  });

  it("deduplicates concurrent in-flight requests", async () => {
    mockedAxiosGet.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () => resolve({ data: { value: 42 }, status: 200, headers: {} }),
            50,
          ),
        ),
    );

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      60_000,
    );
    const [r1, r2] = await Promise.all([cache.fetch(), cache.fetch()]);

    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
    expect(r1).toEqual({ value: 42 });
    expect(r2).toEqual({ value: 42 });
  });

  it("returns stale cached data when HTTP request fails", async () => {
    mockedAxiosGet
      .mockResolvedValueOnce({
        data: { value: 42 },
        status: 200,
        headers: {},
      })
      .mockRejectedValueOnce(new Error("network error"));

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      0,
    );
    await cache.fetch();
    await new Promise(r => setTimeout(r, 10));
    const result = await cache.fetch();

    expect(result).toEqual({ value: 42 });
  });

  it("throws when HTTP request fails and no stale cache exists", async () => {
    mockedAxiosGet.mockRejectedValueOnce(new Error("network error"));

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      60_000,
    );

    await expect(cache.fetch()).rejects.toThrow("network error");
  });

  it("sends If-None-Match header with cached etag on subsequent request", async () => {
    mockedAxiosGet
      .mockResolvedValueOnce({
        data: { value: 1 },
        status: 200,
        headers: { etag: '"abc123"' },
      })
      .mockResolvedValueOnce({
        data: { value: 2 },
        status: 200,
        headers: {},
      });

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      0,
    );
    await cache.fetch();
    await new Promise(r => setTimeout(r, 10));
    await cache.fetch();

    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
    expect(mockedAxiosGet).toHaveBeenLastCalledWith(
      "https://example.com/data",
      {
        headers: { "If-None-Match": '"abc123"' },
        validateStatus: expect.any(Function),
      },
    );
  });

  it("handles 304 Not Modified by extending TTL", async () => {
    mockedAxiosGet
      .mockResolvedValueOnce({
        data: { value: 42 },
        status: 200,
        headers: { etag: '"abc123"' },
      })
      .mockResolvedValueOnce({
        data: undefined,
        status: 304,
        headers: {},
      });

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      0,
    );
    await cache.fetch();
    await new Promise(r => setTimeout(r, 10));
    const result = await cache.fetch();

    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ value: 42 });
  });

  it("clears all instances via clearAll", async () => {
    mockedAxiosGet.mockResolvedValue({
      data: { value: 42 },
      status: 200,
      headers: {},
    });

    const cache = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      0,
    );
    await cache.fetch();
    AxiosCache.clearAll();

    const cache2 = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      0,
    );
    await new Promise(r => setTimeout(r, 10));
    await cache2.fetch();
    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
  });

  it("shares the same instance for identical URL", () => {
    const cache1 = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      60_000,
    );
    const cache2 = AxiosCache.get<{ value: number }>(
      "https://example.com/data",
      60_000,
    );

    expect(cache1).toBe(cache2);
  });
});
