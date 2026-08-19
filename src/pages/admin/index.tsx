import PageWrapper from "@/components/layout/PageWrapper";

export function AdminPage() {
  return (
    <PageWrapper
      title="Admin Panel"
      description="Trang cấu hình và quản trị hệ thống dành riêng cho Administrator."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border-border bg-card space-y-4 rounded-xl border p-6">
          <h2 className="text-lg font-bold">Quản lý người dùng</h2>
          <p className="text-muted-foreground text-xs">
            Thêm mới, chỉnh sửa quyền truy cập hoặc vô hiệu hóa các tài khoản
            Creator, AM và Client.
          </p>
          <div className="border-border text-muted-foreground bg-muted/10 flex h-28 items-center justify-center rounded border border-dashed text-xs">
            [Danh sách & bộ lọc người dùng]
          </div>
        </div>

        <div className="border-border bg-card space-y-4 rounded-xl border p-6">
          <h2 className="text-lg font-bold">Cấu hình Hệ thống</h2>
          <p className="text-muted-foreground text-xs">
            Quản lý các tích hợp API bên thứ ba (OpenAI, Facebook, Instagram
            Graph API).
          </p>
          <div className="border-border text-muted-foreground bg-muted/10 flex h-28 items-center justify-center rounded border border-dashed text-xs">
            [Thông tin kết nối & API Keys]
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminPage;
