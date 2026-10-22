import { isAxiosError } from "axios";

export function creditInteger(input: string): number | null {
  if (!/^\d+$/.test(input)) return null;
  const amount = Number(input);
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}
export function creditErrorKey(error: unknown): string {
  const code: unknown = isAxiosError(error)
    ? error.response?.data?.error?.code
    : undefined;
  if (code === "CREDIT_CONFIGURATION_STALE") return "credit.errors.stale";
  if (code === "CREDIT_SCHEMA_NOT_READY") return "credit.errors.schema";
  if (code === "CREDIT_ACCOUNT_NOT_READY") return "credit.errors.account";
  if (code === "NOT_FOUND") return "credit.errors.notFound";
  if (code === "FORBIDDEN") return "credit.errors.forbidden";
  return "credit.errors.generic";
}

export const creditUnit = (operation: string) => {
  if (
    ["CONTENT_GENERATE", "CAPTION_VARIANTS", "HASHTAG_GENERATE"].includes(
      operation,
    )
  )
    return "request";
  return operation === "VIDEO_GENERATE" ? "video" : "image";
};
