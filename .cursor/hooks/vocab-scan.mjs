/**
 * Catalog stem scanner. Segmented-prefix match, not substring and not exact token.
 * Import from vocab-gate.mjs, or: node .cursor/hooks/vocab-scan.mjs [files...]
 */
import { readFileSync } from "node:fs";
import { extname, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

export const DEFAULT_NOTE =
  "Do not introduce this stem in new identifiers or prose. Existing names stay.";

export const REPORT_CAP_BYTES = 4096;
const EXCERPTS_PER_KEY = 3;
const WINDOW = 24;

const SKIP_DIR = /(?:^|\/)(?:node_modules|dist)(?:\/|$)/;
const SKIP_LOCK = /(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/;
const SKIP_FIXTURE_JSON = /fixture/i;

/**
 * @typedef {{ key: string, note: string }} CatalogEntry
 * @typedef {{
 *   key: string,
 *   note: string,
 *   path: string,
 *   token: string,
 *   piece: string,
 *   excerpt: string,
 *   start: number,
 * }} Hit
 */

export function shouldSkipPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  if (SKIP_DIR.test(p)) return true;
  if (SKIP_LOCK.test(p)) return true;
  if (extname(p) === ".json" && SKIP_FIXTURE_JSON.test(p)) return true;
  return false;
}

export function loadCatalog(yamlText) {
  const raw = parseYaml(yamlText);
  if (!raw || typeof raw !== "object") return [];
  /** @type {CatalogEntry[]} */
  const entries = [];
  for (const [key, value] of Object.entries(raw)) {
    const stem = String(key).toLowerCase();
    if (!stem) continue;
    const note =
      typeof value === "string" && value.trim() ? value.trim() : DEFAULT_NOTE;
    entries.push({ key: stem, note });
  }
  entries.sort((a, b) => b.key.length - a.key.length);
  return entries;
}

export function loadCatalogFromFile(yamlPath) {
  return loadCatalog(readFileSync(yamlPath, "utf8"));
}

/**
 * Split an alphanumeric run on camelCase / PascalCase / acronyms.
 * `checkDraw` → check, Draw; `HTMLParser` → HTML, Parser; `FOO` → FOO
 * @returns {{ token: string, offset: number }[]}
 */
export function splitByCase(piece) {
  if (!piece) return [];
  const parts = [];
  const re = /[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+/g;
  for (const m of piece.matchAll(re)) {
    parts.push({ token: m[0], offset: m.index ?? 0 });
  }
  if (parts.length === 0) return [{ token: piece, offset: 0 }];
  return parts;
}

/**
 * @param {string} tokenLower
 * @param {CatalogEntry[]} catalog longest-first
 */
export function matchKey(tokenLower, catalog) {
  for (const entry of catalog) {
    if (tokenLower.startsWith(entry.key)) return entry;
  }
  return null;
}

function excerptAt(text, start, end) {
  const from = Math.max(0, start - WINDOW);
  const to = Math.min(text.length, end + WINDOW);
  let slice = text.slice(from, to).replace(/\s+/g, " ").trim();
  if (from > 0) slice = `…${slice}`;
  if (to < text.length) slice = `${slice}…`;
  return slice;
}

/**
 * @param {string} text
 * @param {CatalogEntry[]} catalog
 * @param {string} [path]
 * @returns {Hit[]}
 */
export function scanText(text, catalog, path = "") {
  if (!text || catalog.length === 0) return [];
  /** @type {Hit[]} */
  const hits = [];
  const pieceRe = /[A-Za-z0-9]+/g;
  for (const m of text.matchAll(pieceRe)) {
    const piece = m[0];
    const pieceStart = m.index ?? 0;
    for (const { token, offset } of splitByCase(piece)) {
      const entry = matchKey(token.toLowerCase(), catalog);
      if (!entry) continue;
      const start = pieceStart + offset;
      const end = start + token.length;
      hits.push({
        key: entry.key,
        note: entry.note,
        path,
        token,
        piece,
        excerpt: excerptAt(text, start, end),
        start,
      });
    }
  }
  return hits;
}

/** @param {Pick<Hit, 'key' | 'path' | 'piece'>} hit */
export function fingerprint(hit) {
  return `${hit.key}\n${hit.path}\n${hit.piece.toLowerCase()}`;
}

/**
 * Occurrences in `next` whose fingerprint is not in `prev`.
 * @param {string} prev
 * @param {string} next
 * @param {CatalogEntry[]} catalog
 * @param {string} path
 */
export function newHits(prev, next, catalog, path) {
  const before = new Set(scanText(prev, catalog, path).map(fingerprint));
  return scanText(next, catalog, path).filter(h => !before.has(fingerprint(h)));
}

function displayPath(filePath, cwd) {
  if (!filePath) return ":plan";
  if (cwd) {
    const rel = relative(cwd, filePath);
    if (rel && !rel.startsWith("..")) return rel;
  }
  return filePath;
}

/**
 * @param {Hit[]} hits
 * @param {{ cwd?: string, capBytes?: number }} [opts]
 */
export function formatReport(hits, opts = {}) {
  const cap = opts.capBytes ?? REPORT_CAP_BYTES;
  if (hits.length === 0) return "";

  /** @type {Map<string, { note: string, excerpts: string[], extra: number }>} */
  const groups = new Map();
  for (const hit of hits) {
    let g = groups.get(hit.key);
    if (!g) {
      g = { note: hit.note, excerpts: [], extra: 0 };
      groups.set(hit.key, g);
    }
    const loc = displayPath(hit.path, opts.cwd);
    const line = `${loc}: \`${hit.piece}\` — ${hit.excerpt}`;
    if (g.excerpts.length < EXCERPTS_PER_KEY) g.excerpts.push(line);
    else g.extra += 1;
  }

  const lines = [
    "Catalog stem hits (candidates, not verdicts). Apply each note. Do not mass-rename existing names.",
    "",
  ];
  for (const [key, g] of groups) {
    lines.push(`## \`${key}\``);
    lines.push(g.note);
    for (const ex of g.excerpts) lines.push(`- ${ex}`);
    if (g.extra) lines.push(`- …and ${g.extra} more`);
    lines.push("");
  }

  let out = `${lines.join("\n").trimEnd()}\n`;
  if (Buffer.byteLength(out) > cap) {
    out = `${out.slice(0, cap - 20).trimEnd()}\n…(truncated)\n`;
  }
  return out;
}

function main(argv) {
  const yamlPath = new URL("../rules/banned-words.yaml", import.meta.url);
  let catalog;
  try {
    catalog = loadCatalogFromFile(yamlPath);
  } catch {
    process.exit(0);
  }
  const files = argv.slice(2);
  /** @type {Hit[]} */
  let hits = [];
  if (files.length === 0 && !process.stdin.isTTY) {
    const text = readFileSync(0, "utf8");
    hits = scanText(text, catalog, ":stdin");
  } else {
    for (const file of files) {
      if (shouldSkipPath(file)) continue;
      hits.push(...scanText(readFileSync(file, "utf8"), catalog, file));
    }
  }
  const report = formatReport(hits);
  if (report) process.stdout.write(report);
}

try {
  if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main(process.argv);
  }
} catch {
  // not a CLI invocation
}
