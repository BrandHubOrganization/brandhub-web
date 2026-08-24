import type {
  HashtagGroup,
  CreateHashtagGroupPayload,
} from "@/types/hashtagGroup";

const INITIAL_GROUPS: HashtagGroup[] = [
  {
    id: "hg-1",
    name: "Chiến Dịch Mùa Hè 2026 ☀️",
    hashtags: [
      "#SummerVibes",
      "#Fashion2026",
      "#Lookbook",
      "#SunLight",
      "#BrandHub",
    ],
    count: 5,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-15T12:00:00Z",
  },
  {
    id: "hg-2",
    name: "Công Nghệ & AI Co-Pilot 🤖",
    hashtags: [
      "#TechNews",
      "#AIContent",
      "#FutureTech",
      "#SmartTools",
      "#Saas",
    ],
    count: 5,
    createdAt: "2026-08-05T14:20:00Z",
    updatedAt: "2026-08-16T15:30:00Z",
  },
  {
    id: "hg-3",
    name: "Giày Thể Thao Sneakerhead 👟",
    hashtags: [
      "#Sneakerhead",
      "#AirMaxPulse",
      "#NikeAir",
      "#StreetStyle",
      "#KicksOfTheDay",
    ],
    count: 5,
    createdAt: "2026-08-08T09:00:00Z",
    updatedAt: "2026-08-17T08:10:00Z",
  },
  {
    id: "hg-4",
    name: "Phong Cách Sống & Cà Phê ☕",
    hashtags: [
      "#CoffeeVibes",
      "#Lifestyle",
      "#MorningRoutine",
      "#Aesthetic",
      "#ChillVibes",
    ],
    count: 5,
    createdAt: "2026-08-02T11:30:00Z",
    updatedAt: "2026-08-12T19:40:00Z",
  },
];

class MockHashtagGroupService {
  private groups: HashtagGroup[] = [...INITIAL_GROUPS];

  private async delay(ms: number = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getGroups(search?: string): Promise<HashtagGroup[]> {
    await this.delay(250);
    if (!search || search.trim() === "") {
      return [...this.groups];
    }
    const q = search.toLowerCase();
    return this.groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.hashtags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  async createGroup(payload: CreateHashtagGroupPayload): Promise<HashtagGroup> {
    await this.delay(300);

    // Validate unique name
    if (
      this.groups.some(
        (g) => g.name.toLowerCase() === payload.name.toLowerCase(),
      )
    ) {
      throw new Error("DUPLICATE_NAME");
    }

    const formattedTags = payload.hashtags.map((t) => {
      let tag = t.trim();
      return tag.startsWith("#") ? tag : `#${tag}`;
    });

    const newGroup: HashtagGroup = {
      id: `hg-${Date.now()}`,
      name: payload.name.trim(),
      hashtags: formattedTags,
      count: formattedTags.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.groups.unshift(newGroup);
    return newGroup;
  }

  async updateGroup(
    id: string,
    payload: CreateHashtagGroupPayload,
  ): Promise<HashtagGroup> {
    await this.delay(300);

    // Validate unique name excluding current id
    if (
      this.groups.some(
        (g) =>
          g.id !== id && g.name.toLowerCase() === payload.name.toLowerCase(),
      )
    ) {
      throw new Error("DUPLICATE_NAME");
    }

    const formattedTags = payload.hashtags.map((t) => {
      let tag = t.trim();
      return tag.startsWith("#") ? tag : `#${tag}`;
    });

    const idx = this.groups.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error("NOT_FOUND");

    const updated: HashtagGroup = {
      ...this.groups[idx],
      name: payload.name.trim(),
      hashtags: formattedTags,
      count: formattedTags.length,
      updatedAt: new Date().toISOString(),
    };

    this.groups[idx] = updated;
    return updated;
  }

  async deleteGroup(id: string): Promise<boolean> {
    await this.delay(300);
    this.groups = this.groups.filter((g) => g.id !== id);
    return true;
  }
}

export const mockHashtagGroupService = new MockHashtagGroupService();
