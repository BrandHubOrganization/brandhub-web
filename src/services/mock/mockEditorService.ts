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

    let resultCaption = isHàiHước
      ? `🔥 Bật chế độ "Flex" phong cách cực chất cùng siêu phẩm mới nhất! 👟\nKhông chỉ là một đôi giày, đây là tấm vé giúp bạn trở thành tâm điểm mọi ánh nhìn trên phố.\n\n✨ Đệm khí êm ái đến mức bạn có thể nhún nhảy cả ngày mà không thấy mệt. Đặt hàng ngay kẻo hết size nhé cả nhà!`
      : `👟 Khám phá sự kết hợp hoàn hảo giữa thời trang đường phố và công nghệ đệm khí vượt trội.\n\nThiết kế tối ưu mang lại sự thoải mái trong từng bước di chuyển. Sản phẩm đã chính thức có mặt tại hệ thống cửa hàng trên toàn quốc!`;

    if (isFeedback) {
      resultCaption = `[Đã tối ưu theo phản hồi: "${req.userFeedback}"]\n\n${resultCaption}`;
    }

    const hashtags = [
      "#BrandHub",
      "#Fashion2026",
      "#StreetStyle",
      "#TrendingNow",
      "#MustHave",
      "#StabilityAI",
    ];
    const randomImage =
      MOCK_AI_IMAGES[Math.floor(Math.random() * MOCK_AI_IMAGES.length)];

    // Stream chunks simulation if callback provided
    if (onChunk) {
      const words = resultCaption.split(" ");
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
      caption: resultCaption,
      hashtags,
      imageUrl: randomImage,
      reasoning:
        "Gợi ý nội dung và hình ảnh nghệ thuật Stability AI được tối ưu hóa theo phong cách của bạn.",
    };
  }
}

export const mockEditorService = new MockEditorService();
