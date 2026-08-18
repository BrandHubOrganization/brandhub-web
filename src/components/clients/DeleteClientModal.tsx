import { ConfirmDialog } from "@/components/ui/dialog";
import type { Client } from "@/types/client";

interface DeleteClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteClientModal({
  isOpen,
  client,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteClientModalProps) {
  if (!client) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => onConfirm(client.id)}
      variant="danger"
      title="Xác nhận xóa Client"
      confirmText="Xác nhận xóa Client"
      cancelText="Hủy bỏ"
      isLoading={isLoading}
      description={
        <div className="space-y-3">
          <p>
            Bạn có chắc chắn muốn xóa thương hiệu <span className="font-bold text-foreground">{client.name}</span> không?
          </p>
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-[11px] text-destructive leading-relaxed space-y-1">
            <p className="font-semibold">⚠️ Cảnh báo dữ liệu:</p>
            <p>
              Tất cả bài viết, lịch xuất bản, tài khoản mạng xã hội liên kết và báo cáo chiến dịch của Client này sẽ bị lưu trữ (archived) và ngừng hoạt động.
            </p>
          </div>
        </div>
      }
    />
  );
}
