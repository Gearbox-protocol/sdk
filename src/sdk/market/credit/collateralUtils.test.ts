import type { Address } from "viem";
import { getAddress } from "viem";
import { describe, expect, it } from "vitest";

import {
  RWA_UNDERLYING_DEFAULT,
  RWA_UNDERLYING_ON_DEMAND,
} from "../../base/token-types.js";
import {
  isStrategyCollateral,
  NON_STRATEGY_PHANTOM_TOKEN_TYPES,
  pickStrategyTargetCollateral,
  type StrategyCollateralProps,
} from "./collateralUtils.js";

const TOKEN = getAddress("0xaaaa000000000000000000000000000000000001");
const UNDERLYING = getAddress("0xbbbb000000000000000000000000000000000002");
const UNWRAPPED = getAddress("0xcccc000000000000000000000000000000000003");

const lower = (a: Address) => a.toLowerCase() as Address;

const baseline: StrategyCollateralProps = {
  token: TOKEN,
  underlying: UNDERLYING,
  unwrappedUnderlying: UNWRAPPED,
  liquidationThreshold: 8500,
  contractType: "PHANTOM_TOKEN::CONVEX",
  isExpired: false,
  mainPrice: 1_000_000_000n,
  hasActiveQuota: true,
};

describe("isStrategyCollateral", () => {
  it("accepts a token that passes every check", () => {
    expect(isStrategyCollateral(baseline)).toBe(true);
    expect(isStrategyCollateral(baseline, true)).toBe(true);
  });

  it("accepts a token with no contractType and no isExpired", () => {
    const { contractType: _, isExpired: __, ...props } = baseline;
    expect(isStrategyCollateral(props)).toBe(true);
  });

  it("rejects the credit manager underlying", () => {
    expect(isStrategyCollateral({ ...baseline, token: UNDERLYING })).toBe(
      false,
    );
  });

  it("rejects the unwrapped underlying", () => {
    expect(isStrategyCollateral({ ...baseline, token: UNWRAPPED })).toBe(false);
  });

  it("compares underlying addresses case-insensitively", () => {
    expect(
      isStrategyCollateral({ ...baseline, token: lower(UNDERLYING) }),
    ).toBe(false);
  });

  it("rejects a liquidation threshold of 0", () => {
    expect(isStrategyCollateral({ ...baseline, liquidationThreshold: 0 })).toBe(
      false,
    );
  });

  it("rejects a liquidation threshold at or above 100%", () => {
    expect(
      isStrategyCollateral({ ...baseline, liquidationThreshold: 10000 }),
    ).toBe(false);
    expect(
      isStrategyCollateral({ ...baseline, liquidationThreshold: 10001 }),
    ).toBe(false);
  });

  it.each(NON_STRATEGY_PHANTOM_TOKEN_TYPES)(
    "rejects %s phantom token",
    contractType => {
      expect(isStrategyCollateral({ ...baseline, contractType })).toBe(false);
    },
  );

  it("accepts a phantom token outside the denylist", () => {
    expect(
      isStrategyCollateral({
        ...baseline,
        contractType: "PHANTOM_TOKEN::CONVEX",
      }),
    ).toBe(true);
  });

  it("rejects an RWA underlying contract type even when its address differs from the underlying", () => {
    expect(
      isStrategyCollateral({
        ...baseline,
        contractType: RWA_UNDERLYING_DEFAULT,
      }),
    ).toBe(false);
    expect(
      isStrategyCollateral({
        ...baseline,
        contractType: RWA_UNDERLYING_ON_DEMAND,
      }),
    ).toBe(false);
  });

  it("rejects an expired token", () => {
    expect(isStrategyCollateral({ ...baseline, isExpired: true })).toBe(false);
  });

  it("accepts a token with isExpired explicitly false", () => {
    expect(isStrategyCollateral({ ...baseline, isExpired: false })).toBe(true);
  });

  it("rejects a token without a main price", () => {
    expect(isStrategyCollateral({ ...baseline, mainPrice: undefined })).toBe(
      false,
    );
  });

  it("rejects a token with a zero main price", () => {
    expect(isStrategyCollateral({ ...baseline, mainPrice: 0n })).toBe(false);
  });

  it("ignores quota unless requireQuota is true", () => {
    const props = { ...baseline, hasActiveQuota: false };
    expect(isStrategyCollateral(props)).toBe(true);
    expect(isStrategyCollateral(props, true)).toBe(false);
  });
});

describe("pickStrategyTargetCollateral", () => {
  const A = getAddress("0xaaaa00000000000000000000000000000000000a");
  const B = getAddress("0xbbbb00000000000000000000000000000000000b");
  const C = getAddress("0xcccc00000000000000000000000000000000000c");

  const props = (
    token: Address,
    overrides: Partial<StrategyCollateralProps> = {},
  ): StrategyCollateralProps => ({
    ...baseline,
    token,
    ...overrides,
  });

  it("returns the biggest-index token that is a candidate with active quota", () => {
    expect(
      pickStrategyTargetCollateral([
        props(A),
        props(B),
        props(C, { hasActiveQuota: false }),
      ]),
    ).toBe(B);
  });

  it("falls back to the biggest-index candidate when none has an active quota", () => {
    expect(
      pickStrategyTargetCollateral([
        props(A, { hasActiveQuota: false }),
        props(B, { hasActiveQuota: false }),
        props(C, { liquidationThreshold: 0, hasActiveQuota: false }),
      ]),
    ).toBe(B);
  });

  it("returns undefined when nothing is a candidate", () => {
    expect(
      pickStrategyTargetCollateral([
        props(A, { liquidationThreshold: 0 }),
        props(B, { liquidationThreshold: 0 }),
        props(C, { liquidationThreshold: 0 }),
      ]),
    ).toBeUndefined();
  });

  it("skips a later token that is not a candidate in favour of an earlier full match", () => {
    expect(
      pickStrategyTargetCollateral([
        props(A),
        props(B, { liquidationThreshold: 0 }),
        props(C, { liquidationThreshold: 0 }),
      ]),
    ).toBe(A);
  });
});
