import { custom } from "viem";
import { describe, expect, it, vi } from "vitest";
import {
  SdkMissingChainStateError,
  SdkStateVersionMismatchError,
} from "./core/index.js";
import { MultichainSDK } from "./MultichainSDK.js";
import { OnchainSDK, STATE_VERSION } from "./OnchainSDK.js";
import type { IOnchainSDKPlugin } from "./plugins/index.js";
import type { MultichainState } from "./types/index.js";

const mockTransport = custom({
  request: async () => {
    throw new Error("not implemented");
  },
});

function makeSdk(overrides?: {
  mainnetGasLimit?: bigint | null;
  sharedGasLimit?: bigint | null;
}) {
  return new MultichainSDK({
    chains: {
      Mainnet: {
        transport: mockTransport,
        gasLimit: overrides?.mainnetGasLimit,
      },
      Plasma: { transport: mockTransport },
    },
    gasLimit: overrides?.sharedGasLimit,
  });
}

describe("constructor", () => {
  it("creates OnchainSDK per configured chain", () => {
    const sdk = makeSdk();
    expect(sdk.chains.size).toBe(2);
    expect(sdk.chains.has("Mainnet")).toBe(true);
    expect(sdk.chains.has("Plasma")).toBe(true);
  });

  it("plugin factories are called per chain", () => {
    const factory = vi.fn(
      () =>
        ({
          version: 1,
          loaded: false,
          state: {},
        }) as unknown as IOnchainSDKPlugin,
    );

    const sdk = new MultichainSDK({
      chains: {
        Mainnet: { transport: mockTransport },
        Plasma: { transport: mockTransport },
      },
      plugins: { test: factory },
    });

    expect(factory).toHaveBeenCalledTimes(2);

    const mainnetPlugin = sdk.chain("Mainnet").plugins.test;
    const plasmaPlugin = sdk.chain("Plasma").plugins.test;
    expect(mainnetPlugin).not.toBe(plasmaPlugin);
  });
});

describe("chain()", () => {
  it("returns correct SDK by NetworkType", () => {
    const sdk = makeSdk();
    expect(sdk.chain("Mainnet").chainId).toBe(1);
    expect(sdk.chain("Plasma").chainId).toBe(9745);
  });

  it("returns correct SDK by chainId", () => {
    const sdk = makeSdk();
    expect(sdk.chain(1).networkType).toBe("Mainnet");
    expect(sdk.chain(9745).networkType).toBe("Plasma");
  });

  it("throws for unconfigured network", () => {
    const sdk = makeSdk();
    expect(() => sdk.chain("Sonic")).toThrow(
      "Chain Sonic is not configured in this MultichainSDK",
    );
  });

  it("throws for unknown chainId", () => {
    const sdk = makeSdk();
    expect(() => sdk.chain(999999)).toThrow();
  });
});

describe("gasLimit", () => {
  it("per-chain override wins over shared default", () => {
    const sdk = makeSdk({
      mainnetGasLimit: 100n,
      sharedGasLimit: 200n,
    });
    expect(sdk.chain("Mainnet").gasLimit).toBe(100n);
    expect(sdk.chain("Plasma").gasLimit).toBe(200n);
  });
});

describe("hydrate()", () => {
  it("throws SdkStateVersionMismatchError for wrong version", () => {
    const sdk = makeSdk();
    const state: MultichainState = {
      version: STATE_VERSION + 1,
      chains: [],
    };
    expect(() => sdk.hydrate(state)).toThrow(SdkStateVersionMismatchError);
  });

  it("throws SdkMissingChainStateError when configured chain has no state", () => {
    const hydrateSpy = vi
      .spyOn(OnchainSDK.prototype, "hydrate")
      .mockImplementation(() => {});

    try {
      const sdk = makeSdk();
      const state: MultichainState = {
        version: STATE_VERSION,
        chains: [{ network: "Mainnet" } as MultichainState["chains"][number]],
      };
      expect(() => sdk.hydrate(state)).toThrow(SdkMissingChainStateError);
    } finally {
      hydrateSpy.mockRestore();
    }
  });

  it("skips missing chains when allowMissingChains is set", () => {
    const hydrateSpy = vi
      .spyOn(OnchainSDK.prototype, "hydrate")
      .mockImplementation(() => {});

    try {
      const sdk = makeSdk();
      const state: MultichainState = {
        version: STATE_VERSION,
        chains: [{ network: "Mainnet" } as MultichainState["chains"][number]],
      };

      expect(() =>
        sdk.hydrate(state, { allowMissingChains: true }),
      ).not.toThrow();
      expect(hydrateSpy).toHaveBeenCalledTimes(1);
      expect(hydrateSpy.mock.calls[0][0]).toMatchObject({
        network: "Mainnet",
      });
    } finally {
      hydrateSpy.mockRestore();
    }
  });

  it("silently ignores extra chains in state", () => {
    const hydrateSpy = vi
      .spyOn(OnchainSDK.prototype, "hydrate")
      .mockImplementation(() => {});

    try {
      const sdk = new MultichainSDK({
        chains: {
          Mainnet: { transport: mockTransport },
        },
      });

      const state: MultichainState = {
        version: STATE_VERSION,
        chains: [
          { network: "Mainnet" } as MultichainState["chains"][number],
          { network: "Plasma" } as MultichainState["chains"][number],
        ],
      };

      expect(() => sdk.hydrate(state)).not.toThrow();
      expect(hydrateSpy).toHaveBeenCalledTimes(1);
    } finally {
      hydrateSpy.mockRestore();
    }
  });
});
