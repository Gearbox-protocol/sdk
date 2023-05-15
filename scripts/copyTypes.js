const { resolve } = require("path");
const { sync: rimraf } = require("rimraf");
const { glob, runTypeChain } = require("typechain");

/**
 * This script copies required types from contracts repository
 * Which is supposed to be available at `../contracts-v2`
 *
 * Untils contracts-v2 are published, we have to run it manually and commit src/types
 */
async function main() {
  const src = resolve(process.cwd(), "../contracts-v2/artifacts");
  const dst = resolve(process.cwd(), "src/types");
  const allFiles = glob(src, [
    // interfaces
    "!(build-info)/**/I?([A-Z]|st)+([a-zA-Z0-9_]).json",
    "**/interfaces/**/+([a-zA-Z0-9_]).json",
    // temporary exceptions
    "**/Multicall2.json",
    "**/PoolService.json",
    "**/AbstractCurveLPPriceFeed.json",
  ]);

  rimraf(dst);

  const result = await runTypeChain({
    cwd: process.cwd(),
    filesToProcess: allFiles,
    allFiles,
    outDir: dst,
    target: "ethers-v5",
  });

  console.info(`Copied ${result.filesGenerated} files`);
}

main().catch(console.error);
