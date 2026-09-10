import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import {
  formatInventory,
  globToRegExp,
  inventoryToJson,
  keyOverlap,
  oneEntry,
  parseArgs,
  resolveFiles,
  runInventory,
} from "./vocab-inventory.mjs";
import { DEFAULT_NOTE, loadCatalog, shouldSkipPath } from "./vocab-scan.mjs";

const fixtureYaml = `
foo: |
  note for foo
foobar: |
  note for foobar
`;

const catalog = loadCatalog(fixtureYaml);

describe("parseArgs", () => {
  it("reads --key, --json, --catalog, and paths", () => {
    const a = parseArgs([
      "--key",
      "Foo",
      "--json",
      "--catalog",
      "tmp.yaml",
      "src/a.ts",
    ]);
    assert.equal(a.key, "foo");
    assert.equal(a.json, true);
    assert.equal(a.catalog, "tmp.yaml");
    assert.deepEqual(a.paths, ["src/a.ts"]);
  });
});

describe("oneEntry", () => {
  it("uses DEFAULT_NOTE when the stem is absent", () => {
    const { entry, inCatalog } = oneEntry("zzz", catalog);
    assert.equal(inCatalog, false);
    assert.equal(entry.key, "zzz");
    assert.equal(entry.note, DEFAULT_NOTE);
  });

  it("reuses the fixture note when present", () => {
    const { entry, inCatalog } = oneEntry("foo", catalog);
    assert.equal(inCatalog, true);
    assert.equal(entry.note, "note for foo");
  });
});

describe("keyOverlap", () => {
  it("reports the longer key when the stem prefixes it", () => {
    const overlap = keyOverlap("foo", catalog);
    assert.equal(overlap.length, 1);
    assert.equal(overlap[0].key, "foobar");
    assert.equal(overlap[0].note, "note for foobar");
  });

  it("reports the existing key that is a prefix of the stem", () => {
    const overlap = keyOverlap("foobar", catalog);
    assert.equal(overlap.length, 1);
    assert.equal(overlap[0].key, "foo");
    assert.equal(overlap[0].note, "note for foo");
  });

  it("is empty when no other key shares a prefix", () => {
    assert.deepEqual(keyOverlap("zzz", catalog), []);
  });
});

describe("globToRegExp", () => {
  it("matches a ** glob", () => {
    const re = globToRegExp("src/onchain/**");
    assert.equal(re.test("src/onchain/a.ts"), true);
    assert.equal(re.test("src/model/a.ts"), false);
  });
});

describe("resolveFiles", () => {
  it("honors shouldSkipPath", () => {
    const cwd = "/repo";
    const listed = [
      "src/a.ts",
      "node_modules/x/index.js",
      "src/onchain/preview/__fixtures__/foo.json",
    ];
    const files = resolveFiles(cwd, [], listed);
    assert.deepEqual(files, ["src/a.ts"]);
    assert.equal(shouldSkipPath("node_modules/x/index.js"), true);
  });

  it("filters a directory prefix against the listed set", () => {
    const files = resolveFiles(
      "/repo",
      ["src/onchain"],
      ["src/onchain/a.ts", "src/model/b.ts"],
    );
    assert.deepEqual(files, ["src/onchain/a.ts"]);
  });
});

describe("runInventory", () => {
  const dir = mkdtempSync(join(tmpdir(), "vocab-inv-"));
  const src = join(dir, "src");
  mkdirSync(join(src, "onchain"), { recursive: true });
  const sample = join(src, "onchain", "a.ts");
  writeFileSync(sample, "export const foobar = 1;\n");

  after(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("scans with a one-entry catalog and groups counts", () => {
    const inv = runInventory({
      key: "foo",
      catalog,
      files: ["src/onchain/a.ts"],
      cwd: dir,
    });
    assert.equal(inv.inCatalog, true);
    assert.equal(inv.note, "note for foo");
    assert.equal(inv.overlap[0]?.key, "foobar");
    assert.equal(inv.hits.length, 1);
    assert.equal(inv.hits[0].piece, "foobar");
    assert.equal(inv.byDirectory["src/onchain"], 1);
    assert.equal(inv.byPiece.foobar, 1);
  });

  it("skips unreadable skipped paths", () => {
    const inv = runInventory({
      key: "foo",
      catalog,
      files: ["node_modules/x.js"],
      cwd: dir,
    });
    assert.equal(inv.hits.length, 0);
  });
});

describe("formatInventory and json", () => {
  it("prints overlap and the note", () => {
    const inv = runInventory({
      key: "foo",
      catalog,
      files: [],
      cwd: process.cwd(),
    });
    const text = formatInventory(inv);
    assert.match(text, /# `foo`/);
    assert.match(text, /note for foo/);
    assert.match(text, /Key overlap/);
    assert.match(text, /`foobar`/);
    const json = inventoryToJson(inv);
    assert.equal(json.key, "foo");
    assert.equal(json.overlap[0].key, "foobar");
  });
});
