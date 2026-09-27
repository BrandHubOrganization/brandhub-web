import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, Info, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { authService, oauthLinkUrl } from "@/services/authService";
import type { MeResponse } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/utils/error";

/** Logo Google — không có trong lucide (brand mark, không phải icon). */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.56-5.15 3.56-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.63l3.98 3.09C6.22 6.87 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export function ConnectionsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await authService.me();
      setMe(res.data.data);
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("settings.connections.loadError")),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Backend redirect về đây kèm ?linked= / ?error= sau khi OAuth xong.
  // Xoá query TRƯỚC khi toast để StrictMode double-mount không toast 2 lần.
  useEffect(() => {
    const linked = searchParams.get("linked");
    const error = searchParams.get("error");
    if (!linked && !error) return;

    setSearchParams({}, { replace: true });

    if (linked) {
      toast.success(
        t("settings.connections.connectSuccess", {
          provider: linked === "google" ? "Google" : linked,
        }),
      );
    }
    if (error) {
      toast.error(
        t(
          `settings.connections.error.${error}`,
          t("settings.connections.linkError"),
        ),
      );
    }
  }, [searchParams, setSearchParams, t]);

  const linkedProviders = me?.linkedProviders ?? [];
  const isGoogleLinked = linkedProviders.includes("google");
  const hasPassword = me?.hasPassword === true;
  // Google là cách đăng nhập duy nhất → cấm tự khoá mình khỏi tài khoản.
  const isOnlyMethod = !hasPassword && linkedProviders.length <= 1;

  const handleConnect = () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      toast.error(t("settings.connections.linkError"));
      return;
    }
    setIsRedirecting(true);
    window.location.href = oauthLinkUrl("google", token);
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      await authService.unlinkOAuth({ provider: "google" });
      toast.success(
        t("settings.connections.disconnectSuccess", { provider: "Google" }),
      );
      setConfirmOpen(false);
      await load();
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("settings.connections.unlinkError")),
      );
    } finally {
      setIsUnlinking(false);
    }
  };

  if (isLoading) {
    return (
      <section id="connections" className="flex flex-col gap-4">
        <div className="bg-muted h-24 animate-pulse rounded-lg" />
        <div className="bg-muted h-24 animate-pulse rounded-lg" />
      </section>
    );
  }

  return (
    <section id="connections" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">
          {t("settings.connections.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("settings.connections.pageDescription")}
        </p>
      </header>

      <div className="divide-border divide-y rounded-lg border">
        {/* Email + mật khẩu */}
        <div className="flex items-start justify-between gap-4 p-4">
          <div className="flex gap-3">
            <span className="bg-muted mt-0.5 flex size-9 items-center justify-center rounded-md">
              <Mail className="text-muted-foreground size-5" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {t("settings.connections.emailPasswordLabel")}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("settings.connections.emailPasswordDescription", {
                  email: me?.email ?? "",
                })}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-xs">
                <KeyRound className="size-3.5" />
                {hasPassword
                  ? t("settings.connections.passwordSet")
                  : t("settings.connections.passwordNotSet")}
              </span>
            </div>
          </div>
          {!hasPassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = "/settings/security";
              }}
            >
              {t("settings.connections.setPasswordCta")}
            </Button>
          )}
        </div>

        {/* Google */}
        <div className="flex items-start justify-between gap-4 p-4">
          <div className="flex gap-3">
            <span className="bg-muted mt-0.5 flex size-9 items-center justify-center rounded-md">
              <GoogleMark />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {t("settings.connections.googleLabel")}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("settings.connections.googleDescription")}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-xs">
                {isGoogleLinked ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    {t("settings.connections.connectedLabel")}
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {t("settings.connections.notConnectedLabel")}
                  </span>
                )}
              </span>
            </div>
          </div>

          {isGoogleLinked ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isOnlyMethod}
              title={
                isOnlyMethod
                  ? t("settings.connections.onlyMethodHint")
                  : undefined
              }
              onClick={() => setConfirmOpen(true)}
            >
              {t("settings.connections.disconnect")}
            </Button>
          ) : (
            <Button
              variant="orange"
              size="sm"
              disabled={isRedirecting}
              onClick={handleConnect}
            >
              {isRedirecting
                ? t("settings.connections.connecting")
                : t("settings.connections.connect")}
            </Button>
          )}
        </div>
      </div>

      {isOnlyMethod && isGoogleLinked && (
        <p className="text-muted-foreground text-xs">
          {t("settings.connections.onlyMethodHint")}
        </p>
      )}

      <div className="bg-muted/50 flex gap-3 rounded-lg border p-4">
        <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium">
            {t("settings.connections.howItWorksTitle")}
          </span>
          <span className="text-muted-foreground">
            {t("settings.connections.howItWorksBody")}
          </span>
          <span className="text-muted-foreground">
            {t("settings.connections.emailMismatchWarning", {
              email: me?.email ?? "",
            })}
          </span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleUnlink}
        title={t("settings.connections.disconnectTitle", {
          provider: "Google",
        })}
        description={t("settings.connections.disconnectBody")}
        confirmText={t("settings.connections.disconnectConfirm")}
        cancelText={t("settings.connections.cancel")}
        variant="danger"
        isLoading={isUnlinking}
      />
    </section>
  );
}

export default ConnectionsPage;
