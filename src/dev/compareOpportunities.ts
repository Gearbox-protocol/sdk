import type { Address } from "viem";
import type {
  ChainId,
  ChainMetadata,
  DataResponse,
  Opportunity,
  OpportunityId,
  OpportunityKind,
} from "../model/index.js";
import { opportunityId } from "../model/index.js";

/**
 * What kind of disagreement a {@link FieldDiff} describes, so that a reader can
 * bucket the report without re-deriving it from the values.
 *
 * - `"presence"` — one side has no value at all (`undefined` or `null`).
 * - `"usd"` — an {@link Amount.valueUsd}, i.e. a price-derived float.
 * - `"numeric"` — any other number or bigint.
 * - `"other"` — everything else: strings, booleans, array shapes.
 **/
export type DiffKind = "presence" | "usd" | "numeric" | "other";

/**
 * Why a {@link FieldDiff} is expected rather than a real disagreement.
 *
 * - `"mode-scoped"` — a field documented `@mode offchain`, so the chain has
 *   nothing to put there.
 * - `"tolerance"` — snapshot lag or float-path noise within the thresholds
 *   below, not a formula or membership mismatch.
 **/
export type ExpectedDiffReason = "mode-scoped" | "tolerance";

/**
 * One field of one opportunity where the two sources disagree.
 **/
export interface FieldDiff {
  /**
   * Dotted path into the row, with array elements keyed by their own identity
   * rather than by index, e.g. `collateralTokens[0xa0b8...].symbol`.
   **/
  path: string;
  /**
   * Value the chain reported, `undefined` when it has no such field.
   **/
  onchain: unknown;
  /**
   * Value the backend reported, see {@link onchain}.
   **/
  offchain: unknown;
  kind: DiffKind;
  /**
   * Present when this disagreement is documented or within snapshot-lag noise,
   * so it does not keep the row from being counted as {@link OpportunityMatch.clean}.
   **/
  expected?: true;
  reason?: ExpectedDiffReason;
}

/**
 * Enough of an opportunity to identify it in a report without carrying the
 * whole row.
 **/
export interface OpportunityRef {
  id: OpportunityId;
  kind: OpportunityKind;
  chainId: ChainId;
  name: string;
  /**
   * Set on a pool opportunity.
   **/
  pool?: Address;
  /**
   * Set on a strategy opportunity, together with {@link targetCollateral}.
   **/
  creditManager?: Address;
  targetCollateral?: Address;
}

/**
 * One opportunity both sources listed, and everything they disagree on.
 **/
export interface OpportunityMatch {
  id: OpportunityId;
  kind: OpportunityKind;
  chainId: ChainId;
  /**
   * Name each source gave the row, which is itself a frequent diff.
   **/
  onchainName: string;
  offchainName: string;
  /**
   * No diffs at all, including the documented offchain-only ones.
   **/
  identical: boolean;
  /**
   * No unexpected diffs: every disagreement is mode-scoped or within tolerance.
   **/
  clean: boolean;
  diffs: FieldDiff[];
}

/**
 * How often one field disagreed across all matched rows, with array keys
 * collapsed, e.g. `collateralTokens[].symbol`.
 **/
export interface DiffPathCount {
  path: string;
  kinds: DiffKind[];
  count: number;
  expected: number;
  unexpected: number;
}

/**
 * Counts of one chain, or of the whole report when `chainId` is absent.
 **/
export interface CompareCounts {
  onchainRows: number;
  offchainRows: number;
  matched: number;
  identical: number;
  /**
   * Matched rows with no unexpected diffs, including the identical ones.
   **/
  clean: number;
  differing: number;
  onlyOnchain: number;
  onlyOffchain: number;
}

/**
 * Counts of one chain.
 **/
export interface ChainCompareCounts extends CompareCounts {
  chainId: ChainId;
}

/**
 * Totals of the comparison plus the fields that differed most often.
 **/
export interface CompareSummary extends CompareCounts {
  byChain: ChainCompareCounts[];
  diffsByPath: DiffPathCount[];
}

/**
 * Everything one comparison run produced, ready to be written out as JSON.
 **/
export interface OpportunityCompareReport {
  generatedAt: string;
  backendUrl: string;
  networks: string[];
  /**
   * Per-chain metadata of the on-chain read, which says which block each chain
   * answered from.
   **/
  onchainChains: ChainMetadata[];
  /**
   * Per-chain metadata of the backend read, see {@link onchainChains}.
   **/
  offchainChains: ChainMetadata[];
  summary: CompareSummary;
  onlyOnchain: OpportunityRef[];
  onlyOffchain: OpportunityRef[];
  matched: OpportunityMatch[];
}

/**
 * The two listings to compare, plus what the run was pointed at.
 **/
export interface CompareOpportunitiesInput {
  onchain: DataResponse<Opportunity[]>;
  offchain: DataResponse<Opportunity[]>;
  backendUrl: string;
  networks: string[];
  /**
   * ISO timestamp stamped onto the report, defaulting to now. Pinned by tests.
   **/
  generatedAt?: string;
}

/**
 * Matches two opportunity listings by {@link opportunityId} and reports every
 * field the two sources disagree on.
 *
 * Nothing is filtered out. A field only the backend can fill, or a USD value
 * that drifted within snapshot-lag noise, is still reported — tagged
 * {@link FieldDiff.expected} so that {@link CompareCounts.clean} can ignore it
 * while {@link CompareCounts.identical} stays strict.
 **/
export function compareOpportunities(
  input: CompareOpportunitiesInput,
): OpportunityCompareReport {
  const onchainRows = indexById(input.onchain.data);
  const offchainRows = indexById(input.offchain.data);

  const onlyOnchain: OpportunityRef[] = [];
  const onlyOffchain: OpportunityRef[] = [];
  const matched: OpportunityMatch[] = [];

  for (const [id, row] of onchainRows) {
    const counterpart = offchainRows.get(id);
    if (!counterpart) {
      onlyOnchain.push(toRef(row));
      continue;
    }
    const diffs = diffOpportunity(row, counterpart);
    matched.push({
      id,
      kind: row.kind,
      chainId: row.chainId,
      onchainName: row.name,
      offchainName: counterpart.name,
      identical: diffs.length === 0,
      clean: diffs.every(diff => diff.expected),
      diffs,
    });
  }
  for (const [id, row] of offchainRows) {
    if (!onchainRows.has(id)) {
      onlyOffchain.push(toRef(row));
    }
  }

  byId(onlyOnchain);
  byId(onlyOffchain);
  matched.sort((a, b) => a.id.localeCompare(b.id));

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    backendUrl: input.backendUrl,
    networks: [...input.networks],
    onchainChains: input.onchain.meta.chains,
    offchainChains: input.offchain.meta.chains,
    summary: summarize(
      input.onchain.data,
      input.offchain.data,
      onlyOnchain,
      onlyOffchain,
      matched,
    ),
    onlyOnchain,
    onlyOffchain,
    matched,
  };
}

function indexById(rows: Opportunity[]): Map<OpportunityId, Opportunity> {
  return new Map(rows.map(row => [opportunityId(row), row]));
}

function byId(refs: OpportunityRef[]): void {
  refs.sort((a, b) => a.id.localeCompare(b.id));
}

function toRef(row: Opportunity): OpportunityRef {
  const base = {
    id: opportunityId(row),
    kind: row.kind,
    chainId: row.chainId,
    name: row.name,
  };
  return row.kind === "pool"
    ? { ...base, pool: row.pool }
    : {
        ...base,
        creditManager: row.creditManager,
        targetCollateral: row.targetCollateral.address,
      };
}

/**
 * Every field two versions of one opportunity disagree on.
 **/
export function diffOpportunity(
  onchain: Opportunity,
  offchain: Opportunity,
): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  diffValue("", onchain, offchain, diffs);
  return diffs.map(diff => tagDiff(diff, onchain.kind));
}

function diffValue(
  path: string,
  onchain: unknown,
  offchain: unknown,
  out: FieldDiff[],
): void {
  if (isAbsent(onchain) && isAbsent(offchain)) {
    return;
  }
  if (isAbsent(onchain) || isAbsent(offchain)) {
    out.push({ path, onchain, offchain, kind: "presence" });
    return;
  }
  if (Array.isArray(onchain) && Array.isArray(offchain)) {
    diffArray(path, onchain, offchain, out);
    return;
  }
  if (isRecord(onchain) && isRecord(offchain)) {
    for (const key of union(Object.keys(onchain), Object.keys(offchain))) {
      diffValue(join(path, key), onchain[key], offchain[key], out);
    }
    return;
  }
  if (!sameScalar(onchain, offchain)) {
    out.push({ path, onchain, offchain, kind: scalarKind(path, onchain) });
  }
}

/**
 * Arrays whose elements identify themselves — collateral tokens, points
 * programs — are matched by that identity, so a token present on one side only
 * is reported as such rather than shifting every later element into a diff.
 **/
function diffArray(
  path: string,
  onchain: unknown[],
  offchain: unknown[],
  out: FieldDiff[],
): void {
  const onchainKeyed = keyElements(onchain);
  const offchainKeyed = keyElements(offchain);

  if (!onchainKeyed || !offchainKeyed) {
    if (onchain.length !== offchain.length) {
      out.push({ path, onchain, offchain, kind: "other" });
      return;
    }
    onchain.forEach((element, index) => {
      diffValue(`${path}[${index}]`, element, offchain[index], out);
    });
    return;
  }

  for (const key of union(
    [...onchainKeyed.keys()],
    [...offchainKeyed.keys()],
  )) {
    diffValue(
      `${path}[${key}]`,
      onchainKeyed.get(key),
      offchainKeyed.get(key),
      out,
    );
  }
}

/**
 * The array indexed by each element's own identity, or `undefined` when its
 * elements have none and order is all there is to go by.
 **/
function keyElements(values: unknown[]): Map<string, unknown> | undefined {
  const keyed = new Map<string, unknown>();
  for (const value of values) {
    if (!isRecord(value)) {
      return undefined;
    }
    const identity = value.address ?? value.id ?? value.token;
    if (typeof identity !== "string") {
      return undefined;
    }
    keyed.set(identity.toLowerCase(), value);
  }
  return keyed.size === values.length ? keyed : undefined;
}

const ADDRESS = /^0x[0-9a-f]{40}$/i;

/**
 * Only addresses are compared case-insensitively: the backend lowercases them
 * while the chain hands out checksummed ones, which is not a disagreement. A
 * symbol or a name spelled differently is.
 **/
function sameScalar(onchain: unknown, offchain: unknown): boolean {
  if (
    typeof onchain === "string" &&
    typeof offchain === "string" &&
    ADDRESS.test(onchain) &&
    ADDRESS.test(offchain)
  ) {
    return onchain.toLowerCase() === offchain.toLowerCase();
  }
  return onchain === offchain;
}

function scalarKind(path: string, onchain: unknown): DiffKind {
  if (path.endsWith("valueUsd")) {
    return "usd";
  }
  return typeof onchain === "number" || typeof onchain === "bigint"
    ? "numeric"
    : "other";
}

/**
 * Relative drift allowed on {@link Amount.valueUsd} before a USD float is a
 * real disagreement: 0.1%.
 **/
const USD_RELATIVE_EPSILON = 0.001;

/**
 * Relative drift allowed on lag-bounded bigint amounts (`totalSupply.value`,
 * `availableLiquidity.value`): 0.05%.
 **/
const AMOUNT_RELATIVE_EPSILON = 0.0005;

/**
 * Absolute drift allowed on bps rates before rounding and a one-block lag are
 * no longer enough to explain it.
 **/
const BPS_ABSOLUTE_EPSILON = 1;

/**
 * Paths whose values are basis-point rates that routinely differ by ±1 from
 * truncation vs rounding, plus pool `utilization` for the same reason.
 **/
const BPS_RATE_PATHS = new Set([
  "borrowApy",
  "supplyApy.organicApy",
  "additionalBorrowApy",
  "utilization",
]);

/**
 * Amount fields whose bigint `value` moves with expected-liquidity accrual
 * between the backend's last sync and the current block. Strategy
 * `totalBorrow.value` and `maxBorrowAmount.value` are not in this set: those
 * disagreements are formula bugs, not lag.
 **/
const LAG_AMOUNT_PATHS = new Set([
  "totalSupply.value",
  "availableLiquidity.value",
]);

/**
 * Fields documented `@mode offchain` in the model: the chain has nothing to
 * put there, so a presence (or nested) mismatch is expected. Strategy
 * `utilization` is in this set; pool `utilization` is not.
 **/
function isModeScoped(path: string, kind: OpportunityKind): boolean {
  if (path === "curator.url") {
    return true;
  }
  if (path === "totalApy" || path.endsWith(".totalApy")) {
    return true;
  }
  if (
    path === "rewards" ||
    path.startsWith("rewards[") ||
    path.includes(".rewards[") ||
    path.endsWith(".rewards")
  ) {
    return true;
  }
  if (kind !== "strategy") {
    return false;
  }
  return (
    path === "utilization" ||
    path === "collateralApy" ||
    path.startsWith("collateralApy.") ||
    path === "maxLeverageApy" ||
    path.startsWith("maxLeverageApy.") ||
    path === "totalValue" ||
    path.startsWith("totalValue.")
  );
}

function tagDiff(diff: FieldDiff, kind: OpportunityKind): FieldDiff {
  if (isModeScoped(diff.path, kind)) {
    return { ...diff, expected: true, reason: "mode-scoped" };
  }
  if (withinTolerance(diff)) {
    return { ...diff, expected: true, reason: "tolerance" };
  }
  return diff;
}

function withinTolerance(diff: FieldDiff): boolean {
  if (diff.kind === "usd") {
    return withinRelative(
      asFiniteNumber(diff.onchain),
      asFiniteNumber(diff.offchain),
      USD_RELATIVE_EPSILON,
    );
  }
  if (diff.kind !== "numeric") {
    return false;
  }
  if (BPS_RATE_PATHS.has(diff.path)) {
    const onchain = asFiniteNumber(diff.onchain);
    const offchain = asFiniteNumber(diff.offchain);
    return (
      onchain !== undefined &&
      offchain !== undefined &&
      Math.abs(onchain - offchain) <= BPS_ABSOLUTE_EPSILON
    );
  }
  if (
    LAG_AMOUNT_PATHS.has(diff.path) &&
    typeof diff.onchain === "bigint" &&
    typeof diff.offchain === "bigint"
  ) {
    return withinRelativeBigint(
      diff.onchain,
      diff.offchain,
      AMOUNT_RELATIVE_EPSILON,
    );
  }
  return false;
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function withinRelative(
  onchain: number | undefined,
  offchain: number | undefined,
  epsilon: number,
): boolean {
  if (onchain === undefined || offchain === undefined) {
    return false;
  }
  const scale = Math.max(Math.abs(onchain), Math.abs(offchain));
  return scale === 0 ? true : Math.abs(onchain - offchain) / scale <= epsilon;
}

/**
 * `diff / max(|a|, |b|) <= epsilon`, computed in integer arithmetic so a
 * 1e18-scale amount does not round through `Number`.
 **/
function withinRelativeBigint(
  onchain: bigint,
  offchain: bigint,
  epsilon: number,
): boolean {
  if (onchain === offchain) {
    return true;
  }
  const diff = onchain > offchain ? onchain - offchain : offchain - onchain;
  const scale = abs(onchain) > abs(offchain) ? abs(onchain) : abs(offchain);
  if (scale === 0n) {
    return true;
  }
  const inverse = BigInt(Math.round(1 / epsilon));
  return diff * inverse <= scale;
}

function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function summarize(
  onchain: Opportunity[],
  offchain: Opportunity[],
  onlyOnchain: OpportunityRef[],
  onlyOffchain: OpportunityRef[],
  matched: OpportunityMatch[],
): CompareSummary {
  const chainIds = union(
    onchain.map(row => String(row.chainId)),
    offchain.map(row => String(row.chainId)),
  );

  const byChain = chainIds
    .map(chainId => ({
      chainId: Number(chainId),
      ...count(
        onchain.filter(row => String(row.chainId) === chainId),
        offchain.filter(row => String(row.chainId) === chainId),
        onlyOnchain.filter(ref => String(ref.chainId) === chainId),
        onlyOffchain.filter(ref => String(ref.chainId) === chainId),
        matched.filter(match => String(match.chainId) === chainId),
      ),
    }))
    .sort((a, b) => a.chainId - b.chainId);

  return {
    ...count(onchain, offchain, onlyOnchain, onlyOffchain, matched),
    byChain,
    diffsByPath: countPaths(matched),
  };
}

function count(
  onchain: Opportunity[],
  offchain: Opportunity[],
  onlyOnchain: OpportunityRef[],
  onlyOffchain: OpportunityRef[],
  matched: OpportunityMatch[],
): CompareCounts {
  const identical = matched.filter(match => match.identical).length;
  const clean = matched.filter(match => match.clean).length;
  return {
    onchainRows: onchain.length,
    offchainRows: offchain.length,
    matched: matched.length,
    identical,
    clean,
    differing: matched.length - identical,
    onlyOnchain: onlyOnchain.length,
    onlyOffchain: onlyOffchain.length,
  };
}

/**
 * How often each field differed, with array keys collapsed so that the same
 * field of a hundred collateral tokens counts as one path. Sorted so the
 * unexpected disagreements come first.
 **/
function countPaths(matched: OpportunityMatch[]): DiffPathCount[] {
  const counts = new Map<string, DiffPathCount>();
  for (const match of matched) {
    for (const diff of match.diffs) {
      const path = diff.path.replace(/\[[^\]]*\]/g, "[]");
      const entry = counts.get(path) ?? {
        path,
        kinds: [],
        count: 0,
        expected: 0,
        unexpected: 0,
      };
      entry.count += 1;
      if (diff.expected) {
        entry.expected += 1;
      } else {
        entry.unexpected += 1;
      }
      if (!entry.kinds.includes(diff.kind)) {
        entry.kinds.push(diff.kind);
      }
      counts.set(path, entry);
    }
  }
  return [...counts.values()].sort(
    (a, b) =>
      b.unexpected - a.unexpected ||
      b.count - a.count ||
      a.path.localeCompare(b.path),
  );
}

function isAbsent(value: unknown): boolean {
  return value === undefined || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function union(left: string[], right: string[]): string[] {
  return [...new Set([...left, ...right])];
}

function join(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}
