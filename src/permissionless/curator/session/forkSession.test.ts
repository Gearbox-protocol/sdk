import { createPublicClient, custom, erc20Abi } from "viem";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getChain } from "../../../onchain/chain/chains.js";
import { OnchainSDK } from "../../../onchain/OnchainSDK.js";
import type { GearboxState } from "../../../onchain/types/state.js";
import {
  ADDRESS_PROVIDER,
  CONFIGURATOR,
  configuratorState,
  createTestSdk,
  marketState,
  PF_COMPRESSOR,
  SOURCE_BLOCK,
  SOURCE_TIMESTAMP,
  TIMELOCK,
  USDC,
} from "../testing/sdkHarness.js";
import { type ForkNode, startForkNode } from "../testing/startForkNode.js";
import {
  CuratorSession,
  type CuratorSessionOptions,
} from "./CuratorSession.js";
import type { GipAnvilForkOptions } from "./forkConnection.js";

function sdkState(): GearboxState {
  return {
    version: 2,
    network: "Mainnet",
    chainId: 1,
    currentBlock: SOURCE_BLOCK,
    timestamp: BigInt(SOURCE_TIMESTAMP),
    addressProvider: {
      baseParams: {
        addr: ADDRESS_PROVIDER,
        version: 310n,
        contractType: "0x",
        serializedParams: "0x",
      },
      // The SDK resolves the price feed compressor from the address provider.
      addresses: { "GLOBAL::PRICE_FEED_COMPRESSOR": { 311: PF_COMPRESSOR } },
    },
    markets: [],
    zappers: [],
    tokens: { tokens: [], extendedLoaded: [] },
    rwa: [[], []],
    plugins: {},
  };
}

/** What a test adds to the fork session it creates. **/
type CreateExtra = Partial<CuratorSessionOptions> & {
  fork?: GipAnvilForkOptions;
};

describe("SDK connection to its creation-time fork", () => {
  let node: ForkNode;
  let url: string;
  beforeAll(async () => {
    node = await startForkNode();
    url = node.url;
  });
  beforeEach(() => node.reset());
  afterAll(() => node.close());
  const create = (extra: CreateExtra = {}) =>
    CuratorSession.create({
      fork: { rpcUrl: url, timeoutMs: 1000 },
      marketConfigurator: CONFIGURATOR,
      ...extra,
    });

  it("owns the fork client, pins reads, and fetches configurator state through that URL", async () => {
    const fork = { rpcUrl: `${url}/`, timeoutMs: 1000 };
    const sdk = await create({ fork });
    fork.rpcUrl = "http://elsewhere.invalid";
    expect(sdk.mode).toBe("fork");
    expect(sdk.fork?.rpcUrl).toBe(url);
    expect(Object.isFrozen(sdk.fork)).toBe(true);
    expect(sdk.client.transport.url).toBe(url);
    expect(sdk.readClient.transport.url).toBe(url);
    expect(
      await sdk.readClient.readContract({
        address: USDC,
        abi: erc20Abi,
        functionName: "decimals",
      }),
    ).toBe(6);
    const preview = await sdk
      .configurator()
      .addAction({
        type: "CONFIGURATOR::setEmergencyAdmin",
        params: { emergencyAdmin: USDC },
      })
      .preview();
    expect(preview.stateProvenance).toBe("fork-read");
    expect(preview.before.admin).toBe(TIMELOCK);
    expect(preview.after.emergencyAdmin).toBe(USDC);
    expect(
      preview.incompleteChecks.some(
        c => c.check === "configuratorState.shutdown",
      ),
    ).toBe(true);
    expect(node.requests.map(r => r.method)).toEqual(
      expect.arrayContaining([
        "anvil_nodeInfo",
        "eth_chainId",
        "eth_blockNumber",
        "eth_getBlockByNumber",
        "eth_call",
      ]),
    );
    for (const call of node.requests.filter(r => r.method === "eth_call"))
      expect(call.params[1]).toBe(`0x${SOURCE_BLOCK.toString(16)}`);
  });

  it("rehydrates a supplied OnchainSDK on the fork, including plan dependencies", async () => {
    let outsideCalls = 0;
    const outside = createPublicClient({
      chain: getChain(1),
      transport: custom({
        request: async () => {
          outsideCalls++;
          throw new Error("Outside RPC must not be used");
        },
      }),
    });
    const original = new OnchainSDK("Mainnet", { client: outside }, {});
    original.hydrate(sdkState());
    const sdk = await create({ sdk: original });
    const rebound = await sdk.onchainSdk();
    expect(rebound).not.toBe(original);
    expect(await rebound.client.getChainId()).toBe(1);
    expect(
      await rebound.client.readContract({
        address: USDC,
        abi: erc20Abi,
        functionName: "decimals",
      }),
    ).toBe(6);
    const plan = await sdk
      .configurator({ initialState: configuratorState() })
      .addAction({
        type: "CONFIGURATOR::setEmergencyAdmin",
        params: { emergencyAdmin: USDC },
      })
      .build({ author: USDC, eta: SOURCE_TIMESTAMP + 86400 });
    expect(plan.payloadCalls).toHaveLength(1);
    expect(plan.executeBatchTxs).toHaveLength(1);
    expect(plan.source.blockNumber).toBe(SOURCE_BLOCK);
    expect(original.client).toBe(outside);
    expect(outsideCalls).toBe(0);
  });

  it("copies SDK state before hydration without mutating caller data", async () => {
    const state = sdkState(),
      before = structuredClone(state);
    const sdk = await create({ sdkState: state });
    await sdk.onchainSdk();
    expect(state).toEqual(before);
  });

  it("rejects conflicting client and fork arguments before touching a node", async () => {
    const { client } = await createTestSdk();
    // A client next to a fork is what the argument types forbid.
    await expect(create({ client } as unknown as CreateExtra)).rejects.toThrow(
      /either client or fork/,
    );
    expect(node.requests).toHaveLength(0);
  });

  it("rejects endpoints without Anvil support", async () => {
    node.supportsAnvil = false;
    await expect(create()).rejects.toThrow(/requires an Anvil node/);
    expect(node.requests.map(r => r.method)).toEqual(["anvil_nodeInfo"]);
  });

  it("rejects a historical source block and invalid fork options", async () => {
    await expect(create({ blockNumber: SOURCE_BLOCK - 1n })).rejects.toThrow(
      /current block/,
    );
    await expect(
      create({ fork: { rpcUrl: "file:///tmp/anvil" } }),
    ).rejects.toThrow(/HTTP or HTTPS/);
    await expect(
      create({ fork: { rpcUrl: url, timeoutMs: 0 } }),
    ).rejects.toThrow(/positive finite/);
  });

  it("disables simulation for every chain-backed scope", async () => {
    const { sdk } = await createTestSdk();
    expect(sdk.mode).toBe("chain");
    expect(sdk.fork).toBeUndefined();
    const scopes = [
      sdk.market({ initialState: marketState() }),
      sdk.configurator(),
    ];
    for (const scope of scopes) {
      await expect(scope.simulate()).rejects.toThrow(
        /requires an SDK created in fork mode/,
      );
    }
    expect(node.requests).toHaveLength(0);
  });

  it("detects a reset at the same height before touching the node", async () => {
    const sdk = await create();
    node.blockHash = `0x${"cd".repeat(32)}`;
    await expect(
      sdk
        .configurator({ initialState: configuratorState() })
        .addAction({
          type: "CONFIGURATOR::setEmergencyAdmin",
          params: { emergencyAdmin: USDC },
        })
        .simulate(),
    ).rejects.toThrow(/fork changed since SDK creation/);
    expect(node.requests.some(r => r.method === "evm_snapshot")).toBe(false);
  });
});
