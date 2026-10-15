import { describe, expect, it } from "vitest";
import { MAX_UINT256 } from "../../../constants/index.js";
import { strategyLimits } from "../strategyLimits.js";
import { ANY, CREDIT_MANAGER, POS, QUOTAS, UND } from "../testing/market.js";
import type {
  AdjustLeverageIntent,
  DepositStrategyIntent,
  StartIntentProps,
} from "../types.js";
import { accountView } from "../view.js";
import {
  buildAdjustLeverageProps,
  buildAdjustLeverageSdk,
  case_increase,
} from "./adjust-leverage.fixtures.js";
import {
  buildDepositProps,
  buildDepositSdk,
  case_fixed_leverage,
} from "./deposit.fixtures.js";
import { buildOpenStrategySdk } from "./open-strategy.fixtures.js";

const values = (limits: ReturnType<typeof strategyLimits>) => ({
  min: limits?.collateralLimits?.min.value.toString(),
  max: limits?.collateralLimits?.max.value.toString(),
  quota: limits?.quotaLimits?.collateralMax?.value.toString(),
});

interface AccountLimitsTestProps extends StartIntentProps {
  intent: DepositStrategyIntent | AdjustLeverageIntent;
}

function accountLimits(props: AccountLimitsTestProps) {
  return strategyLimits({
    ...props.intent,
    suite: props.sdk.marketRegister.findCreditManager(
      props.creditAccount.creditManager,
    ),
    view: accountView(props.creditAccount, props.sdk),
    initialQuotas: props.creditAccount.tokens,
    quotaReserve: props.quotaReserve,
  });
}

describe("limit boundary characterization", () => {
  it("preserves exact opening boundaries across prices, reserves and quota rounding", () => {
    const results = [];
    for (const token of [UND, ANY]) {
      for (const reserve of [0, 137]) {
        for (const available of [0n, 12345n]) {
          const sdk = buildOpenStrategySdk({
            minDebt: 33n,
            availableLiquidity: 201n,
            quotas: {
              ...QUOTAS,
              [POS]: { ...QUOTAS[POS], limit: available, totalQuoted: 0n },
            },
          });
          const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
          results.push(
            values(
              strategyLimits({
                type: "OPEN",
                suite,
                collateral: [{ token, balance: 1000n }],
                leverage: 246n,
                targetToken: POS,
                quotaReserve: reserve,
              }),
            ),
          );
        }
      }
    }
    expect(results).toEqual([
      { min: "23", max: "138", quota: "0" },
      { min: "23", max: "138", quota: "8837" },
      { min: "23", max: "138", quota: "0" },
      { min: "23", max: "138", quota: "8717" },
      { min: "440000000001", max: "2760000000000", quota: "0" },
      { min: "440000000001", max: "2760000000000", quota: "176740000000000" },
      { min: "440000000001", max: "2760000000000", quota: "0" },
      { min: "440000000001", max: "2760000000000", quota: "174340000000000" },
    ]);
  });
  it("preserves exact deposit and leverage boundaries independently", () => {
    const depositSdk = buildDepositSdk(case_fixed_leverage);
    const deposit = accountLimits(
      buildDepositProps(case_fixed_leverage, depositSdk),
    );
    const leverageSdk = buildAdjustLeverageSdk(case_increase);
    const leverage = accountLimits(
      buildAdjustLeverageProps(case_increase, leverageSdk),
    );
    expect({
      deposit: values({
        collateralLimits: deposit.collateralLimits,
        quotaLimits: deposit.quotaLimits,
      }),
      leverage: {
        debt: leverage.leverageLimits,
        quota: leverage.quotaLimits,
      },
    }).toEqual({
      deposit: {
        min: "1",
        max: "19950000000000",
        quota: MAX_UINT256.toString(),
      },
      leverage: {
        debt: { min: 101n, max: 40100n },
        quota: { leverageMax: MAX_UINT256 },
      },
    });
  });
  it("preserves quota plateaus and omits targeted-deposit bounds", () => {
    for (const available of [0n, 5000000000n]) {
      for (const reserve of [0, 137]) {
        const depositSdk = buildDepositSdk(case_fixed_leverage);
        const suite =
          depositSdk.marketRegister.findCreditManager(CREDIT_MANAGER);
        const quota = suite.market.pool.pqk.quotas.get(POS);
        if (!quota) throw new Error("missing quota fixture");
        quota.limit = quota.totalQuoted + available;
        for (const targetLeverage of [undefined, 150n, 246n]) {
          const props = buildDepositProps(case_fixed_leverage, depositSdk);
          const limits = accountLimits({
            ...props,
            quotaReserve: reserve,
            intent: { ...props.intent, targetLeverage },
          });
          if (targetLeverage !== undefined) expect(limits).toEqual({});
          expect(
            values({
              collateralLimits: limits.collateralLimits,
              quotaLimits: limits.quotaLimits,
            }),
          ).toEqual(
            targetLeverage === undefined
              ? {
                  min: "1",
                  max: "19950000000000",
                  quota: MAX_UINT256.toString(),
                }
              : { min: undefined, max: undefined, quota: undefined },
          );
        }
        const leverageSdk = buildAdjustLeverageSdk(case_increase);
        const leverQuota = leverageSdk.marketRegister
          .findCreditManager(CREDIT_MANAGER)
          .market.pool.pqk.quotas.get(POS);
        if (!leverQuota) throw new Error("missing quota fixture");
        leverQuota.limit = leverQuota.totalQuoted + available;
        const limits = accountLimits({
          ...buildAdjustLeverageProps(case_increase, leverageSdk),
          quotaReserve: reserve,
        });
        expect({
          leverage: limits.leverageLimits,
          quota: limits.quotaLimits,
        }).toEqual({
          leverage: { min: 101n, max: 40100n },
          quota: { leverageMax: MAX_UINT256 },
        });
      }
    }
  });
});
