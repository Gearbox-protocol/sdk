import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: [
            "src/e2e/**/*.test.ts",
            "src/**/*.e2e.test.ts",
            "src/offchain/**/*.test.ts",
            "src/permissionless/**/*.test.ts",
          ],
          setupFiles: ["./vitest.setup.ts"],
          env: loadEnv(mode, process.cwd(), ""),
          typecheck: {
            enabled: true,
            include: ["src/**/*.test-d.ts"],
          },
        },
      },
      {
        test: {
          // Backend clients: a release from `next` may target a backend that
          // is not deployed yet, so release.yml does not gate `next` on these.
          name: "api",
          include: [
            "src/offchain/**/*.test.ts",
            "src/permissionless/**/*.test.ts",
          ],
          exclude: ["src/**/*.e2e.test.ts"],
          setupFiles: ["./vitest.setup.ts"],
          env: loadEnv(mode, process.cwd(), ""),
        },
      },
      {
        test: {
          name: "e2e",
          include: ["src/e2e/**/*.test.ts", "src/**/*.e2e.test.ts"],
          setupFiles: ["./vitest.setup.ts"],
          globalSetup: ["src/e2e/globalSetup.ts"],
          testTimeout: 120_000,
          hookTimeout: 120_000,
          fileParallelism: false,
          env: loadEnv("", process.cwd(), ""),
        },
      },
    ],
  },
}));
