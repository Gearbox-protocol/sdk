import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { listBundles } from "../bundles/catalog/index.js";
import { marketActionsData } from "../index.js";
import { computeBundleFixtures } from "./fixture-runner.js";

const fixturePath = fileURLToPath(
  new URL("./fixtures/bundles.json", import.meta.url),
);

describe("GIP builder migration snapshots", () => {
  it("preserves calldata and resulting state for the catalog bundles", async () => {
    const actual = await computeBundleFixtures();
    const expected = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
    expect(Object.keys(actual)).toHaveLength(72);
    expect(actual).toEqual(expected);
  });

  it("includes every action in the registry and every catalog pair", () => {
    expect(new Set(marketActionsData.map(action => action.type)).size).toBe(53);
    expect(listBundles()).toHaveLength(100);
  });
});
