# New SDK — design decisions

Design record for the new product-oriented `GearboxSDK`: a combined entry point that
serves the same read model from onchain data (`MultichainSDK`) and from the backend.

`tmp/agentic-mock3` is the proof of concept this replaces. Treat it as a sketch of the
idea, not as reference code: its capability manifest, entity classes and attach-time
snapshots are explicitly rejected below.

The first namespace to be implemented is `opportunities`. Its read model lives in
`tmp/new-types/types.ts`. This document is namespace-agnostic — it records the rules
every namespace follows.

---

## 1. Public shape

- **Async methods returning plain data.** `await sdk.opportunities.list(props)`, not
  synchronous materialized collections. This matches how the backend works (detail
  endpoints, history, per-wallet queries) and how `LiquidationsService` is already
  written.
- **No entity classes.** POJOs plus canonical ids and explicit lookups. Entity graphs
  with navigation getters are not serialisable (Redux, SSR, `structuredClone`), are hard
  to merge two sources into, and force the whole graph to be resident.
- **Fluent filtering is optional sugar** on top of returned arrays, never the return
  type. Chaining and `await` do not compose.
- **Namespaces are routers.** They pick sources, merge, and wrap in the response
  envelope. They hold no state of their own.

## 2. Mode

`Mode = "onchain" | "offchain" | "both"`, fixed at construction. It is never dynamic —
a backend outage degrades a `both` SDK, it does not turn it into an `onchain` SDK.

Mode gates **method existence only**. Data types are mode-independent (see §3), so
`offchain` and `both` are type-identical.

Three method groups per namespace:

| Group | Available in |
|---|---|
| base reads (both sources can produce) | all modes |
| offchain-only (history, backend-computed values) | `offchain`, `both` |
| onchain-only (needs live chain state) | `onchain`, `both` |

**Transaction builders are assigned per builder, not as a group.** Many can be built from
offchain data alone, and every transaction goes through the preview stage before being sent,
so a malformed or failing one surfaces there rather than silently going out. Whether a given
builder lives in the offchain-capable group or the onchain-only one is a case-by-case call.

Expressed as a lookup map, not conditional types:

```ts
interface OpportunitiesByMode {
  onchain: OpportunitiesBase & OpportunitiesOnchainOnly;
  offchain: OpportunitiesBase & OpportunitiesOffchainOnly;
  both: OpportunitiesBase & OpportunitiesOffchainOnly & OpportunitiesOnchainOnly;
}

type Opportunities<M extends Mode> = OpportunitiesByMode[M];
```

Conditional types (`M extends "onchain" ? ... : ...`) are rejected: they distribute over
a naked type parameter, so gating silently evaporates whenever `M` widens to `Mode`,
and `both` has to be derived by double negation. The lookup map states `both`
explicitly and degrades safely — a widened `M` yields a union, leaving only base
methods accessible.

The same mechanism gates `sdk.onchain` / `sdk.offchain` and the namespace map on the
root SDK.

There is no central capability manifest. Each namespace owns its three interfaces.

## 3. Types

- **One shared read model** in `src/model`, owned by neither source: both the types and
  their zod schemas.
- **Flat optional fields**, optional in every mode. No mode-conditional data types.
- Every optional field carries a tsdoc `@mode onchain | offchain` marker naming the source
  that fills it. With onchain-first merging, optionality exists in both directions, and the
  type alone cannot say which source a field comes from. A field marked `@mode offchain` is
  present in both `offchain` and `both` mode — the tag names the source, not the single mode
  it appears in.
- `@mode` is a custom tag: neither TSDoc nor TypeDoc defines it, so it must be registered in
  TypeDoc's `blockTags` config or docs generation warns on every use.
- **There are no separate wire DTOs and no mapper.** The backend imports the SDK and its
  endpoints return the model types directly, so the wire format *is* the public type.
  `src/offchain` holds the HTTP client only.
- **The offchain client validates every backend response against the model schemas.** A
  validation failure is an error, handled exactly like a transport error per §6: the offchain
  contribution is dropped in `both` mode, and the call throws in `offchain` mode where it is
  the only source. The point of the check is to catch version skew — an SDK talking to an
  older backend, or the reverse — loudly rather than letting malformed data through.
- Accepted cost: the read model is a contract shared with a separately deployed service, so
  changing it is a coordinated release. The validation above exists precisely to make the
  window where they disagree visible instead of silent.
- `src/model` needs its own subpath export so the backend can import the contract without
  pulling the onchain SDK.
- Accepted cost: consumers in `offchain`/`both` mode carry `?.` on fields that are
  always present for them.

## 4. Merging in `both` mode

- **Onchain-first by default**: onchain wins for every field it can produce, offchain
  fills the gaps.
- Implemented as an **explicit per-field source policy per namespace**, defaulting to
  onchain, with a short exception list. Some values the backend computes better
  (smoothed APY, anything derived from history); without an exception list, `both` would
  silently return worse data than `offchain`.
- **Merge is strictly top-level-field-wise.** A source owns a whole group including its
  nulls. `Amount.value` and `Amount.valueUsd` can never come from different sources; the
  same holds for `ApyBreakdown` and every other nested group. No deep merge.
- **Lists are a union by canonical id.** An onchain-only row lacks the backend optionals;
  a backend-only row has no live values.
- **All derived values come from shared pure functions** used by both adapters and by the
  merger, so the two paths cannot drift on formulas.

## 5. Response envelope

Every namespace method returns `{ result, meta }`.

```ts
interface SourceMeta {
  chains: Array<{ network: NetworkType; status: "success" | "error"; error?: unknown }>;
  offchain?: { status: "success" | "error"; error?: unknown };
}
```

- Per-chain entries for the onchain fan-out; a **single** offchain entry, because one HTTP
  call covers all chains and a per-chain breakdown there would be fabricated.
- Block numbers and `updatedAt` are deliberately **not** in meta for now (see
  §10). Meta is expected to grow — treat it as an open object, do not destructure it
  exhaustively.
- Nothing in `src/sdk` changes. Existing services keep returning bare values or
  `MultichainResult`; the namespace wraps them.

## 6. Failure handling

- Backend transport error or schema-validation failure (i.e. version skew, §3) → **drop the
  offchain contribution**, serve onchain-only, report the degraded source in meta.
- **Throw an aggregate error only when no source succeeded at all.** A partial result is
  never an exception; an empty list indistinguishable from "nothing found" is.
- **No caching in the facade.** Consumers own it (react-query and friends). Onchain data
  is inherently snapshot-cached by `attach`/`syncState`; offchain is fetched per call.

## 7. Onchain source

- **Strictly RPC.** No HTTP sources.
- **APY is offchain-only.** Every yield figure — pool rates, collateral yield, points, Merkl
  rewards — comes from the backend and is simply absent in `onchain` mode.
- Consequence: `onchain` mode is a real but reduced surface, exposing liquidity, limits,
  thresholds and leverage but no yield. It targets bots, liquidators and self-hosted
  deployments.
- Freshness is decided **per method**: serve the attached SDK state when it holds the
  data, issue RPC calls otherwise (as `LiquidationsService` already does).
- `ApyPlugin` and `common-utils/utils/strategies` stay where they are, but the new
  namespaces **do not use them**. Soft layering agreement, no enforcement in code. The
  legacy path is frozen and eventually retired. Since APY is offchain-only, the new stack
  does not reimplement their math either — it asks the backend. Do not "fix" the separation
  by wiring the layers back together.

## 8. Offchain source

- **`offchain` mode can still build transactions** where the builder only needs backend data
  (§2). The preview stage runs before anything is sent, so a transaction built from stale or
  incomplete data shows up there as failing rather than being submitted blindly.
- Endpoints return the model types directly (§3). Responses are validated at the boundary
  against the model schemas as a version-skew check; failure is handled per §6.

## 9. Layout, lifecycle, packaging

- `src/new-sdk` — `GearboxSDK` (combined entry point) and its namespaces.
- `src/offchain` — `GearboxAPI`, the backend client.
- `src/model` — shared read-model types and their zod schemas; the contract the backend
  imports.
- **All three are exported as subpaths**; the existing main entry is untouched. The backend
  depends on the `src/model` subpath alone.
- The facade constructor stores options only and constructs the onchain SDK **inside
  `attach()`**.
- The facade accepts **either** onchain options (it constructs and attaches) **or** an
  already-attached `MultichainSDK` (client-v3 has one; two instances would double RPC load
  and memory). When injected, `attach()` must not re-attach it.
- **Top-level `networks` is authoritative.** The onchain chain config must cover it;
  a mismatch warns.
- `sdk.onchain` (`MultichainSDK`) and `sdk.offchain` (`GearboxAPI`) are **public escape
  hatches**, gated by mode like everything else.
- Names: `GearboxSDK` for the combined entry point (the name is currently unused in `src`),
  `GearboxAPI` for the offchain entry point, `OnchainSDK` and `MultichainSDK` keep theirs
  underneath.

## 10. Rejected from the proof of concept

| Rejected | Why |
|---|---|
| `ModeCapabilities` manifest in `core/mode.ts` | central registry every namespace must register in; produces `unknown` intersections that hover badly and generate unreadable `.d.ts` |
| Namespaces as materialized collections | forces the backend into a "load everything at attach" model; breaks history, detail endpoints, per-wallet data |
| `OffchainSDK` snapshot loaded during `attach()` | same |
| Entity classes with navigation getters | not serialisable, hard to merge, hard to fixture |
| Mode as an array of sources | combinations grow as 2^n; a 3-value union is enough today |
| Constructing `MultichainSDK` in the facade constructor | prevents injecting an already-attached instance |

---

## Risks I'd watch

- **First paint in `both` mode.** If every read blocks on the onchain attach — which loads
  all markets on all chains — the frontend is slower than it is today. The fix falls out of
  decisions already made: before attach completes, treat the onchain source as unavailable
  and serve offchain-only with meta saying so, exactly like backend degradation. This only
  works if the facade allows calls before `attach()` resolves, so it must be a deliberate
  design rule rather than something discovered later. See the startup item under *Requires
  discussion*.
- **Backend-only rows look live.** With a union list and no per-item provenance, a row that
  exists only in the backend is indistinguishable from a freshly merged one. Adding an
  optional provenance field later is non-breaking, so the bet is reversible, but it will
  make "why is this number stale" reports harder to triage.
- **Degradation removes rows, not just fields.** If the backend fails in `both` mode,
  backend-only rows vanish from the list entirely rather than losing their optional fields.
  Consumers must read meta to tell "no such opportunity" from "backend down".
- **"Onchain data is a subset of offchain data" is a rule we enforce, not something that is
  automatically true.** Some things only the chain can give us: exact values at a known block,
  `paused` flags, price-update transactions. Each one is either added to the backend too, or
  left in the low-level `src/sdk` services. It must not end up in the shared read model as a
  third kind of field.
- **Cross-source consistency of USD values.** In `both` mode USD figures come from onchain
  prices; in `offchain` mode from backend prices. The same screen can show different numbers
  depending on mode. Acceptable, but it must be documented, and it is another reason the
  merge is group-wise rather than field-wise.
- **Two implementations of the same read model.** Nothing but discipline keeps the onchain
  and offchain adapters shape-identical. The guard is integration-style tests that fetch the
  same entities from both sources and compare the responses — which also catches value drift,
  not just shape drift, and doubles as the version-skew check against a live backend.
- **Mode gating depends on literal inference.** If a consumer's config object widens `mode`
  to `Mode`, the lookup map degrades to base methods only. Confusing when it happens; needs
  a `const` type parameter and a documented pattern.
- **The read model is now a cross-service contract.** With the backend importing the SDK and
  no mapper in between, any change to a model type is a coordinated release of two separately
  deployed things, and a purely additive-looking change can still break an older peer. The
  schema check turns that into an alert rather than a silent wrong answer, but it does not
  remove the coupling — and in `both` mode a skewed backend degrades the SDK to onchain-only,
  which for a strategy means losing the headline APY entirely.

## Requires discussion

- **Meta contents.** Block numbers (snapshot block, and whether/at which block live reads
  happened) and backend `updatedAt` were dropped for now — needs a team decision, because it
  determines whether the UI can show "data as of" and how honest we are about a response
  that mixes snapshot and live reads.
- **How version skew is reported.** A schema mismatch is already an error (§3, §6), but the
  alerting path on top of that is undecided: logger, a dedicated error subtype, metrics.
  Related: whether the model carries an explicit contract version so skew is detectable
  before a field-level mismatch happens.
- **Whether the facade takes a `Plugins` type parameter** to type `sdk.onchain` precisely, or
  exposes it as `MultichainSDK<{}>` and lets injectors keep their own typed reference.
- **Per-item provenance** — deferred, revisit if stale-data triage becomes painful.
- **Startup speed and first paint.** The onchain attach is expensive, so `both` mode needs a
  story for what is available immediately. Options include backend snapshots that cover the
  initial screens, and splitting namespace methods into two classes: those called
  automatically on startup and those called on demand, drawn from the most common frontend
  flows. This decides how much the SDK preloads and what the backend has to expose.
