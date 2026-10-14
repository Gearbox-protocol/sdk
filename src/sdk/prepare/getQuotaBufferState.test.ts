import { describe, expect, it, vi } from "vitest";
import type { StrategyPosition, TokenAmount } from "../../model/index.js";
import { unpriceableTokenError } from "../../model/index.js";
import {
  ANY,
  ANY2,
  buildMarketSdk,
  CREDIT_ACCOUNT,
  CREDIT_MANAGER,
  MAX_DEBT,
  QUOTAS,
  UND,
} from "../../onchain/accounts/intents/testing/market.js";
import { MultichainSDK } from "../../onchain/MultichainSDK.js";
import type { OnchainSDK } from "../../onchain/OnchainSDK.js";
import { PrepareApi } from "./PrepareApi.js";

function prepare(sdk: OnchainSDK): PrepareApi {
  const multichain = new MultichainSDK({ chains: {} });
  Object.defineProperty(multichain, "chains", {
    value: new Map([["Mainnet", sdk]]),
  });
  return new PrepareApi(multichain);
}

const BALANCE = 2_000n * 10n ** 18n;
const CURRENT = 92_000_000_000n;
function position(sdk: OnchainSDK, current = CURRENT): StrategyPosition {
  const underlyingToken = {
    ...sdk.tokensMeta.mustGetToken(UND),
    wrappedAddress: null,
  };
  const amount = (value: bigint): TokenAmount => ({
    token: underlyingToken,
    value,
    valueUsd: 0,
  });
  const target = sdk.tokensMeta.mustGetToken(ANY);
  return {
    kind: "strategy",
    chainId: 1,
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    name: "Test",
    underlyingToken,
    targetCollateral: target,
    leverage: 2,
    borrowApy: 0,
    totalDebt: amount(50_000_000_000n),
    totalValue: amount(100_000_000_000n),
    healthFactor: 20_000,
    collaterals: [
      {
        collateral: { token: target, value: BALANCE, valueUsd: 0 },
        quota: amount(current),
        withdrawals: [],
      },
    ],
  };
}
function limited(available: bigint): OnchainSDK {
  return buildMarketSdk({
    quotas: {
      ...QUOTAS,
      [ANY]: {
        ...QUOTAS[ANY],
        totalQuoted: CURRENT,
        limit: CURRENT + available,
      },
    },
  });
}

describe("prepare.getQuotaBufferState", () => {
  it("returns raw base, current quota and the actual increase without reading the account", () => {
    const sdk = buildMarketSdk();
    const p = position(sdk);
    const read = vi.mocked(sdk.accounts.getCreditAccountData);
    expect(prepare(sdk).getQuotaBufferState(p)).toMatchObject({
      baseQuota: CURRENT,
      currentQuota: CURRENT,
      quotaIncrease: 4_600_000_000n,
    });
    expect(read).not.toHaveBeenCalled();
  });
  it("does not round the base to the protocol quota step", () => {
    const sdk = buildMarketSdk();
    const p = position(sdk);
    p.collaterals[0].collateral.value += 40_000_000_000n;
    expect(prepare(sdk).getQuotaBufferState(p)?.baseQuota).toBe(CURRENT + 1n);
  });
  it.each([0n, 9_999n, 10_000n, 47_249_999n, 4_600_000_000n])(
    "uses full/partial/rounded pool capacity %s",
    available => {
      const sdk = limited(available);
      expect(
        prepare(sdk).getQuotaBufferState(position(sdk))?.quotaIncrease,
      ).toBe(available < 10_000n ? undefined : (available / 10_000n) * 10_000n);
    },
  );
  it("accounts for an extra zero-balance quota supplied by the host", () => {
    const sdk = buildMarketSdk();
    const p = position(sdk, MAX_DEBT * 2n - 10_000n);
    p.collaterals[0].collateral.value = BALANCE * 1_000n;
    expect(prepare(sdk).getQuotaBufferState(p)?.quotaIncrease).toBe(10_000n);
    expect(
      prepare(sdk).getQuotaBufferState(p, [{ token: ANY2, quota: 10_000n }]),
    ).toBeUndefined();
  });
  it("also counts visible non-target quotas toward the account limit", () => {
    const sdk = buildMarketSdk();
    const p = position(sdk, MAX_DEBT * 2n - 10_000n);
    p.collaterals[0].collateral.value = BALANCE * 1_000n;
    p.collaterals.push({
      collateral: {
        token: sdk.tokensMeta.mustGetToken(ANY2),
        value: 0n,
        valueUsd: 0,
      },
      quota: { ...p.totalDebt, value: 10_000n },
      withdrawals: [],
    });
    expect(prepare(sdk).getQuotaBufferState(p)).toBeUndefined();
  });
  it.each(["target", "balance", "quota", "debt", "error", "chain", "market"])(
    "rejects ineligible %s",
    field => {
      const sdk = buildMarketSdk();
      const p = position(sdk);
      if (field === "target") p.targetCollateral = null;
      if (field === "balance") p.collaterals[0].collateral.value = 0n;
      if (field === "quota") p.collaterals[0].quota.value = 0n;
      if (field === "debt") p.totalDebt.value = 0n;
      if (field === "error") p.error = "unpriced";
      if (field === "chain") p.chainId = 42161;
      if (field === "market") p.creditManager = ANY;
      expect(prepare(sdk).getQuotaBufferState(p)).toBeUndefined();
    },
  );
  it("rejects phantom target but permits an unrelated phantom holding", () => {
    const sdk = buildMarketSdk({ phantoms: [ANY2] });
    const p = position(sdk);
    p.collaterals.push({
      collateral: {
        token: sdk.tokensMeta.mustGetToken(ANY2),
        value: BALANCE,
        valueUsd: 0,
      },
      quota: { ...p.totalDebt, value: 10_000n },
      withdrawals: [],
    });
    expect(prepare(sdk).getQuotaBufferState(p)?.quotaIncrease).toBe(
      4_600_000_000n,
    );
    p.targetCollateral = sdk.tokensMeta.mustGetToken(ANY2);
    expect(prepare(sdk).getQuotaBufferState(p)).toBeUndefined();
  });
  it("rejects unsupported position kinds", () => {
    const sdk = buildMarketSdk();
    const p = position(sdk);
    expect(
      prepare(sdk).getQuotaBufferState({
        kind: "pool",
        name: "Pool",
        chainId: 1,
        pool: UND,
        underlyingToken: p.underlyingToken,
        netValue: p.totalValue,
        apy: { organicApy: 0, rewards: [] },
      }),
    ).toBeUndefined();
  });
  it("returns undefined for an inactive or forbidden target", () => {
    const inactive = buildMarketSdk({
      quotas: { ...QUOTAS, [ANY]: { ...QUOTAS[ANY], isActive: false } },
    });
    expect(
      prepare(inactive).getQuotaBufferState(position(inactive)),
    ).toBeUndefined();
    const forbidden = buildMarketSdk({ forbiddenTokens: [ANY] });
    expect(
      prepare(forbidden).getQuotaBufferState(position(forbidden)),
    ).toBeUndefined();
  });
  it("returns undefined for zero LT or a target whose quota needs no increase", () => {
    const sdk = buildMarketSdk({ extraLiquidationThresholds: { [ANY]: 0 } });
    expect(prepare(sdk).getQuotaBufferState(position(sdk))).toBeUndefined();
    const normal = buildMarketSdk();
    expect(
      prepare(normal).getQuotaBufferState(position(normal, CURRENT * 2n)),
    ).toBeUndefined();
  });
  it("returns undefined for an unpriceable target but propagates unexpected failures", () => {
    const sdk = buildMarketSdk();
    const p = position(sdk);
    const oracle =
      sdk.marketRegister.findCreditManager(CREDIT_MANAGER).market.priceOracle;
    const convert = vi.spyOn(oracle, "safeConvert");
    convert.mockReturnValue({ value: 0n, error: unpriceableTokenError(ANY) });
    expect(prepare(sdk).getQuotaBufferState(p)).toBeUndefined();
    convert.mockImplementation(() => {
      throw new Error("unexpected oracle failure");
    });
    expect(() => prepare(sdk).getQuotaBufferState(p)).toThrow(
      "unexpected oracle failure",
    );
  });
  it("keeps low-HF positions eligible for a host's full recovery forecast", () => {
    const sdk = buildMarketSdk();
    const p = position(sdk);
    p.healthFactor = 9_500;
    expect(prepare(sdk).getQuotaBufferState(p)?.quotaIncrease).toBe(
      4_600_000_000n,
    );
  });
  it("does not refresh chains or read the account and skips unavailable networks", () => {
    const sdk = buildMarketSdk();
    const p = position(sdk);
    const multichain = new MultichainSDK({ chains: {} });
    Object.defineProperty(multichain, "chains", {
      value: new Map([["Mainnet", sdk]]),
    });
    const refresh = vi.fn(async () => undefined);
    const api = new PrepareApi(multichain, refresh);
    expect(api.getQuotaBufferState(p)?.quotaIncrease).toBe(4_600_000_000n);
    expect(api.getQuotaBufferState({ ...p, chainId: 42161 })).toBeUndefined();
    expect(refresh).not.toHaveBeenCalled();
    expect(sdk.accounts.getCreditAccountData).not.toHaveBeenCalled();
  });
});
