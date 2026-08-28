import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import { GearboxAPI } from "../../offchain/index.js";
import { MultichainSDK } from "../../onchain/index.js";
import { SourceUnavailableError } from "../errors/index.js";
import { GearboxSDK } from "../GearboxSDK.js";
import { PositionsNamespace } from "./PositionsNamespace.js";

const WALLET = "0x1111111111111111111111111111111111111111" as Address;
const KEY = { kind: "strategy", chainId: 1, creditAccount: WALLET } as const;
const envelope = <T>(data: T) => ({ data, meta: { chains: [] } });

function backend() {
  const positions = {
    getCharts: vi.fn(async () =>
      envelope({
        window: { range: "1m", from: 0, to: 1 },
        timestamps: [0, 1],
        sampling: { kind: "grid", intervalSeconds: 3600 },
        series: {},
      }),
    ),
  };
  const notices = { list: vi.fn(async () => envelope([{ kind: "expired" }])) };
  // a real GearboxAPI's prototype, so the SDK's `instanceof` injection seam holds
  const api = Object.create(GearboxAPI.prototype) as GearboxAPI;
  Object.assign(api, { positions, notices, chainIds: [1] });
  return { positions, notices, api };
}

/** An attached-looking MultichainSDK with no chains, for the onchain-only mode. */
function emptyOnchain(): MultichainSDK {
  const onchain = Object.create(MultichainSDK.prototype) as MultichainSDK;
  // `chains` is a prototype getter: define own properties, do not assign
  Object.defineProperties(onchain, {
    chains: { value: new Map() },
    opportunities: { value: {} },
    positions: { value: {} },
  });
  return onchain;
}

/** S-SDK-5: chart reads delegate to the backend, and only exist with one. */
describe("positions.charts", () => {
  it("delegates to the backend namespace, passing the key through", async () => {
    const { api, positions } = backend();
    const namespace = new PositionsNamespace(undefined, api, {
      maxOffchainLagSeconds: 120,
    });

    await expect(
      namespace.charts(KEY, ["totalValueUnderlying", "borrowApyAvg7d"], "1m"),
    ).resolves.toEqual(
      envelope({
        window: { range: "1m", from: 0, to: 1 },
        timestamps: [0, 1],
        sampling: { kind: "grid", intervalSeconds: 3600 },
        series: {},
      }),
    );
    expect(positions.getCharts).toHaveBeenCalledWith(
      KEY,
      ["totalValueUnderlying", "borrowApyAvg7d"],
      "1m",
    );
  });

  it("without a backend they throw SourceUnavailableError, like every offchain read", async () => {
    const onchain = { positions: {} } as unknown as MultichainSDK;
    const namespace = new PositionsNamespace(onchain, undefined, {
      maxOffchainLagSeconds: 120,
    });

    await expect(namespace.charts(KEY, ["healthFactor"], "1m")).rejects.toThrow(
      SourceUnavailableError,
    );
  });
});

describe("positions.getCurrentWithdrawals", () => {
  it("delegates to the onchain namespace", async () => {
    const getCurrentWithdrawals = vi.fn(async () =>
      envelope({ claimable: [], pending: [] }),
    );
    const onchain = {
      positions: { getCurrentWithdrawals },
    } as unknown as MultichainSDK;
    const namespace = new PositionsNamespace(onchain, undefined, {
      maxOffchainLagSeconds: 120,
    });

    const props = { chainId: 1, creditAccount: WALLET };
    await expect(namespace.getCurrentWithdrawals(props)).resolves.toEqual(
      envelope({ claimable: [], pending: [] }),
    );
    expect(getCurrentWithdrawals).toHaveBeenCalledWith(props);
  });

  it("without a chain they throw SourceUnavailableError, like every onchain read", async () => {
    const { api } = backend();
    const namespace = new PositionsNamespace(undefined, api, {
      maxOffchainLagSeconds: 120,
    });

    await expect(
      namespace.getCurrentWithdrawals({ chainId: 1, creditAccount: WALLET }),
    ).rejects.toThrow(SourceUnavailableError);
  });
});

describe("sdk.notices", () => {
  it("delegates to the backend's notices namespace", async () => {
    const { api, notices } = backend();
    const sdk = new GearboxSDK({
      mode: "offchain",
      networks: ["Mainnet"],
      offchain: api,
    });

    const subject = { kind: "pool", chainId: 1, pool: WALLET } as never;
    await expect(sdk.notices(subject)).resolves.toEqual(
      envelope([{ kind: "expired" }]),
    );
    expect(notices.list).toHaveBeenCalledWith(subject);
  });

  it("is absent without a backend", () => {
    const sdk = new GearboxSDK({
      mode: "onchain",
      networks: [],
      onchain: emptyOnchain(),
    });
    expect(sdk.notices).toBeUndefined();
  });
});
