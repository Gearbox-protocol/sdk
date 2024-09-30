import type { Options } from "tsup";
import { defineConfig } from "tsup";

export default defineConfig(options => {
  const commonOptions: Partial<Options> = {
    entry: ["src/index.ts"],
    clean: true,
    dts: true,
    splitting: false,
    treeshake: true,
    sourcemap: false,
    ...options,
  };

  return [
    {
      ...commonOptions,
      format: "cjs",
      outDir: "./dist/cjs/",
      outExtension: () => ({ js: ".cjs" }),
    },
    {
      ...commonOptions,
      format: ["esm"],
      outExtension: () => ({ js: ".mjs" }),
      outDir: "./dist/esm/",
    },
  ];
});
