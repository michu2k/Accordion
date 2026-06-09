/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: "./tests/test.setup.ts",
    environment: "jsdom",
    coverage: {
      reporter: ["html"],
      include: ["src/**/*.ts"]
    },
    include: ["tests/**/*.test.ts"]
  }
});
