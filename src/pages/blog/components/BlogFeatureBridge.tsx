import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  ListChecks,
  Package,
  Scale,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type {
  BlogCategorySlug,
  CanonicalRole,
  PlannedBlogTopic,
} from "@/data/blogTypes";
import { Button } from "@/components/ui/button";

interface BridgeConfig {
  badge: string;
  headline: string;
  description: string;
  featureList: string[];
  sectionHref: string;
  primaryText: string;
  secondaryHref: string;
  secondaryText: string;
  icon: LucideIcon;
}

const BRIDGE_BY_CATEGORY: Record<BlogCategorySlug, BridgeConfig> = {
  "agency-project-management": {
    badge: "Không gian làm việc Đa Thương hiệu",
    headline: "Thiết lập Workspace chuẩn Jira & Notion cho từng thương hiệu",
    description:
      "Tách biệt hoàn toàn dữ liệu giữa các thương hiệu, giao việc Kanban theo hạn chót và phân quyền chặt chẽ 6 vai trò chuẩn (Guest, Owner, Manager, Creator, Client, Admin).",
    featureList: [
      "Tạo Workspace mới trong 30 giây từ Workspace Template theo ngành",
      "Cô lập múi giờ, kho tài nguyên & tài khoản mạng xã hội cho từng Client",
      "Bảng điều khiển phân bổ nhân lực & theo dõi tiến độ theo thời gian thực",
    ],
    sectionHref: "/#agency-workspace",
    primaryText: "Khám phá Mô hình Workspace",
    secondaryHref: "/#templates",
    secondaryText: "Xem thư viện Template",
    icon: Layers,
  },
  "content-workflow-approval": {
    badge: "Quy trình Phê duyệt 3 Cấp",
    headline: "Loại bỏ tình trạng duyệt bài sót phiên bản trên nhóm chat",
    description:
      "Mỗi bài viết đều đi qua kiểm duyệt an toàn cộng đồng tự động, thảo luận nội bộ giữa Creator và Manager trước khi gửi Client nghiệm thu bằng 1 chạm.",
    featureList: [
      "Kiểm duyệt an toàn nội dung cộng đồng trước khi xuất bản",
      "Luồng chuyển trạng thái rõ ràng từ Nhận Brief -> Chờ duyệt -> Hoàn tất",
      "Kho lịch sử chỉnh sửa & bình luận gắn trực tiếp theo từng bản thảo",
    ],
    sectionHref: "/#how-it-works",
    primaryText: "Xem Quy trình Phê duyệt",
    secondaryHref: "/#features",
    secondaryText: "Xem bộ tính năng Vận hành",
    icon: ListChecks,
  },
  "media-package-campaign": {
    badge: "Gói Truyền thông & Chiến dịch",
    headline: "Biến Proposal báo giá thành Chiến dịch thực thi tự động",
    description:
      "Xây dựng Gói Truyền thông (Media Package) với định mức bài đăng, đàm phán điều khoản 2 chiều cùng Client và tự động sinh Media Campaign khi chốt.",
    featureList: [
      "Đóng gói minh bạch số lượng bài, kênh triển khai & ngân sách dự kiến",
      "Lưu trọn vẹn lịch sử đàm phán giá giữa Owner / Manager và Client",
      "Chuyển thẳng Media Package đã chốt thành lịch bài chiến dịch",
    ],
    sectionHref: "/#media-package",
    primaryText: "Xem Gói Truyền thông",
    secondaryHref: "/#pricing",
    secondaryText: "Xem Bảng giá Agency",
    icon: Package,
  },
  "ai-studio-graphrag-trends": {
    badge: "AI Studio GraphRAG & Bắt Trend",
    headline: "Giữ chuẩn Brand Voice & Bắt nhịp xu hướng bằng AI GraphRAG",
    description:
      "Kết hợp đồ thị tri thức Neo4j và ChromaDB vector search để mỗi nội dung AI sinh ra đều bám sát bộ nhận diện, kèm đại sứ ảo và gợi ý trend mỗi ngày.",
    featureList: [
      "Khớp chuẩn giọng văn & quy tắc thương hiệu qua đồ thị tri thức Neo4j",
      "Đề xuất ý tưởng bắt nhịp xu hướng thực tế từ TikTok Creative Center & Google",
      "Kiểm soát tiêu thụ AI Credits minh bạch & nạp nhanh qua SePay / PayOS VietQR",
    ],
    sectionHref: "/#ai-features",
    primaryText: "Trải nghiệm AI Studio",
    secondaryHref: "/#templates",
    secondaryText: "Thử Prompt & Mẫu có sẵn",
    icon: Sparkles,
  },
  "multi-channel-publishing": {
    badge: "Xuất bản Đồng loạt 4 Nền tảng",
    headline: "Hẹn lịch đăng tự động Facebook, Instagram, TikTok & Threads",
    description:
      "Một trình soạn thảo đa kênh duy nhất giúp xem trước bố cục từng nền tảng, bảo vệ OAuth token bằng mã hóa AES-256 và đo lường hiệu suất tập trung.",
    featureList: [
      "Hỗ trợ trọn vẹn 4 kênh: Facebook, Instagram, TikTok, Threads",
      "Lịch xuất bản trực quan theo tháng/tuần kèm phát hiện khung giờ vàng",
      "Bảo vệ khóa truy cập mạng xã hội theo chuẩn mã hóa AES-256",
    ],
    sectionHref: "/#features",
    primaryText: "Xem Bộ Xuất bản 4 Kênh",
    secondaryHref: "/#how-it-works",
    secondaryText: "Quy trình đăng tự động",
    icon: Share2,
  },
  "tool-comparison-case-study": {
    badge: "Tối ưu Chi phí & Chuyển đổi số",
    headline: "Thay thế 4 đến 5 công cụ rời rạc bằng một nền tảng hợp nhất",
    description:
      "So sánh trực diện tổng chi phí bản quyền khi dùng Jira + Notion + công cụ hẹn giờ riêng lẻ với giải pháp hợp nhất của BrandHub cùng thanh toán VietQR linh hoạt.",
    featureList: [
      "Cắt giảm chi phí thuê bao phân mảnh tính theo đầu người ở quy mô lớn",
      "Thanh toán minh bạch, nhanh chóng bằng VietQR qua cổng SePay / PayOS",
      "Giữ trọn lịch sử tri thức thương hiệu khi nhân sự luân chuyển",
    ],
    sectionHref: "/#comparison",
    primaryText: "Xem Bảng So sánh Nền tảng",
    secondaryHref: "/#pricing",
    secondaryText: "So sánh Các Gói Cước",
    icon: Scale,
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
  const config = BRIDGE_BY_CATEGORY[category];
  const Icon = config.icon;
  const featureName = plannedTopic?.brandhubFeature ?? config.badge;

  return (
    <section
      aria-label="Kết nối tính năng BrandHub"
      className="bh-spotlight-card relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Icon className="size-3.5 text-brand-orange" />
            {config.badge}
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Dành cho: {targetRoles.join(" · ")}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-balance text-lg font-extrabold text-zinc-900 sm:text-xl dark:text-zinc-50">
            Giải quyết bài toán này ngay với: {featureName}
          </h3>
          <p className="text-pretty text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
            {config.description}
          </p>
        </div>

        <ul className="space-y-2">
          {config.featureList.map((feat) => (
            <li
              key={feat}
              className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-700 sm:text-[13px] dark:text-zinc-300"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link to={config.sectionHref}>
            <Button className="bg-brand-orange hover:bg-brand-orange/90 h-10 cursor-pointer rounded-xl px-5 text-xs font-semibold text-white shadow-sm">
              {config.primaryText}
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </Link>
          <Link to={config.secondaryHref}>
            <Button
              variant="outline"
              className="h-10 cursor-pointer rounded-xl border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-800 hover:border-brand-orange/45 hover:text-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {config.secondaryText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BlogFeatureBridge;
