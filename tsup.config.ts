import { readFile, writeFile } from "node:fs/promises";

import { sync as spawnSync } from "cross-spawn";
import type { Options } from "tsup";
import { defineConfig } from "tsup";

async function writeDummyPackage(subpath: string, type: "cjs" | "esm") {
  const body =
    type === "cjs"
      ? `{"type": "commonjs"}`
      : `{"type": "module","sideEffects":false}`;
  await writeFile(`./dist/${type}/${subpath}/package.json`, body, "utf-8");
}

async function fixRelativeImports(subpath: string) {
  for (const ext of ["d.mts", "mjs"]) {
    let raw = await readFile(`./dist/esm/${subpath}/index.${ext}`, "utf-8");
    raw = raw.replace(`from '../sdk';`, `from '../sdk/index.${ext}';`);
    await writeFile(`./dist/esm/${subpath}/index.${ext}`, raw, "utf-8");
  }
}

export default defineConfig(options => {
  const commonOptions: Partial<Options> = {
    entry: [
      "src/sdk/index.ts",
      "src/dev/index.ts",
      "src/adapters/index.ts",
      "src/abi/**/*.ts",
    ],
    clean: true,
    splitting: false,
    treeshake: true,
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
      outExtension: () => ({ js: ".cjs" }),
      onSuccess: async () => {
        await Promise.all(
          ["sdk", "dev", "adapters", "abi"].map(subpath =>
            writeDummyPackage(subpath, "cjs"),
          ),
        );
      },
    },
    {
      ...commonOptions,
      format: ["esm"],
      outExtension: () => ({ js: ".mjs" }),
      outDir: "./dist/esm/",
      onSuccess: async () => {
        // tsup with dts option is not working as expected: onSuccess is triggered and then dts is executed in parallel
        // so we use spawnSync to run it in a separate process
        spawnSync("yarn", ["tsup", "--dts-only"], { stdio: "inherit" });

        for (const subpath of ["dev", "adapters"]) {
          await fixRelativeImports(subpath);
        }

        await Promise.all(
          ["sdk", "dev", "adapters", "abi"].map(subpath =>
            writeDummyPackage(subpath, "esm"),
          ),
        );
      },
    },
  ];
});
