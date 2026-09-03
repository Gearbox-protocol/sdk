import type { Address } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  CreditAccountNotFoundError,
  CreditManagerPausedError,
  DebtOutOfRangeError,
  ForbiddenTokenError,
  IGearboxError,
  InsufficientBalanceError,
  InsufficientCollateralError,
  InsufficientPoolLiquidityError,
  LeverageOutOfRangeError,
  MalformedTransactionError,
  MarketExpiredError,
  MultipleDelayedWithdrawalsError,
  NoDelayedRouteError,
  NoRecordedIntentError,
  NoStrategyTargetCollateralError,
  PoolSunsetError,
  PositionCollateral,
  QuotaCountExceededError,
  QuotaLimitReachedError,
  SDKReturn,
  UnexpectedFailureError,
  UnsupportedCollateralTokenError,
  UnsupportedTokenPairError,
  WithdrawalInProgressError,
} from "../../model/index.js";
import type {
  FinalizeResult,
  IOpportunitiesPrepare,
  LeverageBand,
  LpResult,
  OpenStrategyResult,
  StrategyResult,
  StrategyRoutesResult,
  WithdrawCeilings,
  WithRouteErrors,
} from "./types.js";

type P = IOpportunitiesPrepare;

/**
 * The failure half a method's answer names — `never` for one that cannot
 * error, which is what keeps the negative probes below honest.
 */
type ErrorOf<T> = T extends { ok: false; error: infer E } ? E : never;

/**
 * Every method's own union is spelled out below, expanded member by member:
 * the point of this file is that the base aliases in `types.ts` cannot gain
 * or lose a member without the signatures moving with them, so nothing here is
 * allowed to abbreviate through those aliases.
 */
describe("every prepare method names exactly its own errors", () => {
  it("the LP flows answer with the unroutable pair and the read that failed", () => {
    expectTypeOf<Awaited<ReturnType<P["deposit"]>>>().toEqualTypeOf<
      SDKReturn<LpResult, UnsupportedTokenPairError | UnexpectedFailureError>
    >();
    expectTypeOf<Awaited<ReturnType<P["withdraw"]>>>().toEqualTypeOf<
      SDKReturn<LpResult, UnsupportedTokenPairError | UnexpectedFailureError>
    >();
    expectTypeOf<Awaited<ReturnType<P["redeem"]>>>().toEqualTypeOf<
      SDKReturn<LpResult, UnsupportedTokenPairError | UnexpectedFailureError>
    >();
  });

  it("openNewStrategy: the open-flow guards plus the opening's own codes", () => {
    expectTypeOf<Awaited<ReturnType<P["openNewStrategy"]>>>().toEqualTypeOf<
      SDKReturn<
        OpenStrategyResult,
        | CreditManagerPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientBalanceError
        | UnexpectedFailureError
        | DebtOutOfRangeError
        | LeverageOutOfRangeError
        | UnsupportedTokenPairError
        | InsufficientPoolLiquidityError
        | NoStrategyTargetCollateralError
      >
    >();
  });

  it("depositStrategy: the account-flow guards plus the borrow leg's codes", () => {
    expectTypeOf<Awaited<ReturnType<P["depositStrategy"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyResult,
        | CreditManagerPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientBalanceError
        | CreditAccountNotFoundError
        | UnexpectedFailureError
        | DebtOutOfRangeError
        | LeverageOutOfRangeError
        | UnsupportedCollateralTokenError
        | UnsupportedTokenPairError
        | InsufficientPoolLiquidityError
      >
    >();
  });

  it("repayStrategy: the account-flow guards, debtLimits and the funding token", () => {
    expectTypeOf<Awaited<ReturnType<P["repayStrategy"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyResult,
        | CreditManagerPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientBalanceError
        | CreditAccountNotFoundError
        | UnexpectedFailureError
        | DebtOutOfRangeError
        | UnsupportedCollateralTokenError
      >
    >();
  });

  it("addCollateral and withdrawCollateral: the account-flow guards alone", () => {
    expectTypeOf<Awaited<ReturnType<P["addCollateral"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyResult,
        | CreditManagerPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientBalanceError
        | CreditAccountNotFoundError
        | UnexpectedFailureError
      >
    >();
    expectTypeOf<Awaited<ReturnType<P["withdrawCollateral"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyResult,
        | CreditManagerPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientBalanceError
        | CreditAccountNotFoundError
        | UnexpectedFailureError
      >
    >();
  });

  it("withdrawStrategy: the two-route flow, every error carrying `errors`", () => {
    expectTypeOf<Awaited<ReturnType<P["withdrawStrategy"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyRoutesResult,
        (
          | CreditManagerPausedError
          | MarketExpiredError
          | ForbiddenTokenError
          | QuotaLimitReachedError
          | InsufficientCollateralError
          | InsufficientBalanceError
          | CreditAccountNotFoundError
          | UnexpectedFailureError
          | DebtOutOfRangeError
          | UnsupportedTokenPairError
          | NoDelayedRouteError
          | MultipleDelayedWithdrawalsError
          | WithdrawalInProgressError
        ) &
          WithRouteErrors
      >
    >();
  });

  it("adjustLeverage: the widest union — both routes plus the borrow leg", () => {
    expectTypeOf<Awaited<ReturnType<P["adjustLeverage"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyRoutesResult,
        (
          | CreditManagerPausedError
          | MarketExpiredError
          | ForbiddenTokenError
          | QuotaLimitReachedError
          | InsufficientCollateralError
          | InsufficientBalanceError
          | CreditAccountNotFoundError
          | UnexpectedFailureError
          | DebtOutOfRangeError
          | UnsupportedTokenPairError
          | NoDelayedRouteError
          | MultipleDelayedWithdrawalsError
          | WithdrawalInProgressError
          | InsufficientPoolLiquidityError
          | LeverageOutOfRangeError
        ) &
          WithRouteErrors
      >
    >();
  });

  it("finalize: the account-flow guards plus the tail's own codes", () => {
    expectTypeOf<Awaited<ReturnType<P["finalize"]>>>().toEqualTypeOf<
      SDKReturn<
        FinalizeResult,
        | CreditManagerPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientBalanceError
        | CreditAccountNotFoundError
        | UnexpectedFailureError
        | NoRecordedIntentError
        | NoDelayedRouteError
        | WithdrawalInProgressError
        | UnsupportedTokenPairError
      >
    >();
  });
});

describe("the preview-only codes appear in no prepare union", () => {
  /** Everything any prepare method can put in its failure half. */
  type AnyPrepareError =
    | ErrorOf<Awaited<ReturnType<P["deposit"]>>>
    | ErrorOf<Awaited<ReturnType<P["withdraw"]>>>
    | ErrorOf<Awaited<ReturnType<P["redeem"]>>>
    | ErrorOf<Awaited<ReturnType<P["openNewStrategy"]>>>
    | ErrorOf<Awaited<ReturnType<P["depositStrategy"]>>>
    | ErrorOf<Awaited<ReturnType<P["repayStrategy"]>>>
    | ErrorOf<Awaited<ReturnType<P["addCollateral"]>>>
    | ErrorOf<Awaited<ReturnType<P["withdrawCollateral"]>>>
    | ErrorOf<Awaited<ReturnType<P["withdrawStrategy"]>>>
    | ErrorOf<Awaited<ReturnType<P["adjustLeverage"]>>>
    | ErrorOf<Awaited<ReturnType<P["finalize"]>>>;

  it("poolSunset, quotaCountExceeded and malformedTransaction stay preview's", () => {
    // @ts-expect-error poolSunset judges a deposit already sent, not a request
    const _sunset: AnyPrepareError = {} as PoolSunsetError;
    // @ts-expect-error quotaCountExceeded is the replay's error, not prepare's
    const _count: AnyPrepareError = {} as QuotaCountExceededError;
    // @ts-expect-error malformedTransaction can only be said of calldata handed in
    const _malformed: AnyPrepareError = {} as MalformedTransactionError;
    void _sunset;
    void _count;
    void _malformed;
  });
});

describe("narrowing the envelope settles which half is there", () => {
  it("ok narrows to the result, and the result is stamped", () => {
    const lp = {} as Awaited<ReturnType<P["deposit"]>>;
    if (lp.ok) {
      expectTypeOf(lp.data).toEqualTypeOf<LpResult>();
    }

    const strategy = {} as Awaited<ReturnType<P["depositStrategy"]>>;
    if (strategy.ok) {
      expectTypeOf(strategy.data).toEqualTypeOf<StrategyResult>();
    } else {
      expectTypeOf(strategy.error).toExtend<IGearboxError>();
    }

    const routes = {} as Awaited<ReturnType<P["withdrawStrategy"]>>;
    if (routes.ok) {
      expectTypeOf(routes.data).toEqualTypeOf<StrategyRoutesResult>();
    } else {
      expectTypeOf(routes.error.errors).toExtend<object>();
    }

    const open = {} as Awaited<ReturnType<P["openNewStrategy"]>>;
    if (open.ok) {
      expectTypeOf(open.data).toEqualTypeOf<OpenStrategyResult>();
    }
  });

  it("every result names the block it was computed from", () => {
    expectTypeOf<LpResult["blockNumber"]>().toEqualTypeOf<number>();
    expectTypeOf<LpResult["timestamp"]>().toEqualTypeOf<number>();
    expectTypeOf<StrategyResult["blockNumber"]>().toEqualTypeOf<number>();
    expectTypeOf<StrategyRoutesResult["timestamp"]>().toEqualTypeOf<number>();
    expectTypeOf<OpenStrategyResult["blockNumber"]>().toEqualTypeOf<number>();
  });
});

describe("the reads outside the envelope stay bare", () => {
  it("the withdraw ceiling names both ends of the scale", () => {
    expectTypeOf<WithdrawCeilings["partial"]>().toEqualTypeOf<bigint>();
    expectTypeOf<WithdrawCeilings["exit"]>().toEqualTypeOf<bigint>();
  });

  it("the max* ceilings answer bare numbers or throw", () => {
    expectTypeOf<ReturnType<P["maxWithdraw"]>>().toEqualTypeOf<
      Promise<WithdrawCeilings>
    >();
    expectTypeOf<ReturnType<P["maxRepay"]>>().toEqualTypeOf<Promise<bigint>>();
    expectTypeOf<ReturnType<P["maxWithdrawCollateral"]>>().toEqualTypeOf<
      Promise<bigint>
    >();
  });

  it("the synchronous readers answer their values outright", () => {
    expectTypeOf<ReturnType<P["leverageBand"]>>().toEqualTypeOf<
      LeverageBand | undefined
    >();
    expectTypeOf<ReturnType<P["withdrawableCollaterals"]>>().toEqualTypeOf<
      PositionCollateral[]
    >();
  });
});

describe("I7: prepare error shapes are narrowed to what the trace proves", () => {
  it("creditManagerPaused from prepare always names the credit manager, never a pool", () => {
    expectTypeOf<
      CreditManagerPausedError["creditManager"]
    >().toEqualTypeOf<Address>();
    if (Math.abs(0) !== 0) {
      const paused = {} as CreditManagerPausedError;
      // @ts-expect-error the pool-paused variant is preview-only
      void paused.pool;
    }
  });
});
