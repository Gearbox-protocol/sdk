import {
  createPublicClient,
  custom,
  encodeAbiParameters,
  toFunctionSelector,
} from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import type { StrategyOpportunityKey } from "../../model/index.js";
import type { MultichainSDK } from "../MultichainSDK.js";
import { MultichainOpportunitiesService } from "./MultichainOpportunitiesService.js";

const vault = "0xCe29c36c6D4556f2d01d79414C1354B968dDDEf1";

describe("Midas issuance pause read", () => {
  it.each([true, false])(
    "decodes paused()=%s from eth_call through the selected chain",
    async paused => {
      const request = vi
        .fn()
        .mockResolvedValue(encodeAbiParameters([{ type: "bool" }], [paused]));
      const client = createPublicClient({
        chain: mainnet,
        transport: custom({ request }),
      });
      const chain = vi.fn().mockReturnValue({ client });
      const service = new MultichainOpportunitiesService({
        chain,
      } as unknown as MultichainSDK);
      await expect(service.isMGLOBALInvestmentWindowOpen()).resolves.toBe(
        !paused,
      );
      expect(chain).toHaveBeenCalledWith("Mainnet");
      expect(request.mock.calls[0][0]).toEqual({
        method: "eth_call",
        params: [{ to: vault, data: toFunctionSelector("paused()") }, "latest"],
      });
    },
  );
  it("propagates RPC errors", async () => {
    const readContract = vi
      .fn()
      .mockRejectedValue(new Error("RPC unavailable"));
    const chain = vi.fn().mockReturnValue({ client: { readContract } });
    const service = new MultichainOpportunitiesService({
      chain,
    } as unknown as MultichainSDK);
    await expect(service.isMGLOBALInvestmentWindowOpen()).rejects.toThrow(
      "RPC unavailable",
    );
  });
  it("propagates an unsupported chain without reading a vault", async () => {
    const chain = vi.fn().mockImplementation(() => {
      throw new Error("chain not configured");
    });
    const service = new MultichainOpportunitiesService({
      chain,
    } as unknown as MultichainSDK);
    await expect(service.isMGLOBALInvestmentWindowOpen()).rejects.toThrow(
      "chain not configured",
    );
  });
});

describe("chain boundaries", () => {
  it("preserves the strategy chain for existing eligibility reads", async () => {
    const isEligibleForStrategy = vi.fn().mockResolvedValue(true);
    const chain = vi
      .fn()
      .mockReturnValue({ opportunities: { isEligibleForStrategy } });
    const service = new MultichainOpportunitiesService({
      chain,
    } as unknown as MultichainSDK);
    const key: StrategyOpportunityKey = {
      chainId: 42161,
      creditManager: vault,
    };
    await expect(service.isEligibleForStrategy(key, vault)).resolves.toBe(true);
    expect(chain).toHaveBeenCalledWith(42161);
    expect(isEligibleForStrategy).toHaveBeenCalledWith(key, vault);
  });
});
