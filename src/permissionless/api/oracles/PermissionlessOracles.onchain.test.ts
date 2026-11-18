import {
  type Address,
  type Chain,
  getAddress,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GearboxPermissionless } from "../GearboxPermissionless.js";
import type { TreeNode } from "./stress/classify.js";

const contracts = vi.hoisted(() => ({
  compressor: vi.fn(),
  readFeedTrees: vi.fn(),
}));

vi.mock("../../bindings/address-provider.js", () => ({
  AddressProviderContract: class {
    getLatestVersionAddress = contracts.compressor;
  },
}));

vi.mock("./stress/run.js", async importOriginal => ({
  ...(await importOriginal<typeof import("./stress/run.js")>()),
  readFeedTrees: contracts.readFeedTrees,
}));

const BASE_URL = "https://api.gear-dev.dev";
const CHAIN = 1;
const COMPRESSOR = "0x1fa2637b9fab0cd14290a7ee908ddc9688a15120" as Address;
const FEED = "0x3c40839dec34502bd94c662a1ed6df3f24ddee76" as Address;
const CHILD = "0x00000000000000000000000000000000000000c1" as Address;

const ROOT_NODE: TreeNode = {
  address: FEED,
  contractType: "PRICE_FEED::CURVE_STABLE",
  version: 310,
  description: "  crvUSD/USDC Curve LP price feed ",
  underlyingFeeds: [CHILD],
};
const CHILD_NODE: TreeNode = {
  address: CHILD,
  contractType: "PRICE_FEED::EXTERNAL",
  version: 4,
  description: "USDC / USD",
  underlyingFeeds: [],
};

function status(code: number): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("{}", { status: code }),
  );
}

function tree(...nodes: TreeNode[]): void {
  contracts.readFeedTrees.mockResolvedValue({
    nodes: new Map(nodes.map(node => [node.address, node])),
    answers: new Map(),
  });
}

function sdk(): GearboxPermissionless {
  const permissionless = new GearboxPermissionless({ baseUrl: BASE_URL });
  vi.spyOn(permissionless.chains, "client").mockReturnValue(
    {} as PublicClient<Transport, Chain>,
  );
  return permissionless;
}

beforeEach(() => {
  contracts.compressor.mockResolvedValue(COMPRESSOR);
  tree(ROOT_NODE, CHILD_NODE);
});

afterEach(() => {
  vi.restoreAllMocks();
  contracts.compressor.mockReset();
  contracts.readFeedTrees.mockReset();
});

describe("oracles.feed off the chain", () => {
  it("reads a feed the store does not carry off the compressor", async () => {
    status(404);

    const details = await sdk().oracles.feed({
      chainId: CHAIN,
      address: getAddress(FEED),
    });

    expect(contracts.readFeedTrees).toHaveBeenCalledWith(
      expect.anything(),
      COMPRESSOR,
      [FEED],
    );
    expect(details).toEqual({
      chainId: CHAIN,
      priceFeed: {
        address: getAddress(FEED),
        contractType: "PRICE_FEED::CURVE_STABLE",
        version: 310,
        deployedBy: zeroAddress,
        stalenessPeriod: 0,
        name: "crvUSD/USDC Curve LP price feed",
      },
      assets: [],
      markets: [],
      inStore: false,
    });
  });

  it("names a type the compressor left empty as external", async () => {
    status(404);
    tree({ ...ROOT_NODE, contractType: "", underlyingFeeds: [] });

    const details = await sdk().oracles.feed({ chainId: CHAIN, address: FEED });

    expect(details.priceFeed.contractType).toBe("PRICE_FEED::EXTERNAL");
  });

  it("reports the store's miss when the chain does not know the feed either", async () => {
    status(404);
    tree();

    await expect(
      sdk().oracles.feed({ chainId: CHAIN, address: FEED }),
    ).rejects.toMatchObject({ name: "OffchainStatusError", status: 404 });
  });

  it("reports the store's miss when the chain cannot be read", async () => {
    status(404);
    contracts.readFeedTrees.mockRejectedValue(new Error("execution reverted"));

    await expect(
      sdk().oracles.feed({ chainId: CHAIN, address: FEED }),
    ).rejects.toMatchObject({ name: "OffchainStatusError", status: 404 });
  });

  it("reports the store's miss when the chain has no compressor", async () => {
    status(404);
    contracts.compressor.mockResolvedValue(zeroAddress);

    await expect(
      sdk().oracles.feed({ chainId: CHAIN, address: FEED }),
    ).rejects.toMatchObject({ status: 404 });
    expect(contracts.readFeedTrees).not.toHaveBeenCalled();
  });

  it("does not read the chain when the backend fails for another reason", async () => {
    status(500);

    await expect(
      sdk().oracles.feed({ chainId: CHAIN, address: FEED }),
    ).rejects.toMatchObject({ status: 500 });
    expect(contracts.readFeedTrees).not.toHaveBeenCalled();
  });
});
