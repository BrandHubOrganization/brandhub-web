import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

export function requestError(error: unknown, t: TFunction) {
  const code: unknown = isAxiosError(error) ? error.response?.data?.error?.code : undefined;
  const key = typeof code === "string" ? `requests.v2.errors.${code}` : "";
  return key && t(key) !== key ? t(key) : t("requests.v2.errors.generic");
}

export function invalidRequestFields(error: unknown): string[] {
  if (!isAxiosError(error)) return [];
  const fields: unknown = error.response?.data?.error?.details?.fields;
  return fields && typeof fields === "object" ? Object.keys(fields) : [];
}
