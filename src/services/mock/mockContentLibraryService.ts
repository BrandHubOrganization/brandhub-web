import type {
  MediaItem,
  HashtagGroup,
  PostTemplate,
  MediaQueryParams,
  PaginatedResponse,
} from "@/types/contentLibrary";

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "med-1",
    workspaceId: "ws-default",
    filename: "summer-campaign-banner.jpg",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    sizeBytes: 2450000,
    width: 1200,
    height: 630,
    aspectRatio: "16:9",
    resolution: "4K UHD",
    category: "Marketing Campaign",
    createdAt: "2026-08-15T10:30:00Z",
  },
  {
    id: "med-2",
    workspaceId: "ws-default",
    filename: "brand-identity-showcase.png",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80",
    type: "image",
    sizeBytes: 1840000,
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    resolution: "FHD 1080p",
    category: "Branding",
    createdAt: "2026-08-14T14:20:00Z",
  },
  {
    id: "med-3",
    workspaceId: "ws-default",
    filename: "product-teaser-vertical.mp4",
    url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-outfit-41315-large.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    type: "video",
    sizeBytes: 8900000,
    width: 1080,
    height: 1920,
    durationSeconds: 15,
    aspectRatio: "9:16",
    resolution: "FHD 1080p",
    category: "Reels / TikTok",
    createdAt: "2026-08-12T09:15:00Z",
  },
  {
    id: "med-4",
    workspaceId: "ws-default",
    filename: "minimalist-workspace-desk.jpg",
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    sizeBytes: 3100000,
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    resolution: "4K UHD",
    category: "Corporate & Team",
    createdAt: "2026-08-10T16:45:00Z",
  },
  {
    id: "med-5",
    workspaceId: "ws-default",
    filename: "autumn-lookbook-01.jpg",
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1080&q=80",
    type: "image",
    sizeBytes: 2150000,
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    resolution: "FHD 1080p",
    category: "Fashion & E-comm",
    createdAt: "2026-08-08T11:00:00Z",
  },
  {
    id: "med-6",
    workspaceId: "ws-default",
    filename: "coffee-lifestyle-reel.mp4",
    url: "https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-into-a-cup-42898-large.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    type: "video",
    sizeBytes: 12400000,
    width: 1080,
    height: 1920,
    durationSeconds: 24,
    aspectRatio: "9:16",
    resolution: "FHD 1080p",
    category: "F&B Lifestyle",
    createdAt: "2026-08-05T08:30:00Z",
  },
  {
    id: "med-7",
    workspaceId: "ws-default",
    filename: "cyberpunk-neon-vibes.jpg",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    sizeBytes: 4200000,
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    resolution: "4K UHD",
    category: "Creative Art",
    createdAt: "2026-08-01T19:10:00Z",
  },
  {
    id: "med-8",
    workspaceId: "ws-default",
    filename: "team-brainstorming-session.jpg",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    sizeBytes: 2800000,
    width: 1200,
    height: 800,
    aspectRatio: "16:9",
    resolution: "FHD 1080p",
    category: "Agency Life",
    createdAt: "2026-07-28T13:40:00Z",
  },
  {
    id: "med-9",
    workspaceId: "ws-default",
    filename: "saas-analytics-dashboard.png",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    sizeBytes: 1950000,
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    resolution: "4K UHD",
    category: "Technology",
    createdAt: "2026-07-25T11:15:00Z",
  },
  {
    id: "med-10",
    workspaceId: "ws-default",
    filename: "streetwear-fashion-urban.jpg",
    url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1080&q=80",
    type: "image",
    sizeBytes: 2200000,
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    resolution: "FHD 1080p",
    category: "Fashion & E-comm",
    createdAt: "2026-07-22T09:20:00Z",
  },
  {
    id: "med-11",
    workspaceId: "ws-default",
    filename: "skincare-cosmetics-botanical.jpg",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1080&q=80",
    type: "image",
    sizeBytes: 2600000,
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    resolution: "FHD 1080p",
    category: "Beauty & Care",
    createdAt: "2026-07-20T16:00:00Z",
  },
  {
    id: "med-12",
    workspaceId: "ws-default",
    filename: "podcast-broadcast-studio.jpg",
    url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    sizeBytes: 3400000,
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    resolution: "4K UHD",
    category: "Media & Audio",
    createdAt: "2026-07-18T14:30:00Z",
  },
  {
    id: "med-13",
    workspaceId: "ws-default",
    filename: "gourmet-plating-culinary.jpg",
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1080&q=80",
    type: "image",
    sizeBytes: 2750000,
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    resolution: "FHD 1080p",
    category: "F&B Lifestyle",
    createdAt: "2026-07-15T10:10:00Z",
  },
  {
    id: "med-14",
    workspaceId: "ws-default",
    filename: "fitness-athletic-training.jpg",
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1080&q=80",
    type: "image",
    sizeBytes: 3150000,
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    resolution: "FHD 1080p",
    category: "Health & Sport",
    createdAt: "2026-07-12T08:45:00Z",
  },
  {
    id: "med-15",
    workspaceId: "ws-default",
    filename: "modern-minimal-architecture.jpg",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    type: "image",
    sizeBytes: 3800000,
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    resolution: "4K UHD",
    category: "Real Estate",
    createdAt: "2026-07-10T15:20:00Z",
  },
  {
    id: "med-16",
    workspaceId: "ws-default",
    filename: "smart-gadget-wearable.jpg",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1080&q=80",
    type: "image",
    sizeBytes: 2100000,
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    resolution: "FHD 1080p",
    category: "Gadgets & Tech",
    createdAt: "2026-07-08T12:00:00Z",
  },
];

const INITIAL_HASHTAG_GROUPS: HashtagGroup[] = [
  {
    id: "hg-1",
    workspaceId: "ws-default",
    name: "Fashion & Lookbook 2026",
    category: "Thời trang & E-comm",
    usageCount: 142,
    tags: [
      "#fashion",
      "#summer2026",
      "#styleinspo",
      "#ootdvietnam",
      "#lookbook",
      "#brandhub",
      "#trendystyle",
    ],
    createdAt: "2026-08-10T10:00:00Z",
    updatedAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "hg-2",
    workspaceId: "ws-default",
    name: "Tech, AI & SaaS Ecosystem",
    category: "Công nghệ & AI",
    usageCount: 285,
    tags: [
      "#technews",
      "#aidesign",
      "#marketingtech",
      "#saas",
      "#futureofwork",
      "#synapforge",
      "#creatorsvn",
    ],
    createdAt: "2026-08-12T11:30:00Z",
    updatedAt: "2026-08-12T11:30:00Z",
  },
  {
    id: "hg-3",
    workspaceId: "ws-default",
    name: "F&B Gourmet & Daily Vibes",
    category: "Ẩm thực & Đời sống",
    usageCount: 96,
    tags: [
      "#coffeetime",
      "#morningvibes",
      "#aesthetic",
      "#saigonfoodie",
      "#hanoicoffee",
      "#relax",
      "#worklife",
    ],
    createdAt: "2026-08-14T09:00:00Z",
    updatedAt: "2026-08-14T09:00:00Z",
  },
  {
    id: "hg-4",
    workspaceId: "ws-default",
    name: "Mega Sale & Flash Deal",
    category: "Khuyến mãi & E-comm",
    usageCount: 310,
    tags: [
      "#megasale",
      "#dealhot",
      "#uudai",
      "#flashsale",
      "#freeship",
      "#chotdon",
      "#shoppingonline",
    ],
    createdAt: "2026-08-15T08:00:00Z",
    updatedAt: "2026-08-15T08:00:00Z",
  },
  {
    id: "hg-5",
    workspaceId: "ws-default",
    name: "Brand Storytelling & Growth",
    category: "Thương hiệu & Doanh nghiệp",
    usageCount: 178,
    tags: [
      "#brandstory",
      "#leadership",
      "#agencyvn",
      "#growthmarketing",
      "#contentstrategy",
      "#digitalmarketing",
    ],
    createdAt: "2026-08-16T14:00:00Z",
    updatedAt: "2026-08-16T14:00:00Z",
  },
  {
    id: "hg-6",
    workspaceId: "ws-default",
    name: "TikTok Viral & Gen Z Trends",
    category: "Mạng xã hội & Viral",
    usageCount: 420,
    tags: [
      "#xuhuongtiktok",
      "#fypvietnam",
      "#viralreels",
      "#genzmarketing",
      "#trendingnow",
      "#videoshorts",
    ],
    createdAt: "2026-08-17T16:30:00Z",
    updatedAt: "2026-08-17T16:30:00Z",
  },
];

const INITIAL_POST_TEMPLATES: PostTemplate[] = [
  {
    id: "tpl-1",
    workspaceId: "ws-default",
    title: "Ra Mắt Sản Phẩm Mới (Product Launch 🚀)",
    category: "Ra mắt",
    platforms: ["facebook", "instagram", "tiktok"],
    caption:
      "🔥 CHÍNH THỨC TRÌNH LÀNG: ĐỈNH CAO CÔNG NGHỆ 2026!\n\nSau 6 tháng ấp ủ, chúng tôi tự hào mang đến thế hệ sản phẩm đột phá tiếp theo giúp tối ưu hóa 60% năng suất làm việc của bạn.\n\n✨ 3 điểm nhấn độc quyền:\n1. Tự động hóa toàn diện quy trình kiểm duyệt\n2. Tích hợp AI GraphRAG phân tích xu hướng siêu nhạy\n3. Trải nghiệm mượt mà chuẩn UX 2026\n\n👉 Nhận ngay voucher giảm 30% cho 100 khách hàng đầu tiên qua link sinh viên/doanh nghiệp ở phần bình luận!",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[1],
    createdAt: "2026-08-15T12:00:00Z",
  },
  {
    id: "tpl-2",
    workspaceId: "ws-default",
    title: "Flash Sale 24 Giờ: Săn Deal Sốc (Mega Sale ⚡)",
    category: "Khuyến mãi",
    platforms: ["facebook", "instagram"],
    caption:
      "⏳ ĐẾM NGƯỢC 24H: CƠ HỘI DUY NHẤT TRONG THÁNG!\n\nĐừng bỏ lỡ chương trình Flash Sale bùng nổ:\n💥 Giảm trực tiếp đến 45% toàn bộ sản phẩm\n🎁 Tặng kèm bộ quà tặng trị giá 500.000đ cho hóa đơn từ 1.200.000đ\n🚚 Miễn phí vận chuyển toàn quốc\n\nChương trình sẽ tự động đóng lại khi hết số lượng ưu đãi. Chốt đơn ngay kẻo lỡ!",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[3],
    createdAt: "2026-08-16T09:30:00Z",
  },
  {
    id: "tpl-3",
    workspaceId: "ws-default",
    title: "Case Study & Khách Hàng Thành Công (Social Proof 📈)",
    category: "Case Study",
    platforms: ["linkedin", "facebook"],
    caption:
      "LÀM THẾ NÀO MỘT AGENCY TĂNG TRƯỞNG 300% NĂNG SUẤT XUẤT BẢN NỘI DUNG?\n\nTrước khi số hóa, team AdVenture Agency mất 4 ngày để gửi email và duyệt thủ công từng bài đăng cho đối tác.\n\nSau khi áp dụng nền tảng quản trị phân quyền 2 chiều:\n✅ Thời gian phê duyệt rút ngắn chỉ còn 2 giờ\n✅ 0% sai sót tone of voice thương hiệu\n✅ Minh bạch báo cáo tiến độ thời gian thực\n\nĐọc trọn vẹn câu chuyện chuyển đổi số tại bài viết!",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[4],
    createdAt: "2026-08-16T15:30:00Z",
  },
  {
    id: "tpl-4",
    workspaceId: "ws-default",
    title: "Góc Hậu Trường & Văn Hóa Đội Ngũ (Behind The Scenes 🎬)",
    category: "Thương hiệu",
    platforms: ["instagram", "tiktok", "linkedin"],
    caption:
      "Một ngày bình thường của các kỹ sư phía sau hệ thống BrandHub diễn ra như thế nào? ☕💻\n\nTừ những buổi họp phân rã WBS/Agile, thảo luận kiến trúc microservices cho đến khoảnh khắc re-run bài test đạt pass rate 100%.\n\nChúng tôi tin rằng sản phẩm tốt nhất đến từ sự gắn kết và tinh thần sáng tạo không ngừng nghỉ của từng cá nhân!",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[1],
    createdAt: "2026-08-17T08:10:00Z",
  },
  {
    id: "tpl-5",
    workspaceId: "ws-default",
    title: "Thảo Luận Tương Tác: Bạn Thuộc Team Nào? (Community Poll 🎯)",
    category: "Tương tác",
    platforms: ["facebook", "tiktok"],
    caption:
      "GÓC THĂM DÒ Ý KIẾN CỦA CREATORS VÀ MARKETERS 👇\n\nKhi sản xuất nội dung đa kênh, đâu là khâu khiến bạn tốn thời gian nhất?\n\n🅰️ Lên ý tưởng & bắt kịp xu hướng thịnh hành\n🅱️ Chờ khách hàng duyệt qua lại nhiều vòng\n🅲 Thiết kế hình ảnh, video đúng chuẩn từng nền tảng\n\nĐể lại bình luận của bạn bên dưới, BrandHub sẽ gửi tặng bộ cẩm nang tối ưu workflow hoàn toàn miễn phí nhé!",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[5],
    createdAt: "2026-08-17T14:20:00Z",
  },
  {
    id: "tpl-6",
    workspaceId: "ws-default",
    title: "Thông Báo Tuyển Dụng Nhân Tài (We Are Hiring 💼)",
    category: "Tuyển dụng",
    platforms: ["linkedin", "facebook"],
    caption:
      "🌟 CHÚNG TÔI ĐANG TÌM KIẾM NHỮNG MẢNH GHÉP TÀI NĂNG!\n\nNhằm mở rộng quy mô phát triển các giải pháp MarTech & AI, team tuyển dụng các vị trí:\n1. Senior Backend Engineer (Java / .NET / Python)\n2. Creative Content Lead (Social Strategy)\n3. UI/UX Product Designer\n\n✨ Quyền lợi:\n- Mức lương cạnh tranh & thưởng dự án định kỳ\n- Làm việc hybrid linh hoạt, thiết bị hiện đại\n- Cơ hội làm việc cùng đội ngũ kỹ sư dẫn đầu công nghệ\n\n📩 Gửi CV trực tiếp về: careers@brandhub.vn",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[4],
    createdAt: "2026-08-18T10:00:00Z",
  },
  {
    id: "tpl-7",
    workspaceId: "ws-default",
    title: "3 Bước Tối Ưu Giọng Điệu Thương Hệ (Brand Tone Guide 💡)",
    category: "Kiến thức",
    platforms: ["instagram", "facebook", "linkedin"],
    caption:
      "Làm sao để nội dung trên mọi kênh mạng xã hội luôn giữ vững bản sắc riêng?\n\n📌 3 nguyên tắc vàng từ BrandHub:\n1️⃣ Xây dựng bảng từ khóa cấm & từ khóa nhận diện bắt buộc\n2️⃣ Xác định cảm xúc chủ đạo (Tin cậy, Sôi nổi hay Tối giản)\n3️⃣ Áp dụng kiểm tra tự động trước khi xuất bản\n\nLưu lại bài viết này nếu bạn đang xây dựng Brand Guidelines cho dự án tiếp theo!",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[4],
    createdAt: "2026-08-18T13:40:00Z",
  },
  {
    id: "tpl-8",
    workspaceId: "ws-default",
    title: "Năng Lượng Tích Cực Đầu Tuần (Monday Motivation ☀️)",
    category: "Tương tác",
    platforms: ["facebook", "instagram"],
    caption:
      "Chào buổi sáng thứ Hai đầy hứng khởi! ☕✨\n\nMột tuần mới lại mở ra với những mục tiêu mới và những chiến dịch truyền thông bùng nổ. Chúc cho tất cả các Creators, Marketers và quý đối tác một tuần làm việc tràn đầy cảm hứng và hiệu suất vượt trội!\n\nBạn đã lên lịch xong cho bài đăng hôm nay chưa? Bật BrandHub lên và hoàn tất chỉ trong 5 phút nhé!",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[2],
    createdAt: "2026-08-19T07:30:00Z",
  },
];

class MockContentLibraryService {
  private mediaItems: MediaItem[] = [...INITIAL_MEDIA_ITEMS];
  private hashtagGroups: HashtagGroup[] = [...INITIAL_HASHTAG_GROUPS];
  private templates: PostTemplate[] = [...INITIAL_POST_TEMPLATES];

  // Helper delay
  private async delay(ms: number = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --- MEDIA ---
  async getMedia(
    params: MediaQueryParams,
  ): Promise<PaginatedResponse<MediaItem>> {
    await this.delay(400);

    let filtered = [...this.mediaItems];

    if (params.type && params.type !== "all") {
      filtered = filtered.filter((item) => item.type === params.type);
    }

    if (params.aspectRatio && params.aspectRatio !== "all") {
      filtered = filtered.filter((item) => item.aspectRatio === params.aspectRatio);
    }

    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((item) =>
        item.filename.toLowerCase().includes(q),
      );
    }

    if (params.sort === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    const limit = params.limit || 6;
    const page = params.page || 1;
    const startIndex = 0;
    const endIndex = page * limit;

    const items = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    return {
      items,
      hasMore,
      total: filtered.length,
      page,
    };
  }

  async uploadMedia(file: File): Promise<MediaItem> {
    await this.delay(1000);
    const isVideo = file.type.startsWith("video");

    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      workspaceId: "ws-default",
      filename: file.name,
      url: isVideo
        ? "https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-into-a-cup-42898-large.mp4"
        : URL.createObjectURL(file),
      type: isVideo ? "video" : "image",
      sizeBytes: file.size,
      width: isVideo ? 1080 : 1200,
      height: isVideo ? 1920 : 800,
      durationSeconds: isVideo ? 15 : undefined,
      createdAt: new Date().toISOString(),
    };

    this.mediaItems.unshift(newItem);
    return newItem;
  }

  async deleteMedia(id: string): Promise<boolean> {
    await this.delay(300);
    this.mediaItems = this.mediaItems.filter((item) => item.id !== id);
    return true;
  }

  // --- HASHTAG GROUPS ---
  async getHashtagGroups(): Promise<HashtagGroup[]> {
    await this.delay(300);
    return [...this.hashtagGroups];
  }

  async createHashtagGroup(
    name: string,
    tags: string[],
  ): Promise<HashtagGroup> {
    await this.delay(400);
    const newGroup: HashtagGroup = {
      id: `hg-${Date.now()}`,
      workspaceId: "ws-default",
      name,
      tags: tags.map((t) => (t.startsWith("#") ? t : `#${t}`)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.hashtagGroups.unshift(newGroup);
    return newGroup;
  }

  async updateHashtagGroup(
    id: string,
    name: string,
    tags: string[],
  ): Promise<HashtagGroup> {
    await this.delay(300);
    const index = this.hashtagGroups.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Group not found");

    const updated: HashtagGroup = {
      ...this.hashtagGroups[index],
      name,
      tags: tags.map((t) => (t.startsWith("#") ? t : `#${t}`)),
      updatedAt: new Date().toISOString(),
    };
    this.hashtagGroups[index] = updated;
    return updated;
  }

  async deleteHashtagGroup(id: string): Promise<boolean> {
    await this.delay(300);
    this.hashtagGroups = this.hashtagGroups.filter((g) => g.id !== id);
    return true;
  }

  // --- TEMPLATES ---
  async getTemplates(): Promise<PostTemplate[]> {
    await this.delay(300);
    return [...this.templates];
  }

  async createTemplate(
    title: string,
    caption: string,
    hashtagGroupId?: string,
  ): Promise<PostTemplate> {
    await this.delay(400);
    const hg = this.hashtagGroups.find((g) => g.id === hashtagGroupId);
    const newTpl: PostTemplate = {
      id: `tpl-${Date.now()}`,
      workspaceId: "ws-default",
      title,
      caption,
      hashtagGroup: hg,
      createdAt: new Date().toISOString(),
    };
    this.templates.unshift(newTpl);
    return newTpl;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    await this.delay(300);
    this.templates = this.templates.filter((t) => t.id !== id);
    return true;
  }
}

export const mockContentLibraryService = new MockContentLibraryService();
