import { isAxiosError } from "axios";
import type { TFunction } from "i18next";
import { extractErrorMessage } from "@/utils/error";

export function packageMutationError(
  error: unknown,
  fallback: string,
  t: TFunction,
): string {
  if (isAxiosError<{ error?: { code?: string } }>(error)) {
    const code = error.response?.data.error?.code;
    if (
      code &&
      [
        "PACKAGE_PREPARATION_PENDING",
        "PACKAGE_IMPACT_BLOCKED",
        "PACKAGE_WORKFLOW_REPLACED",
      ].includes(code)
    )
      return t(`campaign.errors.${code}`);
    if (code === "MEDIA_PACKAGE_VERSION_CONFLICT")
      return t("mediaPackage.history.conflict");
    if (code === "TASK_REVIEW_MANAGER_REQUIRED")
      return t("mediaPackage.errors.campaignManagerRequired");
    if (
      code === "REQUEST_STORAGE_UNAVAILABLE" ||
      code === "TASK_SCHEMA_NOT_READY"
    )
      return t("mediaPackage.errors.campaignTaskStorage");
  }
  return extractErrorMessage(error, fallback);
}
