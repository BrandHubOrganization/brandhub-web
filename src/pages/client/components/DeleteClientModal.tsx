import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/ui/dialog";

interface DeleteClientModalProps {
  isOpen: boolean;
  clientName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteClientModal({
  isOpen,
  clientName = "",
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteClientModalProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("client.deleteModal.title", { name: clientName })}
      description={t("client.deleteModal.description")}
      confirmText={t("client.deleteModal.confirmText")}
      cancelText={t("client.deleteModal.cancelText")}
      variant="danger"
      isLoading={isLoading}
    />
  );
}
