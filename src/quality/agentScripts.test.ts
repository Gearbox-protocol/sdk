// D1-S1 (precise-error-unions): the workspace exposes the code-production
// package.json API and builds on a clean install. The seven script names come
// from the agent-stack package contract; `unrun` is tsdown's config loader —
// without it in devDependencies a fresh checkout cannot build at all.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..");

interface PackageJsonShape {
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const pkg = JSON.parse(
  readFileSync(join(ROOT, "package.json"), "utf8"),
) as PackageJsonShape;

const REQUIRED_SCRIPTS = [
  "agent:install",
  "agent:test:backend",
  "agent:test:frontend",
  "agent:test:e2e",
  "agent:verify:commit",
  "agent:verify:pr",
  "agent:verify:docs",
] as const;

describe("code-production package API", () => {
  it.each(REQUIRED_SCRIPTS)("declares the %s script", name => {
    expect(
      pkg.scripts?.[name],
      `package.json is missing "${name}"`,
    ).toBeTruthy();
  });

  it("carries unrun so a clean install can load tsdown.config.ts", () => {
    expect(
      pkg.devDependencies?.unrun,
      "unrun must be a devDependency — tsdown fails without it on a fresh checkout",
    ).toBeTruthy();
  });
});
