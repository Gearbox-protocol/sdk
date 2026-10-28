import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("./", import.meta.url));

/** Source modules of the curator, without its tests and test helpers. **/
function listModules(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== path.join(root, "testing")) listModules(full, out);
    } else if (
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test-d.ts")
    ) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Whether the compiler erases an import or re-export clause: `type …`, or
 * named specifiers that are all `type X`.
 **/
function isTypeOnly(clause: string): boolean {
  const text = clause
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();
  if (/^type\s/.test(text)) return true;
  const named = /^\{([\s\S]*)\}$/.exec(text);
  if (!named) return false;
  const specifiers = named[1]
    .split(",")
    .map(specifier => specifier.trim())
    .filter(Boolean);
  return (
    specifiers.length > 0 &&
    specifiers.every(specifier => /^type\s/.test(specifier))
  );
}

/**
 * Relative imports of every source module, with type-only imports erased the
 * way the compiler erases them, so what is left is exactly the runtime graph.
 **/
function runtimeImportGraph(): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const file of listModules(root)) {
    const source = fs.readFileSync(file, "utf8");
    const specifiers = [
      ...[
        ...source.matchAll(
          /^\s*(?:import|export)\s([^;]*?)\s*from\s+"(\.[^"]+\.js)"/gm,
        ),
      ]
        .filter(match => !isTypeOnly(match[1]))
        .map(match => match[2]),
      ...[...source.matchAll(/^\s*import\s+"(\.[^"]+\.js)"/gm)].map(
        match => match[1],
      ),
    ];
    graph.set(
      file,
      specifiers.map(specifier =>
        path.resolve(path.dirname(file), specifier.replace(/\.js$/, ".ts")),
      ),
    );
  }
  return graph;
}

/** Strongly connected components with more than one module (Tarjan). **/
function findCycles(graph: Map<string, string[]>): string[][] {
  let counter = 0;
  const index = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const cycles: string[][] = [];

  function visit(node: string): void {
    const nodeIndex = counter;
    index.set(node, nodeIndex);
    lowlink.set(node, nodeIndex);
    counter += 1;
    stack.push(node);
    onStack.add(node);
    for (const next of graph.get(node) ?? []) {
      if (!graph.has(next)) continue;
      const nextIndex = index.get(next);
      if (nextIndex === undefined) {
        visit(next);
        lowlink.set(
          node,
          Math.min(lowlink.get(node) ?? nodeIndex, lowlink.get(next) ?? 0),
        );
      } else if (onStack.has(next)) {
        lowlink.set(node, Math.min(lowlink.get(node) ?? nodeIndex, nextIndex));
      }
    }
    if (lowlink.get(node) !== nodeIndex) return;
    const component: string[] = [];
    let member: string | undefined;
    do {
      member = stack.pop();
      if (member === undefined) break;
      onStack.delete(member);
      component.push(path.relative(root, member));
    } while (member !== node);
    if (component.length > 1) cycles.push(component.sort());
  }

  for (const node of graph.keys()) if (!index.has(node)) visit(node);
  return cycles;
}

describe("module graph", () => {
  // In a cycle, which module evaluates first depends on which one is imported
  // first, so a registry that reads its plugins at module scope throws a TDZ
  // ReferenceError for some import orders.
  it("has no runtime import cycles, so every module can be an entry point", () => {
    const graph = runtimeImportGraph();
    expect(graph.size).toBeGreaterThan(100);
    expect(findCycles(graph)).toEqual([]);
  });
});
