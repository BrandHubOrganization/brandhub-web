import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { Platform } from "@/types/post";
import type { SocialAccount } from "../types/socialAccount";
import { ALL_PLATFORMS, PLATFORM_META } from "../lib/platformMeta";
import {
  buildOAuthConnectUrl,
  fetchSocialAccounts,
  disconnectSocialAccount,
} from "../services/socialAccountService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

export function useSocialAccounts() {
  const { t } = useTranslation();
  const { id: routeWorkspaceId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const user = useAuthStore((s) => s.user);

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState<SocialAccount | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const effectiveWorkspaceId =
    routeWorkspaceId || currentWorkspace?.id || "ws-default";
  const effectiveClientId = user?.id ? String(user.id) : "client-default";

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const connectedAccounts = await fetchSocialAccounts(effectiveWorkspaceId);

      // Tạo map từ các account đã kết nối theo platform
      const connectedMap = new Map<Platform, SocialAccount>();
      connectedAccounts.forEach((acc) => {
        connectedMap.set(acc.platform, acc);
      });

      // Đảm bảo hiển thị đầy đủ tất cả các platform
      const fullList: SocialAccount[] = ALL_PLATFORMS.map((platform) => {
        if (connectedMap.has(platform)) {
          return connectedMap.get(platform)!;
        }
        const meta = PLATFORM_META[platform];
        return {
          id: `unconnected-${platform.toLowerCase()}`,
          platform,
          accountName: meta?.label || platform,
          accountHandle: `@${platform.toLowerCase()}`,
          status: "DISCONNECTED",
        };
      });

      setAccounts(fullList);
    } catch (err) {
      console.error("Failed to load social accounts:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveWorkspaceId]);

  // Xử lý callback params khi redirect về từ OAuth Provider
  useEffect(() => {
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const errorMsg = searchParams.get("error");

    if (status) {
      const platformUpper = platform ? platform.toUpperCase() : "";
      if (status === "success") {
        toast.success(
          t("socialAccounts.callback.success", { platform: platformUpper }),
        );
      } else if (status === "error") {
        toast.error(
          t("socialAccounts.callback.error", {
            platform: platformUpper,
            message: errorMsg || t("socialAccounts.callback.unknownError"),
          }),
          {
            duration: 6000,
          },
        );
      }

      // Xoá query param sạch sẽ trên URL
      searchParams.delete("status");
      searchParams.delete("platform");
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });

      // Refresh list
      loadAccounts();
    }
  }, [searchParams, setSearchParams, t, loadAccounts]);

  // Load danh sách lần đầu
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleSelectPlatform = (platform: Platform) => {
    const connectUrl = buildOAuthConnectUrl(
      platform,
      effectiveWorkspaceId,
      effectiveClientId,
    );
    // Điều hướng sang OAuth authorization dialog của Provider
    window.location.href = connectUrl;
  };

  const handleOpenDisconnectModal = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    if (target) {
      setAccountToDisconnect(target);
    }
  };

  const handleCloseDisconnectModal = () => {
    if (!isDisconnecting) {
      setAccountToDisconnect(null);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!accountToDisconnect) return;
    setIsDisconnecting(true);
    try {
      await disconnectSocialAccount(accountToDisconnect.id, effectiveWorkspaceId);
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountToDisconnect.id ? { ...a, status: "DISCONNECTED" } : a)),
      );
      toast.success(t("socialAccounts.disconnectSuccess"));
      setAccountToDisconnect(null);
    } catch (err) {
      console.error("Failed to disconnect account:", err);
      toast.error(t("socialAccounts.disconnectError"));
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefresh = async (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (account) {
      // Re-trigger OAuth flow
      handleSelectPlatform(account.platform);
    }
  };

  return {
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
  };
}
