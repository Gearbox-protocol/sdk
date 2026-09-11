import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_NOTE,
  fingerprint,
  formatReport,
  loadCatalog,
  matchKey,
  newHits,
  scanText,
  shouldSkipPath,
  splitByCase,
} from "./vocab-scan.mjs";

const catalog = loadCatalog(`
ask:
draw: |
  Ban when it means borrowing.
credit:
payout:
short:
shortfall:
bar:
`);

describe("splitByCase", () => {
  it("splits camelCase and PascalCase", () => {
    assert.deepEqual(
      splitByCase("checkDraw").map(p => p.token),
      ["check", "Draw"],
    );
    assert.deepEqual(
      splitByCase("quotasAsked").map(p => p.token),
      ["quotas", "Asked"],
    );
  });

  it("keeps acronyms then the following word", () => {
    assert.deepEqual(
      splitByCase("HTMLParser").map(p => p.token),
      ["HTML", "Parser"],
    );
  });
});

describe("matchKey", () => {
  it("uses the longest catalog key", () => {
    const hit = matchKey("shortfall", catalog);
    assert.equal(hit?.key, "shortfall");
  });

  it("matches inflected prefixes", () => {
    assert.equal(matchKey("asked", catalog)?.key, "ask");
    assert.equal(matchKey("drawn", catalog)?.key, "draw");
    assert.equal(matchKey("crediting", catalog)?.key, "credit");
    assert.equal(matchKey("payouts", catalog)?.key, "payout");
  });

  it("does not match embedded stems", () => {
    assert.equal(matchKey("task", catalog), null);
    assert.equal(matchKey("basket", catalog), null);
    assert.equal(matchKey("embarrass", catalog), null);
  });
});

describe("scanText", () => {
  it("hits identifier pieces after case split", () => {
    const hits = scanText("function checkDraw() {}", catalog, "a.ts");
    assert.ok(hits.some(h => h.key === "draw" && h.piece === "checkDraw"));
  });

  it("hits quotasAsked via Asked → ask", () => {
    const hits = scanText("checkQuotasAsked", catalog, "b.ts");
    assert.ok(hits.some(h => h.key === "ask" && h.piece === "checkQuotasAsked"));
  });

  it("skips task / embarrass", () => {
    const hits = scanText("task embarrass sidebar", catalog, "c.ts");
    assert.equal(
      hits.filter(h => h.key === "ask" || h.key === "bar").length,
      0,
    );
  });

  it("uses DEFAULT_NOTE when yaml value is empty", () => {
    const hits = scanText("a bar width", loadCatalog("bar:\n"), "d.ts");
    assert.equal(hits[0]?.note, DEFAULT_NOTE);
  });

  it("keeps a non-empty yaml note", () => {
    const hits = scanText("drawn from the pool", catalog, "e.ts");
    assert.ok(hits.some(h => h.key === "draw" && h.note.includes("borrowing")));
  });
});

describe("fingerprint and newHits", () => {
  it("is key + path + piece", () => {
    const [hit] = scanText("checkDraw", catalog, "src/a.ts");
    assert.equal(fingerprint(hit), "draw\nsrc/a.ts\ncheckdraw");
  });

  it("only reports occurrences added in the new text", () => {
    const added = newHits(
      "function keep() {}",
      "function checkDraw() {}",
      catalog,
      "src/a.ts",
    );
    assert.equal(added.length, 1);
    assert.equal(added[0].key, "draw");
  });

  it("does not re-report a piece that was already there", () => {
    const added = newHits(
      "function checkDraw() { return 1 }",
      "function checkDraw() { return 2 }",
      catalog,
      "src/a.ts",
    );
    assert.equal(added.length, 0);
  });
});

describe("formatReport", () => {
  it("groups by key and caps excerpts", () => {
    const hits = scanText(
      "checkDraw drawn drawing drawNow",
      catalog,
      "src/a.ts",
    );
    const report = formatReport(hits, { cwd: process.cwd() });
    assert.match(report, /candidates, not verdicts/);
    assert.match(report, /## `draw`/);
    assert.match(report, /borrowing/);
  });
});

describe("shouldSkipPath", () => {
  it("skips node_modules, dist, lockfiles, fixture json", () => {
    assert.equal(shouldSkipPath("src/foo.ts"), false);
    assert.equal(shouldSkipPath("node_modules/x/index.js"), true);
    assert.equal(shouldSkipPath("dist/index.js"), true);
    assert.equal(shouldSkipPath("pnpm-lock.yaml"), true);
    assert.equal(
      shouldSkipPath("src/onchain/preview/__fixtures__/foo.json"),
      true,
    );
  });
});
