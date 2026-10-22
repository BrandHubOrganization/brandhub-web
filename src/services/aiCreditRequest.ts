import axios from "axios";
import { api } from "@/lib/axios";
import i18n from "@/i18n";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

const errorKeys: Record<string, string> = {
  CREDIT_BALANCE_INSUFFICIENT: "balance",
  CREDIT_MEMBER_LIMIT_REACHED: "limit",
  CREDIT_WORKSPACE_LIMIT_REACHED: "limit",
  CREDIT_PRICE_NOT_CONFIGURED: "price",
  CREDIT_ACCOUNT_NOT_READY: "account",
  CREDIT_SCHEMA_NOT_READY: "schema",
  CREDIT_AI_PENDING: "pending",
  CREDIT_AI_OUTCOME_UNKNOWN: "unknown",
  CREDIT_AI_FAILED: "failed",
  CREDIT_REQUEST_CONFLICT: "conflict",
};

export function aiCreditErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message === "AI_WORKSPACE_REQUIRED")
    return i18n.t("credit.ai.workspace");
  if (!axios.isAxiosError(error)) return null;
  const code = error.response?.data?.error?.code as string | undefined;
  const key = code && errorKeys[code];
  if (key) return i18n.t(`credit.ai.${key}`);
  if (!error.response && error.code !== "ERR_CANCELED")
    return i18n.t("credit.ai.unknown");
  return null;
}

export function refreshAiCredit(userId = useAuthStore.getState().user?.id) {
  if (userId) {
    void queryClient.invalidateQueries({ queryKey: ["credit", userId] });
    void queryClient.invalidateQueries({ queryKey: ["workspace-ai", userId] });
  }
}

export async function postAiWithCredit<T>(
  path: string,
  payload: unknown,
  options?: { signal?: AbortSignal; workspaceId?: string },
) {
  const pathWorkspace = path.match(
    /^\/api\/v1\/workspaces\/([^/]+)\/ai\//,
  )?.[1];
  const workspaceId =
    pathWorkspace ??
    options?.workspaceId ??
    window.location.pathname.match(/^\/workspaces\/([^/]+)(?:\/|$)/)?.[1] ??
    useWorkspaceStore.getState().currentWorkspace?.id;
  if (!workspaceId) throw new Error("AI_WORKSPACE_REQUIRED");
  const userId = useAuthStore.getState().user?.id;
  try {
    return await api.post<T>(path, payload, {
      signal: options?.signal,
      headers: {
        "X-AI-Workspace-Id": workspaceId,
        "Idempotency-Key": crypto.randomUUID(),
      },
    });
  } finally {
    refreshAiCredit(userId);
  }
}
