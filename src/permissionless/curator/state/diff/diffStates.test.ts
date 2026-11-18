import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  UniswapV3PoolFee,
  UniswapV3PoolStatus,
} from "../../plugins/adapters/uniswap-v3/setPoolBatchStatusActionData.js";
import type { RateKeeperState } from "../../plugins/rate-keepers/rateKeeperPlugins.js";
import { marketStateFixtures } from "../../testing/marketStateFixtures.js";
import {
  diffMarketStates,
  marketStateSchema,
} from "../market/marketStateComparison.js";
import type { MarketState, PeripheryState } from "../market/types.js";
import {
  applyChanges,
  canonicalize,
  formatStateDiff,
  type StateChange,
  type StateDiff,
  sameTree,
} from "./diffStates.js";
import type { LeafNode, SchemaNode } from "./schemaNodes.js";

const states = marketStateFixtures();

const CM: Address = "0x00000000000000000000000000000000000000c1";
const TARGET: Address = "0x00000000000000000000000000000000000000a1";
const A: Address = "0xAAaAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const B: Address = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const C: Address = "0xcccccccccccccccccccccccccccccccccccccccc";
const ZERO: Address = "0x0000000000000000000000000000000000000000";
const REAL: Address = "0x1111111111111111111111111111111111111111";

const clone = <T>(value: T): T => structuredClone(value);

/** A real state with one Uniswap V3 adapter whose pools are under test. **/
function market(
  pools: UniswapV3PoolStatus[],
  adapter: Address = REAL,
  edit?: (state: MarketState) => void,
): MarketState {
  const state = clone(states[0].state);
  const cm = Object.values(state.creditManagers)[0];
  state.creditManagers = { [CM]: { ...cm, address: CM, adapters: {} } };
  state.creditManagerDebtLimit = { [CM]: 100 };
  state.creditManagers[CM].adapters[TARGET] = {
    type: "UNISWAP_V3_ROUTER",
    version: 310,
    target: TARGET,
    adapter,
    isForbidden: false,
    pools,
  };
  edit?.(state);
  return state;
}
const pool = (
  token0: Address,
  token1: Address,
  fee: UniswapV3PoolFee,
  allowed = true,
): UniswapV3PoolStatus => ({
  token0,
  token1,
  fee,
  allowed,
});
const poolsPath = ["creditManagers", CM, "adapters", TARGET, "pools"];
const key = (x: string, y: string, fee: number) =>
  `${[x, y]
    .map(v => v.toLowerCase())
    .sort()
    .join("-")}-${fee}`;
const firstToken = (s: MarketState) =>
  Object.values(s.creditManagers[CM].collateralTokens)[0];

function expectEqual(result: StateDiff): void {
  expect(result.equal, formatStateDiff(result)).toBe(true);
}

/** Writes a field the types do not allow, to feed the diff a malformed state. **/
const loose = (value: object) => value as unknown as Record<string, unknown>;

// --------------------------------------------------------------------- random

function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = prng(20260930);
const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(random() * items.length)];
const shuffle = <T>(items: readonly T[]): T[] =>
  items
    .map((item): [number, T] => [random(), item])
    .sort(([x], [y]) => x - y)
    .map(([, item]) => item);
const randomAddress = (): Address =>
  `0x${Array.from({ length: 40 }, () => Math.floor(random() * 16).toString(16)).join("")}`;
const isAddress = (value: unknown): value is string =>
  typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);
const randomCase = (value: string): string =>
  `0x${[...value.slice(2)].map(c => (random() < 0.5 ? c.toUpperCase() : c.toLowerCase())).join("")}`;

// ------------------------------------------------------------- schema walking

type Segment = string | number;
type Tree = Record<Segment, unknown>;

interface Leaf {
  node: LeafNode;
  /** Keys and indexes as written in the state. **/
  raw: Segment[];
  /** Path as the diff reports it. **/
  path: string[];
  value: unknown;
  inList: boolean;
}

const isTree = (value: unknown): value is Tree =>
  typeof value === "object" && value !== null;

function* leaves(
  node: SchemaNode,
  value: unknown,
  raw: Segment[] = [],
  path: string[] = [],
  inList = false,
): Generator<Leaf> {
  switch (node.node) {
    case "leaf":
      if (value !== undefined) yield { node, raw, path, value, inList };
      return;
    case "object":
      for (const [name, field] of Object.entries(node.fields))
        if (isTree(value) && name in value)
          yield* leaves(
            field,
            value[name],
            [...raw, name],
            [...path, name],
            inList,
          );
      return;
    case "record": {
      const items = (value ?? {}) as Tree;
      for (const k of Object.keys(items))
        yield* leaves(
          node.item,
          items[k],
          [...raw, k],
          [...path, k.toLowerCase()],
          inList,
        );
      return;
    }
    case "list": {
      const items = (value ?? []) as unknown[];
      // Only the item that wins its key is visible, as in the diff itself.
      const winners = new Map<string, number>();
      for (const [index, item] of items.entries()) {
        if (node.present && !node.present(item)) winners.delete(node.key(item));
        else winners.set(node.key(item), index);
      }
      for (const [k, index] of winners)
        yield* leaves(
          node.item,
          items[index],
          [...raw, index],
          [...path, k],
          true,
        );
      return;
    }
    case "union": {
      const tag = isTree(value) ? value[node.tag] : undefined;
      const variant = typeof tag === "string" ? node.variants[tag] : undefined;
      if (!variant) return;
      // The tag selects the variant, so it is not a leaf that can change on its own.
      for (const leaf of leaves(variant, value, raw, path, inList))
        if (
          !(leaf.raw.length === raw.length + 1 && leaf.raw.at(-1) === node.tag)
        )
          yield leaf;
      return;
    }
  }
}

function setAt(state: object, raw: readonly Segment[], value: unknown): void {
  let target = state as Tree;
  for (const segment of raw.slice(0, -1)) target = target[segment] as Tree;
  target[raw[raw.length - 1]] = value;
}

function mutate(leaf: Leaf): unknown {
  const v = leaf.value;
  switch (leaf.node.kind) {
    case "address":
      return randomAddress();
    case "percent":
      return (v as number) + 0.01;
    case "amount":
      return v === 0 ? 1 : (v as number) * 1.5;
    case "limit":
      return v === "Unlimited" ? 1000 : v === 0 ? 1 : (v as number) * 1.5;
    case "integer":
      return (v as number) + 1;
    case "boolean":
      return !v;
    case "string":
      return `${v}x`;
    case "status":
      return typeof v === "boolean" ? !v : v === 1 ? 2 : 1;
    default:
      return typeof v === "number"
        ? v + 1
        : typeof v === "boolean"
          ? !v
          : `${v}x`;
  }
}

/** Changes how a state is written without changing what it means. **/
function scramble(state: MarketState): MarketState {
  const copy = clone(state);
  for (const leaf of [...leaves(marketStateSchema, copy)]) {
    if (leaf.node.role === "observed") continue;
    const v = leaf.value;
    if (typeof v !== "number" || v === 0) continue;
    if (leaf.node.kind === "percent" || leaf.node.kind === "amount")
      setAt(copy, leaf.raw, v * (1 + 1e-14));
  }
  copy.treasury.balances[randomAddress()] = random() * 1e6;
  copy.treasury.type = "TREASURY_SPLITTER";
  copy.creditManagerDebtLimit[randomAddress()] = 0;
  copy.rateKeeper.salt = "0x01";
  for (const cm of Object.values(copy.creditManagers)) {
    cm.isExpired = !cm.isExpired;
    for (const adapter of Object.values(cm.adapters).map(loose)) {
      for (const [name, value] of Object.entries(adapter)) {
        if (!Array.isArray(value) || value.length === 0) continue;
        const items = value as Tree[];
        const flag = "allowed" in items[0] ? "allowed" : "status";
        const off = typeof items[0][flag] === "boolean" ? false : 0;
        // an item that was disallowed, and an item disallowed then allowed again
        adapter[name] = [
          { ...(replaceAddresses(clone(items[0])) as Tree), [flag]: off },
          { ...clone(items[0]), [flag]: off },
          ...items,
          clone(pick(items)),
        ];
      }
    }
  }
  return restyle(copy) as MarketState;
}

function replaceAddresses(value: unknown): unknown {
  if (isAddress(value)) return randomAddress();
  if (Array.isArray(value)) return value.map(replaceAddresses);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, replaceAddresses(v)]),
    );
  return value;
}

const hasStatusFlag = (items: readonly unknown[]) =>
  items.some(
    item =>
      item &&
      typeof item === "object" &&
      ("allowed" in item || "status" in item),
  );

function restyle(value: unknown, keepOrder = false): unknown {
  if (isAddress(value)) return randomCase(value);
  if (Array.isArray(value)) {
    const items = value.map(item => restyle(item));
    // Order inside a list carries "later wins", so lists with duplicates keep their order.
    return keepOrder ? items : shuffle(items);
  }
  if (value && typeof value === "object") {
    let entries: [string, unknown][] = Object.entries(value);
    if ("token0" in value && "token1" in value && random() < 0.5)
      entries = entries.map(([k, v]): [string, unknown] =>
        k === "token0"
          ? ["token1", v]
          : k === "token1"
            ? ["token0", v]
            : [k, v],
      );
    return Object.fromEntries(
      shuffle(entries).map(([k, v]) => [
        isAddress(k) ? randomCase(k) : k,
        restyle(v, Array.isArray(v) && hasStatusFlag(v)),
      ]),
    );
  }
  return value;
}

function mirror(change: StateChange): StateChange {
  switch (change.op) {
    case "set":
      return { ...change, before: change.after, after: change.before };
    case "retag":
      return { ...change, before: change.after, after: change.before };
    case "add":
      return { op: "remove", path: change.path, before: change.after };
    case "remove":
      return { op: "add", path: change.path, after: change.before };
  }
}

const byPath = (changes: readonly StateChange[]) =>
  [...changes].sort((x, y) =>
    `${x.path.join("/")}|${x.op}`.localeCompare(`${y.path.join("/")}|${y.op}`),
  );

// ================================================================ regressions

describe("diffMarketStates", () => {
  it("skips an undeployed adapter address in both argument orders", () => {
    const computed = market([], ZERO);
    const simulated = market([], REAL);
    for (const result of [
      diffMarketStates(computed, simulated),
      diffMarketStates(simulated, computed),
    ]) {
      expectEqual(result);
      expect(result.skipped).toEqual([
        {
          path: ["creditManagers", CM, "adapters", TARGET, "adapter"],
          reason: "not known on one side",
        },
      ]);
    }
  });

  it("reports an adapter redeployed at another address as a conflict", () => {
    const result = diffMarketStates(market([], REAL), market([], B));
    expect(result.changes).toEqual([]);
    expect(result.conflicts).toHaveLength(1);
  });

  it("touches only the changed pool when its fee changes", () => {
    const result = diffMarketStates(
      market([pool(A, B, 500), pool(A, C, 3000), pool(B, C, 100)]),
      market([pool(A, B, 500), pool(A, C, 500), pool(B, C, 100)]),
    );
    expect(byPath(result.changes).map(c => [c.op, c.path.at(-1)])).toEqual([
      ["remove", key(A, C, 3000)],
      ["add", key(A, C, 500)],
    ]);
  });

  it("reports one added pool as one change at the pool", () => {
    const result = diffMarketStates(
      market([pool(A, B, 500)]),
      market([pool(A, B, 500), pool(A, C, 500)]),
    );
    expect(result.changes.map(c => [c.op, c.path])).toEqual([
      ["add", [...poolsPath, key(A, C, 500)]],
    ]);
  });

  it("ignores disallowed and duplicated list items", () => {
    expectEqual(
      diffMarketStates(
        market([pool(A, B, 500), pool(A, C, 500, false), pool(A, B, 500)]),
        market([pool(A, B, 500)]),
      ),
    );
  });

  it("lets a later list item win over an earlier one", () => {
    expectEqual(
      diffMarketStates(
        market([pool(A, B, 500), pool(A, B, 500, false)]),
        market([]),
      ),
    );
    expectEqual(
      diffMarketStates(
        market([pool(A, B, 500, false), pool(A, B, 500)]),
        market([pool(A, B, 500)]),
      ),
    );
  });

  it("ignores token pair order and address case", () => {
    expectEqual(
      diffMarketStates(
        market([pool(A, B, 500)]),
        market([
          pool(
            B.toUpperCase().replace("0X", "0x") as Address,
            A.toLowerCase() as Address,
            500,
          ),
        ]),
      ),
    );
  });

  it("treats a missing debt limit key as a limit of zero", () => {
    const without = market([], REAL, s => (s.creditManagerDebtLimit = {}));
    const zero = market(
      [],
      REAL,
      s => (s.creditManagerDebtLimit = { [CM]: 0 }),
    );
    const some = market(
      [],
      REAL,
      s => (s.creditManagerDebtLimit = { [CM]: 5 }),
    );
    expectEqual(diffMarketStates(without, zero));
    expect(diffMarketStates(without, some).changes).toEqual([
      { op: "add", path: ["creditManagerDebtLimit", CM], after: 5 },
    ]);
  });

  it("equates a threshold computed in floats with the chain value", () => {
    for (let f = 1; f <= 500; f += 7) {
      for (let p = f; p <= 1000; p += 11) {
        const computed = market([], REAL, s => {
          firstToken(s).liquidationThresholdFinal = 100 - f / 100 - p / 100;
        });
        const chain = market([], REAL, s => {
          firstToken(s).liquidationThresholdFinal = (10000 - f - p) / 100;
        });
        expectEqual(diffMarketStates(computed, chain));
      }
    }
  });

  it("does not compare clock-dependent and runtime fields", () => {
    const other = market([], REAL, s => {
      s.creditManagers[CM].isExpired = true;
      s.treasury = {
        address: B,
        type: "TREASURY_SPLITTER",
        balances: { [A]: 12.5 },
      };
      s.rateKeeper.salt = "0x01";
    });
    expectEqual(diffMarketStates(market([]), other));
  });

  it("matches periphery by domain and address, ignoring metadata placeholders", () => {
    // Persisted before deployments were tracked, so without a status.
    const entry = (
      address: Address,
      domain: string,
      type: string,
      version: number,
    ) =>
      ({
        address,
        domain,
        type,
        version,
      }) as PeripheryState;
    const computed = market([], REAL, s => {
      s.periphery = [
        entry(A, "DEGEN_NFT", "", 0),
        entry(B, "ZAPPER", "ZAPPER::X", 0),
      ];
    });
    const simulated = market([], REAL, s => {
      s.periphery = [
        entry(
          B.toUpperCase().replace("0X", "0x") as Address,
          "ZAPPER",
          "ZAPPER::X",
          310,
        ),
        entry(A, "DEGEN_NFT", "DEGEN_NFT::SECURITIZE", 310),
      ];
    });
    expectEqual(diffMarketStates(computed, simulated));
    const missing = market(
      [],
      REAL,
      s => (s.periphery = [simulated.periphery[0]]),
    );
    expect(
      diffMarketStates(computed, missing).changes.map(c => [c.op, c.path]),
    ).toEqual([["remove", ["periphery", `DEGEN_NFT:${A.toLowerCase()}`]]]);
    const legacy = market([], REAL, s => delete loose(s).periphery);
    expectEqual(
      diffMarketStates(
        legacy,
        market([], REAL, s => (s.periphery = [])),
      ),
    );
  });

  it("reports an identity difference as a conflict, not a change", () => {
    const result = diffMarketStates(
      market([]),
      market([], REAL, s => (s.name = "other")),
    );
    expect(result.changes).toEqual([]);
    expect(result.conflicts).toEqual([
      {
        op: "set",
        path: ["name"],
        before: states[0].state.name,
        after: "other",
      },
    ]);
  });

  it("reports a field the schema does not know", () => {
    const result = diffMarketStates(
      market([]),
      market([], REAL, s => (loose(s.creditManagers[CM]).newField = 1)),
    );
    expect(result.equal).toBe(false);
    expect(
      result.diagnostics.map(i => [i.code, i.side, i.path.at(-1)]),
    ).toEqual([["unexpected-field", "after", "newField"]]);
  });

  it("reports an unknown plugin variant", () => {
    const result = diffMarketStates(
      market([]),
      market([], REAL, s => (s.rateKeeper = {} as unknown as RateKeeperState)),
    );
    expect(result.equal).toBe(false);
    expect(result.diagnostics.map(i => [i.code, i.side, i.path])).toEqual([
      ["unknown-variant", "after", ["rateKeeper"]],
    ]);
  });

  it("reports a malformed value", () => {
    const result = diffMarketStates(
      market([]),
      market([], REAL, s => (s.underlyingPriceFeed = "0x123")),
    );
    expect(result.diagnostics.map(i => [i.code, i.path])).toEqual([
      ["invalid-value", ["underlyingPriceFeed"]],
    ]);
  });

  it("reports a rate keeper type change as one change", () => {
    const result = diffMarketStates(
      market([]),
      market([], REAL, s => (s.rateKeeper = { type: "GAUGE", rates: {} })),
    );
    expect(result.changes.map(c => [c.op, c.path])).toEqual([
      ["retag", ["rateKeeper"]],
    ]);
  });

  it("compares ramp parameters", () => {
    const ramped = market([], REAL, s => {
      firstToken(s).rampStart = 1_800_000_000;
      firstToken(s).rampDuration = 86_400;
    });
    const result = diffMarketStates(ramped, market([]));
    expect(result.changes.map(change => change.path.at(-1))).toEqual([
      "rampStart",
      "rampDuration",
    ]);
    expect(result.skipped).toHaveLength(0);
  });
});

// ================================================================= properties

describe("diffMarketStates on the bundle fixtures", () => {
  it("reads every real state without a diagnostic", () => {
    for (const { state } of states)
      expect(canonicalize(marketStateSchema, state).diagnostics).toEqual([]);
  });

  it("is reflexive", () => {
    for (const { state } of states) expectEqual(diffMarketStates(state, state));
  });

  it("is invariant under notation", () => {
    for (const { state } of states) {
      for (let round = 0; round < 3; round++) {
        const other = scramble(state);
        expectEqual(diffMarketStates(state, other));
        expectEqual(diffMarketStates(other, state));
      }
    }
  });

  it("reports one changed leaf as one change at that leaf", () => {
    for (const { state } of states) {
      const candidates = [...leaves(marketStateSchema, state)].filter(
        leaf => leaf.node.role !== "observed" && !leaf.node.unknown,
      );
      for (const leaf of shuffle(candidates).slice(0, 30)) {
        const other = clone(state);
        setAt(other, leaf.raw, mutate(leaf));
        const result = diffMarketStates(state, other);
        const all = [...result.changes, ...result.conflicts];
        expect(result.diagnostics).toEqual([]);
        if (leaf.inList) {
          // The leaf may be part of the item key or its presence flag.
          const itemDepth =
            leaf.raw.findIndex(segment => typeof segment === "number") + 1;
          const item = leaf.path.slice(0, itemDepth);
          expect(all.length).toBeGreaterThanOrEqual(1);
          expect(all.length).toBeLessThanOrEqual(2);
          for (const change of all)
            expect(change.path.slice(0, item.length - 1)).toEqual(
              item.slice(0, -1),
            );
        } else {
          expect(all).toHaveLength(1);
          expect(all[0].op).toBe("set");
          expect(all[0].path).toEqual(leaf.path);
          expect(
            leaf.node.role === "identity" ? result.conflicts : result.changes,
          ).toHaveLength(1);
        }
      }
    }
  });

  it("mirrors the result when the arguments are swapped", () => {
    for (let i = 0; i < states.length; i++) {
      const a = states[i].state;
      const b = states[(i + 1) % states.length].state;
      const forward = diffMarketStates(a, b);
      const backward = diffMarketStates(b, a);
      expect(byPath(forward.changes.map(mirror))).toEqual(
        byPath(backward.changes),
      );
      expect(byPath(forward.conflicts.map(mirror))).toEqual(
        byPath(backward.conflicts),
      );
    }
  });

  it("is complete: before plus the diff gives after", () => {
    for (let i = 0; i < states.length; i++) {
      for (const step of [1, 7, 23]) {
        const a = states[i].state;
        const b = scramble(states[(i + step) % states.length].state);
        const result = diffMarketStates(a, b);
        expect(result.diagnostics).toEqual([]);
        const patched = applyChanges(canonicalize(marketStateSchema, a).tree, [
          ...result.conflicts,
          ...result.changes,
        ]);
        expect(sameTree(patched, canonicalize(marketStateSchema, b).tree)).toBe(
          true,
        );
        for (const change of [...result.changes, ...result.conflicts])
          if (change.op === "set")
            expect(change.before).not.toEqual(change.after);
      }
    }
  });
});
