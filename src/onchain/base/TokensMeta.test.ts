import type { Address } from "viem";
import { createPublicClient, custom, getAddress } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";
import { chains } from "../chain/chains.js";
import { SdkRWADataNotLoadedError } from "../core/errors.js";
import { TokensMeta } from "./TokensMeta.js";
import { RWA_UNDERLYING_DEFAULT, type TokenMetaData } from "./token-types.js";

const BEEFY_WBTC = getAddress("0x924d24c238db7ecae2aa3a19430239ed684bde4a");
const SOURCE = getAddress("0x7433806912Eae67919e66aea853d46Fa0aef98A8");
const TARGET = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const PHANTOM = getAddress("0x15f8C07CdC24b4e73911170A9fE04743c04fc482");
const DC_USDC = getAddress("0x42d3618A6c0770d413c93D4d1bEcC041C27D7524");
const RWA_FACTORY = getAddress("0x867b5b0cd9999959f696cef4ecf7777a39516d27");

function meta(
  addr: Address,
  symbol: string,
  extras?: Partial<TokenMetaData>,
): TokenMetaData {
  return {
    addr,
    symbol,
    name: symbol,
    decimals: 6,
    ...extras,
  };
}

function tokensMeta(chain: typeof chains.Mainnet | typeof mainnet): TokensMeta {
  const client = createPublicClient({
    chain,
    transport: custom({
      request: async () => {
        throw new Error("not implemented");
      },
    }),
  });
  return new TokensMeta(client);
}

describe("TokensMeta", () => {
  describe("upsert pretty names", () => {
    it("replaces the on-chain ticker with a curated pretty name", () => {
      const tokens = tokensMeta(chains.Mainnet);
      tokens.upsert(BEEFY_WBTC, meta(BEEFY_WBTC, "mooBeefyWBTC"));
      expect(tokens.symbol(BEEFY_WBTC)).toBe("Beefy WBTC/cbBTC/hemiBTC");
    });

    it("leaves the ticker unchanged when the chain has no pretty names", () => {
      const tokens = tokensMeta(mainnet);
      tokens.upsert(BEEFY_WBTC, meta(BEEFY_WBTC, "mooBeefyWBTC"));
      expect(tokens.symbol(BEEFY_WBTC)).toBe("mooBeefyWBTC");
    });
  });

  describe("renameRedemptionPhantoms", () => {
    it("rewrites a redemption phantom symbol to source -> target", () => {
      const tokens = tokensMeta(chains.Mainnet);
      tokens.upsert(SOURCE, meta(SOURCE, "mGLOBAL"));
      tokens.upsert(TARGET, meta(TARGET, "USDC"));
      tokens.upsert(
        PHANTOM,
        meta(PHANTOM, "mGLOBALrdUSDC", {
          contractType: "PHANTOM_TOKEN::MIDAS_REDEMPTION",
        }),
      );

      tokens.renameRedemptionPhantoms([
        { phantom: PHANTOM, source: SOURCE, target: TARGET },
      ]);

      expect(tokens.symbol(PHANTOM)).toBe("mGLOBAL -> USDC");
      expect(tokens.mustGet(PHANTOM).name).toBe("mGLOBALrdUSDC");
    });

    it("skips when the phantom is not in the registry", () => {
      const tokens = tokensMeta(chains.Mainnet);
      tokens.upsert(SOURCE, meta(SOURCE, "mGLOBAL"));
      tokens.upsert(TARGET, meta(TARGET, "USDC"));

      tokens.renameRedemptionPhantoms([
        { phantom: PHANTOM, source: SOURCE, target: TARGET },
      ]);

      expect(tokens.has(PHANTOM)).toBe(false);
    });

    it("skips when the source or target is not in the registry", () => {
      const tokens = tokensMeta(chains.Mainnet);
      tokens.upsert(TARGET, meta(TARGET, "USDC"));
      tokens.upsert(
        PHANTOM,
        meta(PHANTOM, "mGLOBALrdUSDC", {
          contractType: "PHANTOM_TOKEN::MIDAS_REDEMPTION",
        }),
      );

      tokens.renameRedemptionPhantoms([
        { phantom: PHANTOM, source: SOURCE, target: TARGET },
      ]);

      expect(tokens.symbol(PHANTOM)).toBe("mGLOBALrdUSDC");
    });

    it("lets an active mapping override an older mapping for the same phantom", () => {
      const tokens = tokensMeta(chains.Mainnet);
      const legacySource = getAddress(
        "0x0000000000000000000000000000000000000001",
      );
      const legacyTarget = getAddress(
        "0x0000000000000000000000000000000000000002",
      );
      tokens.upsert(legacySource, meta(legacySource, "legacy"));
      tokens.upsert(legacyTarget, meta(legacyTarget, "oldUSDC"));
      tokens.upsert(SOURCE, meta(SOURCE, "current"));
      tokens.upsert(TARGET, meta(TARGET, "USDC"));
      tokens.upsert(PHANTOM, meta(PHANTOM, "wdtoken"));

      tokens.renameRedemptionPhantoms([
        { phantom: PHANTOM, source: legacySource, target: legacyTarget },
        { phantom: PHANTOM, source: SOURCE, target: TARGET },
      ]);

      expect(tokens.symbol(PHANTOM)).toBe("current -> USDC");
    });
  });

  describe("unwrapRWA", () => {
    it("returns the token itself when it is not an RWA underlying", () => {
      const tokens = tokensMeta(chains.Mainnet);
      tokens.upsert(TARGET, meta(TARGET, "USDC"));

      expect(tokens.unwrapRWA(TARGET)).toBe(TARGET);
    });

    it("returns the wrapped asset when RWA compressor data is loaded", () => {
      const tokens = tokensMeta(chains.Mainnet);
      tokens.upsert(TARGET, meta(TARGET, "USDC"));
      tokens.upsert(
        DC_USDC,
        meta(DC_USDC, "dcUSDC", {
          contractType: RWA_UNDERLYING_DEFAULT,
          rwaFactory: RWA_FACTORY,
          asset: TARGET,
        }),
      );

      expect(tokens.unwrapRWA(DC_USDC)).toBe(TARGET);
    });

    it("throws SdkRWADataNotLoadedError when RWA data is missing", () => {
      const tokens = tokensMeta(chains.Mainnet);
      tokens.upsert(
        DC_USDC,
        meta(DC_USDC, "dcUSDC", {
          contractType: RWA_UNDERLYING_DEFAULT,
        }),
      );

      expect(() => tokens.unwrapRWA(DC_USDC)).toThrow(SdkRWADataNotLoadedError);
    });
  });
});
