/**
 * Schema combinators for state diffing.
 *
 * A schema mirrors a state tree and carries every piece of domain knowledge
 * the diff needs: how each leaf is normalised, which leafs are compared, and
 * how items of a collection are identified. The engine in `diffStates.ts` walks the
 * schema and has no knowledge of any concrete state.
 **/

/** Canonical leaf value. Two leafs are equal when their canonical values are `===`. **/
export type Canon = string | number | boolean | null;

/**
 * - `config`: written by an action, compared, reported as a change.
 * - `identity`: fixed when the entity is created, compared, reported as a conflict.
 * - `observed`: read from chain or derived, never compared.
 **/
export type Role = "config" | "identity" | "observed";

interface BaseNode {
  /** Value to assume when the key is missing in the parent. **/
  absent?: { value: unknown };
}

export interface LeafNode extends BaseNode {
  node: "leaf";
  kind: string;
  role: Role;
  /** Returns the canonical value. Throws when the value has the wrong shape. **/
  canon(value: unknown): Canon;
  /** True for a placeholder. A leaf is compared only when both sides are known. **/
  unknown?(value: unknown): boolean;
}

export interface ObjectNode extends BaseNode {
  node: "object";
  fields: Record<string, SchemaNode>;
  /** Rewrites the raw object before it is read, e.g. to order a token pair. **/
  normalize?(value: Record<string, unknown>): Record<string, unknown>;
}

export interface RecordNode extends BaseNode {
  node: "record";
  key: LeafNode;
  item: SchemaNode;
  /** An item equal to this value is the same as no item. **/
  zero?: { value: unknown };
}

export interface ListNode extends BaseNode {
  node: "list";
  item: SchemaNode;
  /** Stable identity of an item. Items are matched by key, never by position. **/
  // biome-ignore lint/suspicious/noExplicitAny: items are typed by the caller
  key(item: any): string;
  /** False for an item that means "not there", e.g. `allowed: false`. **/
  // biome-ignore lint/suspicious/noExplicitAny: items are typed by the caller
  present?(item: any): boolean;
}

export interface UnionNode extends BaseNode {
  node: "union";
  tag: string;
  variants: Record<string, ObjectNode>;
  /** Schema of a value whose tag has no variant; without it, a diagnostic. **/
  fallback?: ObjectNode;
}

export type SchemaNode =
  | LeafNode
  | ObjectNode
  | RecordNode
  | ListNode
  | UnionNode;

// ---------------------------------------------------------------- leaf kinds

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;

function fail(kind: string, value: unknown): never {
  throw new Error(`not a valid ${kind}: ${JSON.stringify(value)}`);
}

function finite(kind: string, value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(kind, value);
  return value as number;
}

export function leaf(kind: string, canon: (value: unknown) => Canon): LeafNode {
  return { node: "leaf", kind, role: "config", canon };
}

/** Ethereum address, canonical form is lowercase. **/
export const address = leaf("address", v =>
  typeof v === "string" && ADDRESS.test(v)
    ? v.toLowerCase()
    : fail("address", v),
);

/** Human percent, canonical value is integer basis points. **/
export const percent = leaf("percent", v =>
  Math.round(finite("percent", v) * 100),
);

/** Human token amount. Float noise below 12 significant digits is dropped. **/
export const amount = leaf("amount", v =>
  Number(finite("amount", v).toPrecision(12)),
);

export const integer = leaf("integer", v =>
  Number.isInteger(v) ? (v as number) : fail("integer", v),
);

export const boolean = leaf("boolean", v =>
  typeof v === "boolean" ? v : fail("boolean", v),
);

export const string = leaf("string", v =>
  typeof v === "string" ? v : fail("string", v),
);

/** Enum or other primitive compared as is. **/
export const scalar = leaf("scalar", v =>
  typeof v === "string" || typeof v === "number" || typeof v === "boolean"
    ? v
    : fail("scalar", v),
);

export const UNLIMITED = "Unlimited";

/** Amount or the literal "Unlimited". **/
export const limit = leaf("limit", v =>
  v === UNLIMITED ? UNLIMITED : amount.canon(v),
);

/** Boolean in one contract version, enum in the next. Canonical value is the enum. **/
export const status = leaf("status", v =>
  typeof v === "boolean" ? (v ? 1 : 0) : integer.canon(v),
);

// --------------------------------------------------------------- combinators

/** One schema node per key of `T`. A missing or extra key is a compile error. **/
export type Fields<T> = { [K in keyof T]-?: SchemaNode };

export function object<T extends object = Record<string, unknown>>(
  fields: Fields<T>,
  normalize?: ObjectNode["normalize"],
): ObjectNode {
  return { node: "object", fields, normalize };
}

export function record(
  key: LeafNode,
  item: SchemaNode,
  zero?: { value: unknown },
): RecordNode {
  return { node: "record", key, item, zero };
}

export function list<I>(
  item: SchemaNode,
  key: (item: I) => string,
  present?: (item: I) => boolean,
): ListNode {
  return { node: "list", item, key, present };
}

export function union(
  tag: string,
  variants: Record<string, ObjectNode>,
  fallback?: ObjectNode,
): UnionNode {
  return { node: "union", tag, variants, ...(fallback ? { fallback } : {}) };
}

/** Value to use when the parent has no such key. **/
export function absent<N extends SchemaNode>(node: N, value: unknown): N {
  return { ...node, absent: { value } };
}

/** Leaf that may be missing. Canonical value of a missing leaf is null. **/
export function optional(node: LeafNode): LeafNode {
  return {
    ...node,
    absent: { value: undefined },
    canon: v => (v === undefined || v === null ? null : node.canon(v)),
  };
}

/** Leaf with a placeholder value that stands for "not known yet". **/
export function unknownWhen(
  node: LeafNode,
  unknown: (value: unknown) => boolean,
): LeafNode {
  return { ...node, unknown };
}

function withRole<N extends SchemaNode>(node: N, role: Role): N {
  switch (node.node) {
    case "leaf":
      return { ...node, role };
    case "object":
      return {
        ...node,
        fields: mapValues(node.fields, f => withRole(f, role)),
      };
    case "record":
    case "list":
      return { ...node, item: withRole(node.item, role) };
    case "union":
      return {
        ...node,
        variants: mapValues(node.variants, v => withRole(v, role)),
        ...(node.fallback ? { fallback: withRole(node.fallback, role) } : {}),
      };
  }
}

/** Marks every leaf below as identity. **/
export const identity = <N extends SchemaNode>(node: N): N =>
  withRole(node, "identity");

/** Marks every leaf below as observed. **/
export const observed = <N extends SchemaNode>(node: N): N =>
  withRole(node, "observed");

export function mapValues<A, B>(
  input: Record<string, A>,
  fn: (value: A, key: string) => B,
): Record<string, B> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, fn(value, key)]),
  );
}
