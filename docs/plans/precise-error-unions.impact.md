# Consumer impact — precise-error-unions (measured 2026-08-30)

Method: the branch's built `dist` was linked over each consumer's installed
`@gearbox-protocol/sdk` (original kept as `dist.deptrack-orig`), then the
consumer's own `tsc --noEmit` ran; impact is the delta against the same
run on the unlinked baseline.

## gearbox-backend — zero new errors

Baseline: 262 pre-existing errors (its checkout still pins
`16.0.0-next.17`, whose declarations lack the `/onchain` entrypoint —
unrelated to this Delivery). After linking: 260; the
line-level delta of NEW errors is empty. The backend does not consume the
prepare/preview facade — the deptrack graph predicted this and the
typecheck confirms it. **D3 does not open.**

## client-v3 — 34 errors in 7 files (the D2 work list)

Measured in the `feat/sdk-facade-type-safety` worktree (clean baseline,
zero errors before the link). Every line below is a real `tsc` diagnostic
against the new sdk shape:

```
src/features/strategy/common/AccountDialogFrame.tsx(1,15): error TS2305: Module '"@gearbox-protocol/sdk"' has no exported member 'StrategyRoutesPrepare'.
src/features/tx-preview/entry/TransactionConfirmFlow.tsx(48,56): error TS2345: Argument of type 'SDKReturn<OperationPreview, PreviewVerdictError> | null | undefined' is not assignable to parameter of type 'InterfaceOperation'.
src/features/tx-preview/entry/TransactionConfirmFlow.tsx(81,57): error TS2345: Argument of type 'SDKReturn<OperationPreview, PreviewVerdictError> | null | undefined' is not assignable to parameter of type 'InterfaceOperation'.
src/features/tx-preview/entry/TransactionConfirmFlow.tsx(97,58): error TS2345: Argument of type 'SDKReturn<OperationPreview, PreviewVerdictError> | null | undefined' is not assignable to parameter of type 'InterfaceOperation'.
src/features/tx-preview/entry/TransactionConfirmFlow.tsx(113,58): error TS2345: Argument of type 'SDKReturn<OperationPreview, PreviewVerdictError> | null | undefined' is not assignable to parameter of type 'InterfaceOperation'.
src/features/tx-preview/entry/TransactionConfirmFlow.tsx(129,60): error TS2345: Argument of type 'SDKReturn<OperationPreview, PreviewVerdictError> | null | undefined' is not assignable to parameter of type 'InterfaceOperation'.
src/features/tx-preview/entry/TransactionConfirmFlow.tsx(147,65): error TS2345: Argument of type 'SDKReturn<OperationPreview, PreviewVerdictError> | null | undefined' is not assignable to parameter of type 'InterfaceOperation'.
src/features/tx-preview/entry/useTransactionConfirmPreflight.ts(29,41): error TS2345: Argument of type 'SDKReturn<OperationPreview, PreviewVerdictError> | null | undefined' is not assignable to parameter of type 'InterfaceOperation'.
src/hooks/delayedWithdrawal/useClaimDelayedWithdrawal.ts(46,11): error TS2345: Argument of type 'SDKReturn<StrategyResult, UnsupportedTokenPairError | AccountFlowError | NoDelayedRouteError | WithdrawalInProgressError | NoRecordedIntentError>' is not assignable to parameter of type 'DataResponse<unknown>'.
src/hooks/delayedWithdrawal/useClaimDelayedWithdrawal.ts(55,14): error TS18046: 'sim' is of type 'unknown'.
src/hooks/delayedWithdrawal/useClaimDelayedWithdrawal.ts(55,24): error TS18046: 'sim' is of type 'unknown'.
src/hooks/delayedWithdrawal/useClaimDelayedWithdrawal.ts(57,13): error TS2345: Argument of type 'SDKReturn<StrategyResult, UnsupportedTokenPairError | AccountFlowError | NoDelayedRouteError | WithdrawalInProgressError | NoRecordedIntentError>' is not assignable to parameter of type 'DataResponse<unknown>'.
src/hooks/delayedWithdrawal/useClaimDelayedWithdrawal.ts(64,14): error TS18046: 'sim' is of type 'unknown'.
src/hooks/delayedWithdrawal/useClaimDelayedWithdrawal.ts(67,37): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'PreviewIssue'.
src/hooks/delayedWithdrawal/useClaimDelayedWithdrawal.ts(83,11): error TS2322: Type 'unknown' is not assignable to type 'SDKResult<LpResult> | SDKResult<OpenStrategyResult> | SDKResult<StrategyResult>'.
src/hooks/execute/useExecute.spec.tsx(62,7): error TS2353: Object literal may only specify known properties, and 'operations' does not exist in type 'SDKResult<LpResult> | SDKResult<OpenStrategyResult> | SDKResult<StrategyResult>'.
src/hooks/execute/useExecute.spec.tsx(82,7): error TS2353: Object literal may only specify known properties, and 'state' does not exist in type 'SDKResult<LpResult> | SDKResult<OpenStrategyResult> | SDKResult<StrategyResult>'.
src/hooks/sdk/index.tsx(9,3): error TS2305: Module '"@gearbox-protocol/sdk"' has no exported member 'LpPrepare'.
src/hooks/sdk/index.tsx(11,3): error TS2724: '"@gearbox-protocol/sdk"' has no exported member named 'OpenStrategyPrepare'. Did you mean 'OpenStrategyParams'?
src/hooks/sdk/index.tsx(15,3): error TS2305: Module '"@gearbox-protocol/sdk"' has no exported member 'StrategyPrepare'.
src/hooks/simulate/useSimulate.ts(3,3): error TS2305: Module '"@gearbox-protocol/sdk"' has no exported member 'StrategyRoutesPrepare'.
src/hooks/simulate/useSimulate.ts(205,9): error TS2345: Argument of type 'SDKReturn<OpenStrategyResult, UnsupportedTokenPairError | OpenFlowError | DebtOutOfRangeError | LeverageOutOfRangeError | InsufficientPoolLiquidityError | NoStrategyTargetCollateralError>' is not assignable to parameter of type 'DataResponse<unknown>'.
src/hooks/simulate/useSimulate.ts(274,5): error TS2322: Type 'Promise<SDKReturn<StrategyResult, UnsupportedTokenPairError | DebtOutOfRangeError | LeverageOutOfRangeError | InsufficientPoolLiquidityError | AccountFlowError | UnsupportedCollateralTokenError>>' is not assignable to type 'Promise<DataResponse<StrategyPrepare>>'.
src/hooks/simulate/useSimulate.ts(276,5): error TS2322: Type 'Promise<SDKReturn<StrategyRoutesResult, (UnsupportedTokenPairError | DebtOutOfRangeError | AccountFlowError | NoDelayedRouteError | MultipleDelayedWithdrawalsError | WithdrawalInProgressError) & WithRouteRefusals>>' is not assignable to type 'Promise<DataResponse<StrategyRoutesPrepare>>'.
src/hooks/simulate/useSimulate.ts(278,5): error TS2322: Type 'Promise<SDKReturn<StrategyResult, DebtOutOfRangeError | AccountFlowError | UnsupportedCollateralTokenError>>' is not assignable to type 'Promise<DataResponse<StrategyPrepare>>'.
src/hooks/simulate/useSimulate.ts(280,5): error TS2322: Type 'Promise<SDKReturn<StrategyRoutesResult, (UnsupportedTokenPairError | DebtOutOfRangeError | LeverageOutOfRangeError | ... 4 more ... | WithdrawalInProgressError) & WithRouteRefusals>>' is not assignable to type 'Promise<DataResponse<StrategyRoutesPrepare>>'.
src/hooks/simulate/useSimulate.ts(285,5): error TS2322: Type 'Promise<SDKReturn<StrategyResult, AccountFlowError>>' is not assignable to type 'Promise<DataResponse<StrategyPrepare>>'.
src/hooks/simulate/useSimulate.ts(287,5): error TS2322: Type 'Promise<SDKReturn<StrategyResult, AccountFlowError>>' is not assignable to type 'Promise<DataResponse<StrategyPrepare>>'.
src/hooks/simulate/useSimulate.ts(385,14): error TS2345: Argument of type 'bigint' is not assignable to parameter of type 'DataResponse<unknown>'.
src/hooks/simulate/useSimulate.ts(387,3): error TS2322: Type 'unknown' is not assignable to type 'bigint | undefined'.
src/hooks/simulate/useSimulate.ts(433,9): error TS2345: Argument of type 'bigint' is not assignable to parameter of type 'DataResponse<unknown>'.
src/hooks/simulate/useSimulate.ts(441,3): error TS2322: Type 'unknown' is not assignable to type 'bigint | undefined'.
src/hooks/simulate/useSimulate.ts(460,14): error TS2345: Argument of type 'bigint' is not assignable to parameter of type 'DataResponse<unknown>'.
src/hooks/simulate/useSimulate.ts(462,3): error TS2322: Type 'unknown' is not assignable to type 'bigint | undefined'.
```

Grouped: `src/hooks/simulate/useSimulate.ts` (14), 
`src/hooks/delayedWithdrawal/useClaimDelayedWithdrawal.ts` (7),
`src/features/tx-preview/entry/TransactionConfirmFlow.tsx` (6),
`src/hooks/sdk/index.tsx` (3), `src/hooks/execute/useExecute.spec.tsx` (2),
`src/features/tx-preview/entry/useTransactionConfirmPreflight.ts` (1),
`src/features/strategy/common/AccountDialogFrame.tsx` (1).

This list seeds the D2 plan (`client-v3` repo, its own planctl plan):
mechanical `ok`/`isSDKError` narrowing, `*Prepare`→`SDKReturn<*Result,…>`
type swaps in the re-export barrel, and `unwrap` retirement — plus the
client-side machinery updates (`STRATEGY_INVOKERS`, `errorScenarios`
catalog, `issueCopy` adapter for the flat error objects).
