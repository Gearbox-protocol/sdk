import type { Address, PublicClient } from "viem";
import { encodeFunctionData, getAddress } from "viem";
import { describe, expect, it, vi } from "vitest";
import { iMidasGatewayAdapterV311Abi } from "../../market/adapters/abi/adapters/iMidasGatewayAdapterV311.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import type { MultiCall } from "../../types/index.js";
import { AddressMap } from "../../utils/AddressMap.js";
import { prependMidasReceiveGreenlist } from "./midasUtils.js";

const CM = getAddress("0xBAdfE155662646A1A668c00276220B02FB7f1b23");
const ISSUANCE_ADAPTER = getAddress(
  "0xCedd4a40a2B72a912247B64e508b7DCf52cA0AcA",
);
const ISSUANCE_VAULT = getAddress("0x41438435c20B1C2f1fcA702d387889F346A0C3DE");
const GATEWAY_ADAPTER = getAddress(
  "0x1a1C874cCFE034cfb1437c86755d520293A17e27",
);
const GATEWAY = getAddress("0x805CcC01428CE2F4d3ED23F96c2837393172CDb1");
const MF_ONE = getAddress("0x238a700eD6165261Cf8b2e544ba797BC11e466Ba");
const MGLOBAL = getAddress("0x7433806912Eae67919e66aea853d46Fa0aef98A8");

const RECEIVE_GREENLIST = encodeFunctionData({
  abi: iMidasGatewayAdapterV311Abi,
  functionName: "receiveGreenlist",
});

const ISSUANCE_CALL: MultiCall = {
  target: ISSUANCE_ADAPTER,
  callData: "0xdeadbeef",
};

interface StubMidasAdapter {
  address: Address;
  targetContract: Address;
  contractType: "ADAPTER::MIDAS_GATEWAY" | "ADAPTER::MIDAS_ISSUANCE_VAULT";
  mToken: Address;
}

function adaptersFor(mToken: Address): StubMidasAdapter[] {
  return [
    {
      address: ISSUANCE_ADAPTER,
      targetContract: ISSUANCE_VAULT,
      contractType: "ADAPTER::MIDAS_ISSUANCE_VAULT",
      mToken,
    },
    {
      address: GATEWAY_ADAPTER,
      targetContract: GATEWAY,
      contractType: "ADAPTER::MIDAS_GATEWAY",
      mToken,
    },
  ];
}

function stubCm(mToken: Address): CreditSuite {
  return {
    name: "mF-ONE strategy",
    creditManager: {
      address: CM,
      adapters: AddressMap.fromMappedArray(adaptersFor(mToken), a => a.address),
    },
  } as unknown as CreditSuite;
}

interface StubClient {
  client: PublicClient;
  multicall: ReturnType<typeof vi.fn>;
}

function stubClient(mode: number): StubClient {
  const multicall = vi.fn(async () => [mode]);
  return {
    client: { multicall } as unknown as PublicClient,
    multicall,
  };
}

describe("prependMidasReceiveGreenlist", () => {
  it("prepends receiveGreenlist when opening on the mF-ONE strategy (mode 1)", async () => {
    const { client, multicall } = stubClient(1);
    const calls = [ISSUANCE_CALL];

    expect(
      await prependMidasReceiveGreenlist({
        cm: stubCm(MF_ONE),
        client,
        calls,
      }),
    ).toEqual([
      { target: GATEWAY_ADAPTER, callData: RECEIVE_GREENLIST },
      ISSUANCE_CALL,
    ]);
    expect(multicall).toHaveBeenCalledTimes(1);
    expect(multicall.mock.calls[0][0].contracts[0].address).toBe(GATEWAY);
  });

  it("does not prepend receiveGreenlist for mGLOBAL and does not read mode", async () => {
    const { client, multicall } = stubClient(1);
    const calls = [ISSUANCE_CALL];

    expect(
      await prependMidasReceiveGreenlist({
        cm: stubCm(MGLOBAL),
        client,
        calls,
      }),
    ).toBe(calls);
    expect(multicall).not.toHaveBeenCalled();
  });
});
