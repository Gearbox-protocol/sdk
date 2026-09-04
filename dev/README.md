# Internal maintainer tooling

This directory holds **dev-only** scripts and CLIs used by Gearbox maintainers
to generate fixtures, decode multicalls, and compare transactions.

It is **not** part of the published `@gearbox-protocol/sdk` npm package
(only `dist/` is shipped). Do not import anything from here in application
code or treat it as a public API.

| Path | Purpose |
| --- | --- |
| `scripts/` | One-off / fixture-generation scripts (RWA delayed, e2e, preview, …) |
| `txdiff/` | Generic multicall decode + transaction-dump diff CLI |

Routine fixture regeneration is validated by the tests that consume the
fixtures and by reviewing the git diff. A frontend TxDump is optional and may
no longer exist.

When creating or changing a generator to imitate frontend transaction
assembly, obtain a frontend TxDump first and require the generated transaction
composition to match with `pnpm tx:diff`.

Cursor skills for these workflows live under `.cursor/skills/dev/` (see
[nested skill directories](https://cursor.com/docs/skills#nested-skill-directories)).
