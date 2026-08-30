# Preview type renames (v16 next)

Applied in `src/preview/preview/previewPoolPositionOperation.ts` and
`src/preview/preview/previewExitOrRepayStrategyPosition.ts` — the two files
that kept the old names after the model was renamed in commit 7d00fb38.

| old | new |
|---|---|
| PoolPositionOperationPreview | PreviewLpVerify |
| OpenStrategyPositionPreview | PreviewOpenStrategyVerify |
| AdjustStrategyPositionPreview | PreviewAdjustStrategyVerify |
| ExitStrategyPositionPreview | PreviewExitStrategyVerify |
| RepayStrategyPositionPreview | PreviewRepayStrategyVerify |
| InstantStrategyPositionOperationPreview | PreviewInstantStrategyVerify |
| DelayedStrategyPositionOperationPreview | PreviewDelayedStrategyVerify |
