/**
 * One-key catalog inventory. Same matcher as vocab-scan.
 * node .cursor/hooks/vocab-inventory.mjs --key <stem> [--json] [--catalog path] [paths...]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  DEFAULT_NOTE,
  formatReport,
  loadCatalogFromFile,
  scanText,
  shouldSkipPath,
} from "./vocab-scan.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_YAML = join(HERE, "../rules/banned-words.yaml");

/**
 * @typedef {{ key: string, note: string }} CatalogEntry
 * @typedef {{
 *   key: string,
 *   note: string,
 *   inCatalog: boolean,
 *   overlap: CatalogEntry[],
 *   byDirectory: Record<string, number>,
 *   byPiece: Record<string, number>,
 *   hits: import("./vocab-scan.mjs").Hit[],
 * }} Inventory
 */

/**
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  /** @type {{ key: string, json: boolean, catalog: string, paths: string[] }} */
  const out = { key: "", json: false, catalog: "", paths: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") {
      out.json = true;
      continue;
    }
    if (a === "--key") {
      out.key = String(argv[++i] ?? "").toLowerCase();
      continue;
    }
    if (a === "--catalog") {
      out.catalog = String(argv[++i] ?? "");
      continue;
    }
    if (a.startsWith("-")) {
      throw new Error(`Unknown flag: ${a}`);
    }
    out.paths.push(a);
  }
  return out;
}

/**
 * Catalog-vs-catalog: other keys that prefix `stem` or that `stem` prefixes.
 * @param {string} stem
 * @param {CatalogEntry[]} catalog
 * @returns {CatalogEntry[]}
 */
export function keyOverlap(stem, catalog) {
  const s = stem.toLowerCase();
  return catalog.filter(
    e => e.key !== s && (e.key.startsWith(s) || s.startsWith(e.key)),
  );
}

/**
 * @param {string} stem
 * @param {CatalogEntry[]} catalog
 * @returns {{ entry: CatalogEntry, inCatalog: boolean }}
 */
export function oneEntry(stem, catalog) {
  const key = stem.toLowerCase();
  const found = catalog.find(e => e.key === key);
  if (found) return { entry: found, inCatalog: true };
  return { entry: { key, note: DEFAULT_NOTE }, inCatalog: false };
}

/**
 * @param {string} cwd
 * @returns {string[]}
 */
export function listDefaultFiles(cwd) {
  const r = spawnSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd, encoding: "buffer" },
  );
  if (r.status !== 0) return [];
  const raw = r.stdout ?? Buffer.alloc(0);
  if (raw.length === 0) return [];
  return raw
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

function hasGlob(pattern) {
  return /[*?]/.test(pattern);
}

/**
 * @param {string} pattern posix-ish glob, `**` and `*` / `?`
 */
export function globToRegExp(pattern) {
  const n = pattern.replace(/\\/g, "/").replace(/^\.\//, "");
  let src = "^";
  for (let i = 0; i < n.length; i++) {
    const c = n[i];
    if (c === "*" && n[i + 1] === "*") {
      src += ".*";
      i += 1;
      if (n[i + 1] === "/") i += 1;
      continue;
    }
    if (c === "*") {
      src += "[^/]*";
      continue;
    }
    if (c === "?") {
      src += "[^/]";
      continue;
    }
    if ("\\^$+()[]{}|.".includes(c)) src += `\\${c}`;
    else src += c;
  }
  src += "$";
  return new RegExp(src);
}

function relPosix(cwd, filePath) {
  const rel = relative(cwd, resolve(cwd, filePath)).replace(/\\/g, "/");
  return rel.startsWith("../") ? filePath.replace(/\\/g, "/") : rel;
}

/**
 * @param {string} cwd
 * @param {string} dir
 * @returns {string[]}
 */
function walkDir(cwd, dir) {
  const abs = resolve(cwd, dir);
  /** @type {string[]} */
  const out = [];
  const visit = p => {
    let ents;
    try {
      ents = readdirSync(p, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of ents) {
      const child = join(p, ent.name);
      const rel = relPosix(cwd, child);
      if (shouldSkipPath(rel) || shouldSkipPath(child)) continue;
      if (ent.isDirectory()) visit(child);
      else if (ent.isFile()) out.push(rel);
    }
  };
  visit(abs);
  return out;
}

/**
 * @param {string} cwd
 * @param {string[]} pathArgs
 * @param {string[]} [listed]
 */
export function resolveFiles(cwd, pathArgs, listed) {
  const all = listed ?? listDefaultFiles(cwd);
  if (pathArgs.length === 0) {
    return all.filter(p => !shouldSkipPath(p));
  }
  /** @type {string[]} */
  const out = [];
  for (const arg of pathArgs) {
    const n = arg.replace(/\\/g, "/").replace(/^\.\//, "");
    if (hasGlob(n)) {
      const re = globToRegExp(n);
      out.push(...all.filter(p => re.test(p.replace(/\\/g, "/"))));
      continue;
    }
    const prefix = n.replace(/\/$/, "");
    const pfx = prefix === "." || prefix === "" ? "" : `${prefix}/`;
    const fromList = all.filter(p => {
      const q = p.replace(/\\/g, "/");
      if (!pfx) return true;
      return q === prefix || q.startsWith(pfx);
    });
    if (fromList.length) {
      out.push(...fromList);
      continue;
    }
    const abs = resolve(cwd, arg);
    if (existsSync(abs) && statSync(abs).isDirectory()) {
      out.push(...walkDir(cwd, abs));
      continue;
    }
    out.push(relPosix(cwd, arg));
  }
  const seen = new Set();
  /** @type {string[]} */
  const uniq = [];
  for (const p of out) {
    if (shouldSkipPath(p) || seen.has(p)) continue;
    seen.add(p);
    uniq.push(p);
  }
  return uniq;
}

/**
 * @param {import("./vocab-scan.mjs").Hit[]} hits
 * @param {string} cwd
 */
export function summarizeHits(hits, cwd) {
  /** @type {Record<string, number>} */
  const byDirectory = {};
  /** @type {Record<string, number>} */
  const byPiece = {};
  for (const hit of hits) {
    const loc = relPosix(cwd, hit.path);
    const slash = loc.lastIndexOf("/");
    const dir = slash === -1 ? "." : loc.slice(0, slash);
    byDirectory[dir] = (byDirectory[dir] ?? 0) + 1;
    byPiece[hit.piece] = (byPiece[hit.piece] ?? 0) + 1;
  }
  return { byDirectory, byPiece };
}

/**
 * @param {{
 *   key: string,
 *   catalog: CatalogEntry[],
 *   files: string[],
 *   cwd: string,
 * }} opts
 * @returns {Inventory}
 */
export function runInventory(opts) {
  const { key, catalog, files, cwd } = opts;
  const { entry, inCatalog } = oneEntry(key, catalog);
  const overlap = keyOverlap(key, catalog);
  /** @type {import("./vocab-scan.mjs").Hit[]} */
  const hits = [];
  for (const file of files) {
    if (shouldSkipPath(file)) continue;
    const abs = resolve(cwd, file);
    let text;
    try {
      text = readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    hits.push(...scanText(text, [entry], file));
  }
  const { byDirectory, byPiece } = summarizeHits(hits, cwd);
  return {
    key: entry.key,
    note: entry.note,
    inCatalog,
    overlap,
    byDirectory,
    byPiece,
    hits,
  };
}

/**
 * @param {Inventory} inv
 * @param {{ cwd?: string }} [opts]
 */
export function formatInventory(inv, opts = {}) {
  const lines = [`# \`${inv.key}\``, "", inv.note, ""];
  lines.push(inv.inCatalog ? "Present in catalog." : "Not in catalog yet.", "");
  lines.push("## Key overlap");
  if (inv.overlap.length === 0) {
    lines.push("None.", "");
  } else {
    for (const e of inv.overlap) {
      lines.push(`- \`${e.key}\`: ${e.note}`);
    }
    lines.push("");
  }
  lines.push("## By directory");
  const dirs = Object.entries(inv.byDirectory).sort((a, b) => b[1] - a[1]);
  if (dirs.length === 0) lines.push("None.", "");
  else {
    for (const [dir, n] of dirs) lines.push(`- ${dir}: ${n}`);
    lines.push("");
  }
  lines.push("## By piece");
  const pieces = Object.entries(inv.byPiece).sort((a, b) => b[1] - a[1]);
  if (pieces.length === 0) lines.push("None.", "");
  else {
    for (const [piece, n] of pieces) lines.push(`- \`${piece}\`: ${n}`);
    lines.push("");
  }
  const report = formatReport(inv.hits, { cwd: opts.cwd, capBytes: Infinity });
  if (report) {
    lines.push("## Hits", "");
    lines.push(report.trimEnd(), "");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

/**
 * @param {Inventory} inv
 */
export function inventoryToJson(inv) {
  return {
    key: inv.key,
    note: inv.note,
    inCatalog: inv.inCatalog,
    overlap: inv.overlap.map(e => ({ key: e.key, note: e.note })),
    byDirectory: inv.byDirectory,
    byPiece: inv.byPiece,
    hits: inv.hits.map(h => ({
      key: h.key,
      path: h.path,
      token: h.token,
      piece: h.piece,
      excerpt: h.excerpt,
    })),
  };
}

/**
 * @param {string[]} argv
 * @param {{ cwd?: string }} [opts]
 */
export function main(argv, opts = {}) {
  const args = parseArgs(argv);
  if (!args.key) {
    process.stderr.write(
      "usage: node .cursor/hooks/vocab-inventory.mjs --key <stem> [--json] [--catalog path] [paths...]\n",
    );
    process.exit(1);
  }
  const cwd = opts.cwd ?? process.cwd();
  const yamlPath = args.catalog || DEFAULT_YAML;
  const catalog = loadCatalogFromFile(yamlPath);
  const files = resolveFiles(cwd, args.paths);
  const inv = runInventory({ key: args.key, catalog, files, cwd });
  if (args.json) {
    process.stdout.write(`${JSON.stringify(inventoryToJson(inv))}\n`);
  } else {
    process.stdout.write(formatInventory(inv, { cwd }));
  }
}

try {
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main(process.argv.slice(2));
  }
} catch (err) {
  process.stderr.write(`${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
}
