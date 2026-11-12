import { BLOG_AUTHORS } from "./blogAuthors";
import type { BlogPostPreview } from "./blogTypes";

/**
 * Lightweight summary metadata for the 6 Core Pillar Articles.
 * Imported on the Landing Page (`/`) so `BlogPreviewSection` never bundles the 100 full long-form articles.
 */
export const BLOG_FEATURED_POSTS: BlogPostPreview[] = [
  {
    id: "post-001",
    topicNumber: 1,
    slug: "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
    title:
      "Cách quản lý dự án truyền thông Agency bài bản như Jira & Notion nhưng có sẵn xuất bản đa kênh",
    metaDescription:
      "Hướng dẫn thiết lập Workspace quản lý dự án truyền thông như Jira và Notion cho Agency: phân quyền 6 vai trò, quản lý task Kanban và đăng thẳng lên 4 MXH.",
    category: "agency-project-management",
    publishedAt: "2026-11-10",
    readingTimeMinutes: 10,
    author: BLOG_AUTHORS["le-tri-trung"],
    coverImage:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Bảng quản trị dự án truyền thông và phân rã tác vụ theo mô hình Workspace trên BrandHub",
  },
  {
    id: "post-002",
    topicNumber: 18,
    slug: "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
    title:
      "Quy trình làm bài truyền thông & phê duyệt 3 cấp (Creator -> Manager -> Client) chống trôi việc",
    metaDescription:
      "Chi tiết quy trình phê duyệt nội dung 3 cấp khép kín giữa Creator, Manager và Client. Cơ chế khóa bản nháp và lưu vết lịch sử giúp chống trôi bài và đăng nhầm.",
    category: "content-workflow-approval",
    publishedAt: "2026-11-10",
    readingTimeMinutes: 9,
    author: BLOG_AUTHORS["nguyen-minh-tuan"],
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Quy trình phê duyệt nội dung đa cấp giữa Creator, Manager và Client trên nền tảng BrandHub",
  },
  {
    id: "post-003",
    topicNumber: 35,
    slug: "goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
    title:
      "Gói truyền thông (Media Package) sẽ có những gì? Hướng dẫn xây dựng báo giá chuẩn B2B cho Agency",
    metaDescription:
      "Phân tích 5 thành phần bắt buộc trong Gói truyền thông (Media Package) chuyên nghiệp: Social, AI Media, Booking Báo đài và quy trình đàm phán 2 chiều trực tuyến.",
    category: "media-package-campaign",
    publishedAt: "2026-11-10",
    readingTimeMinutes: 10,
    author: BLOG_AUTHORS["le-tri-trung"],
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Cấu trúc gói truyền thông Media Package và chuyển đổi thành chiến dịch Media Campaign trên BrandHub",
  },
  {
    id: "post-004",
    topicNumber: 52,
    slug: "ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
    title:
      "AI GraphRAG là gì? Cách ứng dụng Neo4j và ChromaDB để AI viết bài đúng 100% Brand Guidelines",
    metaDescription:
      "Giải pháp ứng dụng đồ thị tri thức Neo4j và ChromaDB để AI hiểu sâu Brand Guidelines: viết caption đúng giọng văn, tạo đại sứ ảo và bắt trend thời gian thực.",
    category: "ai-studio-graphrag-trends",
    publishedAt: "2026-11-10",
    readingTimeMinutes: 10,
    author: BLOG_AUTHORS["nguyen-thanh-loc"],
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Kiến trúc AI Studio tích hợp đồ thị tri thức Neo4j GraphRAG và ChromaDB trên BrandHub",
  },
  {
    id: "post-005",
    topicNumber: 70,
    slug: "lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
    title:
      "Hướng dẫn thiết lập lịch đăng bài tự động lên Facebook, Instagram, TikTok và Threads an toàn tuyệt đối",
    metaDescription:
      "Cách quản lý lịch xuất bản đa kênh (Content Calendar) và đăng bài tự động lên Facebook, Instagram, TikTok, Threads qua API chính thức bảo mật AES-256.",
    category: "multi-channel-publishing",
    publishedAt: "2026-11-10",
    readingTimeMinutes: 10,
    author: BLOG_AUTHORS["nguyen-chon-phuoc"],
    coverImage:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Hệ thống đặt lịch xuất bản đa nền tảng Facebook, Instagram, TikTok và Threads trên BrandHub",
  },
  {
    id: "post-006",
    topicNumber: 86,
    slug: "so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    title:
      "So sánh BrandHub với Buffer, Hootsuite, Planable và combo Jira + Notion cho Agency Việt Nam",
    metaDescription:
      "Bảng đối chiếu chi tiết giữa BrandHub với các công cụ ngoại (Buffer, Hootsuite, Planable) và bộ công cụ Jira + Notion về tính năng, AI tiếng Việt và chi phí.",
    category: "tool-comparison-case-study",
    publishedAt: "2026-11-10",
    readingTimeMinutes: 11,
    author: BLOG_AUTHORS["ha-van-an"],
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Bảng phân tích và so sánh hiệu quả đầu tư giữa BrandHub với các công cụ quản lý rời rạc",
  },
];
