import { describe, expect, it } from "vitest";
import { sortFitTrends, type FitTrend } from "@/services/aiCaptionService";

const trend = (trendId: string, verdict: FitTrend["verdict"], platforms: string[]) =>
  ({ trendId, verdict, platforms }) as FitTrend;

describe("sortFitTrends", () => {
  const trends = [
    trend("evergreen", "nen", []),
    trend("threads-only", "nen", ["threads"]),
    trend("tiktok", "nen", ["tiktok", "threads"]),
    trend("tiktok-maybe", "can_nhac", ["tiktok"]),
  ];

  it("puts the platform's own trends first within a verdict", () => {
    expect(sortFitTrends(trends, "tiktok").map((t) => t.trendId)).toEqual([
      "tiktok",
      "evergreen",
      "threads-only",
      "tiktok-maybe",
    ]);
  });

  it("never lifts a weaker verdict over a stronger one", () => {
    expect(sortFitTrends(trends, "facebook").at(-1)?.trendId).toBe(
      "tiktok-maybe",
    );
  });
});
