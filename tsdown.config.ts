import { readdirSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";

/**
 * Write package.json for subpath with CJS or ESM type
 * @param subpath
 * @param type
 */
async function writeDummyPackage(subpath: string, type: "cjs" | "esm") {
  const body =
    type === "cjs"
      ? `{"type": "commonjs"}`
      : `{"type": "module","sideEffects":false}`;
  await mkdir(`./dist/${type}/${subpath}`, { recursive: true });
  await writeFile(`./dist/${type}/${subpath}/package.json`, body, "utf-8");
}

async function writeDummyPackages(subpaths: string[], type: "cjs" | "esm") {
  await Promise.all(subpaths.map(subpath => writeDummyPackage(subpath, type)));
}

export default defineConfig(inlineConfig => {
  const subpaths = getSubpaths("./src", "abi");
  console.info("building subpaths", subpaths);

  const commonOptions: UserConfig = {
    entry: [
      "src/**/*.ts",
      "!src/**/*.test.ts",
      "!src/**/*.test-d.ts",
      "!src/**/*.mock.ts",
      "!src/**/testing/**",
      "!src/e2e/**",
    ],
    root: "./src",
    unbundle: true,
    clean: !inlineConfig.watch, // cleaning in watch mode causes problems with turborepo
    treeshake: false,
    sourcemap: false,
    hash: false,
    cjsDefault: false,
    dts: false,
    deps: { neverBundle: true },
  };

  return [
    {
      ...commonOptions,
      format: "cjs",
      outDir: "./dist/cjs/",
      outExtensions: () => ({ js: ".js" }),
      onSuccess: () => writeDummyPackages(subpaths, "cjs"),
    },
    {
      ...commonOptions,
      format: "esm",
      outDir: "./dist/esm/",
      outExtensions: () => ({ js: ".js" }),
      onSuccess: () => writeDummyPackages(subpaths, "esm"),
    },
    {
      ...commonOptions,
      format: "esm",
      outDir: "./dist/types/",
      outExtensions: () => ({ dts: ".ts" }),
      dts: { emitDtsOnly: true },
    },
  ];
});

function getSubpaths(dir: string, ...include: string[]): string[] {
  const subdirectories = new Set([...include]);

  function searchDirectory(currentDir: string, relPath = "") {
    const entries = readdirSync(currentDir);

    if (entries.includes("index.ts")) {
      subdirectories.add(relPath);
    } else {
      for (const entry of entries) {
        const fullPath = join(currentDir, entry);
        const entryRelativePath = join(relPath, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
          searchDirectory(fullPath, entryRelativePath);
        }
      }
    }
  }

  searchDirectory(dir);
  return Array.from(subdirectories);
}
