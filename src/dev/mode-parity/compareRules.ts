import type { z } from "zod/v4";
import {
  type CompareTag,
  type CompareTolerance,
  compareTagOf,
} from "../../model/compare.schema.js";
import {
  asFiniteNumber,
  collapseArrayKeys,
  type FieldDiff,
  isAmountWithinTolerance,
  isBpsWithinTolerance,
  isUsdWithinTolerance,
  USD_RELATIVE_EPSILON,
  withExpected,
  withinRelative,
} from "./fieldDiff.js";

/**
 * Collapsed-path → tag map compiled from a zod schema, e.g.
 * `apy.totalApy` → `"offchainOnly"`, `totalDebt.value` → `{ tolerance: amount }`.
 **/
export type CompareRuleMap = Map<string, CompareTag>;

/**
 * Walks a schema and records every field that carries compare metadata.
 *
 * `"amount"` on an object (an Amount / TokenAmount) is stored
 * at `<path>.value`; every other tag is stored at the field's own path.
 **/
export function compileCompareRules(schema: z.ZodType): CompareRuleMap {
  const rules: CompareRuleMap = new Map();
  walk(schema, "", new Set(), rules);
  return rules;
}

/**
 * Rules compiled for each row kind, e.g. `"pool"` vs `"strategy"`.
 **/
export type CompareRulesByKind = Record<string, CompareRuleMap>;

/**
 * Tags one field diff using the rules compiled for its row kind.
 **/
export type TagDiff = (diff: FieldDiff, kind: string) => FieldDiff;

/**
 * Tags diffs using the rules compiled for each row kind.
 *
 * Mode tags match the path or anything nested under it. Tolerance tags match
 * the path exactly and dispatch on {@link CompareTolerance}.
 **/
export function makeTagDiff(rulesByKind: CompareRulesByKind): TagDiff {
  return (diff, kind) => {
    const rules = rulesByKind[kind];
    if (!rules) {
      return diff;
    }
    const path = collapseArrayKeys(diff.path);
    if (isModeScoped(path, rules)) {
      return withExpected(diff, "mode-scoped");
    }
    if (isBackendPreferred(path, rules)) {
      return withExpected(diff, "backend-preferred");
    }
    const tag = rules.get(path);
    if (
      tag &&
      typeof tag === "object" &&
      withinTolerance(tag.tolerance, diff)
    ) {
      return withExpected(diff, "tolerance");
    }
    return diff;
  };
}

function pathMatchesRule(path: string, rulePath: string): boolean {
  return (
    path === rulePath ||
    path.startsWith(`${rulePath}.`) ||
    path.startsWith(`${rulePath}[`)
  );
}

function isModeScoped(path: string, rules: CompareRuleMap): boolean {
  for (const [rulePath, tag] of rules) {
    if (tag !== "offchainOnly" && tag !== "onchainOnly") {
      continue;
    }
    if (pathMatchesRule(path, rulePath)) {
      return true;
    }
  }
  return false;
}

function isBackendPreferred(path: string, rules: CompareRuleMap): boolean {
  for (const [rulePath, tag] of rules) {
    if (tag !== "backendPreferred") {
      continue;
    }
    if (pathMatchesRule(path, rulePath)) {
      return true;
    }
  }
  return false;
}

function withinTolerance(kind: CompareTolerance, diff: FieldDiff): boolean {
  switch (kind) {
    case "usd":
      return isUsdWithinTolerance(diff.onchain, diff.offchain);
    case "bps":
      return isBpsWithinTolerance(diff.onchain, diff.offchain);
    case "amount":
      return isAmountWithinTolerance(diff.onchain, diff.offchain);
    case "float":
      return withinRelative(
        asFiniteNumber(diff.onchain),
        asFiniteNumber(diff.offchain),
        USD_RELATIVE_EPSILON,
      );
  }
}

function walk(
  schema: z.ZodType,
  path: string,
  seen: Set<z.ZodType>,
  rules: CompareRuleMap,
): void {
  if (seen.has(schema)) {
    return;
  }
  const nextSeen = new Set(seen);
  nextSeen.add(schema);

  const tag = compareTagOf(schema);
  if (tag) {
    record(path, tag, schema, rules);
  }

  const def = schema.def as SchemaDef;
  switch (def.type) {
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "readonly":
      if (def.innerType) {
        walk(def.innerType, path, nextSeen, rules);
      }
      return;
    case "array":
      if (def.element) {
        walk(def.element, `${path}[]`, nextSeen, rules);
      }
      return;
    case "object":
      if (def.shape) {
        for (const [key, field] of Object.entries(def.shape)) {
          walk(field, join(path, key), nextSeen, rules);
        }
      }
      return;
    case "union":
      for (const option of def.options ?? []) {
        walk(option, path, nextSeen, rules);
      }
      return;
    case "pipe":
      if (def.out) {
        walk(def.out, path, nextSeen, rules);
      }
      return;
    case "lazy":
      if (def.getter) {
        walk(def.getter(), path, nextSeen, rules);
      }
      return;
    default:
      return;
  }
}

function record(
  path: string,
  tag: CompareTag,
  schema: z.ZodType,
  rules: CompareRuleMap,
): void {
  if (
    typeof tag === "object" &&
    tag.tolerance === "amount" &&
    schema.def.type === "object"
  ) {
    rules.set(join(path, "value"), tag);
    return;
  }
  rules.set(path, tag);
}

function join(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}

/**
 * The subset of a zod v4 `def` the walker reads. Kept loose so a new wrapper
 * type is a no-op rather than a compile failure.
 **/
interface SchemaDef {
  type: string;
  innerType?: z.ZodType;
  element?: z.ZodType;
  shape?: Record<string, z.ZodType>;
  options?: z.ZodType[];
  out?: z.ZodType;
  getter?: () => z.ZodType;
}
