import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  BlogCategorySlug,
  CanonicalRole,
  PlannedBlogTopic,
} from "@/data/blogTypes";

interface CategorySystemConfig {
  moduleLabel: string;
  sectionHref: string;
  sectionButtonText: string;
  secondaryHref: string;
  secondaryLabel: string;
  capabilities: [string, string, string];
}

const CATEGORY_SYSTEM_MAP: Record<BlogCategorySlug, CategorySystemConfig> = {
  "agency-project-management": {
    moduleLabel: "Phân hệ Đa Workspace & Phân quyền 6 Vai trò",
    sectionHref: "/#agency-workspace",
    sectionButtonText: "Xem mô hình Đa Workspace",
    secondaryHref: "/#templates",
    secondaryLabel: "Khám phá Mẫu quy trình chuẩn",
    capabilities: [
      "Cô lập dữ liệu hoàn toàn theo từng Workspace thương hiệu, ngăn rò rỉ chéo giữa các nhãn hàng",
      "Phân quyền chặt chẽ theo 6 vai trò chuẩn: Guest, Owner, Manager, Creator, Client và Admin",
      "Nhật ký kiểm toán (Audit Log) và chuyển giao toàn bộ tài sản số tức thì khi biến động nhân sự",
    ],
  },
  "content-workflow-approval": {
    moduleLabel: "Phân hệ Quy trình Sản xuất & Phê duyệt 3 Cấp",
    sectionHref: "/#how-it-works",
    sectionButtonText: "Xem luồng Phê duyệt 3 cấp",
    secondaryHref: "/#features",
    secondaryLabel: "Xem tính năng Khóa bản nháp & Preview",
    capabilities: [
      "Luồng phê duyệt khép kín Creator -> Manager -> Client kèm phản hồi trực tiếp trên từng phiên bản",
      "Cơ chế khóa bản nháp (Content Locking) và lịch sử đối chiếu phiên bản chống sửa đè ngoài ý muốn",
      "Tự động kiểm duyệt an toàn nội dung cộng đồng trước khi chuyển sang cổng duyệt của Client",
    ],
  },
  "media-package-campaign": {
    moduleLabel: "Phân hệ Gói Truyền thông (Media Package) & Chiến dịch",
    sectionHref: "/#media-package",
    sectionButtonText: "Xem Gói Truyền thông & Báo giá",
    secondaryHref: "/#pricing",
    secondaryLabel: "Đối chiếu Bảng giá & Thanh toán VietQR",
    capabilities: [
      "Đóng gói dịch vụ đa kênh rõ ràng định lượng bài đăng, báo giá minh bạch và đàm phán trực tuyến với Client",
      "Tự động chuyển đổi Gói truyền thông đã chốt thành Media Campaign và phân rã đầu việc cho Creator",
      "Theo dõi tiến độ nghiệm thu KPI theo thời gian thực ngay trên không gian cộng tác chung",
    ],
  },
  "ai-studio-graphrag-trends": {
    moduleLabel: "Phân hệ AI Marketing Studio, GraphRAG & Bắt Trend",
    sectionHref: "/#ai-features",
    sectionButtonText: "Khám phá AI Studio & GraphRAG",
    secondaryHref: "/#templates",
    secondaryLabel: "Xem thư viện Prompt & Khung kịch bản",
    capabilities: [
      "Kiến trúc GraphRAG (Neo4j + ChromaDB) neo chặt mọi bản nháp vào Brand Guidelines và danh sách từ cấm",
      "Trợ lý bắt trend TikTok Creative Center và Google Trends chuyển hóa xu hướng thành kịch bản đúng giọng thương hiệu",
      "Tích hợp tạo ảnh thương mại và huấn luyện đại sứ ảo đồng nhất nhận diện ngay trong luồng soạn thảo",
    ],
  },
  "multi-channel-publishing": {
    moduleLabel: "Phân hệ Xuất bản Tự động 4 Nền tảng & Bảo mật OAuth",
    sectionHref: "/#features",
    sectionButtonText: "Xem Lịch đăng 4 nền tảng MXH",
    secondaryHref: "/#how-it-works",
    secondaryLabel: "Xem quy trình từ Duyệt đến Đăng bài",
    capabilities: [
      "Lên lịch và xuất bản tự động chính thức trên 4 nền tảng: Facebook, Instagram, TikTok và Threads",
      "Mã hóa OAuth Access Token chuẩn AES-256, cho phép xuất bản an toàn không cần chia sẻ mật khẩu gốc",
      "Xem trước giao diện hiển thị (Live Preview) chuẩn tỷ lệ khung hình từng kênh trước khi bấm duyệt",
    ],
  },
  "tool-comparison-case-study": {
    moduleLabel: "Ma trận Đối chiếu Giải pháp & Chuyển đổi số Agency",
    sectionHref: "/#comparison",
    sectionButtonText: "Xem Bảng đối chiếu Nền tảng",
    secondaryHref: "/#pricing",
    secondaryLabel: "Xem gói Starter (0đ) & Nâng cấp VietQR",
    capabilities: [
      "Hợp nhất quản lý công việc kiểu Jira/Notion, AI GraphRAG và lịch xuất bản 4 kênh trên một nền tảng duy nhất",
      "Loại bỏ chi phí mua rời 4–5 phần mềm ngoại tệ nhờ gói dịch vụ linh hoạt thanh toán nội địa qua VietQR (SePay / PayOS)",
      "Triển khai nhanh trong 7 ngày với phân quyền sẵn sàng cho cả đội ngũ nội bộ lẫn khách hàng Client",
    ],
  },
};

interface BlogFeatureBridgeProps {
  category: BlogCategorySlug;
  targetRoles: CanonicalRole[];
  plannedTopic?: PlannedBlogTopic;
}

export function BlogFeatureBridge({
  category,
  targetRoles,
  plannedTopic,
}: BlogFeatureBridgeProps) {
  const config = CATEGORY_SYSTEM_MAP[category];
  const featureName =
    plannedTopic?.brandhubFeature || config.moduleLabel;

  return (
    <section
      aria-label="Ứng dụng thực tế trên nền tảng BrandHub"
      className="rounded-2xl border-2 border-brand-orange/30 bg-gradient-to-br from-brand-orange/8 via-card to-amber-500/5 p-5 sm:p-7 space-y-4 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-orange uppercase tracking-wider">
          <Layers className="size-4" />
          <span>Liên kết trực tiếp tính năng trên BrandHub</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
          <ShieldCheck className="size-3.5" />
          <span>Tối ưu cho: {targetRoles.join(" · ")}</span>
        </span>
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg sm:text-xl font-extrabold text-foreground leading-snug">
          Giải quyết bài toán này ngay với: {featureName}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Thay vì ghép nối thủ công bảng tính, nhóm chat và công cụ đăng bài rời rạc,{" "}
          <strong className="text-foreground font-semibold">
            {config.moduleLabel}
          </strong>{" "}
          trên BrandHub tự động hóa trọn vẹn quy trình ngay trong một không gian làm việc thống nhất:
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2.5 pt-1">
        {config.capabilities.map((cap, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed"
          >
            <CheckCircle2 className="size-4 text-brand-orange shrink-0 mt-0.5" />
            <span>{cap}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60">
        <Link to="/register">
          <Button
            size="sm"
            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-1.5 cursor-pointer"
          >
            <Rocket className="size-3.5" />
            <span>Khởi tạo Workspace 0đ</span>
          </Button>
        </Link>
        <Link to={config.sectionHref}>
          <Button
            size="sm"
            variant="outline"
            className="font-semibold gap-1.5 border-brand-orange/30 hover:bg-brand-orange/10 hover:text-brand-orange cursor-pointer"
          >
            <Sparkles className="size-3.5 text-brand-orange" />
            <span>{config.sectionButtonText}</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
        <Link
          to={config.secondaryHref}
          className="text-xs font-semibold text-muted-foreground hover:text-brand-orange underline underline-offset-4 px-2 py-1 transition-colors"
        >
          {config.secondaryLabel}
        </Link>
      </div>
    </section>
  );
}

export default BlogFeatureBridge;
