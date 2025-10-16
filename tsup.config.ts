import { readdirSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { sync as spawnSync } from "cross-spawn";
import type { Options } from "tsup";
import { defineConfig } from "tsup";

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

export default defineConfig(options => {
  const subpaths = getSubpaths("./src", "abi");
  console.info("building subpaths", subpaths);

  const commonOptions: Partial<Options> = {
    entry: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/*.mock.ts"],
    clean: !options.watch, // cleaning in watch mode causes problems with turborepo
    bundle: false,
    splitting: false,
    treeshake: false,
    sourcemap: false,
    // axios is externalized, because it has two different bundles for node (with native modules as dependencies)
    // and browser. and we here make one bundle for both. so this responsibility is pushed further the build chain
    external: ["../sdk", "axios"],
    ...options,
  };

  return [
    {
      ...commonOptions,
      format: "cjs",
      outDir: "./dist/cjs/",
      // outExtension: () => ({ js: ".cjs" }),
      onSuccess: async () => {
        await Promise.all(
          subpaths.map(subpath => writeDummyPackage(subpath, "cjs")),
        );
      },
    },
    {
      ...commonOptions,
      format: ["esm"],
      outExtension: () => ({ js: ".js" }),

      outDir: "./dist/esm/",
      onSuccess: async () => {
        await Promise.all(
          subpaths.map(subpath => writeDummyPackage(subpath, "esm")),
        );

        spawnSync("tsc", [
          "--project",
          "./tsconfig.build.json",
          "--declarationDir",
          "./dist/types",
          "--emitDeclarationOnly",
          "--declaration",
        ]);
      },
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
