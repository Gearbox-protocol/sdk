import { describe, expect, it, vi } from "vitest";
import { MAX_UINT256 } from "../../../constants/index.js";
import { strategyLimits } from "../strategyLimits.js";
import { CREDIT_MANAGER, POS, UND } from "../testing/market.js";
import { accountView } from "../view.js";
import {
  buildDepositProps,
  buildDepositSdk,
  case_fixed_leverage,
} from "./deposit.fixtures.js";
import { buildOpenStrategySdk } from "./open-strategy.fixtures.js";

describe("degraded price boundary characterization", () => {
  it("omits opening quota limits for underlying", () => {
    const sdk = buildOpenStrategySdk();
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    expect(
      strategyLimits({
        type: "OPEN",
        suite,
        collateral: [{ token: UND, balance: 1000n }],
        leverage: 200n,
        targetToken: UND,
        quotaReserve: 0,
      })?.quotaLimits,
    ).toBeUndefined();
  });
  it("omits opening quota limits for an unpriceable target", () => {
    const sdk = buildOpenStrategySdk();
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const oracle = suite.market.priceOracle;
    const convert = oracle.convert.bind(oracle);
    vi.spyOn(oracle, "convert").mockImplementation(
      (from, to, amount, reserve) => {
        if (from === POS || to === POS)
          throw new Error("target feed unavailable");
        return convert(from, to, amount, reserve);
      },
    );
    expect(
      strategyLimits({
        type: "OPEN",
        suite,
        collateral: [{ token: UND, balance: 1000n }],
        leverage: 200n,
        targetToken: POS,
        quotaReserve: 0,
      })?.quotaLimits?.collateralMax?.value,
    ).toBeUndefined();
  });
  it("retains no quota increase when account projection prices the target at zero", () => {
    const sdk = buildDepositSdk(case_fixed_leverage);
    const props = buildDepositProps(case_fixed_leverage, sdk);
    const creditAccount = {
      ...props.creditAccount,
      tokens: [
        ...props.creditAccount.tokens,
        {
          ...props.creditAccount.tokens[0],
          token: UND,
          balance: 200000000000n,
          quota: 0n,
        },
      ],
    };
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const quota = suite.market.pool.pqk.quotas.get(POS);
    if (!quota) throw new Error("missing quota");
    quota.limit = quota.totalQuoted;
    const oracle = suite.market.priceOracle;
    const convert = oracle.convert.bind(oracle);
    vi.spyOn(oracle, "convert").mockImplementation(
      (from, to, amount, reserve) => {
        if (from === POS || to === POS)
          throw new Error("target feed unavailable");
        return convert(from, to, amount, reserve);
      },
    );
    expect(
      strategyLimits({
        ...props.intent,
        positionToken: POS,
        suite,
        view: accountView(creditAccount, sdk),
        initialQuotas: creditAccount.tokens,
        quotaReserve: props.quotaReserve,
      }).quotaLimits?.collateralMax?.value,
    ).toBe(MAX_UINT256);
  });
});
