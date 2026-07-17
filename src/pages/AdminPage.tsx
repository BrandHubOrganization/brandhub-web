import PageWrapper from "@/components/layout/PageWrapper";

export function AdminPage() {
  return (
    <PageWrapper
      title="Admin Panel"
      description="Trang cấu hình và quản trị hệ thống dành riêng cho Administrator."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border bg-card p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-bold">Quản lý người dùng</h2>
          <p className="text-xs text-muted-foreground">
            Thêm mới, chỉnh sửa quyền truy cập hoặc vô hiệu hóa các tài khoản Creator, AM và Client.
          </p>
          <div className="h-28 border border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground bg-muted/10">
            [Danh sách & bộ lọc người dùng]
          </div>
        </div>

        <div className="border border-border bg-card p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-bold">Cấu hình Hệ thống</h2>
          <p className="text-xs text-muted-foreground">
            Quản lý các tích hợp API bên thứ ba (OpenAI, Facebook, Instagram Graph API).
          </p>
          <div className="h-28 border border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground bg-muted/10">
            [Thông tin kết nối & API Keys]
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminPage;
