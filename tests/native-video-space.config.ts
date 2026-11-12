import path from "node:path";
import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "../vendor/video-space/src"),
    },
  },
  test: { include: ["tests/native/*.test.ts"] },
});

