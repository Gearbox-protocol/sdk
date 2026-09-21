import type { Address, Hex } from "viem";
import { encodeAbiParameters, getAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
  DEGEN_NFT_MIDAS,
  MidasDegenNFT,
  MidasGatewayAdapterContract,
  type OnchainSDK,
} from "../onchain/index.js";
import { collectMidasGateways } from "./midasUtils.js";

const ADAPTER_GATEWAY = getAddress(
  "0x1111111111111111111111111111111111111111",
);
const NFT_GATEWAY = getAddress("0x2222222222222222222222222222222222222222");
const ACCESS = getAddress("0x3333333333333333333333333333333333333333");
const DEGEN = getAddress("0x4444444444444444444444444444444444444444");
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

function stubAdapter(targetContract: Address): MidasGatewayAdapterContract {
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
          [DEGEN, targetContract, targetContract, ACCESS, ACCESS, ACCESS],
        ),
      },
    },
  );
}

function stubNft(gateway: Address): MidasDegenNFT {
  return new MidasDegenNFT({ client: {} } as unknown as OnchainSDK, {
    addr: DEGEN,
    version: 311,
    contractType: DEGEN_NFT_MIDAS,
    serializedParams: serializeMidas(gateway, ACCESS, ROLE),
  });
}

interface CollectMidasGatewaysSuiteStub {
  adapters?: MidasGatewayAdapterContract[];
  nft?: MidasDegenNFT;
}

function stubSdk(suites: CollectMidasGatewaysSuiteStub[]): OnchainSDK {
  return {
    marketRegister: {
      creditManagers: suites.map(suite => ({
        creditManager: {
          adapters: {
            values: () => suite.adapters ?? [],
          },
        },
        degenNFT: async () => suite.nft,
      })),
    },
  } as unknown as OnchainSDK;
}

describe("collectMidasGateways", () => {
  it("collects gateways from adapters and Midas degen NFTs, skipping suites without either", async () => {
    const sdk = stubSdk([
      { adapters: [stubAdapter(ADAPTER_GATEWAY)] },
      { nft: stubNft(NFT_GATEWAY) },
      {},
    ]);
    await expect(collectMidasGateways(sdk)).resolves.toEqual([
      ADAPTER_GATEWAY,
      NFT_GATEWAY,
    ]);
  });

  it("dedups a gateway present on both an adapter and a degen NFT", async () => {
    const sdk = stubSdk([
      { adapters: [stubAdapter(NFT_GATEWAY)], nft: stubNft(NFT_GATEWAY) },
    ]);
    await expect(collectMidasGateways(sdk)).resolves.toEqual([NFT_GATEWAY]);
  });
});
