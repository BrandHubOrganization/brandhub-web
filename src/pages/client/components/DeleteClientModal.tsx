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
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Xóa thương hiệu "${clientName}"?`}
      description="Hành động này sẽ ngắt kết nối các tài khoản mạng xã hội và lưu trữ toàn bộ dữ liệu bài viết. Bạn có chắc chắn muốn tiếp tục không?"
      confirmText="Xác nhận Xóa"
      cancelText="Hủy bỏ"
      variant="danger"
      isLoading={isLoading}
    />
  );
}
