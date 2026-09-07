import type {
  PostDraft,
  AIGenerateRequest,
  AIGenerateResponse,
} from "@/types/editor";

const MOCK_AI_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80",
];

class MockEditorService {
  private draft: PostDraft = {
    id: "post-99",
    title: "Nike Air Max Pulse — Mở bán đợt 1",
    caption:
      "Đột phá phong cách với dòng Nike Air Max Pulse hoàn toàn mới! Với đệm khí Air cải tiến mang lại độ đàn hồi vượt trội.",
    hashtags: ["#NikeAirMax", "#AirMaxPulse", "#Sneakerhead", "#BrandHub"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
    ],
    targetPlatforms: ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
    status: "DRAFT",
    updatedAt: new Date().toISOString(),
  };

  private async delay(ms: number = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getDraft(_id?: string): Promise<PostDraft> {
    await this.delay(200);
    return { ...this.draft };
  }

  async autoSaveDraft(
    _id: string,
    payload: Partial<PostDraft>,
  ): Promise<{ success: boolean; updatedAt: string }> {
    await this.delay(300);
    this.draft = {
      ...this.draft,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return { success: true, updatedAt: this.draft.updatedAt };
  }

  async submitForReview(
    _id: string,
  ): Promise<{ success: boolean; status: string }> {
    await this.delay(500);
    this.draft.status = "PENDING_REVIEW";
    return { success: true, status: "PENDING_REVIEW" };
  }

  async generateWithAI(
    req: AIGenerateRequest,
    onChunk?: (partial: string) => void,
  ): Promise<AIGenerateResponse> {
    // Simulate error testing if prompt contains "error" or "fail"
    if (req.prompt.toLowerCase().includes("error")) {
      await this.delay(1000);
      throw new Error("SERVICE_UNAVAILABLE");
    }
    if (req.prompt.toLowerCase().includes("limit")) {
      await this.delay(1000);
      throw new Error("RATE_LIMITED");
    }

    const isHàiHước =
      req.prompt.toLowerCase().includes("hài") ||
      req.prompt.toLowerCase().includes("funny");
    const isFeedback = !!req.userFeedback;

    const result = this.buildContentByType(req, isHàiHước);

    if (isFeedback) {
      result.caption = `[Đã tối ưu theo phản hồi: "${req.userFeedback}"]\n\n${result.caption}`;
    }

    const allHashtags = [
      "#BrandHub",
      "#Fashion2026",
      "#StreetStyle",
      "#TrendingNow",
      "#MustHave",
      "#StabilityAI",
    ];
    const hashtags =
      req.contentType === "CAPTION"
        ? allHashtags.slice(0, req.hashtagCount ?? allHashtags.length)
        : allHashtags.slice(0, 3);
    const randomImage =
      MOCK_AI_IMAGES[Math.floor(Math.random() * MOCK_AI_IMAGES.length)];

    // Stream chunks simulation if callback provided
    if (onChunk) {
      const words = result.caption.split(" ");
      let current = "";
      for (let i = 0; i < words.length; i++) {
        current += (i === 0 ? "" : " ") + words[i];
        onChunk(current);
        await this.delay(40);
      }
    } else {
      await this.delay(1500);
    }

    return {
      ...result,
      hashtags,
      imageUrl: req.contentType === "CAPTION" ? randomImage : undefined,
      reasoning:
        "Gợi ý nội dung và hình ảnh nghệ thuật Stability AI được tối ưu hóa theo phong cách của bạn.",
    };
  }

  private buildContentByType(
    req: AIGenerateRequest,
    isHàiHước: boolean,
  ): {
    caption: string;
    blogTitle?: string;
    adHeadline?: string;
    adDescription?: string;
  } {
    if (req.contentType === "BLOG") {
      const keyword = req.blogKeyword?.trim() || "Air Max Pulse";
      const intro = `Mở bài: Thị trường sneaker đầu năm 2026 chứng kiến sự trở lại mạnh mẽ của dòng đệm khí Air với phiên bản ${keyword} hoàn toàn mới.`;
      const body = `Thân bài: Nike ${keyword} không chỉ kế thừa di sản thiết kế biểu tượng mà còn tích hợp công nghệ đệm khí thế hệ mới, mang lại độ đàn hồi và độ bền vượt trội trong từng bước di chuyển. Chất liệu upper được dệt từ sợi tái chế, vừa thân thiện môi trường vừa đảm bảo độ thoáng khí tối ưu cho người dùng vận động cường độ cao.`;
      const extra = `Ngoài ra, dòng sản phẩm còn đi kèm bộ sưu tập phụ kiện đồng bộ và chương trình bảo hành mở rộng 12 tháng, giúp khách hàng yên tâm hơn khi lựa chọn.`;
      const conclusion = `Kết luận: Với mức giá cạnh tranh và chiến lược phân phối rộng khắp hệ thống cửa hàng toàn quốc, ${keyword} được kỳ vọng trở thành một trong những mẫu giày bán chạy nhất năm.`;
      const length = req.blogLength || "MEDIUM";
      const caption =
        length === "SHORT"
          ? `${intro}\n\n${conclusion}`
          : length === "LONG"
            ? `${intro}\n\n${body}\n\n${extra}\n\n${conclusion}`
            : `${intro}\n\n${body}\n\n${conclusion}`;
      return {
        blogTitle: `${keyword}: Bước Đột Phá Của Công Nghệ Đệm Khí`,
        caption,
      };
    }

    if (req.contentType === "AD_COPY") {
      const objective = req.adObjective || "CONVERSION";
      const cta = req.adCallToAction?.trim() || "Mua ngay";
      const headlineByObjective: Record<string, string> = {
        AWARENESS: "Khám Phá Bộ Sưu Tập Air Max Pulse Mới Nhất",
        TRAFFIC: "Xem Ngay Bộ Sưu Tập Air Max Pulse Tại Cửa Hàng",
        CONVERSION: isHàiHước
          ? "Đôi Chân Đẹp, Deal Còn Đẹp Hơn! 🔥"
          : "Ưu Đãi Giới Hạn — Air Max Pulse Chính Hãng",
      };
      const descriptionByObjective: Record<string, string> = {
        AWARENESS:
          "Công nghệ đệm khí thế hệ mới, thiết kế biểu tượng, chất liệu bền vững. Tìm hiểu ngay câu chuyện thương hiệu.",
        TRAFFIC:
          "Ghé cửa hàng gần bạn hoặc truy cập website để trải nghiệm trực tiếp toàn bộ bộ sưu tập mới.",
        CONVERSION:
          "Giảm ngay 20% cho 100 khách đặt hàng đầu tiên. Miễn phí vận chuyển toàn quốc. Đặt ngay hôm nay, số lượng có hạn.",
      };
      return {
        adHeadline: headlineByObjective[objective],
        adDescription: descriptionByObjective[objective],
        caption: `${cta} — Air Max Pulse chính hãng!`,
      };
    }

    const caption = isHàiHước
      ? `🔥 Bật chế độ "Flex" phong cách cực chất cùng siêu phẩm mới nhất! 👟\nKhông chỉ là một đôi giày, đây là tấm vé giúp bạn trở thành tâm điểm mọi ánh nhìn trên phố.\n\n✨ Đệm khí êm ái đến mức bạn có thể nhún nhảy cả ngày mà không thấy mệt. Đặt hàng ngay kẻo hết size nhé cả nhà!`
      : `👟 Khám phá sự kết hợp hoàn hảo giữa thời trang đường phố và công nghệ đệm khí vượt trội.\n\nThiết kế tối ưu mang lại sự thoải mái trong từng bước di chuyển. Sản phẩm đã chính thức có mặt tại hệ thống cửa hàng trên toàn quốc!`;
    return { caption };
  }
}

export const mockEditorService = new MockEditorService();
