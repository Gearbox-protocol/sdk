# Delivery evidence — preview errors cleanup (D1)

All runs on `feat/verdict-shim-removal`, Node 22 lane. After the owner's
review rounds the surface is: interfaces alone, raise sites RETURN
`satisfies`-literals end to end — nothing throws a refusal and nothing
catches one; the probe anchors live in previewOperation.test-d.ts.

## Poison A — a member added to the union

Edit: appended `| { code: "poisonProbe"; message: string }` to
`PreviewOperationError`. `bun run agent:typecheck` fails at both test-d
exactness probes:

```
src/preview/preview/previewOperation.test-d.ts(61,7): error TS2344: Type 'SDKReturn<OperationPreview, ...>' does not satisfy the constraint '{ data: never; error: never; ok: boolean; }'.
src/preview/preview/previewOperation.test-d.ts(84,9): error TS2344: ... 'Expected: literal string: invalidDelayedIntent, Actual: literal string: poisonProbe' ...
```

## Poison B — a member removed from the union

Edit: dropped `| PreviewSimulationError` from `PreviewOperationError`.
`bun run agent:typecheck` fails at the probes AND inside the return-based
pipeline itself (the pool branch's envelope no longer composes):

```
src/preview/preview/previewOperation.test-d.ts(61,7): error TS2344: ...
src/preview/preview/previewOperation.test-d.ts(84,9): error TS2344: ... 'Actual: never' ...
src/preview/preview/previewOperation.ts(70,5): error TS2322: Type 'SDKReturn<PoolPositionOperationPreview, PreviewSimulationError>' is not assignable to type 'SDKReturn<OperationPreview, PreviewOperationError>'.
```

## Restoration

After each poison the file was restored from a byte-exact backup (`cmp`
clean) and `bun run agent:typecheck` exits 0.

## Cold gate

`rm -rf node_modules && bun run agent:install && bun run agent:verify:pr`
— result recorded in the stage D1-S3 row (the return-based rework re-ran
the full unit lane: 2337 passed / 1 todo, typecheck clean).
