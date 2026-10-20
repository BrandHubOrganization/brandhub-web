import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests do not need the native Tailwind/Vite UI build pipeline.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  test: { include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"] },
});
