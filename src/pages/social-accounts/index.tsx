import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialAccountCard } from "./components/SocialAccountCard";
import { DisconnectAccountDialog } from "./components/DisconnectAccountDialog";
import { useSocialAccounts } from "./hooks/useSocialAccounts";

export function SocialAccountsPage() {
  const { t } = useTranslation();
  const {
    accounts,
    isLoading,
    isError,
    accountToDisconnect,
    isDisconnecting,
    handleOpenDisconnectModal,
    handleCloseDisconnectModal,
    handleConfirmDisconnect,
    loadAccounts,
    handleSelectPlatform,
    handleRefresh,
  } = useSocialAccounts();

  return (
    <PageWrapper
      title={t("socialAccounts.title")}
      description={t("socialAccounts.description")}
    >
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
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
            onClick={loadAccounts}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" /> {t("socialAccounts.retry")}
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              account={account}
              onConnect={() => handleSelectPlatform(account.platform)}
              onDisconnect={handleOpenDisconnectModal}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      )}

      <DisconnectAccountDialog
        account={accountToDisconnect}
        isOpen={!!accountToDisconnect}
        isLoading={isDisconnecting}
        onClose={handleCloseDisconnectModal}
        onConfirm={handleConfirmDisconnect}
      />
    </PageWrapper>
  );
}

export default SocialAccountsPage;
