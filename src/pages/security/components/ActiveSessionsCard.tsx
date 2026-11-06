import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Laptop,
  LogOut,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { authService, type UserSession } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/utils/error";
import { cn } from "@/lib/utils";

interface ActiveSessionsCardProps {
  className?: string;
}

function parseClientEnvironment(): {
  os: string;
  browser: string;
  deviceType: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
} {
  if (typeof navigator === "undefined") {
    return {
      os: "Windows",
      browser: "Chrome",
      deviceType: "DESKTOP",
    };
  }
  const ua = navigator.userAgent;

  let os = "Desktop";
  if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/ipad/i.test(ua)) os = "iPadOS";
  else if (/iphone/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Web Browser";
  if (/edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Google Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
  else if (/safari/i.test(ua)) browser = "Apple Safari";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  let deviceType: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN" = "DESKTOP";
  if (/ipad|tablet/i.test(ua)) deviceType = "TABLET";
  else if (/mobi|iphone|android/i.test(ua)) deviceType = "MOBILE";

  return { os, browser, deviceType };
}

function getDeviceIcon(type: UserSession["deviceType"]) {
  switch (type) {
    case "MOBILE":
      return <Smartphone className="size-5" />;
    case "TABLET":
      return <Tablet className="size-5" />;
    case "DESKTOP":
      return <Monitor className="size-5" />;
    default:
      return <Laptop className="size-5" />;
  }
}

export function ActiveSessionsCard({ className }: ActiveSessionsCardProps) {
  const { t } = useTranslation();
  const [sessions, setSessions] = React.useState<UserSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [revoking, setRevoking] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const fetchSessions = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await authService.getSessions();
      if (
        res.data.data &&
        Array.isArray(res.data.data) &&
        res.data.data.length > 0
      ) {
        setSessions(res.data.data);
      } else {
        throw new Error("No active sessions returned");
      }
    } catch {
      // Fallback: Detect current session from browser environment & auth user
      const env = parseClientEnvironment();
      const lastLoginAt = useAuthStore.getState().user?.lastLoginAt;
      const fallbackSession: UserSession = {
        id: "current-client-session",
        deviceType: env.deviceType,
        os: env.os,
        browser: env.browser,
        ipAddress: "Vị trí hiện tại",
        lastActive: lastLoginAt || new Date().toISOString(),
        current: true,
      };
      setSessions([fallbackSession]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeOthers = async () => {
    setRevoking(true);
    try {
      await authService.revokeOtherSessions();
      toast.success(
        t(
          "security.sessions.revokeOthersSuccess",
          "Đã đăng xuất khỏi tất cả các thiết bị khác thành công",
        ),
      );
      setConfirmOpen(false);
      await fetchSessions();
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          t(
            "security.sessions.revokeOthersError",
            "Không thể đăng xuất các thiết bị khác. Vui lòng thử lại sau.",
          ),
        ),
      );
    } finally {
      setRevoking(false);
    }
  };

  const otherSessionsCount = sessions.filter((s) => !s.current).length;

  return (
    <div
      className={cn(
        "border-border bg-card rounded-xl border p-6 shadow-sm",
        className,
      )}
    >
      <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-orange-soft text-brand-orange rounded-xl p-2.5">
            <Monitor className="size-5" />
          </div>
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {t("security.sessions.title", "Thiết bị & Phiên hoạt động")}
            </h3>
            <p className="text-muted-foreground text-xs">
              {t(
                "security.sessions.subtitle",
                "Quản lý các thiết bị đang đăng nhập vào tài khoản BrandHub của bạn",
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={fetchSessions}
            disabled={loading}
            title={t("common.reload", "Tải lại")}
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
            onClick={() => setConfirmOpen(true)}
            disabled={loading || otherSessionsCount === 0}
          >
            <LogOut className="size-3.5" />
            {t("security.sessions.revokeOthers", "Đăng xuất thiết bị khác")}
          </Button>
        </div>
      </div>

      <div className="divide-border/60 mt-4 divide-y">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  session.current
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {getDeviceIcon(session.deviceType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-foreground text-sm font-medium">
                    {session.os} · {session.browser}
                  </p>
                  {session.current && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                      {t("security.sessions.currentDevice", "Thiết bị này")}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {session.ipAddress} •{" "}
                  {session.current
                    ? t("security.sessions.activeNow", "Đang hoạt động")
                    : session.lastActive
                      ? new Date(session.lastActive).toLocaleString()
                      : t("security.sessions.justNow", "Vừa xong")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => !revoking && setConfirmOpen(false)}
        title={
          <div className="text-foreground flex items-center gap-2 text-base font-semibold">
            <div className="rounded-lg bg-rose-100 p-1.5 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <LogOut className="size-4" />
            </div>
            {t(
              "security.sessions.revokeOthersConfirmTitle",
              "Đăng xuất khỏi tất cả thiết bị khác?",
            )}
          </div>
        }
        description={t(
          "security.sessions.revokeOthersConfirmBody",
          "Tất cả các phiên làm việc trên trình duyệt và thiết bị khác sẽ bị chấm dứt ngay lập tức.",
        )}
        footer={
          <div className="flex w-full justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={revoking}
              onClick={() => setConfirmOpen(false)}
            >
              {t("common.cancel", "Hủy")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={revoking}
              onClick={handleRevokeOthers}
              className="gap-1.5"
            >
              <LogOut className="size-3.5" />
              {t("security.sessions.confirmRevoke", "Đăng xuất thiết bị khác")}
            </Button>
          </div>
        }
      >
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t(
            "security.sessions.revokeOthersWarning",
            "Nếu bạn nghi ngờ tài khoản bị truy cập trái phép, vui lòng đổi mật khẩu ngay sau khi đăng xuất.",
          )}
        </p>
      </Modal>
    </div>
  );
}

export default ActiveSessionsCard;
