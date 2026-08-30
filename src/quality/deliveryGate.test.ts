// D1-S8 (precise-error-unions): the Delivery's own gate as a spec, so its
// guarantees fail the suite instead of fading into a checklist: the poison
// evidence exists, and the dead envelope cannot creep back in.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..");
const EVIDENCE = join(
  ROOT,
  "docs",
  "plans",
  "precise-error-unions.evidence.md",
);

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path, acc);
    } else if (/\.ts$/.test(name)) {
      acc.push(path);
    }
  }
  return acc;
}

describe("delivery gate", () => {
  it("the poison evidence is recorded with both diagnostics", () => {
    expect(existsSync(EVIDENCE), "evidence file must exist").toBe(true);
    const text = readFileSync(EVIDENCE, "utf8");
    expect(text).toContain("Poison A");
    expect(text).toContain("Poison B");
    expect(text).toContain("error TS");
    expect(text).toContain("restored");
  });

  it("the dead envelope stays dead: no WithError, no success discriminant", () => {
    const offenders: string[] = [];
    for (const file of walk(join(ROOT, "src"))) {
      // the two doc/gate tests quote the dead names on purpose; AccountOpener
      // is a dev helper with its own unrelated success flag on a tx report
      if (
        file.includes("src/quality/") ||
        file.endsWith("dev/AccountOpener.ts")
      ) {
        continue;
      }
      const source = readFileSync(file, "utf8");
      if (
        source.includes("WithError<") ||
        source.includes("success: true; data")
      ) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
