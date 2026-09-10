import type { Address, Hex } from "viem";
import { encodeAbiParameters, getAddress, padHex, stringToHex } from "viem";
import { describe, expect, it, vi } from "vitest";
import { iVersionAbi } from "../../../abi/iVersion.js";
import { iMidasDegenNFTAbi } from "../../../abi/rwa/iMidasDegenNFT.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { createDegenNFT } from "./createDegenNFT.js";
import { DEGEN_NFT_MIDAS, DEGEN_NFT_SECURITIZE } from "./index.js";
import { MidasDegenNFT } from "./midas/MidasDegenNFT.js";
import type { SecuritizeRWAFactory } from "./securitize/index.js";

const DEGEN = "0x1111111111111111111111111111111111111111" as Address;
const GATEWAY = "0x2222222222222222222222222222222222222222" as Address;
const ACCESS = "0x3333333333333333333333333333333333333333" as Address;
const FACTORY = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
const ROLE =
  "0x1111111111111111111111111111111111111111111111111111111111111111" as Hex;

function contractTypeBytes(name: string): Hex {
  return padHex(stringToHex(name), { dir: "right", size: 32 });
}

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

function serializeSecuritize(factory: Address): Hex {
  return encodeAbiParameters(
    [
      { type: "address" },
      {
        type: "tuple[]",
        components: [
          { type: "address" },
          { type: "address" },
          { type: "address[]" },
        ],
      },
    ],
    [factory, []],
  );
}

function ok<T>(result: T): { status: "success"; result: T } {
  return { status: "success", result };
}

function fail(message = "revert"): { status: "failure"; error: Error } {
  return { status: "failure", error: new Error(message) };
}

function factoryMock(): SecuritizeRWAFactory {
  return {
    address: FACTORY,
    degenNFT: { address: DEGEN, protocol: "securitize" },
  } as unknown as SecuritizeRWAFactory;
}

function sdkMock(over: {
  identify?: unknown[];
  throwOnMulticall?: Error;
  factories?: SecuritizeRWAFactory[];
}): OnchainSDK {
  const multicall = over.throwOnMulticall
    ? vi.fn(async () => {
        throw over.throwOnMulticall;
      })
    : vi.fn(
        async ({ contracts }: { contracts: { functionName: string }[] }) => {
          const fn = contracts[0]?.functionName;
          if (fn === "contractType") {
            return over.identify;
          }
          throw new Error(`unexpected multicall ${fn}`);
        },
      );
  return {
    client: { multicall },
    rwa: { factories: over.factories ?? [] },
  } as unknown as OnchainSDK;
}

const identifyContracts = [
  { abi: iVersionAbi, address: DEGEN, functionName: "contractType" },
  { abi: iVersionAbi, address: DEGEN, functionName: "version" },
  { abi: iMidasDegenNFTAbi, address: DEGEN, functionName: "serialize" },
];

describe("createDegenNFT", () => {
  it.each([
    {
      name: "legacy NFT without IVersion",
      identify: [fail(), fail(), fail()],
      factories: [] as SecuritizeRWAFactory[],
      expected: "undefined" as const,
    },
    {
      name: "contractType ok, serialize failed",
      identify: [ok(contractTypeBytes(DEGEN_NFT_MIDAS)), ok(311n), fail()],
      factories: [],
      expected: "undefined" as const,
    },
    {
      name: "default degen NFT",
      identify: [
        ok(contractTypeBytes("DEGEN_NFT::DEFAULT")),
        ok(310n),
        ok("0x"),
      ],
      factories: [],
      expected: "undefined" as const,
    },
    {
      name: "Midas degen NFT",
      identify: [
        ok(contractTypeBytes(DEGEN_NFT_MIDAS)),
        ok(311n),
        ok(serializeMidas(GATEWAY, ACCESS, ROLE)),
      ],
      factories: [],
      expected: "midas" as const,
    },
    {
      name: "Securitize degen NFT with loaded factory",
      identify: [
        ok(contractTypeBytes(DEGEN_NFT_SECURITIZE)),
        ok(310n),
        ok(serializeSecuritize(getAddress(FACTORY))),
      ],
      factories: [factoryMock()],
      expected: "securitize" as const,
    },
    {
      name: "Securitize degen NFT whose factory is not loaded",
      identify: [
        ok(contractTypeBytes(DEGEN_NFT_SECURITIZE)),
        ok(310n),
        ok(serializeSecuritize(FACTORY)),
      ],
      factories: [],
      expected: "undefined" as const,
    },
  ])("$name", async ({ identify, factories, expected }) => {
    const sdk = sdkMock({ identify, factories });
    const nft = await createDegenNFT(sdk, DEGEN);
    if (expected === "undefined") {
      expect(nft).toBeUndefined();
    } else if (expected === "midas") {
      expect(nft).toBeInstanceOf(MidasDegenNFT);
      expect(nft).toMatchObject({
        protocol: "midas",
        gateway: getAddress(GATEWAY),
        accessControl: getAddress(ACCESS),
        greenlistedRole: ROLE,
      });
    } else {
      expect(nft).toBe(factories[0].degenNFT);
    }
    expect(sdk.client.multicall).toHaveBeenCalledWith({
      allowFailure: true,
      contracts: identifyContracts,
    });
  });

  it("does not swallow a rejected identify multicall", async () => {
    const sdk = sdkMock({ throwOnMulticall: new Error("rpc down") });
    await expect(createDegenNFT(sdk, DEGEN)).rejects.toThrow("rpc down");
  });
});
