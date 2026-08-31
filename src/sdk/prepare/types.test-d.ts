import type { Address } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  IGearboxError,
  PositionCollateral,
  SDKReturn,
} from "../../model/index.js";
import type {
  CreditAccountNotFoundError,
  DebtOutOfRangeError,
  ForbiddenTokenError,
  InsufficientCollateralError,
  InsufficientPoolLiquidityError,
  InsufficientSourceBalanceError,
  LeverageOutOfRangeError,
  MalformedTransactionError,
  MarketExpiredError,
  MarketPausedError,
  MultipleDelayedWithdrawalsError,
  NoDelayedRouteError,
  NoRecordedIntentError,
  NoStrategyTargetCollateralError,
  PoolSunsetError,
  QuotaCountExceededError,
  QuotaLimitReachedError,
  UnexpectedFailureError,
  UnsupportedCollateralTokenError,
  UnsupportedTokenPairError,
  WithdrawalInProgressError,
  WithRouteRefusals,
} from "./errors.js";
import type {
  FinalizeResult,
  IOpportunitiesPrepare,
  LeverageBand,
  LpResult,
  OpenStrategyResult,
  StrategyResult,
  StrategyRoutesResult,
} from "./types.js";

type P = IOpportunitiesPrepare;

/**
 * The failure half a method's answer names — `never` for one that cannot be
 * refused, which is what keeps the negative probes below honest.
 */
type RefusalOf<T> = T extends { ok: false; error: infer E } ? E : never;

/**
 * Every method's own union is spelled out below, expanded member by member:
 * the point of this file is that the base aliases in `errors.ts` cannot gain
 * or lose a member without the signatures moving with them, so nothing here is
 * allowed to abbreviate through those aliases.
 */
describe("every prepare method names exactly its own refusals", () => {
  it("the LP flows refuse with the unroutable pair alone, synchronously", () => {
    expectTypeOf<ReturnType<P["deposit"]>>().toEqualTypeOf<
      SDKReturn<LpResult, UnsupportedTokenPairError>
    >();
    expectTypeOf<ReturnType<P["withdraw"]>>().toEqualTypeOf<
      SDKReturn<LpResult, UnsupportedTokenPairError>
    >();
    expectTypeOf<ReturnType<P["redeem"]>>().toEqualTypeOf<
      SDKReturn<LpResult, UnsupportedTokenPairError>
    >();
  });

  it("openNewStrategy: the open-flow guards plus the opening's own codes", () => {
    expectTypeOf<Awaited<ReturnType<P["openNewStrategy"]>>>().toEqualTypeOf<
      SDKReturn<
        OpenStrategyResult,
        | MarketPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientSourceBalanceError
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
        | MarketPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientSourceBalanceError
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

  it("repayStrategy: the account-flow guards, the band and the funding token", () => {
    expectTypeOf<Awaited<ReturnType<P["repayStrategy"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyResult,
        | MarketPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientSourceBalanceError
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
        | MarketPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientSourceBalanceError
        | CreditAccountNotFoundError
        | UnexpectedFailureError
      >
    >();
    expectTypeOf<Awaited<ReturnType<P["withdrawCollateral"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyResult,
        | MarketPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientSourceBalanceError
        | CreditAccountNotFoundError
        | UnexpectedFailureError
      >
    >();
  });

  it("withdrawStrategy: the two-route flow, every refusal carrying `refused`", () => {
    expectTypeOf<Awaited<ReturnType<P["withdrawStrategy"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyRoutesResult,
        (
          | MarketPausedError
          | MarketExpiredError
          | ForbiddenTokenError
          | QuotaLimitReachedError
          | InsufficientCollateralError
          | InsufficientSourceBalanceError
          | CreditAccountNotFoundError
          | UnexpectedFailureError
          | DebtOutOfRangeError
          | UnsupportedTokenPairError
          | NoDelayedRouteError
          | MultipleDelayedWithdrawalsError
          | WithdrawalInProgressError
        ) &
          WithRouteRefusals
      >
    >();
  });

  it("adjustLeverage: the widest union — both routes plus the borrow leg", () => {
    expectTypeOf<Awaited<ReturnType<P["adjustLeverage"]>>>().toEqualTypeOf<
      SDKReturn<
        StrategyRoutesResult,
        (
          | MarketPausedError
          | MarketExpiredError
          | ForbiddenTokenError
          | QuotaLimitReachedError
          | InsufficientCollateralError
          | InsufficientSourceBalanceError
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
          WithRouteRefusals
      >
    >();
  });

  it("finalize: the account-flow guards plus the tail's own codes", () => {
    expectTypeOf<Awaited<ReturnType<P["finalize"]>>>().toEqualTypeOf<
      SDKReturn<
        FinalizeResult,
        | MarketPausedError
        | MarketExpiredError
        | ForbiddenTokenError
        | QuotaLimitReachedError
        | InsufficientCollateralError
        | InsufficientSourceBalanceError
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
  type AnyPrepareRefusal =
    | RefusalOf<ReturnType<P["deposit"]>>
    | RefusalOf<ReturnType<P["withdraw"]>>
    | RefusalOf<ReturnType<P["redeem"]>>
    | RefusalOf<Awaited<ReturnType<P["openNewStrategy"]>>>
    | RefusalOf<Awaited<ReturnType<P["depositStrategy"]>>>
    | RefusalOf<Awaited<ReturnType<P["repayStrategy"]>>>
    | RefusalOf<Awaited<ReturnType<P["addCollateral"]>>>
    | RefusalOf<Awaited<ReturnType<P["withdrawCollateral"]>>>
    | RefusalOf<Awaited<ReturnType<P["withdrawStrategy"]>>>
    | RefusalOf<Awaited<ReturnType<P["adjustLeverage"]>>>
    | RefusalOf<Awaited<ReturnType<P["finalize"]>>>;

  it("poolSunset, quotaCountExceeded and malformedTransaction stay preview's", () => {
    // @ts-expect-error poolSunset judges a deposit already sent, not a request
    const _sunset: AnyPrepareRefusal = {} as PoolSunsetError;
    // @ts-expect-error quotaCountExceeded is the replay's refusal, not prepare's
    const _count: AnyPrepareRefusal = {} as QuotaCountExceededError;
    // @ts-expect-error malformedTransaction can only be said of calldata handed in
    const _malformed: AnyPrepareRefusal = {} as MalformedTransactionError;
    void _sunset;
    void _count;
    void _malformed;
  });
});

describe("narrowing the envelope settles which half is there", () => {
  it("ok narrows to the result, and the result is stamped", () => {
    const lp = {} as ReturnType<P["deposit"]>;
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
      expectTypeOf(routes.error.refused).toExtend<object>();
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
  it("the max* ceilings answer a bigint or throw", () => {
    expectTypeOf<ReturnType<P["maxWithdraw"]>>().toEqualTypeOf<
      Promise<bigint>
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
  it("marketPaused from prepare always names the credit manager, never a pool", () => {
    expectTypeOf<MarketPausedError["creditManager"]>().toEqualTypeOf<Address>();
    if (Math.abs(0) !== 0) {
      const paused = {} as MarketPausedError;
      // @ts-expect-error the pool-paused variant is preview-only
      void paused.pool;
    }
  });
});
