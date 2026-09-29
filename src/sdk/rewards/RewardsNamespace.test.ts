import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DataResponse } from "../../model/index.js";
import type { MultichainSDK } from "../../onchain/index.js";
import type { Reward } from "../../rewards/index.js";
import { RewardsService } from "../../rewards/index.js";
import { RewardsNamespace } from "./RewardsNamespace.js";

vi.mock("../../rewards/index.js", () => ({
  RewardsService: vi.fn(),
}));

const WALLET = "0x0000000000000000000000000000000000000001" as Address;
const KEYS = { merklApiKey: "merkl", turtleApiKey: "turtle" };
const onchain = {} as MultichainSDK;
const rewards: DataResponse<Reward[]> = { data: [], meta: { chains: [] } };
const list = vi.fn();

class FakeRewardsService {
  readonly list = list;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(RewardsService).mockImplementation(
    FakeRewardsService as unknown as typeof RewardsService,
  );
  list.mockResolvedValue(rewards);
});

describe("RewardsNamespace", () => {
  it("builds the service over the on-chain source with the given keys", () => {
    new RewardsNamespace(onchain, KEYS, { maxOffchainLagSeconds: 0 });

    expect(RewardsService).toHaveBeenCalledWith(onchain, KEYS);
  });

  it("list awaits ensureFresh for the named chains, then delegates", async () => {
    const order: string[] = [];
    const ensureFresh = vi.fn(async () => {
      order.push("fresh");
    });
    list.mockImplementation(async () => {
      order.push("read");
      return rewards;
    });

    const ns = new RewardsNamespace(onchain, KEYS, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const result = await ns.list(WALLET, [1]);

    expect(result).toBe(rewards);
    expect(ensureFresh).toHaveBeenCalledWith([1]);
    expect(list).toHaveBeenCalledWith(WALLET, [1]);
    expect(order).toEqual(["fresh", "read"]);
  });
});
