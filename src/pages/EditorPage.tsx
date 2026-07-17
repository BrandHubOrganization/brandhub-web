import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";

export function EditorPage() {
  return (
    <PageWrapper
      title="Content Editor"
      description="Trình biên tập nội dung đa nền tảng kết hợp AI."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs cursor-pointer">Lưu nháp</Button>
          <Button className="bg-[#f05a28] hover:bg-[#f05a28]/90 text-white cursor-pointer text-xs">Gửi phê duyệt</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 border border-border bg-card p-6 rounded-lg space-y-4">
          <input
            type="text"
            className="w-full text-xl font-bold border-b border-border pb-2 outline-none focus:border-brand-orange bg-transparent"
            placeholder="Nhập tiêu đề nội dung..."
            defaultValue="Nike Air Max Pulse - Chi tiết ra mắt"
          />
          <textarea
            className="w-full h-64 outline-none resize-none bg-transparent text-sm leading-relaxed"
            placeholder="Bắt đầu viết bài của bạn..."
            defaultValue={`👟 Đột phá phong cách với dòng Nike Air Max Pulse hoàn toàn mới!
Với đệm khí Air cải tiến mang lại độ đàn hồi vượt trội, đây là sự kết hợp hoàn hảo giữa thời trang đường phố và hiệu năng vận hành.

📅 Ngày mở bán: 18/07/2026.
Đừng bỏ lỡ!`}
          />
        </div>

        <div className="border border-border bg-card p-6 rounded-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Trợ lý AI Co-Pilot</h2>
            <p className="text-xs text-muted-foreground">
              Nhập yêu cầu để AI tinh chỉnh bài viết hoặc tạo hình ảnh minh họa.
            </p>
            <textarea
              className="w-full h-24 border border-border p-2 rounded text-xs outline-none bg-muted/20"
              placeholder="Ví dụ: Viết lại bài đăng trên với giọng văn hài hước và thêm các hashtag phù hợp..."
            />
          </div>
          <Button className="w-full bg-[#f05a28] hover:bg-[#f05a28]/90 text-white text-xs py-2 cursor-pointer">
            Tối ưu bằng AI ✨
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default EditorPage;
