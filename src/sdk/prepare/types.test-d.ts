import type { Address } from "viem";
import { describe, expectTypeOf, it } from "vitest";

/** Any address; the reuse case below only needs the field to be present. */
const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

import type {
  CreditAccountNotEmptyError,
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
  PoolPausedError,
  PoolSunsetError,
  PositionCollateral,
  QuotaCountExceededError,
  QuotaLimitReachedError,
  ReservePriceLimitedError,
  SDKReturn,
  UnexpectedFailureError,
  UnsupportedCollateralTokenError,
  UnsupportedTokenPairError,
  WithdrawalInProgressError,
} from "../../model/index.js";
import type { Asset } from "../../onchain/index.js";
import type {
  FinalizeResult,
  IOpportunitiesPrepare,
  LeverageBand,
  LpResult,
  OpenStrategyEmptyParams,
  OpenStrategyParams,
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
  it("the LP flows answer the unroutable pair, the failed read and the pool's own state", () => {
    // The pool's three refusals ride along because `prepare` reads the pool
    // before it hands back a signable transaction, the way the credit walk
    // reads the facade.
    type LpErrors =
      | UnsupportedTokenPairError
      | UnexpectedFailureError
      | PoolPausedError
      | PoolSunsetError
      | InsufficientPoolLiquidityError;

    expectTypeOf<Awaited<ReturnType<P["deposit"]>>>().toEqualTypeOf<
      SDKReturn<LpResult, LpErrors>
    >();
    expectTypeOf<Awaited<ReturnType<P["withdraw"]>>>().toEqualTypeOf<
      SDKReturn<LpResult, LpErrors>
    >();
    expectTypeOf<Awaited<ReturnType<P["redeem"]>>>().toEqualTypeOf<
      SDKReturn<LpResult, LpErrors>
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
        | CreditAccountNotFoundError
        | CreditAccountNotEmptyError
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
        | ReservePriceLimitedError
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
        | ReservePriceLimitedError
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
        | ReservePriceLimitedError
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
        | ReservePriceLimitedError
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
          | ReservePriceLimitedError
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
          | ReservePriceLimitedError
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
        | ReservePriceLimitedError
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

  it("quotaCountExceeded and malformedTransaction stay preview's", () => {
    // @ts-expect-error quotaCountExceeded is the replay's error, not prepare's
    const _count: AnyPrepareError = {} as QuotaCountExceededError;
    // @ts-expect-error malformedTransaction can only be said of calldata handed in
    const _malformed: AnyPrepareError = {} as MalformedTransactionError;
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

/**
 * The empty opening used to be policed at runtime: the flag was optional on one
 * flat shape, so `{ empty: true, creditAccount }` typechecked and had to be
 * refused with `emptyOpenTakesNothing`. The union says it instead, which is why
 * that error no longer exists.
 */
describe("an empty opening takes nothing, and the type is what says so", () => {
  it("names the market, and names the rest only to refuse them", () => {
    expectTypeOf<OpenStrategyEmptyParams["empty"]>().toEqualTypeOf<true>();
    expectTypeOf<OpenStrategyEmptyParams["collateral"]>().toEqualTypeOf<
      undefined | never
    >();
    expectTypeOf<OpenStrategyEmptyParams["leverage"]>().toEqualTypeOf<
      undefined | never
    >();
    expectTypeOf<OpenStrategyEmptyParams["creditAccount"]>().toEqualTypeOf<
      undefined | never
    >();
  });

  it("refuses what an empty opening would have had to drop", () => {
    // @ts-expect-error collateral it meant to spend
    const _collateral: OpenStrategyParams = { empty: true, collateral: [] };
    // @ts-expect-error an account it meant to reuse
    const _account: OpenStrategyParams = { empty: true, creditAccount: WALLET };
    // @ts-expect-error a leverage it asked to reach
    const _leverage: OpenStrategyParams = { empty: true, leverage: 300n };
    void _collateral;
    void _account;
    void _leverage;
  });

  /**
   * The case the literals above cannot reach. Excess-property checking is a
   * freshness rule, so a bare `{ empty: true }` would let params built up in a
   * variable — which is how a form builds them — carry collateral or an account
   * straight past the type and have them dropped at runtime. Only the `never`
   * members refuse this.
   */
  it("refuses them built up rather than written out", () => {
    const built = {
      empty: true as const,
      collateral: [] as Asset[],
      creditAccount: WALLET,
      leverage: 300n,
    };
    // @ts-expect-error the extra members survive into the assignment
    const _built: OpenStrategyParams = built;
    // @ts-expect-error and through a spread
    const _spread: OpenStrategyParams = { ...built };
    void _built;
    void _spread;
  });

  /** A checkbox gives `boolean`, which neither branch accepts. */
  it("refuses a flag that has not been narrowed", () => {
    const toggled = {
      empty: true as boolean,
      collateral: [] as Asset[],
      leverage: 300n,
    };
    // @ts-expect-error `empty: boolean` is neither `true` nor `false | undefined`
    const _toggled: OpenStrategyParams = toggled;
    void _toggled;
  });

  it("still asks a funded opening for its collateral and leverage", () => {
    // @ts-expect-error a funded opening is not a market on its own
    const _bare: OpenStrategyParams = {};
    void _bare;
  });
});
