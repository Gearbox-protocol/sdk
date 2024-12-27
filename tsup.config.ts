import { readFile, writeFile } from "node:fs/promises";

import { sync as spawnSync } from "cross-spawn";
import type { Options } from "tsup";
import { defineConfig } from "tsup";

export default defineConfig(options => {
  const commonOptions: Partial<Options> = {
    entry: ["src/sdk/index.ts", "src/dev/index.ts"],
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
        await writeFile(
          "./dist/cjs/sdk/package.json",
          `{"type": "commonjs"}`,
          "utf-8",
        );
        await writeFile(
          "./dist/cjs/dev/package.json",
          `{"type": "commonjs"}`,
          "utf-8",
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

        let raw = await readFile("./dist/esm/dev/index.mjs", "utf-8");
        raw = raw.replace(`from '../sdk';`, `from '../sdk/index.mjs';`);
        await writeFile("./dist/esm/dev/index.mjs", raw, "utf-8");

        raw = await readFile("./dist/esm/dev/index.d.mts", "utf-8");
        raw = raw.replace(`from '../sdk';`, `from '../sdk/index.d.mts';`);
        await writeFile("./dist/esm/dev/index.d.mts", raw, "utf-8");

        await writeFile(
          "./dist/esm/sdk/package.json",
          `{"type": "module","sideEffects":false}`,
          "utf-8",
        );
        await writeFile(
          "./dist/esm/dev/package.json",
          `{"type": "module","sideEffects":false}`,
          "utf-8",
        );
      },
    },
  ];
});
