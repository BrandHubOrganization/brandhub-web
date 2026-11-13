import { isAxiosError } from "axios";
import type { TFunction } from "i18next";
import { extractErrorMessage } from "@/utils/error";

export function packageMutationError(
  error: unknown,
  fallback: string,
  t: TFunction,
): string {
  if (isAxiosError<{ error?: { code?: string; message?: string } }>(error)) {
    const code = error.response?.data.error?.code;
    if (code === "CAMPAIGN_IMMUTABLE") {
      return t("mediaPackage.errors.campaignImmutable", {
        defaultValue:
          "Workspace này đã có gói dịch vụ đang triển khai. Mỗi Workspace chỉ triển khai được 1 gói dịch vụ; vui lòng tạo Workspace mới để triển khai gói tiếp theo.",
      });
    }
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
      return t("mediaPackage.history.conflict", {
        defaultValue:
          "Gói dịch vụ của Workspace đã thay đổi phiên bản hoặc đã tồn tại gói khác. Vui lòng tải lại trang hoặc tạo Workspace mới.",
      });
    if (code === "MEDIA_PACKAGE_NOT_AVAILABLE")
      return t("mediaPackage.errors.notAvailable", {
        defaultValue: "Gói dịch vụ này hiện không khả dụng cho Workspace.",
      });
    if (code === "MEDIA_PACKAGE_NOT_FOUND")
      return t("mediaPackage.errors.notFound", {
        defaultValue: "Không tìm thấy gói dịch vụ đã chọn.",
      });
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
