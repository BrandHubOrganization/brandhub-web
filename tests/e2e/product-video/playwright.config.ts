import { defineConfig } from "@playwright/test";
import path from "node:path";
export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  outputDir: path.resolve(
    "../.tmp/product-video-pipeline-20261030/web/results",
  ),
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: path.resolve(
          "../.tmp/product-video-pipeline-20261030/web/results.json",
        ),
      },
    ],
  ],
  use: {
    actionTimeout: 15_000,
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3215",
    channel: "msedge",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
