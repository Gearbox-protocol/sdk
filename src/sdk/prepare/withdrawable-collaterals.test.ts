import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  PositionCollateral,
  StrategyPosition,
} from "../../model/index.js";
import type { OnchainSDK } from "../../onchain/index.js";
import { withdrawableCollaterals } from "./withdrawable-collaterals.js";

const WETH = "0x1111111111111111111111111111111111111111" as Address;
const USDC = "0x2222222222222222222222222222222222222222" as Address;
/** A pending delayed withdrawal: held by the account, not transferable. */
const PHANTOM = "0x3333333333333333333333333333333333333333" as Address;
const AAA = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
const BBB = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;

const PHANTOM_TYPES: Record<string, string> = {
  [PHANTOM]: "PHANTOM_TOKEN::DELAYED_WITHDRAWAL",
};

const sdk = {
  tokensMeta: {
    get: (token: Address) =>
      PHANTOM_TYPES[token] ? { contractType: PHANTOM_TYPES[token] } : undefined,
  },
} as unknown as OnchainSDK;

function collateral(address: Address, valueUsd: number | null) {
  return {
    collateral: {
      token: { address },
      value: 1n,
      valueUsd,
    },
    quota: {},
    withdrawals: [],
  } as unknown as PositionCollateral;
}

function position(...collaterals: PositionCollateral[]): StrategyPosition {
  return { chainId: 1, collaterals } as unknown as StrategyPosition;
}

describe("withdrawableCollaterals", () => {
  it("drops phantoms — withdrawCollateral cannot move a virtual balance", () => {
    const rows = withdrawableCollaterals(
      sdk,
      position(collateral(PHANTOM, 900), collateral(WETH, 100)),
    );

    expect(rows.map(r => r.collateral.token.address)).toEqual([WETH]);
  });

  it("puts the most valuable first, whatever order the manager keeps", () => {
    const rows = withdrawableCollaterals(
      sdk,
      position(collateral(USDC, 5), collateral(WETH, 100)),
    );

    expect(rows.map(r => r.collateral.token.address)).toEqual([WETH, USDC]);
  });

  it("treats an unpriced collateral as worth nothing rather than dropping it", () => {
    const rows = withdrawableCollaterals(
      sdk,
      position(collateral(USDC, null), collateral(WETH, 1)),
    );

    expect(rows.map(r => r.collateral.token.address)).toEqual([WETH, USDC]);
  });

  // A picker seeds its default from the first row, so ties cannot wobble.
  it("orders a tie by address, both ways round", () => {
    const forward = withdrawableCollaterals(
      sdk,
      position(collateral(BBB, null), collateral(AAA, null)),
    );
    const reversed = withdrawableCollaterals(
      sdk,
      position(collateral(AAA, null), collateral(BBB, null)),
    );

    expect(forward.map(r => r.collateral.token.address)).toEqual([AAA, BBB]);
    expect(reversed.map(r => r.collateral.token.address)).toEqual([AAA, BBB]);
  });

  // `sort` is in-place, so the copy `filter` makes is what must be sorted —
  // reordering the position every screen reads would be a nasty surprise.
  it("leaves the position's own order alone", () => {
    const pos = position(collateral(USDC, 5), collateral(WETH, 100));

    const rows = withdrawableCollaterals(sdk, pos);

    expect(rows).not.toBe(pos.collaterals);
    expect(pos.collaterals.map(r => r.collateral.token.address)).toEqual([
      USDC,
      WETH,
    ]);
  });
});
