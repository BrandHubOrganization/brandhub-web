export interface BlogAuthor {
  id: string;
  name: string;
  roleTitle: string;
  avatar: string;
  highlight: string;
  bio: string;
}

export const BLOG_AUTHORS: Record<string, BlogAuthor> = {
  "le-tri-trung": {
    id: "le-tri-trung",
    name: "Lê Trí Trung",
    roleTitle: "Founder, Tech Lead & Engineering Manager — SynapForge",
    avatar: "/team/trunglc-white-polo-glasses.png",
    highlight: "Quán quân Hackathon CV 2026 · Kiến trúc sư trưởng BrandHub",
    bio: "Trực tiếp thiết kế kiến trúc hệ thống quản trị truyền thông toàn diện và mô hình vận hành đa Workspace theo 6 vai trò chuẩn cho BrandHub.",
  },
  "nguyen-thanh-loc": {
    id: "nguyen-thanh-loc",
    name: "Nguyễn Thành Lộc",
    roleTitle: "Backend Architect & AI GraphRAG Lead — SynapForge",
    avatar: "/team/Locnt-white-polo.png",
    highlight: "Kỹ sư trưởng AI Studio · Chuyên gia Neo4j GraphRAG & ChromaDB",
    bio: "Phụ trách kiến trúc AI Studio của BrandHub, tích hợp đồ thị tri thức Neo4j cùng ChromaDB vector search để kiểm soát giọng văn thương hiệu và kiểm duyệt an toàn nội dung.",
  },
  "ha-van-an": {
    id: "ha-van-an",
    name: "Hà Văn Ân",
    roleTitle: "Full-Stack & AI Solutions Engineer — SynapForge",
    avatar: "/team/anhv-white-polo.png",
    highlight: "Đồng tác giả nghiên cứu AI ICTA 2026 (73.3% pass rate)",
    bio: "Chuyên sâu xây dựng trình soạn thảo nội dung đa kênh, luồng cộng tác thời gian thực và hệ thống cào dữ liệu xu hướng TikTok Creative Center & Google Trends.",
  },
  "nguyen-chon-phuoc": {
    id: "nguyen-chon-phuoc",
    name: "Nguyễn Chơn Phước",
    roleTitle: "Cloud DevOps & Publisher Microservice Lead — SynapForge",
    avatar: "/team/phuocnc-white-polo.png",
    highlight: "Chung kết InnoCodeCamp FPT 2024 · Chuyên gia Spring Boot & Ops",
    bio: "Xây dựng dịch vụ xuất bản tự động (Publisher Service) kết nối OAuth mã hóa AES-256 tới Facebook, Instagram, TikTok và Threads với độ trễ API trung bình dưới 120ms.",
  },
  "nguyen-minh-tuan": {
    id: "nguyen-minh-tuan",
    name: "Nguyễn Minh Tuấn",
    roleTitle: "Enterprise Backend & Workflow Engineer — SynapForge",
    avatar: "/team/tuannm-white-polo.png",
    highlight: "Microsoft Back-End Developer Pro · Chuyên gia Luồng Nghiệp vụ",
    bio: "Thiết kế luồng đàm phán Gói truyền thông (Media Package), kích hoạt Media Campaign tự động và tích hợp cổng thanh toán VietQR (SePay / PayOS).",
  },
};
