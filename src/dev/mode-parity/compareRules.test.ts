import { describe, expect, it } from "vitest";
import {
  poolOpportunitySchema,
  strategyOpportunitySchema,
} from "../../model/opportunities.schema.js";
import {
  poolPositionSchema,
  strategyPositionSchema,
} from "../../model/positions.schema.js";
import { compileCompareRules } from "./compareRules.js";

describe("compileCompareRules", () => {
  it("records mode and tolerance tags of a pool opportunity", () => {
    const rules = compileCompareRules(poolOpportunitySchema);

    expect(rules.get("curator.url")).toBe("offchainOnly");
    expect(rules.get("supplyApy.totalApy")).toBe("offchainOnly");
    expect(rules.get("supplyApy.rewards")).toBe("offchainOnly");
    expect(rules.get("supplyApy.organicApy")).toEqual({ tolerance: "bps" });
    expect(rules.get("supplyApyAvg7D")).toBe("offchainOnly");
    expect(rules.get("utilization")).toEqual({ tolerance: "bps" });
    expect(rules.get("totalSupply.value")).toEqual({ tolerance: "amount" });
    expect(rules.get("totalSupply.valueUsd")).toEqual({ tolerance: "usd" });
    expect(rules.get("quotaAssets[].quotaRate")).toEqual({ tolerance: "bps" });
    expect(rules.get("quotaAssets[].used.value")).toEqual({
      tolerance: "amount",
    });
    expect(rules.get("quotaAssets[].allocationShare")).toBe("offchainOnly");
    expect(rules.get("quotaAssets[].allocatedDebt")).toBe("offchainOnly");
    expect(rules.get("quotaAssets[].limit.value")).toBeUndefined();
    expect(rules.get("maxBorrowAmount")).toBeUndefined();
    expect(rules.get("maxBorrowAmount.value")).toBeUndefined();
  });

  it("scopes strategy utilization as offchain-only, unlike the pool", () => {
    const pool = compileCompareRules(poolOpportunitySchema);
    const strategy = compileCompareRules(strategyOpportunitySchema);

    expect(pool.get("utilization")).toEqual({ tolerance: "bps" });
    expect(strategy.get("utilization")).toBe("offchainOnly");
    expect(strategy.get("collateralApy")).toBe("offchainOnly");
    expect(strategy.get("collateralApyAvg7D")).toBe("offchainOnly");
    expect(strategy.get("borrowApy")).toEqual({ tolerance: "bps" });
    expect(strategy.get("borrowApyAvg7D")).toBe("offchainOnly");
    expect(strategy.get("quotaRate")).toEqual({ tolerance: "bps" });
    expect(strategy.get("quotaRateAvg7D")).toBe("offchainOnly");
    expect(strategy.get("maxBorrowAmount.value")).toEqual({
      tolerance: "amount",
    });
  });

  it("records position tags, including nested collateral amounts", () => {
    const pool = compileCompareRules(poolPositionSchema);
    const strategy = compileCompareRules(strategyPositionSchema);

    expect(pool.get("pnl")).toBe("offchainOnly");
    expect(pool.get("apyAvg7D")).toBe("offchainOnly");
    expect(pool.get("netValue.value")).toEqual({ tolerance: "amount" });
    expect(strategy.get("netApy")).toBe("offchainOnly");
    expect(strategy.get("netApyAvg7D")).toBe("offchainOnly");
    expect(strategy.get("borrowApyAvg7D")).toBe("offchainOnly");
    expect(strategy.get("borrowRate")).toBe("onchainOnly");
    expect(strategy.get("borrowRateAvg7D")).toBe("offchainOnly");
    expect(strategy.get("leverage")).toEqual({ tolerance: "float" });
    expect(strategy.get("healthFactor")).toEqual({ tolerance: "bps" });
    expect(strategy.get("collaterals[].collateral.value")).toEqual({
      tolerance: "amount",
    });
    expect(strategy.get("collaterals[].quota.value")).toEqual({
      tolerance: "amount",
    });
  });
});
