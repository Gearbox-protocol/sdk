# Delivery evidence — preview errors cleanup (D1)

All runs on `feat/verdict-shim-removal`, Node 22 lane, after stage D1-S2.
The probe target is the compile-total code map inside
`isPreviewOperationError` (src/preview/preview/previewOperation.ts).

## Poison A — a member added to the union

Edit: appended `| { code: "poisonProbe"; message: string }` to
`PreviewOperationError`. `bun run agent:typecheck` fails (3 diagnostics —
the map itself plus both test-d exactness probes):

```
src/preview/preview/previewOperation.ts(58,7): error TS2741: Property 'poisonProbe' is missing in type '{ unsupportedTarget: true; unsupportedPoolFunction: true; unsupportedZapperFunction: true; unsupportedOperation: true; invalidDelayedIntent: true; previewSimulationFailed: true; }' but required in type 'Record<"invalidDelayedIntent" | "poisonProbe" | "previewSimulationFailed" | "unsupportedOperation" | "unsupportedPoolFunction" | "unsupportedTarget" | "unsupportedZapperFunction", true>'.
src/preview/preview/previewOperation.test-d.ts(61,7): error TS2344: Type 'SDKReturn<OperationPreview, ...>' does not satisfy the constraint '{ data: never; error: never; ok: boolean; }'.
src/preview/preview/previewOperation.test-d.ts(84,9): error TS2344: ... 'Expected: literal string: invalidDelayedIntent, Actual: literal string: poisonProbe' ...
```

## Poison B — a member removed from the union

Edit: dropped `| PreviewSimulationError` from `PreviewOperationError`.
`bun run agent:typecheck` fails (3 diagnostics):

```
src/preview/preview/previewOperation.ts(65,3): error TS2353: Object literal may only specify known properties, and 'previewSimulationFailed' does not exist in type 'Record<"invalidDelayedIntent" | "unsupportedOperation" | "unsupportedPoolFunction" | "unsupportedTarget" | "unsupportedZapperFunction", true>'.
src/preview/preview/previewOperation.test-d.ts(61,7): error TS2344: Type 'SDKReturn<OperationPreview, ...>' does not satisfy the constraint '{ data: never; error: never; ok: boolean; }'.
src/preview/preview/previewOperation.test-d.ts(84,9): error TS2344: ... 'Expected: literal string: previewSimulationFailed, Actual: never' ...
```

## Restoration

After each poison: `git checkout src/preview/preview/previewOperation.ts`;
`git diff` against HEAD is empty — the tree is restored byte-exact, and
`bun run agent:typecheck` exits 0.

## Cold gate

`rm -rf node_modules && bun run agent:install && bun run agent:verify:pr`
— result recorded in the stage D1-S3 row.
