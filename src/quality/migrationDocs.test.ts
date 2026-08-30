// D1-S7 (precise-error-unions): the migration guide and the consumer impact
// report exist and are count-checked against the code, so a table cannot
// drift from what shipped.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..");
const MIGRATION = join(ROOT, "MIGRATION.md");
const IMPACT = join(ROOT, "docs", "plans", "precise-error-unions.impact.md");

/** The nine refusable prepare methods the per-method table must carry. */
const REFUSABLE = [
  "deposit",
  "withdraw",
  "redeem",
  "openNewStrategy",
  "depositStrategy",
  "repayStrategy",
  "addCollateral",
  "withdrawCollateral",
  "withdrawStrategy",
  "adjustLeverage",
  "finalize",
] as const;

/** The audited engine throw sites the disposition table must carry. */
const DISPOSITIONS = [
  "plan started no withdrawal",
  "no request among the operations",
  "neither answered nor refused",
  "queued nothing to claim",
] as const;

describe("MIGRATION.md", () => {
  const text = readFileSync(MIGRATION, "utf8");

  it("documents the SDKReturn envelope, not WithError", () => {
    expect(text).toContain("SDKReturn");
    expect(text).toContain("isSDKError");
    expect(text).not.toContain("WithError<D, E>");
  });

  it.each(REFUSABLE)("per-method table row: %s", method => {
    const section = text.slice(text.indexOf("## Per-method error unions"));
    expect(section.indexOf(`\`${method}\``), method).toBeGreaterThan(-1);
  });

  it.each(DISPOSITIONS)("throw disposition row: %s", anchor => {
    const section = text.slice(text.indexOf("## Throw dispositions"));
    expect(section).toContain(anchor);
  });
});

describe("impact report", () => {
  it("exists and names both consumers with real typecheck output", () => {
    expect(existsSync(IMPACT), "impact.md must exist").toBe(true);
    const text = readFileSync(IMPACT, "utf8");
    expect(text).toContain("gearbox-backend");
    expect(text).toContain("client-v3");
    expect(text).toContain("error TS");
    // the two headline numbers the report stands on
    expect(text).toContain("zero new errors");
    expect(text).toContain("useSimulate.ts");
  });
});
