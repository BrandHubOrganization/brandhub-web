import path from "node:path";
import { defineConfig } from "vitest/config";

const directory = path.resolve(import.meta.dirname, "..");
export default defineConfig({
  root: directory,
  resolve: {
    alias: {
      "@": path.join(directory, "src"),
      "opencut-wasm": path.join(directory, "wasm/opencut_wasm_bg.js"),
    },
  },
  test: {
    include: ["tests/edit-*.test.ts"],
    setupFiles: ["tests/setup-wasm.ts"],
  },
});
