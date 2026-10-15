import { isAxiosError } from "axios";
import type { TFunction } from "i18next";
import { extractErrorMessage } from "@/utils/error";

export function packageMutationError(error: unknown, fallback: string, t: TFunction): string {
  if (isAxiosError<{ error?: { code?: string } }>(error)
      && error.response?.data.error?.code === "MEDIA_PACKAGE_VERSION_CONFLICT")
    return t("mediaPackage.history.conflict");
  return extractErrorMessage(error, fallback);
}
