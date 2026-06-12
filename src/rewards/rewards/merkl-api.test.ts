import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from "axios";

import { MerkleXYZApi } from "./merkl-api.js";

const mockedAxiosGet = vi.mocked(axios.get);

describe("MerkleXYZApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls primary domain without headers when apiKey is not provided", async () => {
    mockedAxiosGet.mockResolvedValueOnce({
      data: [],
      status: 200,
      headers: {},
    });

    const url = MerkleXYZApi.getUserRewardsUrl({
      params: {
        user: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      },
    });

    await MerkleXYZApi.fetchWithFallback(url);

    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
    expect(mockedAxiosGet).toHaveBeenCalledWith(
      url(MerkleXYZApi.defaultDomain),
      {
        headers: undefined,
      },
    );
  });

  it("sends X-API-Key header to primary domain when apiKey is provided", async () => {
    mockedAxiosGet.mockResolvedValueOnce({
      data: [],
      status: 200,
      headers: {},
    });

    const url = MerkleXYZApi.getUserRewardsUrl({
      params: {
        user: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      },
    });
    const apiKey = "test-api-key";

    await MerkleXYZApi.fetchWithFallback(url, apiKey);

    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
    expect(mockedAxiosGet).toHaveBeenCalledWith(
      url(MerkleXYZApi.defaultDomain),
      {
        headers: { [MerkleXYZApi.apiKeyHeader]: apiKey },
      },
    );
  });

  it("falls back to angle domain and preserves X-API-Key header", async () => {
    mockedAxiosGet
      .mockRejectedValueOnce(new Error("primary down"))
      .mockResolvedValueOnce({
        data: [],
        status: 200,
        headers: {},
      });

    const url = MerkleXYZApi.getUserRewardsUrl({
      params: {
        user: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      },
    });
    const apiKey = "test-api-key";

    await MerkleXYZApi.fetchWithFallback(url, apiKey);

    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
    expect(mockedAxiosGet).toHaveBeenNthCalledWith(
      1,
      url(MerkleXYZApi.defaultDomain),
      { headers: { [MerkleXYZApi.apiKeyHeader]: apiKey } },
    );
    expect(mockedAxiosGet).toHaveBeenNthCalledWith(
      2,
      url(MerkleXYZApi.angleDomain),
      { headers: { [MerkleXYZApi.apiKeyHeader]: apiKey } },
    );
  });

  it("falls back to angle domain without headers when apiKey is not provided", async () => {
    mockedAxiosGet
      .mockRejectedValueOnce(new Error("primary down"))
      .mockResolvedValueOnce({
        data: [],
        status: 200,
        headers: {},
      });

    const url = MerkleXYZApi.getUserRewardsUrl({
      params: {
        user: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      },
    });

    await MerkleXYZApi.fetchWithFallback(url);

    expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
    expect(mockedAxiosGet).toHaveBeenNthCalledWith(
      1,
      url(MerkleXYZApi.defaultDomain),
      { headers: undefined },
    );
    expect(mockedAxiosGet).toHaveBeenNthCalledWith(
      2,
      url(MerkleXYZApi.angleDomain),
      { headers: undefined },
    );
  });
});
