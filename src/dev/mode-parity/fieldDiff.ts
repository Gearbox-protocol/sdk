import type { ChainId } from "../../model/index.js";

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
 * - `"mode-scoped"` — a field documented `@mode offchain` or `@mode onchain`,
 *   so the other source has nothing to put there.
 * - `"tolerance"` — snapshot lag or float-path noise within the thresholds
 *   below, not a formula or membership mismatch.
 **/
export type ExpectedDiffReason = "mode-scoped" | "tolerance";

/**
 * One field of one row where the two sources disagree.
 **/
export interface FieldDiff {
  /**
   * Dotted path into the row, with array elements keyed by their own identity
   * rather than by index, e.g. `allowedDepositTokens[0xa0b8...].symbol`.
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
   * so it does not keep the row from being counted as clean.
   **/
  expected?: true;
  reason?: ExpectedDiffReason;
}

/**
 * The largest numeric disagreement seen for one collapsed field path, on
 * either the unexpected or the expected side.
 **/
export interface WorstDiff {
  /**
   * Entity id (position/opportunity id) with the biggest relative difference.
   **/
  id: string;
  /**
   * Uncollapsed path, so the exact array element is named.
   **/
  path: string;
  /**
   * Relative difference in bps.
   **/
  bps: number;
  onchain: unknown;
  offchain: unknown;
}

/**
 * One field disagreement together with the matched row it belongs to.
 **/
export interface EntityFieldDiff {
  id: string;
  diff: FieldDiff;
}

/**
 * How often one field disagreed across all matched rows, with array keys
 * collapsed, e.g. `allowedDepositTokens[].symbol`.
 **/
export interface DiffPathCount {
  path: string;
  kinds: DiffKind[];
  count: number;
  expected: number;
  unexpected: number;
  /**
   * Largest unexpected numeric disagreement, when any unexpected diff of this
   * path yields a relative bps value.
   **/
  worstUnexpected?: WorstDiff;
  /**
   * Largest expected numeric disagreement, see {@link worstUnexpected}.
   **/
  worstExpected?: WorstDiff;
}

/**
 * Counts of one chain, one wallet, or of the whole report when those ids are
 * absent.
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
 * Identity of an array element, used so a token present on one side only is
 * reported as such rather than shifting every later element into a diff.
 *
 * Return a string to key the element; `undefined` falls back to the default
 * (`address`, `id`, `token`, or nested `token.address`).
 **/
export type ArrayElementKey = (
  path: string,
  value: unknown,
) => string | undefined;

/**
 * How to walk two values. Callers that need identity-bearing arrays whose
 * key is not one of the defaults pass {@link DiffOptions.keyOf}.
 **/
export interface DiffOptions {
  keyOf?: ArrayElementKey;
}

/**
 * Relative drift allowed on {@link Amount.valueUsd} before a USD float is a
 * real disagreement: 0.1%.
 **/
export const USD_RELATIVE_EPSILON = 0.001;

/**
 * Relative drift allowed on lag-bounded bigint amounts: 0.05%.
 **/
export const AMOUNT_RELATIVE_EPSILON = 0.0005;

/**
 * Absolute drift allowed on bps rates before rounding and a one-block lag are
 * no longer enough to explain it.
 **/
export const BPS_ABSOLUTE_EPSILON = 1;

/**
 * Every field two versions of one value disagree on. Nothing is filtered or
 * tagged: the caller marks expected diffs afterwards.
 **/
export function diffValue(
  path: string,
  onchain: unknown,
  offchain: unknown,
  out: FieldDiff[],
  options?: DiffOptions,
): void {
  if (isAbsent(onchain) && isAbsent(offchain)) {
    return;
  }
  if (isAbsent(onchain) || isAbsent(offchain)) {
    out.push({ path, onchain, offchain, kind: "presence" });
    return;
  }
  if (Array.isArray(onchain) && Array.isArray(offchain)) {
    diffArray(path, onchain, offchain, out, options);
    return;
  }
  if (isRecord(onchain) && isRecord(offchain)) {
    for (const key of union(Object.keys(onchain), Object.keys(offchain))) {
      diffValue(join(path, key), onchain[key], offchain[key], out, options);
    }
    return;
  }
  if (!sameScalar(onchain, offchain)) {
    out.push({ path, onchain, offchain, kind: scalarKind(path, onchain) });
  }
}

/**
 * Deep-diff two values and return the disagreements, in path order of
 * discovery.
 **/
export function diffObjects(
  onchain: unknown,
  offchain: unknown,
  options?: DiffOptions,
): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  diffValue("", onchain, offchain, diffs, options);
  return diffs;
}

/**
 * Mark a diff expected, so a later `clean` count can ignore it.
 **/
export function withExpected(
  diff: FieldDiff,
  reason: ExpectedDiffReason,
): FieldDiff {
  return { ...diff, expected: true, reason };
}

/**
 * How often each field differed, with array keys collapsed so that the same
 * field of a hundred collateral tokens counts as one path. Sorted so the
 * unexpected disagreements come first.
 **/
export function countPaths(diffs: Iterable<EntityFieldDiff>): DiffPathCount[] {
  const counts = new Map<string, DiffPathCount>();
  for (const { id, diff } of diffs) {
    const path = collapseArrayKeys(diff.path);
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
    recordWorst(entry, id, diff);
    counts.set(path, entry);
  }
  return [...counts.values()].sort(
    (a, b) =>
      b.unexpected - a.unexpected ||
      b.count - a.count ||
      a.path.localeCompare(b.path),
  );
}

function recordWorst(entry: DiffPathCount, id: string, diff: FieldDiff): void {
  const bps = relativeDiffBps(diff.onchain, diff.offchain);
  if (bps === undefined) {
    return;
  }
  const worst: WorstDiff = {
    id,
    path: diff.path,
    bps,
    onchain: diff.onchain,
    offchain: diff.offchain,
  };
  if (diff.expected) {
    if (isWorse(worst, entry.worstExpected)) {
      entry.worstExpected = worst;
    }
    return;
  }
  if (isWorse(worst, entry.worstUnexpected)) {
    entry.worstUnexpected = worst;
  }
}

function isWorse(
  candidate: WorstDiff,
  current: WorstDiff | undefined,
): boolean {
  if (!current) {
    return true;
  }
  return (
    candidate.bps > current.bps ||
    (candidate.bps === current.bps &&
      candidate.id.localeCompare(current.id) < 0)
  );
}

/**
 * Collapse `allowedDepositTokens[0xa0b8...].symbol` to `allowedDepositTokens[].symbol`.
 **/
export function collapseArrayKeys(path: string): string {
  return path.replace(/\[[^\]]*\]/g, "[]");
}

/**
 * Membership and match totals of one comparison, from already-built lists.
 **/
export function toCompareCounts(
  onchainRows: number,
  offchainRows: number,
  onlyOnchain: number,
  onlyOffchain: number,
  matched: ReadonlyArray<{ identical: boolean; clean: boolean }>,
): CompareCounts {
  const identical = matched.filter(match => match.identical).length;
  const clean = matched.filter(match => match.clean).length;
  return {
    onchainRows,
    offchainRows,
    matched: matched.length,
    identical,
    clean,
    differing: matched.length - identical,
    onlyOnchain,
    onlyOffchain,
  };
}

/**
 * USD floats within {@link USD_RELATIVE_EPSILON}.
 **/
export function isUsdWithinTolerance(
  onchain: unknown,
  offchain: unknown,
): boolean {
  return withinRelative(
    asFiniteNumber(onchain),
    asFiniteNumber(offchain),
    USD_RELATIVE_EPSILON,
  );
}

/**
 * Bps rates that differ by at most {@link BPS_ABSOLUTE_EPSILON}.
 **/
export function isBpsWithinTolerance(
  onchain: unknown,
  offchain: unknown,
): boolean {
  const left = asFiniteNumber(onchain);
  const right = asFiniteNumber(offchain);
  return (
    left !== undefined &&
    right !== undefined &&
    Math.abs(left - right) <= BPS_ABSOLUTE_EPSILON
  );
}

/**
 * Bigint amounts within {@link AMOUNT_RELATIVE_EPSILON}.
 **/
export function isAmountWithinTolerance(
  onchain: unknown,
  offchain: unknown,
): boolean {
  return (
    typeof onchain === "bigint" &&
    typeof offchain === "bigint" &&
    withinRelativeBigint(onchain, offchain, AMOUNT_RELATIVE_EPSILON)
  );
}

/**
 * Finite numbers within a relative epsilon of each other.
 **/
export function withinRelative(
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
export function withinRelativeBigint(
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

export function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

/**
 * Relative difference of two numbers or bigints, in bps:
 * `|a − b| / max(|a|, |b|) * 10_000`. `undefined` when the values are not
 * a comparable pair of finite numbers or of bigints.
 **/
export function relativeDiffBps(
  onchain: unknown,
  offchain: unknown,
): number | undefined {
  if (typeof onchain === "bigint" && typeof offchain === "bigint") {
    return relativeDiffBpsBigint(onchain, offchain);
  }
  const left = asFiniteNumber(onchain);
  const right = asFiniteNumber(offchain);
  if (left === undefined || right === undefined) {
    return undefined;
  }
  const scale = Math.max(Math.abs(left), Math.abs(right));
  return scale === 0 ? 0 : (Math.abs(left - right) / scale) * 10_000;
}

/**
 * Same formula as {@link relativeDiffBps} for bigints, computed in integer
 * arithmetic to milli-bps so a 1e18-scale amount does not round through
 * `Number`.
 **/
function relativeDiffBpsBigint(onchain: bigint, offchain: bigint): number {
  if (onchain === offchain) {
    return 0;
  }
  const diff = onchain > offchain ? onchain - offchain : offchain - onchain;
  const scale = abs(onchain) > abs(offchain) ? abs(onchain) : abs(offchain);
  if (scale === 0n) {
    return 0;
  }
  return Number((diff * 10_000n * 1_000n) / scale) / 1_000;
}

export function union(left: string[], right: string[]): string[] {
  return [...new Set([...left, ...right])];
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function diffArray(
  path: string,
  onchain: unknown[],
  offchain: unknown[],
  out: FieldDiff[],
  options?: DiffOptions,
): void {
  const onchainKeyed = keyElements(path, onchain, options?.keyOf);
  const offchainKeyed = keyElements(path, offchain, options?.keyOf);

  if (!onchainKeyed || !offchainKeyed) {
    if (onchain.length !== offchain.length) {
      out.push({ path, onchain, offchain, kind: "other" });
      return;
    }
    onchain.forEach((element, index) => {
      diffValue(`${path}[${index}]`, element, offchain[index], out, options);
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
      options,
    );
  }
}

/**
 * The array indexed by each element's own identity, or `undefined` when its
 * elements have none and order is all there is to go by.
 **/
function keyElements(
  path: string,
  values: unknown[],
  keyOf?: ArrayElementKey,
): Map<string, unknown> | undefined {
  const keyed = new Map<string, unknown>();
  for (const value of values) {
    const identity = keyOf?.(path, value) ?? defaultIdentity(value);
    if (typeof identity !== "string") {
      return undefined;
    }
    keyed.set(identity.toLowerCase(), value);
  }
  return keyed.size === values.length ? keyed : undefined;
}

function defaultIdentity(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  if (typeof value.address === "string") {
    return value.address;
  }
  if (typeof value.id === "string") {
    return value.id;
  }
  if (typeof value.token === "string") {
    return value.token;
  }
  if (isRecord(value.token) && typeof value.token.address === "string") {
    return value.token.address;
  }
  return undefined;
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

function isAbsent(value: unknown): boolean {
  return value === undefined || value === null;
}

function join(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}

function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}
