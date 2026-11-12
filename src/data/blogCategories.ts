import type { BlogCategory, BlogCategorySlug } from "./blogTypes";

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    slug: "agency-project-management",
    name: "Quản trị Dự án & Workspace (Mô hình Jira / Notion cho Agency)",
    shortName: "Quản trị như Jira / Notion",
    description:
      "Phương pháp thiết lập không gian làm việc đa thương hiệu, phân rã task truyền thông theo Kanban/Sprint và phân quyền 6 vai trò chuẩn cho Agency.",
    badgeColor:
      "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
    pillarKeyword: "phần mềm quản lý dự án truyền thông agency",
    relatedDomain: "Quản trị Dự án & Không gian làm việc Agency",
    iconName: "Layers",
    plannedCount: 17,
  },
  {
    slug: "content-workflow-approval",
    name: "Quy trình Sản xuất & Phê duyệt Nội dung Đa cấp",
    shortName: "Quy trình & Phê duyệt",
    description:
      "Chuẩn hóa luồng làm bài truyền thông từ Brief, soạn thảo, kiểm duyệt an toàn cộng đồng đến phê duyệt 3 cấp Creator -> Manager -> Client.",
    badgeColor:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    pillarKeyword: "quy trình duyệt bài truyền thông agency",
    relatedDomain: "Quy trình Sản xuất & Phê duyệt Nội dung",
    iconName: "ListChecks",
    plannedCount: 17,
  },
  {
    slug: "media-package-campaign",
    name: "Gói Truyền thông (Media Package) & Chiến dịch Đa kênh",
    shortName: "Gói Truyền thông & Campaign",
    description:
      "Cấu trúc một gói truyền thông chuẩn B2B, cách lên báo giá proposal, đàm phán 2 chiều với Client và chuyển đổi thành chiến dịch thực thi.",
    badgeColor:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    pillarKeyword: "gói truyền thông gồm những gì",
    relatedDomain: "Gói Dịch vụ & Chiến dịch Truyền thông",
    iconName: "Briefcase",
    plannedCount: 17,
  },
  {
    slug: "ai-studio-graphrag-trends",
    name: "AI Marketing Studio, GraphRAG & Bắt Trend Thời gian thực",
    shortName: "AI Studio & GraphRAG",
    description:
      "Ứng dụng đồ thị tri thức Neo4j + ChromaDB để giữ chuẩn Brand Guidelines, tạo đại sứ ảo LoRA và bắt trend TikTok Creative Center mỗi ngày.",
    badgeColor:
      "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    pillarKeyword: "AI viết content đúng brand guidelines graphrag",
    relatedDomain: "AI Studio & Đồ thị Tri thức Thương hiệu",
    iconName: "Sparkles",
    plannedCount: 18,
  },
  {
    slug: "multi-channel-publishing",
    name: "Xuất bản Đa nền tảng (Facebook, Instagram, TikTok, Threads)",
    shortName: "Xuất bản 4 Kênh MXH",
    description:
      "Kỹ thuật lập lịch đăng bài tự động, tối ưu định dạng từng nền tảng, bảo mật OAuth token AES-256 và đo lường hiệu suất thời gian thực.",
    badgeColor:
      "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    pillarKeyword: "phần mềm đăng bài tự động facebook tiktok instagram threads",
    relatedDomain: "Xuất bản Đa kênh & Kết nối Mạng xã hội",
    iconName: "Share2",
    plannedCount: 16,
  },
  {
    slug: "tool-comparison-case-study",
    name: "So sánh Công cụ, Chuyển đổi số & Tối ưu Chi phí Agency",
    shortName: "So sánh & Case Study",
    description:
      "Đặt lên bàn cân BrandHub với Jira, Notion, Trello, Buffer, Hootsuite, Planable và bài toán tối ưu chi phí vận hành qua thanh toán VietQR.",
    badgeColor:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    pillarKeyword: "so sánh phần mềm quản lý agency marketing",
    relatedDomain: "Bảng giá, Đăng ký & So sánh Nền tảng",
    iconName: "Scale",
    plannedCount: 15,
  },
];

export function getBlogCategoryBySlug(
  slug: BlogCategorySlug,
): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}
