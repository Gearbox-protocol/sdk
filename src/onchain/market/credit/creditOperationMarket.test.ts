import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { Curator } from "../../../model/index.js";
import type { CreditSuite } from "./CreditSuite.js";
import {
  creditOperationMarket,
  totalLiquidationDiscount,
} from "./creditOperationMarket.js";
import type { LiquidationFees } from "./types.js";

const CREDIT_MANAGER = "0x1000000000000000000000000000000000000001" as Address;
const CURATOR: Curator = {
  address: "0x2000000000000000000000000000000000000002" as Address,
  name: "Chaos Labs",
  url: null,
};

/**
 * The three getters the market half is read off. `liquidationFees` is the pair
 * in effect right now — the suite resolves its own expiration behind it, so a
 * caller here cannot pick the wrong one.
 */
function suiteWith(fees: LiquidationFees): CreditSuite {
  return {
    name: "wstETH / WETH",
    creditManager: { address: CREDIT_MANAGER },
    market: { curator: CURATOR },
    liquidationFees: () => fees,
  } as unknown as CreditSuite;
}

describe("totalLiquidationDiscount", () => {
  it("is the premium the liquidator keeps plus the protocol's fee", () => {
    // the manager reports the complement of a 3% premium; a 1.5% fee rides on
    // top of it, so a screen labels the pair 4.5%
    const discount = totalLiquidationDiscount(
      suiteWith({ liquidationDiscount: 9700, feeLiquidation: 150 }),
    );
    expect(discount).toBe(450);
  });

  it("follows the fees the suite reports, which is where expiration is resolved", () => {
    // an expired facade liquidates on harsher terms, and `liquidationFees`
    // hands those over without the caller asking
    const discount = totalLiquidationDiscount(
      suiteWith({ liquidationDiscount: 9600, feeLiquidation: 200 }),
    );
    expect(discount).toBe(600);
  });

  it("is not the manager's own figure", () => {
    const fees: LiquidationFees = {
      liquidationDiscount: 9700,
      feeLiquidation: 150,
    };
    expect(totalLiquidationDiscount(suiteWith(fees))).not.toBe(
      fees.liquidationDiscount,
    );
  });
});

describe("creditOperationMarket", () => {
  it("names the market a result acts on, curator and discount included", () => {
    expect(
      creditOperationMarket(
        suiteWith({ liquidationDiscount: 9700, feeLiquidation: 150 }),
      ),
    ).toEqual({
      creditManager: CREDIT_MANAGER,
      name: "wstETH / WETH",
      curator: CURATOR,
      liquidationDiscount: 450,
    });
  });
});
