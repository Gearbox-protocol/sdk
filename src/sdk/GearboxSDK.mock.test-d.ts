import { describe, expectTypeOf, it } from "vitest";
import type { GearboxSDK } from "./GearboxSDK.js";
import type { IGearboxSDK, Mode } from "./types.js";

function notImplemented(): never {
  throw new Error("not implemented");
}

/**
 * A complete no-op {@link IGearboxSDK} in `"both"` mode: every leaf is present,
 * so a mock that omits a method at any depth fails to compile.
 **/
const mockSDK = {
  mode: "both",
  networks: [],
  attached: true,
  attach: notImplemented,
  analytics: {
    positions: {
      list: notImplemented,
    },
  },
  opportunities: {
    list: notImplemented,
    getPool: notImplemented,
    getStrategy: notImplemented,
    filter: notImplemented,
    merge: {
      list: notImplemented,
      pool: notImplemented,
      strategy: notImplemented,
    },
    totals: notImplemented,
    charts: notImplemented,
    prepare: {
      deposit: notImplemented,
      withdraw: notImplemented,
      redeem: notImplemented,
      openNewStrategy: notImplemented,
      depositStrategy: notImplemented,
      withdrawStrategy: notImplemented,
      maxWithdraw: notImplemented,
      repayStrategy: notImplemented,
      maxRepay: notImplemented,
      adjustLeverage: notImplemented,
      addCollateral: notImplemented,
      withdrawCollateral: notImplemented,
      leverageBand: notImplemented,
      withdrawableCollaterals: notImplemented,
      maxWithdrawCollateral: notImplemented,
      finalize: notImplemented,
    },
    execute: {
      buildTx: notImplemented,
    },
    onchain: {
      list: notImplemented,
      getPool: notImplemented,
      getStrategy: notImplemented,
    },
    offchain: {
      list: notImplemented,
      getPool: notImplemented,
      getStrategy: notImplemented,
      getTotals: notImplemented,
      getCharts: notImplemented,
    },
  },
  positions: {
    list: notImplemented,
    filter: notImplemented,
    merge: {
      list: notImplemented,
    },
    totals: notImplemented,
    charts: notImplemented,
    transactions: notImplemented,
    getCurrentWithdrawals: notImplemented,
    onchain: {
      list: notImplemented,
      getCurrentWithdrawals: notImplemented,
    },
    offchain: {
      list: notImplemented,
      getTotals: notImplemented,
      getCharts: notImplemented,
      getTransactions: notImplemented,
    },
  },
  liquidations: {
    getLiquidatableAccounts: notImplemented,
    getLiquidationDetails: notImplemented,
    buildLiquidationTx: notImplemented,
    getLiquidationPositions: notImplemented,
  },
  preview: {
    previewOperation: notImplemented,
  },
  notices: notImplemented,
} as const satisfies IGearboxSDK<"both">;

const annotated: IGearboxSDK<"both"> = mockSDK;

describe("IGearboxSDK is mockable with a no-op object", () => {
  it("accepts a complete no-op in both mode", () => {
    expectTypeOf(annotated).toExtend<IGearboxSDK<"both">>();
    expectTypeOf(mockSDK).toExtend<IGearboxSDK<"both">>();
  });

  it("a both-mode mock is usable where the mode is widened", () => {
    const widened: IGearboxSDK<Mode> = mockSDK;
    expectTypeOf(widened).toExtend<IGearboxSDK<Mode>>();
  });
});

describe("GearboxSDK implements IGearboxSDK in every mode", () => {
  it("onchain", () => {
    expectTypeOf<GearboxSDK<"onchain">>().toExtend<IGearboxSDK<"onchain">>();
  });

  it("offchain", () => {
    expectTypeOf<GearboxSDK<"offchain">>().toExtend<IGearboxSDK<"offchain">>();
  });

  it("both", () => {
    expectTypeOf<GearboxSDK<"both">>().toExtend<IGearboxSDK<"both">>();
  });

  it("widened Mode", () => {
    expectTypeOf<GearboxSDK<Mode>>().toExtend<IGearboxSDK<Mode>>();
  });
});
