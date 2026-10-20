import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

export function workflowError(error: unknown, t: TFunction) {
  const code: unknown = isAxiosError(error)
    ? error.response?.data?.error?.code
    : undefined;
  const key = typeof code === "string" ? `tasks.workflow.errors.${code}` : "";
  return key && t(key) !== key ? t(key) : t("tasks.workflow.errors.generic");
}
export function workflowFields(error: unknown): string[] {
  if (!isAxiosError(error)) return [];
  const code: unknown = error.response?.data?.error?.code;
  if (code === "INVALID_ASSIGNEE") return ["assigneeId"];
  if (
    code === "INVALID_QC_ASSIGNEE" ||
    code === "QC_CANNOT_BE_SAME_AS_ASSIGNEE"
  )
    return ["qcAssigneeId"];
  const fields: unknown = error.response?.data?.error?.details?.fields;
  return fields && typeof fields === "object"
    ? [
        ...new Set(
          Object.keys(fields).map((field) => field.split(".")[0].split("[")[0]),
        ),
      ]
    : [];
}
