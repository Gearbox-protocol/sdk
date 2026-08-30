# D1-S8 delivery gate evidence (2026-08-30)

## Poison A — a code without a raise site cannot join a union

`PoolSunsetError` appended to `addCollateral`'s inline union in
src/sdk/prepare/types.ts. `tsc --noEmit`: 5 errors — the exactness
assertions in types.test-d.ts fire immediately:

```
src/sdk/prepare/types.test-d.ts(128,7): error TS2344: Type 'SDKReturn<StrategyResult, CreditAccountNotFoundError | ForbiddenTokenError | InsufficientCollateralError | ... 4 more ... | UnexpectedFailureError>' does not satisfy the constraint '{ data: never; error: never; ok: boolean; }'.
src/sdk/prepare/types.test-d.ts(242,5): error TS2578: Unused '@ts-expect-error' directive.
src/sdk/prepare/types.test-d.ts(244,5): error TS2578: Unused '@ts-expect-error' directive.
```

## Poison B — a real member cannot silently leave

`UnsupportedCollateralTokenError` removed from `repayStrategy`'s union.
`tsc --noEmit`: 3 errors — exactness plus the implementation no longer
assignable to the interface:

```
src/sdk/opportunities/OpportunitiesNamespace.ts(101,5): error TS2322: Type 'PrepareApi' is not assignable to type 'IOpportunitiesPrepare'.
src/sdk/prepare/PrepareApi.ts(440,16): error TS2416: Property 'repayStrategy' in type 'PrepareApi' is not assignable to the same property in base type 'IOpportunitiesPrepare'.
src/sdk/prepare/types.test-d.ts(110,7): error TS2344: Type 'SDKReturn<StrategyResult, CreditAccountNotFoundError | DebtOutOfRangeError | ForbiddenTokenError | ... 6 more ... | UnsupportedCollateralTokenError>' does not satisfy the constraint '{ data: never; error: never; ok: boolean; }'.
```

Both edits were temporary, applied to the working tree only and restored
via git checkout; `tsc --noEmit` re-verified clean after each.

## Cold-start gate

`rm -rf node_modules && bun run agent:install && bun run agent:verify:pr`
exits 0: biome clean (after materializing the git-lfs e2e fixtures the
machine had as pointer stubs), tsc 7 clean, **125 test files / 1416 unit
tests passed**, tsdown build produced dist.

## Pack check

`npm pack` installed into a scratch project; a sample narrowing
`addCollateral`'s union against the published d.ts typechecks: `ok`
narrowing reaches `data.blockNumber`, `marketPaused` yields a required
`creditManager`, and a `poolSunset` case is refused by @ts-expect-error.
The first run FAILED — `MarketPausedError` still carried the optional
creditManager/pool pair — which produced the I7 fixup commit; the rerun
prints PACK_CHECK_OK.
