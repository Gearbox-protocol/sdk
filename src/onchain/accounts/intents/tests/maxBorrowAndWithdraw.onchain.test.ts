import { describe, expect, it } from "vitest";
import { CreditAccountOperationsService } from "../index.js";
import { maxBorrowAndWithdraw } from "../maxBorrowAndWithdraw.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  MAX_DEBT,
  type MarketSdkExtras,
  POS,
  RWA_ASSET,
  UND,
} from "../testing/market.js";

const DEBT = 20_000_000_000n;
const TOKENS = [caToken(POS, 100_000_000_000n, 92_000_000_000n)];
const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0";
function setup(extras?: MarketSdkExtras, debt = DEBT, tokens = TOKENS) {
  const sdk = buildMarketSdk(extras);
  const creditAccount = buildFixtureCreditAccount({ totalDebt: debt, tokens });
  return { sdk, creditAccount, targetHF: 12_000n, targetSafeHF: 11_000n };
}

describe("maxBorrowAndWithdraw", () => {
  it("does not count disabled holdings", () => {
    const props = setup();
    props.creditAccount.enabledTokensMask = 1n;
    props.creditAccount.tokens = [{ ...TOKENS[0], mask: 2n }];
    expect(maxBorrowAndWithdraw(props)).toBe(0n);
  });

  it("counts quota-free underlying collateral", () => {
    expect(
      maxBorrowAndWithdraw(
        setup(undefined, 0n, [caToken(UND, 100_000_000_000n)]),
      ),
    ).toBe(81_666_666_666n);
  });

  it("applies the service's margin to default and custom thresholds", async () => {
    const props = setup();
    const service = new CreditAccountOperationsService(props.sdk);
    const max = service.maxBorrowAndWithdraw({
      sdk: props.sdk,
      creditAccount: props.creditAccount,
    });
    expect(max).toBe(
      maxBorrowAndWithdraw({
        ...props,
        targetHF: 10_103n,
        targetSafeHF: 10_003n,
      }),
    );
    expect(service.maxBorrowAndWithdraw(props)).toBe(
      maxBorrowAndWithdraw({
        ...props,
        targetHF: 12_002n,
        targetSafeHF: 11_002n,
      }),
    );
  });

  it("returns zero when RWA rounding leaves the debt below the minimum", () => {
    expect(
      maxBorrowAndWithdraw(
        setup(
          {
            rwaAssets: { [UND]: RWA_ASSET },
            extraDecimals: { [RWA_ASSET]: 6 },
            minDebt: 100_000_001n,
            availableLiquidity: 100_000_001n,
          },
          0n,
        ),
      ),
    ).toBe(0n);
  });

  it("keeps the next larger loan below the requested HF target", async () => {
    const props = setup();
    const max = maxBorrowAndWithdraw(props);
    const sim = await new CreditAccountOperationsService(props.sdk).startIntent(
      {
        ...props,
        intent: {
          type: "BORROW_AND_WITHDRAW",
          amount: max + 100_000_000n,
          to: WALLET,
        },
        slippage: undefined,
        quotaReserve: undefined,
      },
    );
    if (!sim.ok) throw new Error(sim.error.code);
    expect(sim.state.healthFactor).toBeLessThan(Number(props.targetHF));
  });

  it("uses the existing quota rather than buying more", () => {
    expect(
      maxBorrowAndWithdraw(
        setup(undefined, DEBT, [
          caToken(POS, 100_000_000_000n, 30_000_000_000n),
        ]),
      ),
    ).toBe(5_000_000_000n);
    expect(
      maxBorrowAndWithdraw(
        setup(undefined, 0n, [caToken(POS, 100_000_000_000n)]),
      ),
    ).toBe(0n);
  });

  it("supports accounts without debt when their collateral already has quota", () => {
    expect(maxBorrowAndWithdraw(setup(undefined, 0n))).toBe(76_666_666_666n);
  });

  it("honours safe prices independently of the main HF target", () => {
    const main = maxBorrowAndWithdraw(setup());
    const safe = maxBorrowAndWithdraw(
      setup({ reservePrices: { [UND]: 200_000_000n, [POS]: 100_000_000n } }),
    );
    expect(safe).toBe(21_818_181_818n);
    expect(safe).toBeLessThan(main);
    expect(maxBorrowAndWithdraw(setup({ reservePrices: {} }))).toBe(0n);
  });

  it.each([
    { availableLiquidity: 1_000_000_000n },
    { debtLimitAvailable: 1_000_000_000n },
  ])(
    "leaves two basis points of market capacity for changes before execution %o",
    extras => {
      expect(maxBorrowAndWithdraw(setup(extras))).toBe(999_800_000n);
    },
  );

  it("still prepares the payout after market capacity decreases by one basis point", async () => {
    const props = setup({ debtLimitAvailable: 1_000_000_000n });
    const amount = maxBorrowAndWithdraw(props);
    const updated = setup({ debtLimitAvailable: 999_900_000n });
    const sim = await new CreditAccountOperationsService(
      updated.sdk,
    ).startIntent({
      ...updated,
      intent: { type: "BORROW_AND_WITHDRAW", amount, to: WALLET },
      slippage: undefined,
      quotaReserve: undefined,
    });
    expect(sim.ok).toBe(true);
  });

  it("subtracts existing debt from the per-account debt cap", () => {
    expect(
      maxBorrowAndWithdraw(
        setup(undefined, MAX_DEBT - 100_000_000n, [
          caToken(POS, 100_000_000_000_000n, 92_000_000_000_000n),
        ]),
      ),
    ).toBe(100_000_000n);
  });

  it.each([
    { facadePaused: true },
    { poolPaused: true },
    { maxDebtPerBlockMultiplier: 0 },
    { availableLiquidity: 0n },
    { expirationDate: 1, timestamp: 2 },
    { minDebt: 100_000_000_000n },
  ])("returns zero when no loan is available %o", extras => {
    expect(maxBorrowAndWithdraw(setup(extras))).toBe(0n);
  });

  it.each([6, 10])(
    "returns a representable RWA payout with %s decimals",
    async decimals => {
      const props = setup({
        rwaAssets: { [UND]: RWA_ASSET },
        extraDecimals: { [RWA_ASSET]: decimals },
      });
      const max = maxBorrowAndWithdraw(props);
      expect(max).toBe((56_666_666_666n * 10n ** BigInt(decimals)) / 10n ** 8n);
      const sim = await new CreditAccountOperationsService(
        props.sdk,
      ).startIntent({
        ...props,
        intent: { type: "BORROW_AND_WITHDRAW", amount: max, to: WALLET },
        slippage: undefined,
        quotaReserve: undefined,
      });
      if (!sim.ok) throw new Error(sim.error.code);
      expect(
        sim.operations.find(o => o.type === "withdrawCollateral"),
      ).toMatchObject({ token: RWA_ASSET, amount: max });
      expect(sim.state.healthFactor).toBeGreaterThanOrEqual(
        Number(props.targetHF),
      );
      expect(sim.state.safeHealthFactor).toBeGreaterThanOrEqual(
        Number(props.targetSafeHF),
      );
    },
  );

  it("deducts existing debt from what the collateral supports", async () => {
    const props = setup();
    const max = maxBorrowAndWithdraw(props);
    expect(max).toBe(56_666_666_666n);
    const sim = await new CreditAccountOperationsService(props.sdk).startIntent(
      {
        ...props,
        intent: { type: "BORROW_AND_WITHDRAW", amount: max, to: WALLET },
        slippage: undefined,
        quotaReserve: undefined,
      },
    );
    if (!sim.ok) throw new Error(sim.error.code);
    expect(sim.state.healthFactor).toBeGreaterThanOrEqual(
      Number(props.targetHF),
    );
    expect(sim.state.safeHealthFactor).toBeGreaterThanOrEqual(
      Number(props.targetSafeHF),
    );
  });
});
