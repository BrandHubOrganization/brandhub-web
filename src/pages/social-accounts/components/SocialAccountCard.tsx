import { useTranslation } from "react-i18next";
import { Link2Off, RefreshCw, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SocialAccount } from "@/pages/social-accounts/types/socialAccount";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

const STATUS_VARIANT: Record<SocialAccount["status"], "SCHEDULED" | "FAILED" | "DRAFT"> = {
  CONNECTED: "SCHEDULED",
  EXPIRED: "FAILED",
  DISCONNECTED: "DRAFT",
};

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
  const rateLimitPct =
    account.rateLimitMax && account.rateLimitUsed !== undefined
      ? Math.min(100, (account.rateLimitUsed / account.rateLimitMax) * 100)
      : null;

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
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
            <Badge variant={STATUS_VARIANT[account.status]}>
              {t(`socialAccounts.status.${account.status}`)}
            </Badge>
          </div>
          <p className="text-muted-foreground truncate text-xs">
            {account.accountHandle} · {meta.label}
          </p>
        </div>
      </div>

      {account.tokenExpiresAt && (
        <p className="text-muted-foreground text-xs">
          {t("socialAccounts.tokenExpires")}{" "}
          {new Date(account.tokenExpiresAt).toLocaleDateString()}
        </p>
      )}

      {rateLimitPct !== null && (
        <div className="space-y-1">
          <div className="text-muted-foreground flex justify-between text-2xs">
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

      <div className="mt-auto flex items-center gap-2 pt-1">
        {account.status === "DISCONNECTED" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => onConnect(account.id)}
          >
            <Link2 className="size-3.5" /> {t("socialAccounts.actions.connect")}
          </Button>
        )}
        {account.status !== "DISCONNECTED" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => onDisconnect(account.id)}
          >
            <Link2Off className="size-3.5" />{" "}
            {t("socialAccounts.actions.disconnect")}
          </Button>
        )}
        {(account.status === "EXPIRED" || account.status === "CONNECTED") && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs"
            onClick={() => onRefresh(account.id)}
          >
            <RefreshCw className="size-3.5" />{" "}
            {t("socialAccounts.actions.refreshToken")}
          </Button>
        )}
      </div>
    </div>
  );
}
