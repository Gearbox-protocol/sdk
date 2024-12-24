import { readFile, writeFile } from "node:fs/promises";

import type { Options } from "tsup";
import { defineConfig } from "tsup";

export default defineConfig(options => {
  const commonOptions: Partial<Options> = {
    entry: ["src/sdk/index.ts", "src/dev/index.ts"],
    clean: true,
    dts: true,
    splitting: false,
    treeshake: true,
    sourcemap: false,
    external: ["../sdk"],
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
