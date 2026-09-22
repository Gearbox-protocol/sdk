import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
} from "viem";
import { describe, expect, it, vi } from "vitest";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { iMidasGatewayAdapterV311Abi } from "../abi/adapters/index.js";
import { MidasGatewayAdapterContract } from "./MidasGatewayAdapterContract.js";

const ADAPTER = getAddress("0x1a1C874cCFE034cfb1437c86755d520293A17e27");
const CREDIT_MANAGER = getAddress("0xBAdfE155662646A1A668c00276220B02FB7f1b23");
const GATEWAY = getAddress("0x805CcC01428CE2F4d3ED23F96c2837393172CDb1");
const MF_ONE = getAddress("0x238a700eD6165261Cf8b2e544ba797BC11e466Ba");
const MGLOBAL = getAddress("0x7433806912Eae67919e66aea853d46Fa0aef98A8");
const QUOTE = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const PHANTOM = getAddress("0x2222222222222222222222222222222222222222");

const RECEIVE_GREENLIST = encodeFunctionData({
  abi: iMidasGatewayAdapterV311Abi,
  functionName: "receiveGreenlist",
});

interface StubClient {
  sdk: OnchainSDK;
  readContract: ReturnType<typeof vi.fn>;
}

function stubSdk(mode: number): StubClient {
  const readContract = vi.fn(async () => mode);
  return {
    sdk: { client: { readContract } } as unknown as OnchainSDK,
    readContract,
  };
}

function gatewayAdapter(
  sdk: OnchainSDK,
  mToken: Address,
): MidasGatewayAdapterContract {
  return new MidasGatewayAdapterContract(sdk, {
    baseParams: {
      addr: ADAPTER,
      version: 311n,
      contractType: "ADAPTER::MIDAS_GATEWAY",
      serializedParams: encodeAbiParameters(
        [
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "address" },
          { type: "address" },
        ],
        [CREDIT_MANAGER, GATEWAY, GATEWAY, mToken, QUOTE, PHANTOM],
      ),
    },
  });
}

describe("MidasGatewayAdapterContract.openingCalls", () => {
  it("returns receiveGreenlist when the gateway is permissioned (mode 1)", async () => {
    const { sdk, readContract } = stubSdk(1);
    const adapter = gatewayAdapter(sdk, MF_ONE);

    expect(await adapter.openingCalls()).toEqual([
      { target: ADAPTER, callData: RECEIVE_GREENLIST },
    ]);
    expect(readContract).toHaveBeenCalledTimes(1);
    expect(readContract.mock.calls[0][0].address).toBe(GATEWAY);
    expect(readContract.mock.calls[0][0].functionName).toBe("mode");
  });

  it("returns nothing when the gateway is permissionless (mode 0)", async () => {
    const { sdk, readContract } = stubSdk(0);

    expect(await gatewayAdapter(sdk, MF_ONE).openingCalls()).toEqual([]);
    expect(readContract).toHaveBeenCalledTimes(1);
  });

  it("returns nothing for mGLOBAL and does not read mode", async () => {
    const { sdk, readContract } = stubSdk(1);

    expect(await gatewayAdapter(sdk, MGLOBAL).openingCalls()).toEqual([]);
    expect(readContract).not.toHaveBeenCalled();
  });

  it("reads mode once across openingCalls calls on the same instance", async () => {
    const { sdk, readContract } = stubSdk(1);
    const adapter = gatewayAdapter(sdk, MF_ONE);

    await adapter.openingCalls();
    await adapter.openingCalls();
    expect(readContract).toHaveBeenCalledTimes(1);
  });
});
