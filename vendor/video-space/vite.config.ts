import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const directory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/video-space/",
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.join(directory, "src"),
      "next/navigation": path.join(directory, "src/platform/navigation.ts"),
      "next/link": path.join(directory, "src/platform/link.tsx"),
      "next/image": path.join(directory, "src/platform/image.tsx"),
      "opencut-wasm": path.join(directory, "wasm/opencut_wasm_bg.js"),
    },
  },
  worker: { format: "es" },
  build: {
    target: "esnext",
    outDir: path.resolve(directory, "../../public/video-space"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
});
