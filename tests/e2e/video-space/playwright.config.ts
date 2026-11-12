import { defineConfig } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  outputDir: path.resolve("../.tmp/video-space-e2e/results"),
  reporter: [
    ["list"],
    [
      "json",
      { outputFile: path.resolve("../.tmp/video-space-e2e/results.json") },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3215",
    channel: "msedge",
    launchOptions: { args: ["--enable-unsafe-webgpu"] },
    viewport: { width: 1680, height: 1100 },
    acceptDownloads: true,
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
