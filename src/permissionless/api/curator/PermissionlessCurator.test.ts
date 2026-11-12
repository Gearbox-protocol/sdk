import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  CONFIGURATOR,
  configuratorState,
  createStubClient,
  LATEST_BLOCK,
  SOURCE_BLOCK,
  SOURCE_BLOCK_HASH,
  SOURCE_TIMESTAMP,
  USDC,
} from "../../curator/testing/sdkHarness.js";
import {
  type ForkNode,
  startForkNode,
} from "../../curator/testing/startForkNode.js";
import { PermissionlessNotAttachedError } from "../errors.js";
import { GearboxPermissionless } from "../GearboxPermissionless.js";
import type { OpenCuratorSessionArgs } from "./types.js";

describe("curator.open", () => {
  let node: ForkNode;

  beforeAll(async () => {
    node = await startForkNode();
  });
  beforeEach(() => node.reset());
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => node.close());

  it.each([undefined, SOURCE_BLOCK])(
    "opens on the selected chain client at block %s",
    async blockNumber => {
      const permissionless = new GearboxPermissionless();
      const client = createStubClient();
      const chainClient = vi
        .spyOn(permissionless.chains, "client")
        .mockReturnValue(client);

      const session = await permissionless.curator.open({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        blockNumber,
      });

      expect(chainClient).toHaveBeenCalledExactlyOnceWith(1);
      expect(session.client).toBe(client);
      expect(session.mode).toBe("chain");
      expect(session.fork).toBeUndefined();
      expect(session.source.blockNumber).toBe(blockNumber ?? LATEST_BLOCK);
      expect(node.requests).toHaveLength(0);
    },
  );

  it("still requires attaching before opening by chain id", async () => {
    const permissionless = new GearboxPermissionless();
    await expect(
      permissionless.curator.open({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
      }),
    ).rejects.toThrow(PermissionlessNotAttachedError);
  });

  it("opens and reads from a fork without attaching or using a chain client", async () => {
    const permissionless = new GearboxPermissionless();
    const chainClient = vi.spyOn(permissionless.chains, "client");
    const fork = { rpcUrl: `${node.url}/`, timeoutMs: 1000 };
    const session = await permissionless.curator.open({
      marketConfigurator: CONFIGURATOR,
      fork,
    });
    fork.rpcUrl = "http://elsewhere.invalid";

    expect(permissionless.isAttached).toBe(false);
    expect(chainClient).not.toHaveBeenCalled();
    expect(session.mode).toBe("fork");
    expect(session.fork).toEqual({ rpcUrl: node.url, timeoutMs: 1000 });
    expect(session.client.transport.url).toBe(node.url);
    expect(session.source).toEqual({
      chainId: 1,
      marketConfigurator: CONFIGURATOR,
      blockNumber: SOURCE_BLOCK,
      blockHash: SOURCE_BLOCK_HASH,
      blockTimestamp: SOURCE_TIMESTAMP,
    });

    const preview = await session
      .configurator()
      .addAction({
        type: "CONFIGURATOR::setEmergencyAdmin",
        params: { emergencyAdmin: USDC },
      })
      .preview();

    expect(preview.stateProvenance).toBe("fork-read");
    expect(preview.after.emergencyAdmin).toBe(USDC);
    for (const call of node.requests.filter(r => r.method === "eth_call")) {
      expect(call.params[1]).toBe(`0x${SOURCE_BLOCK.toString(16)}`);
    }
  });

  it("enables fork simulation and rejects a stale source block", async () => {
    const permissionless = new GearboxPermissionless();
    const session = await permissionless.curator.open({
      marketConfigurator: CONFIGURATOR,
      fork: { rpcUrl: node.url, timeoutMs: 1000 },
    });
    node.head += 1n;

    await expect(
      session
        .configurator({ initialState: configuratorState() })
        .addAction({
          type: "CONFIGURATOR::setEmergencyAdmin",
          params: { emergencyAdmin: USDC },
        })
        .simulate(),
    ).rejects.toThrow(/fork changed since SDK creation/);
    expect(node.requests.some(r => r.method === "evm_snapshot")).toBe(false);
  });

  it("requires an Anvil endpoint", async () => {
    node.supportsAnvil = false;
    const permissionless = new GearboxPermissionless();

    await expect(
      permissionless.curator.open({
        marketConfigurator: CONFIGURATOR,
        fork: { rpcUrl: node.url, timeoutMs: 1000 },
      }),
    ).rejects.toThrow(/requires an Anvil node/);
    expect(node.requests.map(r => r.method)).toEqual(["anvil_nodeInfo"]);
  });

  it("requires the fork's current block when a block number is supplied", async () => {
    const permissionless = new GearboxPermissionless();

    await expect(
      permissionless.curator.open({
        marketConfigurator: CONFIGURATOR,
        fork: { rpcUrl: node.url, timeoutMs: 1000 },
        blockNumber: SOURCE_BLOCK - 1n,
      }),
    ).rejects.toThrow(/current block/);
  });

  it.each(["both", "neither"])(
    "rejects %s connection options before touching any client",
    async selection => {
      const permissionless = new GearboxPermissionless();
      const chainClient = vi.spyOn(permissionless.chains, "client");
      const args = {
        marketConfigurator: CONFIGURATOR,
        ...(selection === "both"
          ? { chainId: 1, fork: { rpcUrl: node.url } }
          : {}),
      } as unknown as OpenCuratorSessionArgs;

      await expect(permissionless.curator.open(args)).rejects.toThrow(
        selection === "both" ? /either chainId or fork/ : /requires chainId/,
      );
      expect(chainClient).not.toHaveBeenCalled();
      expect(node.requests).toHaveLength(0);
    },
  );
});
