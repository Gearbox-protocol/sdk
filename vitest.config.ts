import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/e2e/**/*.test.ts"],
          env: loadEnv(mode, process.cwd(), ""),
          typecheck: {
            enabled: true,
            include: ["src/**/*.test-d.ts"],
          },
        },
      },
      {
        test: {
          name: "e2e",
          include: ["src/e2e/**/*.test.ts"],
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
