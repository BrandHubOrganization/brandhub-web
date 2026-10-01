import { useTranslation } from "react-i18next";
import {
  Link2Off,
  RefreshCw,
  Link2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SocialAccount } from "@/pages/social-accounts/types/socialAccount";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

interface SocialAccountCardProps {
  account: SocialAccount;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onRefresh: (id: string) => void;
}

export function SocialAccountCard({
  account,
  onConnect,
  onDisconnect,
  onRefresh,
}: SocialAccountCardProps) {
  const { t } = useTranslation();
  const meta = PLATFORM_META[account.platform];

  // Tính số ngày còn lại của token
  const daysRemaining = account.tokenExpiresAt
    ? Math.ceil(
        (new Date(account.tokenExpiresAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  // Cảnh báo nếu token còn <= 7 ngày hoặc đã hết hạn
  const isExpired =
    account.status === "EXPIRED" ||
    (daysRemaining !== null && daysRemaining <= 0);
  const isExpiringSoon =
    !isExpired &&
    daysRemaining !== null &&
    daysRemaining <= 7 &&
    account.status !== "DISCONNECTED";

  const rateLimitPct =
    account.rateLimitMax && account.rateLimitUsed !== undefined
      ? Math.min(100, (account.rateLimitUsed / account.rateLimitMax) * 100)
      : null;

  // Quyết định Badge hiển thị
  const renderBadge = () => {
    if (account.status === "DISCONNECTED") {
      return (
        <Badge variant="DRAFT">{t("socialAccounts.status.DISCONNECTED")}</Badge>
      );
    }
    if (isExpired) {
      return (
        <Badge variant="FAILED" className="gap-1">
          <AlertTriangle className="size-3" />
          {t("socialAccounts.status.EXPIRED")}
        </Badge>
      );
    }
    if (isExpiringSoon) {
      return (
        <Badge variant="PENDING_REVIEW" className="gap-1">
          <AlertTriangle className="size-3" />
          {t("socialAccounts.status.EXPIRING_SOON")}
        </Badge>
      );
    }
    return (
      <Badge variant="PUBLISHED" className="gap-1">
        <ShieldCheck className="size-3" />
        {t("socialAccounts.status.CONNECTED")}
      </Badge>
    );
  };

  return (
    <div
      className={`bg-card flex flex-col gap-3 rounded-xl border p-4 transition-colors ${
        isExpiringSoon || isExpired
          ? "border-amber-500/30 bg-amber-500/5 dark:border-amber-500/20"
          : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${meta.color}`}
        >
          {meta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-foreground truncate text-sm font-semibold">
              {account.accountName}
            </h3>
            {renderBadge()}
          </div>
          <p className="text-muted-foreground truncate text-xs">{meta.label}</p>
        </div>
      </div>

      {/* Cảnh báo thông minh: Chỉ hiển thị khi Sắp hết hạn hoặc Đã hết hạn */}
      {isExpiringSoon && (
        <div className="rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
          <p className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="size-3.5 shrink-0" />
            {t("socialAccounts.expiringSoonWarning", { days: daysRemaining })}
          </p>
        </div>
      )}

      {rateLimitPct !== null && (
        <div className="space-y-1">
          <div className="text-muted-foreground text-2xs flex justify-between">
            <span>{t("socialAccounts.rateLimit")}</span>
            <span>
              {account.rateLimitUsed}/{account.rateLimitMax}{" "}
              {t("socialAccounts.postsToday")}
            </span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-brand-orange h-full rounded-full"
              style={{ width: `${rateLimitPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <div>
          {account.status === "DISCONNECTED" ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => onConnect(account.id)}
            >
              <Link2 className="size-3.5" />{" "}
              {t("socialAccounts.actions.connect")}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
              onClick={() => onDisconnect(account.id)}
            >
              <Link2Off className="size-3.5" />{" "}
              {t("socialAccounts.actions.disconnect")}
            </Button>
          )}
        </div>

        {/* Nút Kết nối lại / Làm mới: Nổi bật khi Sắp hết hạn hoặc Hết hạn */}
        {(isExpired || isExpiringSoon) && (
          <Button
            size="sm"
            variant="orange"
            className="gap-1.5 text-xs"
            onClick={() => onRefresh(account.id)}
          >
            <RefreshCw className="size-3.5" />{" "}
            {t("socialAccounts.actions.reconnect")}
          </Button>
        )}
      </div>
    </div>
  );
}
