import { describe, expect, it } from "vitest";
import { isTestnetReady } from "./isTestnetReady.js";
import type {
  TestnetBackendState,
  TestnetPipelineState,
  TestnetStatus,
  TestnetSyncState,
} from "./types.js";

const ZERO = "0x0000000000000000000000000000000000000000";

interface StatusParams {
  state: TestnetPipelineState;
  sync?: TestnetSyncState;
  backend?: TestnetBackendState;
}

function status({ state, sync, backend }: StatusParams): TestnetStatus {
  return {
    network: "Mainnet",
    isActive: true,
    paused: false,
    url: "",
    logsUrl: "",
    persistent: false,
    executionId: "id",
    state,
    sync: sync ? { state: sync } : undefined,
    backend: backend ? { state: backend } : undefined,
    options: {
      network: "Mainnet",
      blockNumber: "",
      owner: "",
      timeout: "1h",
      scripts: [],
      disableSync: false,
      disableIntervalMining: false,
      disableRPCProtection: false,
      webhooks: [],
    },
    forkBlock: { number: 1, time: "2026-01-01T00:00:00Z" },
    originChainId: 1,
    anvilChainId: 1,
    createdAt: "2026-01-01T00:00:00Z",
    addressProvider: ZERO,
    onchainExecutionId: ZERO,
  };
}

describe("isTestnetReady", () => {
  it.each<TestnetPipelineState>([
    "queued",
    "deploying",
    "failed",
    "terminated",
  ])("is not ready while %s, in either mode", state => {
    const s = status({ state, sync: "ok", backend: "active" });
    expect(isTestnetReady(s)).toBe(false);
    expect(isTestnetReady(s, true)).toBe(false);
  });

  it("non-strict ignores sync and backend once deployed", () => {
    expect(
      isTestnetReady(
        status({ state: "deployed", sync: "failing", backend: "error" }),
      ),
    ).toBe(true);
    expect(isTestnetReady(status({ state: "deployed" }))).toBe(true);
  });

  it.each<StatusParams & { expected: boolean }>([
    { state: "deployed", sync: "ok", expected: true },
    { state: "deployed", sync: "disabled", expected: true },
    { state: "deployed", sync: "pending", expected: false },
    { state: "deployed", sync: "failing", expected: false },
    { state: "deployed", expected: false },
    { state: "deployed", sync: "ok", backend: "active", expected: true },
    { state: "deployed", sync: "ok", backend: "starting", expected: false },
    { state: "deployed", sync: "ok", backend: "provisioning", expected: false },
    { state: "deployed", sync: "ok", backend: "error", expected: false },
  ])(
    "strict: sync $sync, backend $backend -> $expected",
    ({ expected, ...params }) => {
      expect(isTestnetReady(status(params), true)).toBe(expected);
    },
  );
});
