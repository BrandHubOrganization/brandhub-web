import { Link } from "react-router-dom";
import { Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlogConversionBanner() {
  return (
    <section
      aria-label="Giải pháp chuyển đổi BrandHub"
      className="rounded-3xl border border-brand-orange/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 p-6 sm:p-8 space-y-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider">
            <Rocket className="size-3.5" />
            <span>Áp dụng ngay kiến thức vào thực tế vận hành</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            Trải nghiệm Nền tảng Quản trị Truyền thông All-in-One ngay hôm nay
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Từ quản lý công việc chuẩn Jira/Notion, đóng gói báo giá Media Package, sáng tạo nội dung
            cùng AI GraphRAG đến đặt lịch đăng tự động lên Facebook, Instagram, TikTok và Threads.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/register">
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-2 cursor-pointer shadow-md">
              <span>Đăng ký gói Starter 0đ</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="font-semibold cursor-pointer">
              Đăng nhập vào Workspace
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
        <Link
          to="/#media-package"
          className="p-4 rounded-2xl bg-card border border-border hover:border-brand-orange/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-brand-orange">GÓI TRUYỀN THÔNG</span>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-sm font-bold text-foreground">
            Đóng gói báo giá &amp; Chiến dịch đa kênh
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tích hợp Social Media (4 kênh) cùng hệ thống đối tác Báo chí &amp; Đài truyền hình.
          </p>
        </Link>

        <Link
          to="/#ai-features"
          className="p-4 rounded-2xl bg-card border border-border hover:border-brand-orange/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-brand-orange">AI MARKETING STUDIO</span>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-sm font-bold text-foreground">
            GraphRAG Neo4j + Đại sứ ảo LoRA
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Viết bài đúng 100% Brand Guidelines, tạo ảnh, video AI và bắt trend thời gian thực.
          </p>
        </Link>

        <Link
          to="/#pricing"
          className="p-4 rounded-2xl bg-card border border-border hover:border-brand-orange/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-brand-orange">BẢNG GIÁ &amp; VIETQR</span>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-sm font-bold text-foreground">
            Nâng cấp Pro 590.000đ/tháng
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Mở khóa 10 Workspace, 5.000 AI Credits và thanh toán VietQR (SePay / PayOS) tức thì.
          </p>
        </Link>
      </div>
    </section>
  );
}

export default BlogConversionBanner;
