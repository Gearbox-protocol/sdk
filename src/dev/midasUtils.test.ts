import type { Address, Hex } from "viem";
import { encodeAbiParameters, getAddress } from "viem";
import { describe, expect, it, vi } from "vitest";
import {
  DEGEN_NFT_MIDAS,
  MidasDegenNFT,
  MidasGatewayAdapterContract,
  type OnchainSDK,
} from "../onchain/index.js";
import {
  discoverMidasCreditSuites,
  discoverMidasGateways,
} from "./midasUtils.js";

const ADAPTER_GATEWAY = getAddress(
  "0x1111111111111111111111111111111111111111",
);
const NFT_GATEWAY = getAddress("0x2222222222222222222222222222222222222222");
const ACCESS = getAddress("0x3333333333333333333333333333333333333333");
const DEGEN = getAddress("0x4444444444444444444444444444444444444444");
const CREDIT_MANAGER = getAddress("0x5555555555555555555555555555555555555555");
const MTOKEN = getAddress("0x7777777777777777777777777777777777777777");
const NFT_MTOKEN = getAddress("0x9999999999999999999999999999999999999999");
const ROLE =
  "0x1111111111111111111111111111111111111111111111111111111111111111" as Hex;

function serializeMidas(
  gateway: Address,
  accessControl: Address,
  role: Hex,
): Hex {
  return encodeAbiParameters(
    [{ type: "address" }, { type: "address" }, { type: "bytes32" }],
    [gateway, accessControl, role],
  );
}

interface StubGatewayAdapterProps {
  gateway: Address;
  mToken: Address;
}

function stubGatewayAdapter(
  props: StubGatewayAdapterProps,
): MidasGatewayAdapterContract {
  const { gateway, mToken } = props;
  return new MidasGatewayAdapterContract(
    { client: {} } as unknown as OnchainSDK,
    {
      baseParams: {
        addr: DEGEN,
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
          [CREDIT_MANAGER, gateway, gateway, mToken, ACCESS, ACCESS],
        ),
      },
    },
  );
}

function stubNft(
  gateway: Address,
  mToken: Address = NFT_MTOKEN,
): MidasDegenNFT {
  return new MidasDegenNFT(
    {
      client: { readContract: vi.fn(async () => mToken) },
    } as unknown as OnchainSDK,
    {
      addr: DEGEN,
      version: 311,
      contractType: DEGEN_NFT_MIDAS,
      serializedParams: serializeMidas(gateway, ACCESS, ROLE),
    },
  );
}

interface MidasMarketSuiteStub {
  creditManager?: Address;
  adapters?: MidasGatewayAdapterContract[];
  nft?: MidasDegenNFT;
  degenNFT?: () => Promise<MidasDegenNFT | undefined>;
}

function stubSdk(suites: MidasMarketSuiteStub[]): OnchainSDK {
  return {
    marketRegister: {
      creditManagers: suites.map(suite => ({
        creditManager: {
          address: suite.creditManager ?? CREDIT_MANAGER,
          adapters: {
            values: () => suite.adapters ?? [],
          },
        },
        degenNFT: suite.degenNFT ?? (async () => suite.nft),
      })),
    },
  } as unknown as OnchainSDK;
}

describe("discoverMidasGateways", () => {
  it("collects gateways from adapters and Midas degen NFTs, skipping suites without either", async () => {
    const sdk = stubSdk([
      {
        adapters: [
          stubGatewayAdapter({ gateway: ADAPTER_GATEWAY, mToken: MTOKEN }),
        ],
      },
      { nft: stubNft(NFT_GATEWAY) },
      {},
    ]);
    await expect(discoverMidasGateways(sdk)).resolves.toEqual([
      ADAPTER_GATEWAY,
      NFT_GATEWAY,
    ]);
  });

  it("uses the adapter gateway and ignores a degen NFT on the same manager", async () => {
    const sdk = stubSdk([
      {
        adapters: [
          stubGatewayAdapter({ gateway: NFT_GATEWAY, mToken: MTOKEN }),
        ],
        nft: stubNft(ADAPTER_GATEWAY),
      },
    ]);
    await expect(discoverMidasGateways(sdk)).resolves.toEqual([NFT_GATEWAY]);
  });
});

describe("discoverMidasCreditSuites", () => {
  it("reads mToken from serialized adapter params, one row per adapter", async () => {
    const sdk = stubSdk([
      {
        adapters: [
          stubGatewayAdapter({ gateway: ADAPTER_GATEWAY, mToken: MTOKEN }),
          stubGatewayAdapter({ gateway: NFT_GATEWAY, mToken: NFT_MTOKEN }),
        ],
      },
    ]);
    await expect(discoverMidasCreditSuites(sdk)).resolves.toEqual([
      {
        creditManager: CREDIT_MANAGER,
        gateway: ADAPTER_GATEWAY,
        mToken: MTOKEN,
      },
      {
        creditManager: CREDIT_MANAGER,
        gateway: NFT_GATEWAY,
        mToken: NFT_MTOKEN,
      },
    ]);
  });

  it("reads mToken from the gateway for an NFT-only suite", async () => {
    const sdk = stubSdk([{ nft: stubNft(NFT_GATEWAY, NFT_MTOKEN) }]);
    await expect(discoverMidasCreditSuites(sdk)).resolves.toEqual([
      {
        creditManager: CREDIT_MANAGER,
        gateway: NFT_GATEWAY,
        mToken: NFT_MTOKEN,
      },
    ]);
  });

  it("does not consult the degen NFT when the suite has an adapter", async () => {
    const degenNFT = vi.fn(async () => stubNft(NFT_GATEWAY));
    const sdk = stubSdk([
      {
        adapters: [
          stubGatewayAdapter({ gateway: ADAPTER_GATEWAY, mToken: MTOKEN }),
        ],
        degenNFT,
      },
    ]);
    await expect(discoverMidasCreditSuites(sdk)).resolves.toEqual([
      {
        creditManager: CREDIT_MANAGER,
        gateway: ADAPTER_GATEWAY,
        mToken: MTOKEN,
      },
    ]);
    expect(degenNFT).not.toHaveBeenCalled();
  });
});
