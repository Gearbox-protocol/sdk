/**
 * Schema-driven diff. Walks the schema, never the shape of the values, so it
 * cannot guess. Anything it cannot compare is returned as a diagnostic or as
 * skipped, never dropped.
 **/
import type {
  Canon,
  LeafNode,
  ListNode,
  ObjectNode,
  RecordNode,
  SchemaNode,
  UnionNode,
} from "./schemaNodes.js";

export type StatePath = readonly string[];

/** Canonical tree: observed leafs removed, lists turned into keyed maps. **/
export type CanonTree = Canon | { [key: string]: CanonTree };

/** Canonical value of a leaf that is not known yet on that side. **/
const UNKNOWN = "<unknown>";

export type StateChange =
  | { op: "set"; path: StatePath; before: Canon; after: Canon }
  | { op: "add"; path: StatePath; after: CanonTree }
  | { op: "remove"; path: StatePath; before: CanonTree }
  | { op: "retag"; path: StatePath; before: CanonTree; after: CanonTree };

export type Side = "before" | "after";

export interface DiffDiagnostic {
  code:
    | "unexpected-field"
    | "missing-field"
    | "invalid-value"
    | "unknown-variant";
  side: Side;
  path: StatePath;
  detail: string;
}

export interface DiffSkipped {
  path: StatePath;
  reason: string;
}

export interface SuppressRule {
  /** Path pattern, `*` matches one segment. **/
  pattern: readonly string[];
  reason: string;
}

export interface StateDiff {
  equal: boolean;
  /** Differences in config leafs and in the set of entities. **/
  changes: StateChange[];
  /** Differences in identity leafs of entities present on both sides. **/
  conflicts: StateChange[];
  /** Suppressed differences and leafs known on one side only, with the reason. **/
  skipped: DiffSkipped[];
  /** Values the schema could not read. **/
  diagnostics: DiffDiagnostic[];
}

export interface DiffOptions {
  /** Differences under these paths are listed as skipped instead of changes. **/
  suppress?: SuppressRule[];
}

interface Ctx {
  out: StateDiff;
  suppress: SuppressRule[];
  /** Diagnostics are recorded once per code, side and path. **/
  seen: Set<string>;
}

export function diffStates(
  schema: SchemaNode,
  before: unknown,
  after: unknown,
  options: DiffOptions = {},
): StateDiff {
  const ctx = context(options.suppress ?? []);
  diffNode(schema, before, after, [], ctx);
  const out = ctx.out;
  out.equal =
    out.changes.length === 0 &&
    out.conflicts.length === 0 &&
    out.diagnostics.length === 0;
  return out;
}

/** Canonical form of one state. Diagnostics are returned, not thrown. **/
export function canonicalize(
  schema: SchemaNode,
  value: unknown,
): { tree: CanonTree; diagnostics: DiffDiagnostic[] } {
  const ctx = context([]);
  const tree = canon(schema, value, [], "before", ctx);
  return {
    tree: tree === OMIT ? null : tree,
    diagnostics: ctx.out.diagnostics,
  };
}

function context(suppress: SuppressRule[]): Ctx {
  return {
    out: {
      equal: true,
      changes: [],
      conflicts: [],
      skipped: [],
      diagnostics: [],
    },
    suppress,
    seen: new Set(),
  };
}

// -------------------------------------------------------------------- diffing

function diffNode(
  node: SchemaNode,
  a: unknown,
  b: unknown,
  path: StatePath,
  ctx: Ctx,
): void {
  const rule = ctx.suppress.find(r => matches(r.pattern, path));
  if (rule) {
    // Compare anyway, so that only a real difference is listed as suppressed.
    const scratch = context([]);
    diffNode(node, a, b, path, scratch);
    for (const change of [...scratch.out.changes, ...scratch.out.conflicts])
      ctx.out.skipped.push({ path: change.path, reason: rule.reason });
    return;
  }
  switch (node.node) {
    case "leaf":
      diffLeaf(node, a, b, path, ctx);
      break;
    case "object":
      diffObject(node, a, b, path, ctx);
      break;
    case "record":
    case "list":
      diffKeyed(node, a, b, path, ctx);
      break;
    case "union":
      diffUnion(node, a, b, path, ctx);
      break;
  }
}

function diffLeaf(
  node: LeafNode,
  a: unknown,
  b: unknown,
  path: StatePath,
  ctx: Ctx,
): void {
  if (node.role === "observed") return;
  const unknownBefore = node.unknown?.(a) ?? false;
  const unknownAfter = node.unknown?.(b) ?? false;
  if (unknownBefore || unknownAfter) {
    if (unknownBefore !== unknownAfter)
      ctx.out.skipped.push({ path, reason: "not known on one side" });
    return;
  }
  const before = canonLeaf(node, a, path, "before", ctx);
  const after = canonLeaf(node, b, path, "after", ctx);
  if (before === INVALID || after === INVALID) return;
  if (before === after) return;
  const target = node.role === "identity" ? ctx.out.conflicts : ctx.out.changes;
  target.push({ op: "set", path, before, after });
}

function diffObject(
  node: ObjectNode,
  a: unknown,
  b: unknown,
  path: StatePath,
  ctx: Ctx,
): void {
  const before = readObject(node, a, path, "before", ctx);
  const after = readObject(node, b, path, "after", ctx);
  if (!before || !after) return;
  for (const [name, field] of Object.entries(node.fields)) {
    const va = readField(field, before, name, path, "before", ctx);
    const vb = readField(field, after, name, path, "after", ctx);
    if (va === MISSING || vb === MISSING) continue;
    diffNode(field, va, vb, [...path, name], ctx);
  }
}

function diffKeyed(
  node: RecordNode | ListNode,
  a: unknown,
  b: unknown,
  path: StatePath,
  ctx: Ctx,
): void {
  const before = toMap(node, a, path, "before", ctx);
  const after = toMap(node, b, path, "after", ctx);
  const keys = [...new Set([...before.keys(), ...after.keys()])].sort();
  for (const key of keys) {
    const at = [...path, key];
    const inBefore = before.has(key);
    const inAfter = after.has(key);
    if (inBefore && inAfter) {
      diffNode(node.item, before.get(key), after.get(key), at, ctx);
      continue;
    }
    const rule = ctx.suppress.find(r => matches(r.pattern, at));
    if (rule) {
      ctx.out.skipped.push({ path: at, reason: rule.reason });
      continue;
    }
    if (inAfter) {
      const tree = canon(node.item, after.get(key), at, "after", ctx);
      if (tree !== OMIT)
        ctx.out.changes.push({ op: "add", path: at, after: tree });
    } else {
      const tree = canon(node.item, before.get(key), at, "before", ctx);
      if (tree !== OMIT)
        ctx.out.changes.push({ op: "remove", path: at, before: tree });
    }
  }
}

function diffUnion(
  node: UnionNode,
  a: unknown,
  b: unknown,
  path: StatePath,
  ctx: Ctx,
): void {
  const va = variantOf(node, a, path, "before", ctx);
  const vb = variantOf(node, b, path, "after", ctx);
  if (!va || !vb) return;
  if (va.tag === vb.tag) {
    diffObject(va.schema, a, b, path, ctx);
    return;
  }
  const before = canon(va.schema, a, path, "before", ctx);
  const after = canon(vb.schema, b, path, "after", ctx);
  if (before === OMIT || after === OMIT) return;
  ctx.out.changes.push({ op: "retag", path, before, after });
}

// ------------------------------------------------------------- canonical form

const OMIT = Symbol("omit");
const INVALID = Symbol("invalid");
const MISSING = Symbol("missing");

function canon(
  node: SchemaNode,
  value: unknown,
  path: StatePath,
  side: Side,
  ctx: Ctx,
): CanonTree | typeof OMIT {
  switch (node.node) {
    case "leaf": {
      if (node.role === "observed") return OMIT;
      if (node.unknown?.(value)) return UNKNOWN;
      const result = canonLeaf(node, value, path, side, ctx);
      return result === INVALID ? UNKNOWN : result;
    }
    case "object": {
      const source = readObject(node, value, path, side, ctx);
      if (!source) return UNKNOWN;
      return canonFields(node, source, path, side, ctx);
    }
    case "record":
    case "list": {
      const tree: Record<string, CanonTree> = {};
      const items = toMap(node, value, path, side, ctx);
      for (const key of [...items.keys()].sort()) {
        const child = canon(
          node.item,
          items.get(key),
          [...path, key],
          side,
          ctx,
        );
        if (child !== OMIT) tree[key] = child;
      }
      return tree;
    }
    case "union": {
      const variant = variantOf(node, value, path, side, ctx);
      if (!variant) return UNKNOWN;
      const source = readObject(variant.schema, value, path, side, ctx);
      if (!source) return UNKNOWN;
      return canonFields(variant.schema, source, path, side, ctx);
    }
  }
}

function canonFields(
  node: ObjectNode,
  source: Record<string, unknown>,
  path: StatePath,
  side: Side,
  ctx: Ctx,
): CanonTree | typeof OMIT {
  const tree: Record<string, CanonTree> = {};
  for (const [name, field] of Object.entries(node.fields)) {
    const raw = readField(field, source, name, path, side, ctx);
    if (raw === MISSING) continue;
    const child = canon(field, raw, [...path, name], side, ctx);
    if (child !== OMIT) tree[name] = child;
  }
  return Object.keys(tree).length === 0 ? OMIT : tree;
}

function canonLeaf(
  node: LeafNode,
  value: unknown,
  path: StatePath,
  side: Side,
  ctx: Ctx,
): Canon | typeof INVALID {
  try {
    return node.canon(value);
  } catch (error) {
    diagnostic(ctx, "invalid-value", side, path, (error as Error).message);
    return INVALID;
  }
}

// -------------------------------------------------------------------- reading

/** The value as a plain object, or `undefined` with a diagnostic. **/
function readPlainObject(
  value: unknown,
  path: StatePath,
  side: Side,
  ctx: Ctx,
): Record<string, unknown> | undefined {
  if (isPlainObject(value)) return value;
  diagnostic(
    ctx,
    "invalid-value",
    side,
    path,
    `expected object, got ${describe(value)}`,
  );
  return undefined;
}

function readObject(
  node: ObjectNode,
  value: unknown,
  path: StatePath,
  side: Side,
  ctx: Ctx,
): Record<string, unknown> | undefined {
  const raw = readPlainObject(value, path, side, ctx);
  if (!raw) return undefined;
  const source = node.normalize ? node.normalize(raw) : raw;
  for (const name of Object.keys(source)) {
    if (!(name in node.fields))
      diagnostic(
        ctx,
        "unexpected-field",
        side,
        [...path, name],
        "not in schema",
      );
  }
  return source;
}

function readField(
  field: SchemaNode,
  source: Record<string, unknown>,
  name: string,
  path: StatePath,
  side: Side,
  ctx: Ctx,
): unknown | typeof MISSING {
  if (name in source && source[name] !== undefined) return source[name];
  if (field.absent) return field.absent.value;
  if (isObserved(field)) return undefined;
  diagnostic(ctx, "missing-field", side, [...path, name], "required by schema");
  return MISSING;
}

function toMap(
  node: RecordNode | ListNode,
  value: unknown,
  path: StatePath,
  side: Side,
  ctx: Ctx,
): Map<string, unknown> {
  const map = new Map<string, unknown>();
  if (node.node === "list") {
    if (!Array.isArray(value)) {
      diagnostic(
        ctx,
        "invalid-value",
        side,
        path,
        `expected array, got ${describe(value)}`,
      );
      return map;
    }
    for (const item of value) {
      let key: string;
      try {
        key = node.key(item);
      } catch (error) {
        diagnostic(ctx, "invalid-value", side, path, (error as Error).message);
        continue;
      }
      // A later item replaces an earlier one with the same key.
      if (node.present && !node.present(item)) map.delete(key);
      else map.set(key, item);
    }
    return map;
  }
  const source = readPlainObject(value, path, side, ctx);
  if (!source) return map;
  const zero = node.zero
    ? JSON.stringify(canon(node.item, node.zero.value, path, side, context([])))
    : undefined;
  for (const [rawKey, item] of Object.entries(source)) {
    const key = canonLeaf(node.key, rawKey, [...path, rawKey], side, ctx);
    if (key === INVALID) continue;
    if (
      zero !== undefined &&
      JSON.stringify(
        canon(node.item, item, [...path, rawKey], side, context([])),
      ) === zero
    )
      continue;
    map.set(String(key), item);
  }
  return map;
}

function variantOf(
  node: UnionNode,
  value: unknown,
  path: StatePath,
  side: Side,
  ctx: Ctx,
): { tag: string; schema: ObjectNode } | undefined {
  const tag = isPlainObject(value) ? value[node.tag] : undefined;
  if (typeof tag === "string") {
    const schema = Object.hasOwn(node.variants, tag)
      ? node.variants[tag]
      : node.fallback;
    if (schema) return { tag, schema };
  }
  diagnostic(
    ctx,
    "unknown-variant",
    side,
    path,
    `${node.tag} = ${JSON.stringify(tag)}`,
  );
  return undefined;
}

// -------------------------------------------------------------------- helpers

function diagnostic(
  ctx: Ctx,
  code: DiffDiagnostic["code"],
  side: Side,
  path: StatePath,
  detail: string,
): void {
  const id = `${code}|${side}|${path.join("/")}`;
  if (ctx.seen.has(id)) return;
  ctx.seen.add(id);
  ctx.out.diagnostics.push({ code, side, path, detail });
}

function isObserved(node: SchemaNode): boolean {
  switch (node.node) {
    case "leaf":
      return node.role === "observed";
    case "object":
      return Object.values(node.fields).every(isObserved);
    case "record":
    case "list":
      return isObserved(node.item);
    case "union":
      return Object.values(node.variants).every(isObserved);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describe(value: unknown): string {
  if (value === null) return "null";
  return Array.isArray(value) ? "array" : typeof value;
}

function matches(pattern: readonly string[], path: StatePath): boolean {
  return (
    pattern.length === path.length &&
    pattern.every((segment, i) => segment === "*" || segment === path[i])
  );
}

// ------------------------------------------------------------------- patching

/** Applies changes to a canonical tree. Used to prove that a diff is complete. **/
export function applyChanges(
  tree: CanonTree,
  changes: readonly StateChange[],
): CanonTree {
  const holder: Record<string, CanonTree> = { root: structuredClone(tree) };
  for (const change of changes) {
    const path = ["root", ...change.path];
    let parent = holder;
    for (const segment of path.slice(0, -1)) {
      const next = parent[segment];
      if (!isPlainObject(next))
        throw new Error(`no such path: ${change.path.join(".")}`);
      parent = next as Record<string, CanonTree>;
    }
    const last = path[path.length - 1];
    if (change.op === "remove") delete parent[last];
    else parent[last] = structuredClone(change.after);
  }
  return holder.root;
}

/** Deep equality on canonical trees. An unknown leaf equals anything. **/
export function sameTree(a: CanonTree, b: CanonTree): boolean {
  if (a === UNKNOWN || b === UNKNOWN) return true;
  if (!isPlainObject(a) || !isPlainObject(b)) return a === b;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (!(key in a) || !(key in b)) return false;
    if (!sameTree(a[key] as CanonTree, b[key] as CanonTree)) return false;
  }
  return true;
}

// ----------------------------------------------------------------- formatting

export function formatStateDiff(result: StateDiff): string {
  if (result.equal && result.skipped.length === 0)
    return "States are identical.";
  const show = (value: unknown) => JSON.stringify(value);
  const at = (path: StatePath) => path.join(".") || "root";
  const line = (prefix: string, change: StateChange) => {
    switch (change.op) {
      case "set":
      case "retag":
        return `${prefix} ${at(change.path)}: ${show(change.before)} to ${show(change.after)}`;
      case "add":
        return `+ ${at(change.path)}: ${show(change.after)}`;
      case "remove":
        return `- ${at(change.path)}: ${show(change.before)}`;
    }
  };
  const lines: string[] = [];
  for (const change of result.changes) lines.push(line("~", change));
  for (const change of result.conflicts) lines.push(line("!", change));
  for (const item of result.diagnostics)
    lines.push(
      `? ${at(item.path)} (${item.side}): ${item.code}, ${item.detail}`,
    );
  for (const item of result.skipped)
    lines.push(`. ${at(item.path)}: skipped, ${item.reason}`);
  return lines.join("\n");
}
