import type {
  ContentTemplate,
  TemplateQueryParams,
  TemplatePaginatedResponse,
} from "@/types/template";

const INITIAL_TEMPLATES: ContentTemplate[] = [
  {
    id: "tpl-101",
    title: "Bộ Sưu Tập Mùa Hè Rực Rỡ ☀️",
    caption:
      "Chào đón bộ sưu tập Mùa Hè 2026 rực rỡ! Khám phá ngay những thiết kế độc quyền giúp bạn nổi bật bất chấp cái nắng hè. Ghé thăm gian hàng online của chúng mình để nhận ưu đãi lên đến 30%!",
    hashtags: ["#FashionSummer", "#Lookbook2026", "#StyleInspo", "#BrandHub"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80",
    ],
    targetPlatforms: ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
    isTemplate: true,
    lastUsedAt: "2026-08-15T12:00:00Z",
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "tpl-102",
    title: "Cập Nhật Tính Năng Mới Tối Ưu AI 🚀",
    caption:
      "Tái định nghĩa trải nghiệm sáng tạo nội dung với sự hỗ trợ từ Trợ lý AI Co-Pilot! Chúng tôi vừa ra mắt tính năng sinh bài đăng và hình ảnh tự động giúp tiết kiệm 50% thời gian.",
    hashtags: ["#TechNews", "#AITrends", "#Saas", "#MarketingTools"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80",
    ],
    targetPlatforms: ["FACEBOOK", "THREADS", "YOUTUBE"],
    isTemplate: true,
    lastUsedAt: "2026-08-16T15:30:00Z",
    createdAt: "2026-08-05T14:20:00Z",
  },
  {
    id: "tpl-103",
    title: "Góc Cà Phê Sáng Khởi Đầu Ngày Mới ☕",
    caption:
      "Một tách cà phê nóng khởi đầu ngày mới làm việc tràn đầy năng lượng. Hãy tạo cho mình một khoảng lặng nghỉ ngơi và tận hưởng những điều nhỏ bé xung quanh.",
    hashtags: ["#CoffeeVibes", "#MorningInspo", "#Aesthetic", "#Lifestyle"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&q=80",
    ],
    targetPlatforms: ["INSTAGRAM", "THREADS"],
    isTemplate: true,
    lastUsedAt: "2026-08-17T08:10:00Z",
    createdAt: "2026-08-08T09:00:00Z",
  },
  {
    id: "tpl-104",
    title: "Thông Báo Chương Trình Khuyến Mãi Flash Sale ⚡",
    caption:
      "SIÊU BÃO GIẢM GIÁ 50%! Chỉ áp dụng cho 100 khách hàng nhanh tay nhất đặt đơn trong hôm nay. Nhấn vào liên kết bên dưới để săn deal ngay!",
    hashtags: ["#FlashSale", "#KhuyenMai", "#HotDeal", "#ShoppingDay"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&q=80",
    ],
    targetPlatforms: ["FACEBOOK", "TIKTOK"],
    isTemplate: true,
    lastUsedAt: "2026-08-12T19:40:00Z",
    createdAt: "2026-08-02T11:30:00Z",
  },
  {
    id: "tpl-105",
    title: "Bài Viết Chia Sẻ Bí Quyết Skincare Ban Đêm 🌸",
    caption:
      "Bí quyết dường da căng bóng như sương vào buổi sáng! 5 bước chuẩn hóa giúp phục hồi hàng rào bảo vệ da sau cả ngày dài tiếp xúc với khói bụi.",
    hashtags: ["#BeautyTips", "#SkincareRoutine", "#GlowSkin", "#SelfCare"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80",
    ],
    targetPlatforms: ["INSTAGRAM", "TIKTOK"],
    isTemplate: true,
    lastUsedAt: "2026-08-14T11:15:00Z",
    createdAt: "2026-08-06T16:00:00Z",
  },
  {
    id: "tpl-106",
    title: "Setup Bàn Làm Việc Tối Giản Minimalist 🖥️",
    caption:
      "Biến góc làm việc thành không gian truyền cảm hứng sáng tạo! Sử dụng các tone màu trung tính kết hợp đèn LED dịu nhẹ tạo sự tập trung tối đa.",
    hashtags: ["#DeskSetup", "#Workspace", "#Minimalism", "#TechVibes"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&q=80",
    ],
    targetPlatforms: ["FACEBOOK", "THREADS", "YOUTUBE"],
    isTemplate: true,
    lastUsedAt: "2026-08-10T14:00:00Z",
    createdAt: "2026-08-04T08:45:00Z",
  },
];

class MockTemplateService {
  private templates: ContentTemplate[] = [...INITIAL_TEMPLATES];

  private async delay(ms: number = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getTemplates(
    params: TemplateQueryParams,
  ): Promise<TemplatePaginatedResponse> {
    await this.delay(350);

    let filtered = [...this.templates];

    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.caption.toLowerCase().includes(q),
      );
    }

    const size = params.size || 20;
    const page = params.page || 0;
    const total = filtered.length;
    const totalPages = Math.ceil(total / size) || 1;

    const startIndex = page * size;
    const items = filtered.slice(startIndex, startIndex + size);

    return {
      items,
      total,
      page,
      size,
      totalPages,
    };
  }

  async deleteTemplate(id: string): Promise<boolean> {
    await this.delay(300);
    this.templates = this.templates.filter((t) => t.id !== id);
    return true;
  }
}

export const mockTemplateService = new MockTemplateService();
