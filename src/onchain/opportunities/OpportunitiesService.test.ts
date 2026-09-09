import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type {
  KycRequirement,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/index.js";
import type { CreditSuite } from "../market/credit/CreditSuite.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { OpportunitiesService } from "./OpportunitiesService.js";

const WALLET = "0x4444444444444444444444444444444444444444" as Address;
const CM = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
const TARGET = "0x5555555555555555555555555555555555555555" as Address;

const REQUIREMENT: KycRequirement = {
  protocol: "midas",
  registrationLink: "https://midas.app/",
};

const KEY: StrategyOpportunityKey = { chainId: 1, creditManager: CM };

const DETAIL = {
  kind: "strategy",
  chainId: 1,
  name: "mGLO / USDC",
  creditManager: CM,
  targetCollateral: {
    chainId: 1,
    address: TARGET,
    symbol: "mGLO",
    name: "Midas Global",
    decimals: 18,
  },
} as StrategyOpportunityDetail;

function service(detail: StrategyOpportunityDetail | undefined): {
  kycRequirement: ReturnType<typeof vi.fn>;
  opportunities: OpportunitiesService;
} {
  const kycRequirement = vi.fn();
  const suite = {
    strategyOpportunityDetail: () => detail,
    kycRequirement,
  } as unknown as CreditSuite;
  const sdk = {
    client: { chain: { id: 1 } },
    marketRegister: {
      findCreditManager: vi.fn(() => suite),
    },
  } as unknown as OnchainSDK;
  return {
    kycRequirement,
    opportunities: new OpportunitiesService(sdk),
  };
}

describe("OpportunitiesService.getStrategy", () => {
  it.each([
    {
      name: "no wallet",
      wallet: undefined,
      resolved: REQUIREMENT,
      expectedCall: false,
      expectedKyc: null,
    },
    {
      name: "wallet already eligible",
      wallet: WALLET,
      resolved: null,
      expectedCall: true,
      expectedKyc: null,
    },
    {
      name: "wallet must register",
      wallet: WALLET,
      resolved: REQUIREMENT,
      expectedCall: true,
      expectedKyc: REQUIREMENT,
    },
  ])("$name", async ({ wallet, resolved, expectedCall, expectedKyc }) => {
    const { kycRequirement, opportunities } = service(DETAIL);
    kycRequirement.mockResolvedValue(resolved);

    await expect(opportunities.getStrategy(KEY, wallet)).resolves.toEqual({
      ...DETAIL,
      kyc: expectedKyc,
    });

    if (expectedCall) {
      expect(kycRequirement).toHaveBeenCalledWith(WALLET, TARGET);
    } else {
      expect(kycRequirement).not.toHaveBeenCalled();
    }
  });

  it("throws when the credit manager does not offer a strategy", async () => {
    const { kycRequirement, opportunities } = service(undefined);
    await expect(opportunities.getStrategy(KEY, WALLET)).rejects.toThrow(
      `credit manager ${CM} does not currently offer a strategy`,
    );
    expect(kycRequirement).not.toHaveBeenCalled();
  });
});
