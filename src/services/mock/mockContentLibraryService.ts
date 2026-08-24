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
    createdAt: "2026-07-28T13:40:00Z",
  },
];

const INITIAL_HASHTAG_GROUPS: HashtagGroup[] = [
  {
    id: "hg-1",
    workspaceId: "ws-default",
    name: "Fashion Summer 2026",
    tags: [
      "#fashion",
      "#summer2026",
      "#styleinspo",
      "#ootd",
      "#lookbook",
      "#brandhub",
    ],
    createdAt: "2026-08-10T10:00:00Z",
    updatedAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "hg-2",
    workspaceId: "ws-default",
    name: "Tech & AI Trends",
    tags: [
      "#technews",
      "#aidesign",
      "#marketingtech",
      "#saas",
      "#futureofwork",
      "#creators",
    ],
    createdAt: "2026-08-12T11:30:00Z",
    updatedAt: "2026-08-12T11:30:00Z",
  },
  {
    id: "hg-3",
    workspaceId: "ws-default",
    name: "Coffee & Daily Vibes",
    tags: [
      "#coffeetime",
      "#morningvibes",
      "#aesthetic",
      "#lifestyle",
      "#relax",
      "#worklife",
    ],
    createdAt: "2026-08-14T09:00:00Z",
    updatedAt: "2026-08-14T09:00:00Z",
  },
];

const INITIAL_POST_TEMPLATES: PostTemplate[] = [
  {
    id: "tpl-1",
    workspaceId: "ws-default",
    title: "Bộ Sưu Tập Mùa Hè ☀️",
    caption:
      "Chào đón bộ sưu tập Mùa Hè 2026 rực rỡ! Khám phá ngay những thiết kế độc quyền giúp bạn nổi bật bất chấp cái nắng hè. Ghé thăm gian hàng online của chúng mình để nhận ưu đãi lên đến 30%!",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[0],
    createdAt: "2026-08-15T12:00:00Z",
  },
  {
    id: "tpl-2",
    workspaceId: "ws-default",
    title: "Cập nhật Tính Năng Mới 🚀",
    caption:
      "Tái định nghĩa trải nghiệm quản lý truyền thông với sự hỗ trợ từ AI! Chúng tôi vừa ra mắt tính năng Content Library giúp tối ưu hóa 50% thời gian sáng tạo bài viết.",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[1],
    createdAt: "2026-08-16T15:30:00Z",
  },
  {
    id: "tpl-3",
    workspaceId: "ws-default",
    title: "Góc Cà Phê Sáng ☕",
    caption:
      "Một tách cà phê nóng khởi đầu ngày mới làm việc tràn đầy năng lượng. Hãy tạo cho mình một khoảng lặng nghỉ ngơi và tận hưởng những điều nhỏ bé.",
    hashtagGroup: INITIAL_HASHTAG_GROUPS[2],
    createdAt: "2026-08-17T08:10:00Z",
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
