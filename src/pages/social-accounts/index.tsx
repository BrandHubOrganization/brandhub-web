import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Platform } from "@/types/post";
import {
  connectAccount,
  disconnectAccount,
  getSocialAccounts,
  refreshToken,
} from "@/services/mock/mockSocialAccountService";
import type { SocialAccount } from "./types/socialAccount";
import { SocialAccountCard } from "./components/SocialAccountCard";
import { ConnectAccountDialog } from "./components/ConnectAccountDialog";

export function SocialAccountsPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getSocialAccounts();
        if (!cancelled) setAccounts(data);
      } catch (err) {
        console.error("Failed to load social accounts:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAccounts();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelectPlatform(platform: Platform) {
    setIsDialogOpen(false);
    try {
      const account = await connectAccount(platform);
      setAccounts((prev) => [...prev, account]);
      toast.success(t("socialAccounts.connectSuccess"));
    } catch (err) {
      console.error("Failed to connect account:", err);
      toast.error(t("socialAccounts.connectError"));
    }
  }

  async function handleDisconnect(id: string) {
    if (!window.confirm(t("socialAccounts.disconnectConfirm"))) return;
    try {
      await disconnectAccount(id);
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "DISCONNECTED" } : a)),
      );
      toast.success(t("socialAccounts.disconnectSuccess"));
    } catch (err) {
      console.error("Failed to disconnect account:", err);
      toast.error(t("socialAccounts.disconnectError"));
    }
  }

  async function handleRefresh(id: string) {
    try {
      const updated = await refreshToken(id);
      setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success(t("socialAccounts.refreshSuccess"));
    } catch (err) {
      console.error("Failed to refresh token:", err);
      toast.error(t("socialAccounts.refreshError"));
    }
  }

  return (
    <PageWrapper
      title={t("socialAccounts.title")}
      description={t("socialAccounts.description")}
      actions={
        <Button
          size="sm"
          variant="orange"
          className="gap-1.5 text-xs"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="size-3.5" /> {t("socialAccounts.connectNew")}
        </Button>
      }
    >
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
          <div className="text-destructive flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="size-4" />
            <span>{t("socialAccounts.loadError")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" /> {t("socialAccounts.retry")}
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              account={account}
              onConnect={() => setIsDialogOpen(true)}
              onDisconnect={handleDisconnect}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      )}

      <ConnectAccountDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectPlatform={handleSelectPlatform}
      />
    </PageWrapper>
  );
}

export default SocialAccountsPage;
