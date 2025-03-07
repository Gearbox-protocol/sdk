import { glob, mkdir, readFile, rename, writeFile } from "node:fs/promises";

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

/**
 * When building ESM modules from subpath that import core SDK, such as dev
 * they'll have `import {...} from "../sdk"` line
 * This method fixes it by replacing `../sdk` with `../sdk/index.mjs`
 * @param subpath
 */
async function fixRelativeImports(subpath: string) {
  for (const ext of ["d.mts", "mjs"]) {
    let raw = await readFile(`./dist/esm/${subpath}/index.${ext}`, "utf-8");
    raw = raw.replace(`from '../sdk';`, `from '../sdk/index.${ext}';`);
    await writeFile(`./dist/esm/${subpath}/index.${ext}`, raw, "utf-8");
  }
}

/**
 * Abis are built separately by tsc
 * @param type
 */
async function buildAbi(type: "cjs" | "esm") {
  const options =
    type === "cjs"
      ? ["--module", "commonjs", "--moduleResolution", "node"]
      : [];
  spawnSync(
    "yarn",
    [
      "tsc",
      "--project",
      "tsconfig.abi.json",
      "--outDir",
      `./dist/${type}/abi`,
      ...options,
    ],
    {
      stdio: "inherit",
    },
  );
  // rename extensions
  const extensions =
    type === "esm"
      ? [
          ["d.ts", "d.mts"],
          ["js", "mjs"],
        ]
      : [["js", "cjs"]];
  for (const [from, to] of extensions) {
    const files = glob(`./dist/${type}/abi/*.${from}`);
    for await (const file of files) {
      const newFile = file.replace(new RegExp(`\\.${from}$`), `.${to}`);
      await rename(file, newFile);
    }
  }
}

export default defineConfig(options => {
  const commonOptions: Partial<Options> = {
    entry: ["src/sdk/index.ts", "src/dev/index.ts", "src/adapters/index.ts"],
    clean: !options.watch, // cleaning in watch mode causes problems with turborepo
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
        await buildAbi("cjs");
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

        await buildAbi("esm");
      },
    },
  ];
});
