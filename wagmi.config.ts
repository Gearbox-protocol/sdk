import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig([
  {
    out: "src/types/index.ts",
    contracts: [],
    plugins: [
      foundry({
        forge: { build: false },
        artifacts: "./forge-out/",
      }),
    ],
  },
]);
