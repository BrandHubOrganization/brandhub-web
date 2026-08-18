import type {
  ContentRequest,
  Assignee,
  ContentRequestQueryParams,
  ContentRequestPaginatedResponse,
} from '@/types/contentRequest';

export const MOCK_CREATORS: Assignee[] = [
  {
    id: 'user-1',
    name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@brandhub.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'CONTENT_CREATOR',
  },
  {
    id: 'user-2',
    name: 'Trần Thị Thu Hà',
    email: 'ha.tran@brandhub.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    role: 'CONTENT_CREATOR',
  },
  {
    id: 'user-3',
    name: 'Lê Hoàng Nam',
    email: 'nam.le@brandhub.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'CONTENT_CREATOR',
  },
  {
    id: 'user-4',
    name: 'Phạm Phương Anh',
    email: 'anh.pham@brandhub.io',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'CONTENT_CREATOR',
  },
];

const INITIAL_REQUESTS: ContentRequest[] = [
  {
    id: 'req-101',
    topic: 'Nike Air Max Pulse — Mở bán đợt 1',
    platforms: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'],
    clientName: 'Nike Vietnam',
    deadline: '2026-08-25',
    status: 'IN_PROGRESS',
    assignee: MOCK_CREATORS[0],
    createdAt: '2026-08-18T10:00:00Z',
  },
  {
    id: 'req-102',
    topic: 'Chiến dịch Mùa Hè Rực Rỡ cùng Heineken',
    platforms: ['FACEBOOK', 'YOUTUBE'],
    clientName: 'Heineken Vietnam',
    deadline: '2026-08-28',
    status: 'SUBMITTED',
    createdAt: '2026-08-18T11:20:00Z',
  },
  {
    id: 'req-103',
    topic: 'Ra mắt Dòng Sữa Hạt Hạnh Nhân Organic',
    platforms: ['INSTAGRAM', 'THREADS', 'TIKTOK'],
    clientName: 'Sữa Hạt Organic',
    deadline: '2026-08-22',
    status: 'PENDING_REVIEW',
    assignee: MOCK_CREATORS[1],
    createdAt: '2026-08-17T09:15:00Z',
  },
  {
    id: 'req-104',
    topic: 'Teaser ra mắt mẫu xe điện VinFast VF3 mới',
    platforms: ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE'],
    clientName: 'VinFast',
    deadline: '2026-08-30',
    status: 'SENT_TO_CLIENT',
    assignee: MOCK_CREATORS[2],
    createdAt: '2026-08-16T14:40:00Z',
  },
  {
    id: 'req-105',
    topic: 'Bài đăng ưu đãi Flash Sale 9/9 Shopee',
    platforms: ['FACEBOOK', 'THREADS'],
    clientName: 'Shopee Vietnam',
    deadline: '2026-09-02',
    status: 'APPROVED',
    assignee: MOCK_CREATORS[3],
    createdAt: '2026-08-15T08:30:00Z',
  },
  {
    id: 'req-106',
    topic: 'Hướng dẫn skincare ban đêm cho da dầu',
    platforms: ['TIKTOK', 'INSTAGRAM'],
    clientName: 'L\'Oréal Paris',
    deadline: '2026-08-24',
    status: 'ASSIGNED',
    assignee: MOCK_CREATORS[0],
    createdAt: '2026-08-18T15:00:00Z',
  },
  {
    id: 'req-107',
    topic: 'Khai trương showroom flagship tại Hà Nội',
    platforms: ['FACEBOOK', 'YOUTUBE'],
    clientName: 'Samsung Vietnam',
    deadline: '2026-09-05',
    status: 'REJECTED',
    assignee: MOCK_CREATORS[1],
    createdAt: '2026-08-14T10:00:00Z',
  },
  {
    id: 'req-108',
    topic: 'Chuỗi video ngắn món ngon cuối tuần',
    platforms: ['TIKTOK', 'YOUTUBE'],
    clientName: 'Knorr Vietnam',
    deadline: '2026-08-29',
    status: 'IN_PROGRESS',
    assignee: MOCK_CREATORS[2],
    createdAt: '2026-08-17T16:20:00Z',
  },
  {
    id: 'req-109',
    topic: 'Thông báo tuyển dụng Senior Designer',
    platforms: ['FACEBOOK', 'THREADS'],
    clientName: 'BrandHub Agency',
    deadline: '2026-08-21',
    status: 'APPROVED',
    assignee: MOCK_CREATORS[3],
    createdAt: '2026-08-13T11:10:00Z',
  },
  {
    id: 'req-110',
    topic: 'Cẩm nang du lịch tự túc Đà Lạt mùa mưa',
    platforms: ['INSTAGRAM', 'THREADS'],
    clientName: 'Traveloka',
    deadline: '2026-08-27',
    status: 'SUBMITTED',
    createdAt: '2026-08-18T12:00:00Z',
  },
  {
    id: 'req-111',
    topic: 'Đánh giá ứng dụng ngân hàng số mới',
    platforms: ['YOUTUBE', 'FACEBOOK'],
    clientName: 'Techcombank',
    deadline: '2026-09-01',
    status: 'ASSIGNED',
    assignee: MOCK_CREATORS[0],
    createdAt: '2026-08-17T13:30:00Z',
  },
  {
    id: 'req-112',
    topic: 'Infographic 5 thói quen tiết kiệm năng lượng',
    platforms: ['FACEBOOK', 'INSTAGRAM'],
    clientName: 'EVN Hanoi',
    deadline: '2026-08-31',
    status: 'PENDING_REVIEW',
    assignee: MOCK_CREATORS[1],
    createdAt: '2026-08-16T17:45:00Z',
  },
  {
    id: 'req-113',
    topic: 'Review tai nghe chống ồn không dây',
    platforms: ['YOUTUBE', 'TIKTOK'],
    clientName: 'Sony Vietnam',
    deadline: '2026-09-03',
    status: 'IN_PROGRESS',
    assignee: MOCK_CREATORS[2],
    createdAt: '2026-08-15T19:00:00Z',
  },
  {
    id: 'req-114',
    topic: 'Mini game đoán tên sản phẩm trúng quà',
    platforms: ['FACEBOOK'],
    clientName: 'Comfort Vietnam',
    deadline: '2026-08-26',
    status: 'SENT_TO_CLIENT',
    assignee: MOCK_CREATORS[3],
    createdAt: '2026-08-14T08:50:00Z',
  },
  {
    id: 'req-115',
    topic: 'Lookbook thời trang thu đông nam 2026',
    platforms: ['INSTAGRAM', 'TIKTOK'],
    clientName: 'Coolmate',
    deadline: '2026-09-10',
    status: 'SUBMITTED',
    createdAt: '2026-08-18T07:15:00Z',
  },
  {
    id: 'req-116',
    topic: 'Hướng dẫn tập Pilates cho người mới bắt đầu',
    platforms: ['YOUTUBE', 'INSTAGRAM'],
    clientName: 'California Fitness',
    deadline: '2026-09-04',
    status: 'IN_PROGRESS',
    assignee: MOCK_CREATORS[0],
    createdAt: '2026-08-16T10:20:00Z',
  },
  {
    id: 'req-117',
    topic: 'Thử thách biến hình Outfit đường phố',
    platforms: ['TIKTOK'],
    clientName: 'Uniqlo Vietnam',
    deadline: '2026-08-23',
    status: 'APPROVED',
    assignee: MOCK_CREATORS[1],
    createdAt: '2026-08-13T14:15:00Z',
  },
  {
    id: 'req-118',
    topic: 'Workshop tự làm bánh sinh nhật tại nhà',
    platforms: ['FACEBOOK', 'INSTAGRAM'],
    clientName: 'Tous Les Jours',
    deadline: '2026-09-08',
    status: 'SUBMITTED',
    createdAt: '2026-08-18T13:40:00Z',
  },
  {
    id: 'req-119',
    topic: 'Bí quyết setup bàn làm việc tối giản',
    platforms: ['THREADS', 'INSTAGRAM'],
    clientName: 'IKEA Vietnam',
    deadline: '2026-09-06',
    status: 'ASSIGNED',
    assignee: MOCK_CREATORS[2],
    createdAt: '2026-08-17T11:00:00Z',
  },
  {
    id: 'req-120',
    topic: 'Chương trình tri ân khách hàng thân thiết',
    platforms: ['FACEBOOK'],
    clientName: 'Grab Vietnam',
    deadline: '2026-09-07',
    status: 'SENT_TO_CLIENT',
    assignee: MOCK_CREATORS[3],
    createdAt: '2026-08-15T15:30:00Z',
  },
  {
    id: 'req-121',
    topic: 'Video Unboxing bàn phím cơ không dây',
    platforms: ['YOUTUBE', 'TIKTOK'],
    clientName: 'Logitech Vietnam',
    deadline: '2026-09-12',
    status: 'PENDING_REVIEW',
    assignee: MOCK_CREATORS[0],
    createdAt: '2026-08-14T18:20:00Z',
  },

  {
    id: 'req-122',
    topic: 'Bài PR chiến dịch bảo vệ môi trường biển',
    platforms: ['FACEBOOK', 'THREADS'],
    clientName: 'WWF Vietnam',
    deadline: '2026-09-15',
    status: 'IN_PROGRESS',
    assignee: MOCK_CREATORS[1],
    createdAt: '2026-08-12T09:40:00Z',
  },
];

class MockContentRequestService {
  private requests: ContentRequest[] = [...INITIAL_REQUESTS];

  private async delay(ms: number = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getRequests(params: ContentRequestQueryParams): Promise<ContentRequestPaginatedResponse> {
    await this.delay(350);

    let filtered = [...this.requests];

    // Status filter
    if (params.status && params.status.length > 0) {
      filtered = filtered.filter((r) => params.status!.includes(r.status));
    }

    // Platform filter
    if (params.platform && params.platform.length > 0) {
      filtered = filtered.filter((r) =>
        r.platforms.some((p) => params.platform!.includes(p))
      );
    }

    // Search filter
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) => r.topic.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (params.startDate) {
      filtered = filtered.filter((r) => r.deadline >= params.startDate!);
    }
    if (params.endDate) {
      filtered = filtered.filter((r) => r.deadline <= params.endDate!);
    }

    // My tasks filter (user-1 is current creator mock)
    if (params.myTasksOnly) {
      filtered = filtered.filter((r) => r.assignee?.id === 'user-1');
    }

    const limit = params.limit || 20;
    const page = params.page || 1;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async assignRequest(requestId: string, assigneeId: string): Promise<ContentRequest> {
    await this.delay(400);
    const reqIndex = this.requests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) throw new Error('Request not found');

    const assignee = MOCK_CREATORS.find((c) => c.id === assigneeId);
    if (!assignee) throw new Error('Assignee not found');

    const updated: ContentRequest = {
      ...this.requests[reqIndex],
      assignee,
      status: 'ASSIGNED',
    };

    this.requests[reqIndex] = updated;
    return updated;
  }
}

export const mockContentRequestService = new MockContentRequestService();
