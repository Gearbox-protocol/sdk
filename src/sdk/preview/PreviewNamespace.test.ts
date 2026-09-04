import type { Address, Hex } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  OperationPreview,
  PreviewOperationInput,
} from "../../model/index.js";
import { sdkOk } from "../../model/index.js";
import type { MultichainSDK, OnchainSDK } from "../../onchain/index.js";
import { previewOperation } from "../../preview/preview/previewOperation.js";
import { PreviewNamespace } from "./PreviewNamespace.js";

vi.mock("../../preview/preview/previewOperation.js", () => ({
  previewOperation: vi.fn(),
}));

const previewOperationMock = vi.mocked(previewOperation);

const CHAIN_ID = 1;
const TO = "0x0000000000000000000000000000000000000001" as Address;
const SENDER = "0x0000000000000000000000000000000000000002" as Address;
const CALLDATA = "0xdead" as Hex;

const input: PreviewOperationInput = {
  chainId: CHAIN_ID,
  to: TO,
  calldata: CALLDATA,
  sender: SENDER,
  value: 10n,
};

const previewData: OperationPreview = {
  operation: "Deposit",
  pool: TO,
  holder: SENDER,
  name: "Test Pool",
  underlyingToken: {
    chainId: 1,
    address: TO,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    wrappedAddress: null,
  },
  shareRate: 10n ** 27n,
  curator: { address: TO, url: null },
  netValue: {
    token: {
      chainId: 1,
      address: TO,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
    value: 1n,
    valueUsd: null,
  },
  tokenIn: {
    token: {
      chainId: 1,
      address: TO,
      symbol: "IN",
      name: "In",
      decimals: 18,
    },
    value: 1n,
    valueUsd: null,
  },
  tokenOut: {
    token: {
      chainId: 1,
      address: SENDER,
      symbol: "OUT",
      name: "Out",
      decimals: 18,
    },
    value: 2n,
    valueUsd: null,
  },
};

const chainSdk = {} as OnchainSDK;
const chain = vi.fn(() => chainSdk);
const onchain = { chain } as unknown as MultichainSDK;

beforeEach(() => {
  vi.resetAllMocks();
  chain.mockReturnValue(chainSdk);
  previewOperationMock.mockResolvedValue(sdkOk<OperationPreview>(previewData));
});

describe("PreviewNamespace.previewOperation", () => {
  it("awaits ensureFresh for the named chain, then delegates", async () => {
    const order: string[] = [];
    const ensureFresh = vi.fn(async () => {
      order.push("fresh");
    });
    previewOperationMock.mockImplementation(async () => {
      order.push("preview");
      return sdkOk<OperationPreview>(previewData);
    });

    const ns = new PreviewNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const result = await ns.previewOperation(input, { blockNumber: 99n });

    expect(result.ok && result.data).toBe(previewData);
    expect(ensureFresh).toHaveBeenCalledWith([CHAIN_ID]);
    expect(chain).toHaveBeenCalledWith(CHAIN_ID);
    expect(previewOperationMock).toHaveBeenCalledWith(
      {
        sdk: chainSdk,
        to: TO,
        calldata: CALLDATA,
        sender: SENDER,
        value: 10n,
      },
      { blockNumber: 99n, logger: undefined },
    );
    expect(order).toEqual(["fresh", "preview"]);
  });
});
