import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DataResponse } from "../../model/index.js";
import type { NetworkType } from "../chain/chains.js";
import { chains, getNetworkType } from "../chain/chains.js";
import {
  ChainNotConfiguredError,
  SdkNotAttachedError,
} from "../core/errors.js";
import type { MultichainSDK } from "../MultichainSDK.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type {
  ChainBlock,
  ChainQueryOneProps,
  ChainQueryProps,
} from "./MultichainConstruct.js";
import { MultichainConstruct } from "./MultichainConstruct.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;

/**
 * A chain the SDK is attached to, at the block of its loaded snapshot.
 **/
function chainSdk(network: NetworkType, snapshot: bigint): OnchainSDK {
  return {
    chainId: chains[network].id,
    currentBlock: snapshot,
    timestamp: snapshot * 10n,
    client: {
      getBlock: vi.fn(async ({ blockNumber }: { blockNumber?: bigint }) => {
        const number = blockNumber ?? snapshot + 50n;
        return { number, timestamp: number * 10n };
      }),
    },
    logger: undefined,
  } as unknown as OnchainSDK;
}

function multichainSdk(
  chainsByNetwork: Map<NetworkType, OnchainSDK>,
): MultichainSDK {
  return {
    chains: chainsByNetwork,
    chain: (networkOrChainId: NetworkType | number) => {
      const network =
        typeof networkOrChainId === "number"
          ? getNetworkType(networkOrChainId)
          : networkOrChainId;
      const sdk = chainsByNetwork.get(network);
      if (!sdk) {
        throw new ChainNotConfiguredError(network);
      }
      return sdk;
    },
    logger: undefined,
  } as unknown as MultichainSDK;
}

class TestService extends MultichainConstruct {
  public fanOut<T>(props: ChainQueryProps<T[]>): Promise<DataResponse<T[]>> {
    return this.queryChains(props);
  }

  public one<T>(props: ChainQueryOneProps<T>): Promise<DataResponse<T>> {
    return this.queryChain(props);
  }
}

let mainnet: OnchainSDK;
let plasma: OnchainSDK;
let service: TestService;

beforeEach(() => {
  mainnet = chainSdk("Mainnet", 1_000n);
  plasma = chainSdk("Plasma", 2_000n);
  service = new TestService(
    multichainSdk(
      new Map([
        ["Mainnet", mainnet],
        ["Plasma", plasma],
      ]),
    ),
  );
});

describe("a fan-out resolves one block per chain", () => {
  it("pins a live read to each chain's own head and reports it", async () => {
    const readAt: bigint[] = [];
    const { meta } = await service.fanOut({
      label: "read live",
      block: "latest",
      run: async (sdk, block: ChainBlock) => {
        readAt.push(block.blockNumber);
        return [sdk.chainId];
      },
    });

    // the head of each chain, not the snapshot the SDK is attached at
    expect(readAt).toEqual([1_050n, 2_050n]);
    expect(meta.chains).toEqual([
      {
        chainId: MAINNET,
        status: "success",
        source: "onchain",
        blockNumber: 1_050,
        timestamp: 10_500,
      },
      {
        chainId: PLASMA,
        status: "success",
        source: "onchain",
        blockNumber: 2_050,
        timestamp: 20_500,
      },
    ]);
  });

  it("reads loaded state at the snapshot, without asking for a block", async () => {
    const { meta } = await service.fanOut({
      chainIds: [MAINNET],
      label: "walk loaded state",
      run: async (_, block) => [block.blockNumber],
    });

    expect(mainnet.client.getBlock).not.toHaveBeenCalled();
    expect(meta.chains).toEqual([
      {
        chainId: MAINNET,
        status: "success",
        source: "onchain",
        blockNumber: 1_000,
        timestamp: 10_000,
      },
    ]);
  });

  it("concatenates the rows of the chains that answered", async () => {
    const { data } = await service.fanOut({
      label: "list rows",
      run: async sdk => [sdk.chainId, sdk.chainId],
    });

    expect(data).toEqual([MAINNET, MAINNET, PLASMA, PLASMA]);
  });
});

describe("a fan-out absorbs the failure of one chain", () => {
  it("keeps the other chains and reports the failed one", async () => {
    const { data, meta } = await service.fanOut({
      label: "list rows",
      run: async sdk => {
        if (sdk.chainId === MAINNET) {
          throw new Error("no RPC");
        }
        return [sdk.chainId];
      },
    });

    expect(data).toEqual([PLASMA]);
    expect(meta.chains[0]).toMatchObject({
      chainId: MAINNET,
      status: "error",
      source: "onchain",
    });
    expect(meta.chains[1]).toMatchObject({
      chainId: PLASMA,
      status: "success",
    });
  });

  it("reports a chain that cannot say which block it is at", async () => {
    // the same error the read itself would raise, so resolving the block first
    // does not change what a caller sees
    Object.defineProperty(mainnet, "currentBlock", {
      get: () => {
        throw new SdkNotAttachedError();
      },
    });

    const { data, meta } = await service.fanOut({
      chainIds: [MAINNET],
      label: "walk loaded state",
      run: async sdk => [sdk.chainId],
    });

    expect(data).toEqual([]);
    expect(meta.chains[0]).toMatchObject({ chainId: MAINNET, status: "error" });
    expect((meta.chains[0] as { error: unknown }).error).toBeInstanceOf(
      SdkNotAttachedError,
    );
  });
});

describe("a fan-out narrows to the chains it is given", () => {
  it("queries only the chains named", async () => {
    const { data, meta } = await service.fanOut({
      chainIds: [PLASMA],
      label: "list rows",
      run: async sdk => [sdk.chainId],
    });

    expect(data).toEqual([PLASMA]);
    expect(meta.chains).toMatchObject([{ chainId: PLASMA, status: "success" }]);
  });

  it("drops a chain the SDK cannot serve, Gearbox or not", async () => {
    // naming a chain narrows the read, it does not extend it, so neither an
    // unconfigured Gearbox chain nor a foreign id is queried or reported
    const { data, meta } = await service.fanOut({
      chainIds: [MAINNET, chains.Arbitrum.id, 424_242],
      label: "list rows",
      run: async sdk => [sdk.chainId],
    });

    expect(data).toEqual([MAINNET]);
    expect(meta.chains).toMatchObject([
      { chainId: MAINNET, status: "success" },
    ]);
  });

  it("queries a chain named twice only once", async () => {
    const run = vi.fn(async () => []);
    const { meta } = await service.fanOut({
      chainIds: [MAINNET, MAINNET],
      label: "list rows",
      run,
    });

    expect(run).toHaveBeenCalledOnce();
    expect(meta.chains).toHaveLength(1);
  });
});

describe("a single-chain request has no partial answer", () => {
  it("reports the block it was read at", async () => {
    const { data, meta } = await service.one({
      network: "Plasma",
      block: "latest",
      run: async (_, block) => block.blockNumber,
    });

    expect(data).toBe(2_050n);
    expect(meta.chains).toEqual([
      {
        chainId: PLASMA,
        status: "success",
        source: "onchain",
        blockNumber: 2_050,
        timestamp: 20_500,
      },
    ]);
  });

  it("reports the height the caller pinned, not a newer one", async () => {
    const { meta } = await service.one({
      network: MAINNET,
      block: 900n,
      run: async (_, block) => block.blockNumber,
    });

    expect(meta.chains[0]).toMatchObject({
      blockNumber: 900,
      timestamp: 9_000,
    });
  });

  it("throws rather than answering with an empty envelope", async () => {
    await expect(
      service.one({
        network: "Mainnet",
        run: async () => {
          throw new Error("not found");
        },
      }),
    ).rejects.toThrow("not found");
  });
});
