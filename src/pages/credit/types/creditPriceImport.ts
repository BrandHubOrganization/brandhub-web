import type { CreditPrice } from "@/pages/credit/types/credit";

export type BenchmarkCreditOperation =
  "AMBASSADOR_GENERATE" | "COMMERCIAL_IMAGE";
export interface CreditCsvIssue {
  row: number;
  field: string;
  code: string;
}
export interface CreditPriceImportRow {
  proposal: {
    row: number;
    operation: BenchmarkCreditOperation;
    unitCredits: number;
    sourceReportId: string;
    profileId: string;
    width: number;
    height: number;
    steps: number | null;
    generatedAt: string;
  };
  current: { unitCredits: string; revision: string; enabled: boolean } | null;
  changed: boolean;
}
export interface CreditPriceImportPreview {
  sha256: string;
  valid: boolean;
  rows: CreditPriceImportRow[];
  issues: CreditCsvIssue[];
}
export interface CreditPriceImportRequest {
  sha256: string;
  expectedRevisions: {
    operation: BenchmarkCreditOperation;
    revision: string;
  }[];
}
export interface CreditPriceImportResult {
  updatedPrices: CreditPrice[];
  unchangedOperations: BenchmarkCreditOperation[];
}
