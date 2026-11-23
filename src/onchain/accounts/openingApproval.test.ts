import { BaseError, ContractFunctionZeroDataError } from "viem";
import { describe, expect, it } from "vitest";
import type { OnchainSDK } from "../OnchainSDK.js";
import { openingApprovalRequirement } from "./openingApproval.js";

const address = "0x1111111111111111111111111111111111111111";

function sdkWithFailedTypeRead(error: Error): OnchainSDK {
  return {
    marketRegister: {
      findCreditManager: () => ({ creditFacade: { degenNFT: address } }),
    },
    client: {
      getBlockNumber: async () => 1n,
      readContract: async () => {
        throw error;
      },
    },
  } as unknown as OnchainSDK;
}

describe("opening approval discovery", () => {
  it("recognizes a legacy NFT with no contractType result", async () => {
    const error = new ContractFunctionZeroDataError({
      functionName: "contractType",
    });
    const sdk = sdkWithFailedTypeRead(
      new BaseError("Contract read failed", { cause: error }),
    );
    await expect(
      openingApprovalRequirement(sdk, address, address),
    ).resolves.toEqual({ status: "notRequired" });
  });

  it("propagates an RPC failure when checking the gate", async () => {
    const error = new BaseError("RPC unavailable");
    await expect(
      openingApprovalRequirement(
        sdkWithFailedTypeRead(error),
        address,
        address,
      ),
    ).rejects.toBe(error);
  });
});
