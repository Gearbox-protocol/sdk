import type { Address } from "viem";
import { createPublicClient, custom, getAddress } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";
import { chains } from "../chain/chains.js";
import { TokensMeta } from "./TokensMeta.js";
import type { TokenMetaData } from "./token-types.js";

const BEEFY_WBTC = getAddress("0x924d24c238db7ecae2aa3a19430239ed684bde4a");
const SOURCE = getAddress("0x7433806912Eae67919e66aea853d46Fa0aef98A8");
const TARGET = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const PHANTOM = getAddress("0x15f8C07CdC24b4e73911170A9fE04743c04fc482");

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
  });
});
