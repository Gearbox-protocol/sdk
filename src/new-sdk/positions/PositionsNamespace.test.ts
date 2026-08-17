import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import { GearboxAPI } from "../../offchain/index.js";
import { MultichainSDK } from "../../sdk/index.js";
import { SourceUnavailableError } from "../errors/index.js";
import { GearboxSDK } from "../GearboxSDK.js";
import { PositionsNamespace } from "./PositionsNamespace.js";

const WALLET = "0x1111111111111111111111111111111111111111" as Address;
const KEY = { kind: "strategy", chainId: 1, creditAccount: WALLET } as const;
const envelope = <T>(data: T) => ({ data, meta: { chains: [] } });

function backend() {
  const positions = {
    totals: vi.fn(async () => envelope({ netValueUsd: 1 })),
    transactions: vi.fn(async () => envelope([{ kind: "deposit" }])),
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

/** S-SDK-5: the backend-only reads delegate to the backend, and only exist with one. */
describe("positions.totals / positions.transactions", () => {
  it("delegate to the backend namespace, passing the key through", async () => {
    const { api, positions } = backend();
    const namespace = new PositionsNamespace(undefined, api, {
      maxOffchainLagSeconds: 120,
    });

    await expect(namespace.totals(WALLET)).resolves.toEqual(
      envelope({ netValueUsd: 1 }),
    );
    await expect(namespace.transactions(KEY)).resolves.toEqual(
      envelope([{ kind: "deposit" }]),
    );
    expect(positions.totals).toHaveBeenCalledWith(WALLET);
    expect(positions.transactions).toHaveBeenCalledWith(KEY);
  });

  it("without a backend they throw SourceUnavailableError, like every offchain read", async () => {
    const onchain = { positions: {} } as unknown as MultichainSDK;
    const namespace = new PositionsNamespace(onchain, undefined, {
      maxOffchainLagSeconds: 120,
    });

    await expect(namespace.totals(WALLET)).rejects.toThrow(
      SourceUnavailableError,
    );
    await expect(namespace.transactions(KEY)).rejects.toThrow(
      SourceUnavailableError,
    );
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
