import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export function DashboardPage() {
  const { user } = useAuthStore();
  return (
    <PageWrapper
      title="Dashboard"
      description="Tổng quan hoạt động và nội dung cần phê duyệt."
      actions={
        <Button variant="default" className="bg-[#f05a28] hover:bg-[#f05a28]/90 text-white cursor-pointer text-xs">
          Tạo Nội Dung Mới
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border border-border bg-card p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-bold">Chào mừng trở lại, {user?.name || "User"}!</h2>
          <p className="text-sm text-muted-foreground">
            Hôm nay bạn có một vài công việc cần lưu ý trong chiến dịch Heineken Campaign và Nike Vietnam.
          </p>
          <div className="h-48 border border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground bg-muted/20">
            [Biểu đồ thống kê hiệu quả chiến dịch]
          </div>
        </div>

        <div className="border border-border bg-card p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-bold">Nhiệm vụ cần làm</h2>
          <div className="space-y-3">
            {[
              "Phê duyệt bài viết Kem chống nắng (AM)",
              "Lên lịch đăng bài Nike Air Max (Creator)",
              "Kiểm tra báo cáo tháng 7 (Owner)",
            ].map((task, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-foreground/90">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default DashboardPage;
