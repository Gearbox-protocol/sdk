import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import type { Token, UnderlyingToken } from "../../../model/index.js";
import { CreditSuite } from "./CreditSuite.js";

const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const CBETH = getAddress("0xBe9895146f7AF43049ca1c1AE358B0541Ea49704");
const UNKNOWN_ACCOUNT = getAddress(
  "0x0000000000000000000000000000000000000001",
);
// Hardcoded Mainnet override in `chains.ts`.
const OVERRIDE_ACCOUNT = getAddress(
  "0x56631dcb1ea548d2629e82e01375090ed1f81b7e",
);
const OVERRIDE_TARGET = getAddress(
  "0x1a711a5bc48b5c1352c1882fa65dc14b5b9e829d",
);

function token(address: Token["address"], symbol: string): Token {
  return {
    chainId: 1,
    address,
    symbol,
    name: symbol,
    decimals: 18,
  };
}

const UNDERLYING: UnderlyingToken = {
  ...token(WETH, "WETH"),
  wrappedAddress: null,
};

function suite(strategyTarget: Token["address"] | undefined): CreditSuite {
  const known = new Map([
    [CBETH, token(CBETH, "cbETH")],
    [OVERRIDE_TARGET, token(OVERRIDE_TARGET, "stETH")],
  ]);
  const s = {
    chainId: 1,
    strategyTargetCollateral: strategyTarget,
    underlyingToken: UNDERLYING,
    tokensMeta: {
      mustGetToken: (addr: Token["address"]) => {
        const t = known.get(getAddress(addr));
        if (!t) {
          throw new Error(`token ${addr} not found`);
        }
        return t;
      },
    },
  };
  return Object.assign(s, {
    accountTargetCollateral: CreditSuite.prototype.accountTargetCollateral,
    accountStrategyName: CreditSuite.prototype.accountStrategyName,
  }) as unknown as CreditSuite;
}

describe("CreditSuite.accountTargetCollateral", () => {
  it("falls back to the suite's strategy target", () => {
    expect(suite(CBETH).accountTargetCollateral(UNKNOWN_ACCOUNT)).toEqual(
      token(CBETH, "cbETH"),
    );
  });

  it("prefers a hardcoded per-account override", () => {
    expect(suite(CBETH).accountTargetCollateral(OVERRIDE_ACCOUNT)).toEqual(
      token(OVERRIDE_TARGET, "stETH"),
    );
  });

  it("is null when neither an override nor a suite target exists", () => {
    expect(
      suite(undefined).accountTargetCollateral(UNKNOWN_ACCOUNT),
    ).toBeNull();
  });
});

describe("CreditSuite.accountStrategyName", () => {
  it("joins the account target and the underlying", () => {
    expect(suite(CBETH).accountStrategyName(UNKNOWN_ACCOUNT)).toBe(
      "cbETH / WETH",
    );
  });

  it("is the underlying symbol when no target can be resolved", () => {
    expect(suite(undefined).accountStrategyName(UNKNOWN_ACCOUNT)).toBe("WETH");
  });
});
