import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { customerDriveService } from "@/services/customerDriveService";
import { useAuthStore } from "@/store/authStore";
import { customerDriveReturnPath } from "@/lib/customerDriveReturnPath";

export default function CustomerDriveCallback() {
  const { t } = useTranslation();
  const started = useRef(false);
  const [result, setResult] = useState<"connecting" | "completed" | "failed">(
    "connecting",
  );
  const client = useQueryClient();
  const [returnPath] = useState(() =>
    customerDriveReturnPath(
      sessionStorage.getItem("brandhub-drive-actor") ===
        useAuthStore.getState().user?.id
        ? sessionStorage.getItem("brandhub-drive-workspace")
        : null,
      sessionStorage.getItem("brandhub-drive-return"),
    ),
  );
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const workspace = sessionStorage.getItem("brandhub-drive-workspace");
    const actor = sessionStorage.getItem("brandhub-drive-actor");
    const code = params.get("code");
    const state = params.get("state");
    const contextFlags = {
      origin: window.location.origin,
      hasWorkspace: !!workspace,
      hasActor: !!actor,
      hasCode: !!code,
      hasState: !!state,
      hasProviderError: params.has("error"),
      actorMatches: !!actor && actor === useAuthStore.getState().user?.id,
    };
    // Remove authorization codes from browser history before any further navigation.
    window.history.replaceState(null, "", window.location.pathname);
    sessionStorage.removeItem("brandhub-drive-workspace");
    sessionStorage.removeItem("brandhub-drive-actor");
    sessionStorage.removeItem("brandhub-drive-return");
    const complete = async () => {
      if (
        !workspace ||
        !actor ||
        !code ||
        !state ||
        actor !== useAuthStore.getState().user?.id
      ) {
        console.warn(
          "[DEBUG-drive-callback] reason=missing_callback_context",
          contextFlags,
        );
        throw new Error("Invalid Drive callback context");
      }
      await customerDriveService.complete(workspace, code, state);
      if (useAuthStore.getState().user?.id !== actor)
        throw new Error("Drive callback actor changed");
      await client.invalidateQueries({
        queryKey: ["customer-drive", workspace, actor],
      });
    };
    void complete()
      .then(() => setResult("completed"))
      .catch((error: unknown) => {
        if (isAxiosError(error)) {
          console.warn(
            "[DEBUG-drive-callback] reason=complete_request_failed",
            {
              origin: window.location.origin,
              status: error.response?.status ?? null,
            },
          );
        }
        setResult("failed");
      });
  }, [client]);
  return (
    <main
      className="bg-background text-foreground mx-auto max-w-xl space-y-4 p-6"
      aria-live="polite"
    >
      <h1 className="text-xl font-semibold">{t("library.drive.title")}</h1>
      <p role={result === "failed" ? "alert" : "status"}>
        {t(`library.drive.${result}`)}
      </p>
      <Link className="text-primary underline" to={returnPath}>
        {returnPath.endsWith("/library")
          ? t("library.drive.back")
          : t("workspace.agencyStorage.back")}
      </Link>
    </main>
  );
}
