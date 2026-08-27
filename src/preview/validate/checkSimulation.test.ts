import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom } from "viem";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { OperationState } from "../../onchain/index.js";
import { json_parse, OnchainSDK } from "../../onchain/index.js";
import { checkSimulation } from "./checkSimulation.js";

const STATE_FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25475508-adjust-credit-account.json",
);

const CREDIT_MANAGER: Address = "0x79C6C1ce5B12abCC3E407ce8C160eE1160250921";

let sdk: OnchainSDK;

beforeAll(() => {
  sdk = new OnchainSDK("Mainnet", {
    transport: custom({
      request: async () => {
        throw new Error("offline: checkSimulation must not hit RPC");
      },
    }),
  });
  sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
});

/** A healthy projected state, as the engine reports one. */
function state(over: Partial<OperationState> = {}): OperationState {
  return {
    healthFactor: 12_500,
    borrowRate: { total: 300, totalOnDebt: 320, base: 250, quotas: [] },
    timeToLiquidation: 86_400_000n,
    liquidationPrice: null,
    totalValue: 10n ** 20n,
    accountDebt: 41_574_436_328_452_499_320n,
    leverage: 2,
    assets: [],
    quotas: {},
    priceImpact: undefined,
    ...over,
  } as OperationState;
}

const check = (
  over: Partial<OperationState> = {},
  options: Parameters<typeof checkSimulation>[1] = {},
) =>
  checkSimulation(
    { sdk, state: state(over), creditManager: CREDIT_MANAGER },
    options,
  );

describe("checkSimulation", () => {
  it("finds nothing wrong with a simulation the engine accepted", () => {
    expect(check()).toBeNull();
  });

  it("holds the account to the caller's bar, which the engine does not", () => {
    // The engine returns `ok` for anything landing at 1.0; a form asks for more.
    expect(check({ healthFactor: 10_050 })).toBeNull();
    expect(
      check({ healthFactor: 10_050 }, { minHealthFactor: 10_101 })?.detail,
    ).toEqual({ healthFactor: 10_050, required: 10_101, safePrices: false });
  });

  it("lets a rescue through and refuses an operation that does not improve", () => {
    const at = (currentHealthFactor: number) =>
      check(
        { healthFactor: 10_080 },
        {
          minHealthFactor: 10_101,
          currentHealthFactor,
        },
      );

    expect(at(10_050)).toBeNull();
    expect(at(10_090)?.reason).toBe("insufficientCollateral");
  });

  it("weighs the safe-price factor only where the walk reported one", () => {
    // Absent on an operation that hands nothing over, so the bar stands down.
    expect(check({}, { minSafeHealthFactor: 10_001 })).toBeNull();

    expect(
      check({ safeHealthFactor: 10_000 }, { minSafeHealthFactor: 10_001 })
        ?.detail,
    ).toEqual({ healthFactor: 10_000, required: 10_001, safePrices: true });

    expect(
      check({ safeHealthFactor: 10_001 }, { minSafeHealthFactor: 10_001 }),
    ).toBeNull();
  });

  it("counts quoted tokens against the facade's cap, which the engine never does", () => {
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const cap = vi
      .spyOn(suite.creditManager, "maxEnabledTokens", "get")
      .mockReturnValue(1);

    const quotas = {
      ["0x1111111111111111111111111111111111111111" as Address]: {
        token: "0x1111111111111111111111111111111111111111" as Address,
        balance: 1n,
      },
      ["0x2222222222222222222222222222222222222222" as Address]: {
        token: "0x2222222222222222222222222222222222222222" as Address,
        balance: 1n,
      },
    };

    expect(check({ quotas })).toEqual({
      reason: "quotaCountExceeded",
      detail: { count: 2, max: 1 },
    });
    cap.mockRestore();
  });

  it("leaves a loan-free account alone at every bar", () => {
    expect(
      check(
        { accountDebt: 0n, healthFactor: 0 },
        {
          minHealthFactor: 10_101,
          minSafeHealthFactor: 10_001,
        },
      ),
    ).toBeNull();
  });

  it("reports the market's own state ahead of anything else", () => {
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const paused = vi.spyOn(suite, "isPaused", "get").mockReturnValue(true);

    expect(
      check({ healthFactor: 1 }, { minHealthFactor: 10_101 })?.reason,
    ).toBe("marketPaused");
    paused.mockRestore();
  });
});
