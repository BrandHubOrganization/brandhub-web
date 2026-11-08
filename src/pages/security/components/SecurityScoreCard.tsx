import * as React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SecurityScoreCardProps {
  enabled2fa: boolean;
  hasPassword: boolean;
  email: string;
  isGoogleLinked?: boolean;
  className?: string;
}

export function SecurityScoreCard({
  enabled2fa,
  hasPassword,
  email,
  isGoogleLinked = false,
  className,
}: SecurityScoreCardProps) {
  const { t } = useTranslation();

  // Điểm an toàn 0 - 100
  const score = React.useMemo(() => {
    let s = 0;
    if (hasPassword) s += 35;
    if (enabled2fa) s += 35;
    if (email && email.trim().length > 0) s += 15;
    if (isGoogleLinked) s += 15;
    return s;
  }, [hasPassword, enabled2fa, email, isGoogleLinked]);

  const scoreMeta = React.useMemo(() => {
    if (score >= 80) {
      return {
        label: t("security.score.veryGood", "Bảo vệ rất tốt"),
        badgeClass:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        iconClass: "text-emerald-500 dark:text-emerald-400",
        iconBgClass:
          "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
        progressClass: "bg-emerald-500",
      };
    }
    if (score >= 50) {
      return {
        label: t("security.score.good", "Khá an toàn"),
        badgeClass:
          "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        iconClass: "text-amber-500 dark:text-amber-400",
        iconBgClass:
          "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
        progressClass: "bg-amber-500",
      };
    }
    return {
      label: t("security.score.needsAttention", "Cần tăng cường bảo mật"),
      badgeClass:
        "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      iconClass: "text-rose-500 dark:text-rose-400",
      iconBgClass:
        "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
      progressClass: "bg-rose-500",
    };
  }, [score, t]);

  const checklist = [
    {
      key: "password",
      title: t("security.score.passwordTitle", "Mật khẩu đăng nhập"),
      subtitle: t(
        "security.score.passwordDesc",
        "Bảo vệ tài khoản bằng mật khẩu mạnh",
      ),
      passed: hasPassword,
      statusBadge: hasPassword
        ? t("security.score.passwordSet", "Đã thiết lập")
        : t("security.score.passwordNotSet", "Chưa thiết lập"),
    },
    {
      key: "2fa",
      title: t("security.score.twoFactorTitle", "Xác thực 2 bước (2FA)"),
      subtitle: t(
        "security.score.twoFactorDesc",
        "Mã bảo mật TOTP dùng một lần",
      ),
      passed: enabled2fa,
      statusBadge: enabled2fa
        ? t("security.score.twoFactorActive", "Đã kích hoạt")
        : t("security.score.twoFactorInactive", "Chưa bật"),
    },
    {
      key: "email",
      title: t("security.score.emailTitle", "Email tài khoản"),
      subtitle:
        email ||
        t("security.score.emailDesc", "Nhận cảnh báo đăng nhập và khôi phục"),
      passed: Boolean(email),
      statusBadge: t("security.score.emailVerified", "Đã xác thực"),
    },
    {
      key: "oauth",
      title: t("security.score.oauthTitle", "Liên kết Google OAuth"),
      subtitle: t("security.score.oauthDesc", "Đăng nhập an toàn và tiện lợi"),
      passed: Boolean(isGoogleLinked),
      statusBadge: isGoogleLinked
        ? t("security.score.oauthLinked", "Đã liên kết")
        : t("security.score.oauthNotLinked", "Chưa liên kết"),
    },
  ];

  return (
    <div
      className={cn(
        "border-border bg-card rounded-xl border p-6 shadow-sm",
        className,
      )}
    >
      <div className="border-border flex items-start justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl p-2.5", scoreMeta.iconBgClass)}>
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {t("security.score.title", "Điểm an toàn tài khoản")}
            </h3>
            <p className="text-muted-foreground text-xs">
              {t(
                "security.score.subtitle",
                "Đánh giá mức độ an toàn theo tiêu chuẩn BrandHub",
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-foreground text-2xl font-bold tracking-tight">
            {score}
          </span>
          <span className="text-muted-foreground text-xs font-semibold">
            /100
          </span>
        </div>
      </div>

      {/* Progress & Remark */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            {t("security.score.status", "Trạng thái")}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
              scoreMeta.badgeClass,
            )}
          >
            {scoreMeta.label}
          </span>
        </div>

        <div className="bg-muted relative h-2.5 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              scoreMeta.progressClass,
            )}
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="divide-border/60 mt-6 divide-y">
        {checklist.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-2.5 pr-2">
              {item.passed ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="size-4 shrink-0 text-amber-500" />
              )}
              <div className="min-w-0">
                <p className="text-foreground truncate text-xs font-semibold">
                  {item.title}
                </p>
                <p className="text-muted-foreground truncate text-[11px]">
                  {item.subtitle}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium",
                item.passed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
              )}
            >
              {item.statusBadge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecurityScoreCard;
