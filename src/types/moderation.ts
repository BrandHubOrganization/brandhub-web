export interface ModerationResult {
  status: "PASSED" | "WARNING" | "BLOCKED" | "NOT_CHECKED";
  issues: { code: string; message: string; score?: number | null; excerpt: string }[];
}
