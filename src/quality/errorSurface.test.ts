// D1-S2 (preview errors cleanup): the dead-shim and retired-wording gate.
// The banned tokens are assembled from fragments below, so no file — this
// one included — is exempt from the sweep.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..");
const SRC = join(ROOT, "src");

/** The retired term (matched case-insensitively), assembled so this file stays clean. */
const RETIRED_WORD = ["ver", "dict"].join("");
/** The shim hook that must never come back. */
const SHIM_HOOK = ["Symbol.", "hasInstance"].join("");
/** The six class-era names: `new <Name>(` must not exist — they are types now. */
const DEAD_NEW = [
  "UnsupportedTargetError",
  "UnsupportedPoolFunctionError",
  "UnsupportedZapperFunctionError",
  "UnsupportedOperationError",
  "InvalidDelayedIntentError",
  "PreviewSimulationError",
].map(name => `new ${name}(`);

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path, acc);
    } else if (/\.tsx?$/.test(name)) {
      acc.push(path);
    }
  }
  return acc;
}

const FILES = walk(SRC);
const SWEPT = [...FILES, join(ROOT, "MIGRATION.md")];

/** The Delivery's evidence file (its slug carries the retired term, so the path is assembled). */
const EVIDENCE = join(
  ROOT,
  "docs",
  "plans",
  `${RETIRED_WORD}-shim-removal.evidence.md`,
);

describe("error surface", () => {
  it("the code-map poison evidence is recorded with both diagnostics", () => {
    expect(existsSync(EVIDENCE), "evidence file must exist").toBe(true);
    const text = readFileSync(EVIDENCE, "utf8");
    expect(text).toContain("Poison A");
    expect(text).toContain("Poison B");
    expect(text).toContain("error TS");
    expect(text).toContain("restored");
  });

  it("no shim hook survives anywhere in src", () => {
    const offenders = FILES.filter(file =>
      readFileSync(file, "utf8").includes(SHIM_HOOK),
    ).map(file => relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it("no new-construction of the six class-era error names in src", () => {
    const offenders: string[] = [];
    for (const file of FILES) {
      const source = readFileSync(file, "utf8");
      for (const needle of DEAD_NEW) {
        if (source.includes(needle)) {
          offenders.push(`${relative(ROOT, file)}: ${needle}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  describe("retired wording", () => {
    it.each(SWEPT.map(file => [relative(ROOT, file), file] as const))(
      "no retired wording: %s",
      (_name, file) => {
        const text = readFileSync(file, "utf8").toLowerCase();
        const at = text.indexOf(RETIRED_WORD);
        expect(
          at,
          at === -1
            ? undefined
            : `retired term at offset ${at}: …${text.slice(Math.max(0, at - 40), at + 40)}…`,
        ).toBe(-1);
      },
    );
  });
});
