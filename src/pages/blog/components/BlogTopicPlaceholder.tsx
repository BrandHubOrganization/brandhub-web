import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlannedBlogTopic, BlogCategory } from "@/data/blogTypes";

interface BlogTopicPlaceholderProps {
  plannedTopic?: PlannedBlogTopic;
  categoryMeta?: BlogCategory;
}

export function BlogTopicPlaceholder({
  plannedTopic,
  categoryMeta,
}: BlogTopicPlaceholderProps) {
  return (
    <div className="space-y-6">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:underline cursor-pointer"
      >
        <ArrowLeft className="size-3.5" />
        <span>Quay lại Thư viện Blog &amp; Cẩm nang</span>
      </Link>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 space-y-5 shadow-xs">
        {plannedTopic ? (
          <>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 text-brand-orange px-3 py-1 text-xs font-bold">
              <Sparkles className="size-3.5" />
              <span>
                CHỦ ĐỀ #{String(plannedTopic.topicNumber).padStart(3, "0")} ·{" "}
                {plannedTopic.priorityBatch}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-foreground leading-tight">
              {plannedTopic.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chủ đề này nằm trong lộ trình 100 báo cáo và cẩm nang truyền thông chuyên sâu của
              BrandHub. Bạn có thể đọc ngay bài viết trụ cột cùng chuyên mục{" "}
              <strong className="text-foreground">
                {categoryMeta?.name}
              </strong>{" "}
              hoặc trải nghiệm trực tiếp tính năng{" "}
              <strong className="text-foreground">
                {plannedTopic.brandhubFeature}
              </strong>{" "}
              trên hệ thống.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground">Giải pháp nền tảng:</span>
                <p className="font-bold text-foreground mt-0.5">
                  {plannedTopic.brandhubFeature}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Vai trò hướng tới:</span>
                <p className="font-bold text-foreground mt-0.5">
                  {plannedTopic.targetRoles.join(", ")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/register">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-2 cursor-pointer">
                  <Rocket className="size-4" />
                  <span>Đăng ký trải nghiệm tính năng này</span>
                </Button>
              </Link>
              <Link to="/blog">
                <Button variant="outline" className="cursor-pointer">
                  Xem các bài viết đã xuất bản
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Không tìm thấy bài viết
            </h1>
            <p className="text-sm text-muted-foreground">
              Liên kết bài viết không tồn tại hoặc đã được cập nhật. Hãy khám phá
              các bài viết khác trong thư viện.
            </p>
            <Link to="/blog">
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer">
                Về trang chủ Blog
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default BlogTopicPlaceholder;
