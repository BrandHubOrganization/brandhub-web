import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  approveModerationItem,
  deleteUser,
  disableUser,
  removeModerationItem,
  verifyUser,
} from "@/services/mock/mockAdminService";
import type { AdminUser, ModerationItem } from "../types/admin";

export function useAdminActions(
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>,
  setModeration: React.Dispatch<React.SetStateAction<ModerationItem[]>>,
) {
  const { t } = useTranslation();

  async function handleVerify(id: string) {
    try {
      const updated = await verifyUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(t("dashboard.admin.users.verifySuccess"));
    } catch (err) {
      console.error("Failed to verify user:", err);
      toast.error(t("dashboard.admin.users.verifyError"));
    }
  }

  async function handleToggleDisable(id: string) {
    try {
      const updated = await disableUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(t("dashboard.admin.users.toggleSuccess"));
    } catch (err) {
      console.error("Failed to toggle user status:", err);
      toast.error(t("dashboard.admin.users.toggleError"));
    }
  }

  async function handleDeleteUser(id: string) {
    if (!window.confirm(t("dashboard.admin.users.deleteConfirm"))) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success(t("dashboard.admin.users.deleteSuccess"));
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error(t("dashboard.admin.users.deleteError"));
    }
  }

  async function handleApproveModeration(id: string) {
    try {
      const updated = await approveModerationItem(id);
      setModeration((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast.success(t("dashboard.admin.moderation.approveSuccess"));
    } catch (err) {
      console.error("Failed to approve moderation item:", err);
      toast.error(t("dashboard.admin.moderation.approveError"));
    }
  }

  async function handleRemoveModeration(id: string) {
    try {
      const updated = await removeModerationItem(id);
      setModeration((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast.success(t("dashboard.admin.moderation.removeSuccess"));
    } catch (err) {
      console.error("Failed to remove moderation item:", err);
      toast.error(t("dashboard.admin.moderation.removeError"));
    }
  }

  return {
    handleVerify,
    handleToggleDisable,
    handleDeleteUser,
    handleApproveModeration,
    handleRemoveModeration,
  };
}
