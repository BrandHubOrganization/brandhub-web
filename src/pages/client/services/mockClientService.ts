import { api } from "@/services/api";
import type {
  Client,
  CreateClientDTO,
  UpdateServicePackageDTO,
  UpdateClientSettingsDTO,
  ClientListParams,
} from "../types/client";

const MOCK_CLIENTS: Client[] = [
  {
    id: "cli-101",
    workspaceId: "ws-1",
    name: "Heineken Vietnam",
    logoUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    industry: "Đồ uống & Giải khát",
    contactEmail: "contact@heineken.vn",
    contactPhone: "+84 901 234 567",
    assignedAccountManagerId: "am-1",
    assignedAccountManagerName: "Nguyễn Văn An",
    assignedAccountManagerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    activePostsCount: 18,
    servicePackage: {
      packageTier: "ENTERPRISE",
      monthlyPostQuota: 45,
      platforms: ["FACEBOOK", "INSTAGRAM", "TIKTOK", "ZALO_OA"],
      aiCreditsPerMonth: 500,
      expiryDate: "2026-12-31",
    },
    status: "ACTIVE",
    linkedAccounts: [
      {
        id: "sa-1",
        platform: "FACEBOOK",
        accountName: "Heineken Vietnam Fanpage",
        accountHandle: "@heineken.vn",
        isConnected: true,
      },
      {
        id: "sa-2",
        platform: "INSTAGRAM",
        accountName: "Heineken Official IG",
        accountHandle: "@heineken_official",
        isConnected: true,
      },
      {
        id: "sa-3",
        platform: "TIKTOK",
        accountName: "Heineken TikTok Channel",
        accountHandle: "@heineken_tiktok",
        isConnected: true,
      },
    ],
    contentRequests: [
      {
        id: "cr-1",
        title: "Bài đăng khuyến mãi Tết 2026 - Post 01",
        status: "APPROVED",
        authorName: "Trần Thị Bình",
        createdAt: "2026-08-15",
      },
      {
        id: "cr-2",
        title: "Video Story mừng năm mới",
        status: "PENDING_APPROVAL",
        authorName: "Lê Hoàng Cường",
        createdAt: "2026-08-17",
      },
    ],
    analyticsSummary: {
      totalPosts: 142,
      publishedPosts: 128,
      activeRequests: 4,
      engagementRate: 8.4,
    },
    contacts: [
      {
        id: "ct-1",
        name: "Đặng Thu Trang",
        email: "trang.dang@heineken.vn",
        role: "MARKETING_LEAD",
        canApproveContent: true,
      },
      {
        id: "ct-2",
        name: "Vũ Quốc Bảo",
        email: "bao.vu@heineken.vn",
        role: "LEGAL",
        canApproveContent: true,
      },
    ],
    preferences: {
      notifyOnNewRequest: true,
      notifyOnPublish: true,
      requireClientApprovalBeforePublish: true,
      preferredLanguage: "vi",
    },
    createdAt: "2026-01-15",
  },
  {
    id: "cli-102",
    workspaceId: "ws-1",
    name: "Nike Vietnam Store",
    logoUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80",
    industry: "Thời trang & Thể thao",
    contactEmail: "marketing@nike.com.vn",
    contactPhone: "+84 908 765 432",
    assignedAccountManagerId: "am-2",
    assignedAccountManagerName: "Phạm Minh Dung",
    assignedAccountManagerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    activePostsCount: 12,
    servicePackage: {
      packageTier: "GROWTH",
      monthlyPostQuota: 30,
      platforms: ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
      aiCreditsPerMonth: 200,
      expiryDate: "2026-11-30",
    },
    status: "ACTIVE",
    linkedAccounts: [
      {
        id: "sa-4",
        platform: "FACEBOOK",
        accountName: "Nike Vietnam Fanpage",
        accountHandle: "@nike.vietnam",
        isConnected: true,
      },
      {
        id: "sa-5",
        platform: "INSTAGRAM",
        accountName: "Nike Running IG",
        accountHandle: "@nike_running_vn",
        isConnected: true,
      },
    ],
    contentRequests: [
      {
        id: "cr-3",
        title: "Bộ sưu tập Nike Air Max Q3",
        status: "PENDING_APPROVAL",
        authorName: "Trần Thị Bình",
        createdAt: "2026-08-16",
      },
    ],
    analyticsSummary: {
      totalPosts: 86,
      publishedPosts: 74,
      activeRequests: 2,
      engagementRate: 6.8,
    },
    contacts: [
      {
        id: "ct-3",
        name: "Hoàng Anh Tuấn",
        email: "tuan.hoang@nike.com.vn",
        role: "MARKETING_LEAD",
        canApproveContent: false,
      },
    ],
    preferences: {
      notifyOnNewRequest: true,
      notifyOnPublish: false,
      requireClientApprovalBeforePublish: false,
      preferredLanguage: "en",
    },
    createdAt: "2026-02-10",
  },
  {
    id: "cli-103",
    workspaceId: "ws-1",
    name: "Sữa Hạt Organic Pure",
    logoUrl:
      "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=100&auto=format&fit=crop&q=80",
    industry: "Thực phẩm & Sức khỏe",
    contactEmail: "info@purenut.vn",
    contactPhone: "+84 912 345 678",
    assignedAccountManagerId: "am-1",
    assignedAccountManagerName: "Nguyễn Văn An",
    assignedAccountManagerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    activePostsCount: 5,
    servicePackage: {
      packageTier: "STARTER",
      monthlyPostQuota: 15,
      platforms: ["FACEBOOK", "ZALO_OA"],
      aiCreditsPerMonth: 50,
      expiryDate: "2026-10-15",
    },
    status: "ACTIVE",
    linkedAccounts: [
      {
        id: "sa-6",
        platform: "FACEBOOK",
        accountName: "Sữa Hạt PureNut",
        accountHandle: "@purenut.official",
        isConnected: true,
      },
    ],
    contentRequests: [],
    analyticsSummary: {
      totalPosts: 32,
      publishedPosts: 27,
      activeRequests: 1,
      engagementRate: 4.2,
    },
    contacts: [
      {
        id: "ct-4",
        name: "Ngô Thị Kim Ngân",
        email: "ngan.ngo@purenut.vn",
        role: "FINANCE",
        canApproveContent: false,
      },
      {
        id: "ct-5",
        name: "Đỗ Văn Phát",
        email: "phat.do@purenut.vn",
        role: "APPROVER",
        canApproveContent: true,
      },
    ],
    preferences: {
      notifyOnNewRequest: false,
      notifyOnPublish: true,
      requireClientApprovalBeforePublish: true,
      preferredLanguage: "vi",
    },
    createdAt: "2026-04-01",
  },
];

function warnMockFallback(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(`[mockClientService] ${context}, using mock fallback`, error);
  }
}

export const mockClientService = {
  async getClients(
    params?: ClientListParams,
  ): Promise<{ content: Client[]; totalElements: number }> {
    try {
      const response = await api.get("/api/v1/clients", { params });
      const content =
        response.data?.data?.content ?? response.data?.data ?? response.data;
      const total =
        response.data?.meta?.totalElements ??
        content?.length ??
        MOCK_CLIENTS.length;

      if (Array.isArray(content) && content.length > 0) {
        return { content, totalElements: total };
      }

      let filtered = [...MOCK_CLIENTS];
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.contactEmail.toLowerCase().includes(query) ||
            c.industry?.toLowerCase().includes(query),
        );
      }
      return { content: filtered, totalElements: filtered.length };
    } catch (error) {
      warnMockFallback("GET /api/v1/clients failed", error);
      let filtered = [...MOCK_CLIENTS];
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.contactEmail.toLowerCase().includes(query),
        );
      }
      return { content: filtered, totalElements: filtered.length };
    }
  },

  async getClientById(id: string): Promise<Client> {
    try {
      const response = await api.get(`/api/v1/clients/${id}`);
      return response.data?.data ?? response.data ?? MOCK_CLIENTS[0];
    } catch (error) {
      warnMockFallback(`GET /api/v1/clients/${id} failed`, error);
      const found = MOCK_CLIENTS.find((c) => c.id === id);
      return found ?? MOCK_CLIENTS[0];
    }
  },

  async createClient(dto: CreateClientDTO): Promise<Client> {
    try {
      const response = await api.post("/api/v1/clients", dto);
      return response.data?.data ?? response.data;
    } catch (error) {
      warnMockFallback("POST /api/v1/clients failed", error);
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        workspaceId: "ws-1",
        name: dto.name,
        logoUrl:
          dto.logoUrl ||
          "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80",
        industry: dto.industry || "General",
        contactEmail: dto.contactEmail,
        assignedAccountManagerId: dto.assignedAccountManagerId || "am-1",
        assignedAccountManagerName: "Nguyễn Văn An",
        activePostsCount: 0,
        servicePackage: {
          packageTier: dto.packageTier,
          monthlyPostQuota:
            dto.packageTier === "ENTERPRISE"
              ? 50
              : dto.packageTier === "GROWTH"
                ? 30
                : 15,
          platforms: dto.allowedPlatforms || ["FACEBOOK", "INSTAGRAM"],
          expiryDate: "2026-12-31",
        },
        status: "ACTIVE",
        createdAt: new Date().toISOString().split("T")[0],
      };
      return newClient;
    }
  },

  async updateServicePackage(
    id: string,
    dto: UpdateServicePackageDTO,
  ): Promise<Client> {
    try {
      const response = await api.put(
        `/api/v1/clients/${id}/service-package`,
        dto,
      );
      return response.data?.data ?? response.data;
    } catch (error) {
      warnMockFallback(
        `PUT /api/v1/clients/${id}/service-package failed`,
        error,
      );
      const existing = MOCK_CLIENTS.find((c) => c.id === id) || MOCK_CLIENTS[0];
      return {
        ...existing,
        servicePackage: {
          ...existing.servicePackage,
          packageTier: dto.packageTier,
          monthlyPostQuota: dto.monthlyPostLimit,
          platforms: dto.allowedPlatforms || existing.servicePackage.platforms,
          aiCreditsPerMonth:
            dto.aiCreditsPerMonth ??
            existing.servicePackage.aiCreditsPerMonth ??
            200,
          expiryDate: dto.expiryDate || existing.servicePackage.expiryDate,
        },
      };
    }
  },

  async updateClientSettings(
    id: string,
    dto: UpdateClientSettingsDTO,
  ): Promise<Client> {
    try {
      const response = await api.put(`/api/v1/clients/${id}/settings`, dto);
      return response.data?.data ?? response.data;
    } catch (error) {
      warnMockFallback(`PUT /api/v1/clients/${id}/settings failed`, error);
      const existing = MOCK_CLIENTS.find((c) => c.id === id) || MOCK_CLIENTS[0];
      return {
        ...existing,
        contacts: dto.contacts,
        preferences: dto.preferences,
      };
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await api.delete(`/api/v1/clients/${id}`);
    } catch (error) {
      warnMockFallback(`DELETE /api/v1/clients/${id} failed`, error);
    }
  },
};
