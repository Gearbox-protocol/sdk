# New SDK — design decisions

Design record for the new product-oriented `GearboxSDK`: a combined entry point that
serves the same read model from onchain data (`MultichainSDK`) and from the backend.

`tmp/agentic-mock3` is the proof of concept this replaces. Treat it as a sketch of the
idea, not as reference code: its capability manifest, entity classes and attach-time
snapshots are explicitly rejected below.

The first namespace to be implemented is `opportunities`. Its read model started as a
sketch in `tmp/new-types/types.ts` and now lives in `src/model`. This document is
namespace-agnostic — it records the rules every namespace follows.

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

**The map gates reads only.** Two things that live on a namespace are deliberately left
out of it, because gating them would widen every line of the map without buying a real
compile error:

- **The source branches** `sdk.<ns>.onchain` / `sdk.<ns>.offchain` are members of the base
  interface, present in every mode. They are the same objects as `sdk.onchain.<ns>` and
  `sdk.offchain.<ns>` (§9), which the mode *does* gate, so gating the alias as well would
  duplicate one decision in two mechanisms. Reading the branch of a source the mode does
  not have throws `SourceUnavailableError`, which is what stands in for the compile error.
- **`merge`** is a member of the base interface too. A merger accepts `undefined` on either
  side and returns the side it was given, so calling one in a single-source mode is a no-op
  rather than a mistake — there is nothing to forbid.

Consequence: each namespace owns three interfaces, and only `history`-style reads actually
depend on the gating. That is also what a widened `M` costs, and no more.

There is no central capability manifest.

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

- ~~**Onchain-first by default**, as an explicit per-field source policy per namespace with
  a short exception list.~~ **Superseded: a chain is served whole by one source.** Both
  sources are asked for the same chains, and for each chain the backend wins when it is no
  more than `maxOffchainLagSeconds` (default 120) behind the block the chain answered at;
  otherwise the chain wins. `mergeChainList` / `mergeChainOne` in `src/new-sdk/utils` are
  the implementation, and they are pure functions over the envelope, exposed as
  `sdk.<ns>.merge.*` so a consumer reading the branches itself applies the same policy.
  `merge` is available in every mode, not just `both` (§2): the mergers are total over an
  absent side, so there is no misuse to gate against.
- Field-wise merging is gone with it, and so is the exception list: a chain's data comes
  from one source at one block, and nothing is stitched together across sources.
- **Lists are no longer a union by canonical id.** The winning source supplies the chain
  entirely. Two consequences, both accepted as product decisions rather than refactors:
  - if the chain wins a chain, backend-only rows and rows of markets the SDK has not loaded
    disappear from the list; if the backend wins it, onchain-only rows and onchain-only
    accuracy (`paused`, live limits) go with them;
  - a chain served from the chain has no `@mode offchain` fields at all, headline APY
    included, where the old merge filled them from the backend. The freshness threshold is
    therefore a product decision, not an implementation detail.
- A namespace that needs a different rule supplies its own `ListMerger` / `EntityMerger`;
  that is the escape hatch, not a second threshold.
- **The two mergers differ in what they may answer with.** A `ListMerger` serves whichever
  side arrived, so it returns `undefined` only while *both* sides are still missing, and its
  type says so: `merge.list(onchain, offchain)` on two responses is a `DataResponse`, with no
  `!` at the call site. An `EntityMerger` (`merge.pool`, `merge.strategy`) stays optional
  whatever it was given, because neither source may have served the entity. `filter` follows
  the list rule: `undefined` in, `undefined` out; an envelope in, an envelope out.
- **All derived values come from shared pure functions** used by both adapters and by the
  merger, so the two paths cannot drift on formulas.
- **Each source owns its chain scope.** `GearboxSDK.networks` is authoritative: the sources
  it builds cover exactly those chains, and any source covering a different set — injected
  or built from options naming other chains — is rejected at construction. A filter's `chainIds` is passed to both sources untouched, and
  each one intersects it with the chains it covers — the fan-out over its configured chains,
  the backend client over the ones it was built with. So the backend is never asked for a
  chain the SDK does not cover, including on `sdk.<ns>.offchain.list()`, and a chain missing
  from a response cannot be confused with one that was never requested. A namespace never
  intersects for itself: it does not know a chain list at all, which is why a read that failed
  everywhere reports the reasons its sources gave rather than a list of chains (§6).
- **Chains are named by id below the public surface.** `chainIds?: ChainId[]` is the one
  representation a filter, a fan-out and a request share, with no `"all"` sentinel: an
  absent list already means "do not narrow", and a named chain a source cannot serve is
  dropped, because a filter narrows a read rather than extending it. A caller who thinks in
  network labels converts once with `toChainIds`.

## 5. Response envelope

Every read of every layer returns `{ data, meta }` — `DataResponse<T>` in `src/model`.

```ts
interface ResponseMetadata {
  chains: ChainMetadata[]; // one entry per chain the read covered
}

// discriminated on `status`, so a success without a source, or without the
// block it reflects, is unrepresentable
type ChainMetadata =
  | { chainId: ChainId; status: "success"; source: DataSource; blockNumber: number; timestamp: number }
  | { chainId: ChainId; status: "error"; source?: DataSource; error?: unknown };
```

- **Metadata is per chain everywhere, including offchain.** One HTTP call covers several
  chains, but the backend indexes them separately, so it reports each one — with the block
  and timestamp it has indexed that chain to. That is what the freshness merge compares,
  and it is why a per-chain offchain breakdown is no longer "fabricated". A chain that is up
  but not indexed is listed with `status: "error"` rather than omitted; omitting it would be
  indistinguishable from not having been asked.
- **`source` names the winner.** Each source stamps its own entries, so after merging the
  envelope says which side served each chain. Which source *lost* a chain, and why, is
  logged only: to a screen, a backend that failed and a backend that is too far behind mean
  the same thing.
- **Block and timestamp are in meta**, which settles the "Meta contents" question below.
  Where they come from is declared per fan-out read: `"state"` for a walk over loaded market
  state, `"latest"` for a live read, which is then pinned to that block as well as reporting
  it.
- **A success always names the block its data reflects.** Data that was produced came from
  some block, so both fields are required on a success rather than optional — the same rule
  as `source`, and the reason the freshness merge can compare two successes without a
  "did not say" case. A chain that cannot be placed at a block, one the backend has not
  indexed included, is an error entry; on the wire, a success missing either field fails
  validation as version skew.
- `DataResponse` describes a backend **2xx body only**. A non-2xx, a timeout, or a body that
  fails validation is not an envelope — the request may never have arrived — so the offchain
  client throws (`OffchainTransportError` — one of `OffchainRequestFailedError`,
  `OffchainStatusError`, `OffchainInvalidJsonError` — or `OffchainValidationError`) and the
  namespace drops that leg: no chain entry is invented for a request that said nothing about
  any chain (§6).
- **The envelope is no longer confined to `src/new-sdk`.** It is the return type of
  `src/model`'s codec, of the fan-out services in `src/sdk`, and of the backend client in
  `src/offchain`. `MultichainResult` and `OffchainResult` are gone; there is one shape, and
  it is not re-exported under a second name per layer.
- One envelope for lists and details alike. The difference between them is a failure rule,
  not a shape: a list fills `data` with the rows of the chains that worked, while a detail
  read that cannot produce its entity throws (`queryChain` wraps successes only) and the
  facade, which has a second source, falls back to it before raising.

## 6. Failure handling

- Backend transport error or schema-validation failure (i.e. version skew, §3) → **drop the
  offchain contribution**, serve the chain's answer, and log the dropped source. Per §5 the
  envelope names the source that served each chain rather than the one that failed: both
  "the backend is down" and "the backend is behind" mean the same thing to a screen.
- **Throw `AllSourcesFailedError` only when no source served a single chain.** A partial
  result is never an exception; an empty list indistinguishable from "nothing found" is.
  In a single-source mode there is nothing to degrade to, so the source's own error
  (an `OffchainTransportError` subclass, `SdkNotAttachedError`) surfaces as it is.
- **The error aggregates the reasons its sources gave**, as an `AggregateError`, rather than
  carrying a per-chain envelope of its own. A source that threw its whole leg said nothing
  about any chain, so the alternative was fabricating an entry for every chain the read
  covered — a per-chain shape that looked like §5's metadata without being sourced like it.
  A chain-level breakdown of a total failure is therefore not available to consumers; the
  per-chain envelope is for reads that partially succeeded.
- **Only errors and warnings are logged.** A dropped source is a `warn`; the freshness
  decisions behind a merge are not logged at all, because the envelope already names the
  source that served each chain.
- **No caching in the facade.** Consumers own it (react-query and friends). Onchain data
  is inherently snapshot-cached by `attach`/`syncState`; offchain is fetched per call.

## 7. Onchain source

- **Strictly RPC.** No HTTP sources.
- **APY is offchain-only, with named exceptions.** Every yield figure that folds in
  incentives, points, smoothing or history — supply APY, collateral APY, Merkl rewards —
  comes from the backend and is simply absent in `onchain` mode.
- **Amended: the borrow side is onchain-capable.** The cost of debt is read straight off the
  contracts with no estimation involved, so these are filled from the chain:
  - `borrowApy` — the pool's `baseInterestRate` scaled by the credit manager's `feeInterest`;
  - `quotaRate` — the pool quota keeper rate of the target collateral, scaled by the same
    `feeInterest`;
  - `RateCurve` — the linear interest rate model's own parameters (`U1`, `U2`, `Rbase`,
    `Rslope*`) evaluated into points, i.e. the model itself rather than a fit to it.

  The line is not "borrow versus supply" but "read versus estimated": anything the chain
  states outright may be served from it, anything that needs a time series or an incentive
  feed may not. Adding to this list requires the same justification.
- Consequence: `onchain` mode is a real but reduced surface, exposing liquidity, limits,
  thresholds, leverage and the cost of debt, but no earned yield. It targets bots,
  liquidators and self-hosted deployments.
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
- **A client is built for a fixed set of chains** (`GearboxAPIOptions.chainIds`, required)
  and every list request names them, see §4. The backend serves chains a given caller has no
  business showing — experimental ones among them — so leaving the parameter off is not a
  neutral "no filter".

## 9. Layout, lifecycle, packaging

- `src/new-sdk` — `GearboxSDK` (combined entry point) and its namespaces: routing, the
  `both`-mode merge policy, and the response envelope. No protocol knowledge.
- Within it, `AbstractNamespace` owns everything a namespace does not decide: holding the
  two source namespaces and exposing them as `.onchain` / `.offchain` branches, running both
  legs of a merged read, catching a source that throws, and the all-sources-failed rule. A
  namespace subclasses it and supplies only its reads and the mergers they name, which is
  where §4 is implemented per namespace.
- **The branches are the source namespaces themselves.** `sdk.opportunities.onchain` has
  the type of `sdk.onchain.opportunities` and forwards every call to it, so the two
  spellings cannot drift, and a consumer that wants the backend's answer painted first and
  the chain's when it arrives reads them separately and calls
  `sdk.opportunities.merge.list` — the same policy `both` mode applies internally.
  *(Amended, sdk-first: the on-chain branch is a thin proxy over the service that awaits the
  facade's loading policy first, so a split read attaches and revalidates like a merged one;
  same type, forwarded calls, a different object identity.)* Because they are the source's
  own methods, the namespace spelling is not gated by mode a second time (§2); the branch of
  a source the mode does not read throws `SourceUnavailableError` on access, raised by
  `AbstractNamespace`.
- **A namespace is handed its sources, not a way to look them up.** It holds a
  `MultichainSDK` and a `GearboxAPI` directly. Readiness of the on-chain source belongs
  to the facade: every on-chain leg awaits its loading policy (`ensureFresh`, see the
  auto-loading amendment below) rather than the namespace deciding on its own; a source
  that then still cannot answer fails the read like a source that is down.
- `src/sdk/<namespace>` — the onchain read service for a namespace, wired onto `OnchainSDK`
  and `MultichainSDK` beside `liquidations` (see the amendment in §5). All protocol
  knowledge of the onchain source lives here, and works without the facade.
- `src/offchain` — `GearboxAPI`, the backend client.
- `src/model` — shared read-model types and their zod schemas; the contract the backend
  imports.
- **All three are exported as subpaths**; the existing main entry is untouched. The backend
  depends on the `src/model` subpath alone.
- **Amended: the facade constructs the onchain SDK in its own constructor**, and `attach()`
  only attaches it. Building a `MultichainSDK` does no I/O, so there is nothing to defer,
  and it is what lets a namespace hold the instance instead of a way to find it later.
- The facade accepts **either** onchain options (it constructs and attaches) **or** an
  already-attached `MultichainSDK` (client-v3 has one; two instances would double RPC load
  and memory). When injected, `attach()` must not re-attach it.
- **Amended (sdk-first): two more directories under `new-sdk/`** — `prepare/` and
  `execute/` — glue from the read-model-shaped request to `src/sdk`'s
  `CreditAccountOperationsService` / `PoolService` / `openCA` / `executeCaUpdate`; they
  map and wrap, the protocol knowledge stays below.
- **Amended (sdk-first): loading is automatic.** Every async on-chain *read* awaits the
  facade's `#ensureFresh` (`execute.buildTx` does not: it encodes what the `prepare` call
  that preceded it priced, and reads only what the encoders need): the first read attaches (later reads join the one promise; a
  rejected attach is not cached), and a read whose touched chains' loaded state is older
  than `maxStateAgeSeconds` (default 30) syncs those chains — one in-flight `syncState`
  per chain, shared by concurrent stale reads — before running. A failed sync serves the
  previous state; its age tells the consumer. `attach()` stays as the opt-in warm-up. The
  sync LP simulations do not auto-attach (they throw `SdkNotAttachedError` before it, as
  before). Not added: `ready()`, `status`, `watch()` — reads live in the consumer's query
  layer and suspend there.
- **Top-level `networks` is authoritative.** The onchain chain config must name exactly
  those chains — it is not narrowed to them — and the same check covers an injected
  `MultichainSDK`, so either kind of mismatch throws at construction.
- `sdk.onchain` (`MultichainSDK`) and `sdk.offchain` (`GearboxAPI`) are **public escape
  hatches**, gated by mode like everything else.
- Names: `GearboxSDK` for the combined entry point (the name is currently unused in `src`),
  `GearboxAPI` for the offchain entry point, `OnchainSDK` and `MultichainSDK` keep theirs
  underneath.
- **Errors live in an `errors/` subdirectory of the layer that throws them**, one exported
  error per identically-named file, with the helpers that describe a failure (`errorCause`,
  `backendMessage`, `readResponseBody`, `assertSameChains`, `everyChainFailed`) beside them
  under the name of the function they export. A namespace holds its reads, not the wording of
  its failures: the formatting a throw site used to do inline belongs to the constructor.
- **Errors extend viem's `BaseError`**, as `src/sdk` already does, and use its layering:
  `shortMessage` is one sentence and never a dump, context lines (`URL:`, `Status:`, one line
  per validation issue) go to `metaMessages`, the peer's own words to `details`, the caught
  error to `cause`, and structured payload to typed properties (`url`, `status`, `zodError`).
  The exception is the two aggregates — `AllSourcesFailedError` and `NoSourceServedError` —
  which extend `AggregateError` because §6 makes the reasons they collect the contract.

## 10. Rejected from the proof of concept

| Rejected | Why |
|---|---|
| `ModeCapabilities` manifest in `core/mode.ts` | central registry every namespace must register in; produces `unknown` intersections that hover badly and generate unreadable `.d.ts` |
| Namespaces as materialized collections | forces the backend into a "load everything at attach" model; breaks history, detail endpoints, per-wallet data |
| `OffchainSDK` snapshot loaded during `attach()` | same |
| Entity classes with navigation getters | not serialisable, hard to merge, hard to fixture |
| Mode as an array of sources | combinations grow as 2^n; a 3-value union is enough today |
| ~~Constructing `MultichainSDK` in the facade constructor~~ | reinstated in §9: it does not prevent injection, since the onchain option is a union and only the options branch constructs |

---

## Risks I'd watch

- **First paint in `both` mode.** If every read blocks on the onchain attach — which loads
  all markets on all chains — the frontend is slower than it is today. The fix falls out of
  decisions already made: a read issued before attach completes is still served, from the
  backend alone, with meta saying so. It gets there by asking the chain and having it fail
  with `SdkNotAttachedError` per chain, which is the same path as an RPC being down — the
  facade does not special-case its own startup. This only works if the facade allows calls
  before `attach()` resolves, so it must be a deliberate design rule rather than something
  discovered later. Note the consequence in `onchain` mode: such a read has no source left
  and raises `AllSourcesFailedError` instead of answering with an empty list. See the
  startup item under *Requires discussion*.
- ~~**Backend-only rows look live.**~~ Answered by §5: a row's provenance is its chain's
  entry, which names the source and the block. What replaces this risk is coarser — a chain's
  whole row set changes with the winning source (§4), so a market only one source knows about
  appears and disappears with that chain's freshness rather than being merged in.
- **Degradation removes rows, not just fields.** Sharpened by §4: a chain the backend loses
  serves only what the chain knows, and vice versa. Consumers must read meta to tell "no such
  opportunity" from "this chain was served by the other source".
- **"Onchain data is a subset of offchain data" is a rule we enforce, not something that is
  automatically true.** Some things only the chain can give us: exact values at a known block,
  `paused` flags, price-update transactions. Each one is either added to the backend too, or
  left in the low-level `src/sdk` services. It must not end up in the shared read model as a
  third kind of field.
  **Resolved for `paused`:** it is a required field of `OpportunityBase`, so the first branch
  applies — the backend has to serve it. The same applies to `expirationDate`, which is
  nullable rather than optional precisely so that the chain's "not expirable" survives the
  merge instead of being filled in from the backend.
- **Curated classification tables are a second cross-service contract.** `AssetType`,
  `rwa` and `sunset` are not read from the chain: they come from `underlyingAssetTypes`,
  `rwaTokens`, `sunsetPools` and `sunsetStrategies` on `GearboxChain` in
  `src/sdk/chain/chains.ts`, with lookup helpers next to `getCuratorName`. That file is the
  single source both sides must read, which means the backend imports it from the main
  entry rather than from the `./model` subpath — a deliberate exception to §9, taken because
  duplicating the tables in two deployables is the worse failure mode. Editing them is a
  data change, not a code change, and the two sides drift silently if only one is updated.
- **RWA opportunities are reported in the unwrapped underlying.** An RWA market borrows a
  compliance wrapper of an ordinary token (`dcUSDC` for `USDC`), and `underlyingToken` — plus
  the `name` built from it, plus the `underlyingType` lookup in `underlyingAssetTypes` — is
  the token that wrapper holds, not the wrapper. The wrapper converts one-for-one, so the
  amounts denominated in it stay exact and no conversion is involved. Both sides must unwrap
  the same way: the merge is group-wise, so a backend that reports the wrapper would hand the
  same row two different underlyings depending on which source filled the field.
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
  a `const` type parameter and a documented pattern. Narrowed by §2: the branches and
  `merge` are not gated, so widening costs `history` and the onchain-only group — and
  nothing that was only ever a no-op or an alias.
- **The read model is now a cross-service contract.** With the backend importing the SDK and
  no mapper in between, any change to a model type is a coordinated release of two separately
  deployed things, and a purely additive-looking change can still break an older peer. The
  schema check turns that into an alert rather than a silent wrong answer, but it does not
  remove the coupling — and in `both` mode a skewed backend degrades the SDK to onchain-only,
  which for a strategy means losing the headline APY entirely.

## Requires discussion

- ~~**Meta contents.**~~ Settled in §5: every chain entry carries the block and timestamp its
  data reflects, and each fan-out read declares whether that is the loaded snapshot or a head
  fetched for the occasion. A response no longer mixes the two silently, since the declared
  block is also the block the read is pinned to. The UI can show "data as of" per chain.
- **How version skew is reported.** A schema mismatch is already an error (§3, §6), but the
  alerting path on top of that is undecided: logger, a dedicated error subtype, metrics.
  Related: whether the model carries an explicit contract version so skew is detectable
  before a field-level mismatch happens.
- ~~**Whether the facade takes a `Plugins` type parameter**~~ — settled for now: `sdk.onchain`
  is `MultichainSDK<{}>`, and a consumer that injects a plugin-typed instance keeps its own
  reference to it. Revisit if a namespace ever needs a plugin.
- ~~**Per-item provenance**~~ — settled at chain granularity: a chain is served whole by one
  source (§4), and its metadata entry names that source and the block it answered at, so
  every row of that chain has the same provenance. Per-row provenance would only be needed
  again if a merge ever mixed sources inside one chain.
- **Startup speed and first paint.** The onchain attach is expensive, so `both` mode needs a
  story for what is available immediately. Options include backend snapshots that cover the
  initial screens, and splitting namespace methods into two classes: those called
  automatically on startup and those called on demand, drawn from the most common frontend
  flows. This decides how much the SDK preloads and what the backend has to expose.
