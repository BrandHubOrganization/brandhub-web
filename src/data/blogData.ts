import { BLOG_AUTHORS, type BlogAuthor } from "./blogAuthors";
import { BLOG_BATCH1_PART1_POSTS } from "./blogBatch1Part1";
import { BLOG_BATCH1_PART2_POSTS } from "./blogBatch1Part2";

export { BLOG_AUTHORS, type BlogAuthor };

export type BlogCategorySlug =
  | "agency-project-management"
  | "content-workflow-approval"
  | "media-package-campaign"
  | "ai-studio-graphrag-trends"
  | "multi-channel-publishing"
  | "tool-comparison-case-study";

export type CanonicalRole =
  | "Guest"
  | "Owner"
  | "Manager"
  | "Creator"
  | "Client"
  | "Admin";

export type SearchIntentType =
  | "Informational"
  | "Commercial"
  | "Transactional"
  | "Comparison";

export interface BlogCategory {
  slug: BlogCategorySlug;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
  pillarKeyword: string;
  relatedDomain: string;
  iconName: string;
  plannedCount: number;
  frRange: string;
}

export interface BlogComparisonTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface BlogInlineCta {
  badge: string;
  title: string;
  description: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
  featureHighlight: string;
}

export interface BlogSection {
  id: string;
  heading: string;
  paragraphs: string[];
  subheadings?: {
    title: string;
    body: string;
  }[];
  checklist?: string[];
  comparisonTable?: BlogComparisonTable;
  callout?: {
    label: string;
    text: string;
  };
  inlineCta?: BlogInlineCta;
}

export interface BlogPost {
  id: string;
  topicNumber: number;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: BlogCategorySlug;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntentType;
  targetRoles: CanonicalRole[];
  relatedFrCodes: string[];
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  author: BlogAuthor;
  coverImage: string;
  coverImageAlt: string;
  /** 130-170 words direct answer optimized for Google AI Overviews, ChatGPT Search & Perplexity (GEO) */
  geoSummary: string;
  keyTakeaways: string[];
  sections: BlogSection[];
  faqs: {
    question: string;
    answer: string;
  }[];
  primaryCta: BlogInlineCta;
  relatedSlugs: string[];
}

export interface PlannedBlogTopic {
  topicNumber: number;
  slug: string;
  title: string;
  category: BlogCategorySlug;
  primaryKeyword: string;
  searchIntent: SearchIntentType;
  targetRoles: CanonicalRole[];
  brandhubFeature: string;
  ctaTarget: string;
  priorityBatch: "Batch 1" | "Batch 2" | "Batch 3" | "Batch 4";
  isPublished: boolean;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    slug: "agency-project-management",
    name: "Quản trị Dự án & Workspace (Mô hình Jira / Notion cho Agency)",
    shortName: "Quản trị như Jira / Notion",
    description:
      "Phương pháp thiết lập không gian làm việc đa thương hiệu, phân rã task truyền thông theo Kanban/Sprint và phân quyền 6 vai trò chuẩn cho Agency.",
    badgeColor:
      "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
    pillarKeyword: "phần mềm quản lý dự án truyền thông agency",
    relatedDomain: "3.4 Agency & Workspace (26 FRs)",
    iconName: "Layers",
    plannedCount: 17,
    frRange: "FR-3.4.1 -> FR-3.4.26",
  },
  {
    slug: "content-workflow-approval",
    name: "Quy trình Sản xuất & Phê duyệt Nội dung Đa cấp",
    shortName: "Quy trình & Phê duyệt",
    description:
      "Chuẩn hóa luồng làm bài truyền thông từ Brief, soạn thảo, kiểm duyệt an toàn cộng đồng đến phê duyệt 3 cấp Creator -> Manager -> Client.",
    badgeColor:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    pillarKeyword: "quy trình làm bài truyền thông và duyệt content",
    relatedDomain: "3.6 Content & Workflow (35 FRs)",
    iconName: "ListChecks",
    plannedCount: 17,
    frRange: "FR-3.6.1 -> FR-3.6.35",
  },
  {
    slug: "media-package-campaign",
    name: "Gói Truyền thông (Media Package) & Chiến dịch Đa kênh",
    shortName: "Gói Truyền thông & Campaign",
    description:
      "Cấu trúc một gói truyền thông chuẩn B2B, cách lên báo giá proposal, đàm phán 2 chiều với Client và chuyển đổi thành Media Campaign.",
    badgeColor:
      "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    pillarKeyword: "gói truyền thông gồm những gì",
    relatedDomain: "3.5 Media Package & Media Campaign (13 FRs)",
    iconName: "Briefcase",
    plannedCount: 17,
    frRange: "FR-3.5.1 -> FR-3.5.13",
  },
  {
    slug: "ai-studio-graphrag-trends",
    name: "AI Marketing Studio, GraphRAG & Bắt Trend Thời gian thực",
    shortName: "AI Studio & GraphRAG",
    description:
      "Ứng dụng đồ thị tri thức Neo4j + ChromaDB để giữ chuẩn Brand Guidelines, tạo đại sứ ảo LoRA và bắt trend TikTok Creative Center & Google Trends.",
    badgeColor:
      "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    pillarKeyword: "AI viết content chuẩn brand guidelines",
    relatedDomain: "3.7 AI Features (19 FRs)",
    iconName: "Sparkles",
    plannedCount: 18,
    frRange: "FR-3.7.1 -> FR-3.7.19",
  },
  {
    slug: "multi-channel-publishing",
    name: "Xuất bản Đa nền tảng (Facebook, Instagram, TikTok, Threads)",
    shortName: "Xuất bản 4 Kênh MXH",
    description:
      "Kỹ thuật lập lịch đăng bài tự động, tối ưu định dạng từng nền tảng, bảo mật OAuth token AES-256 và đo lường hiệu suất thời gian thực.",
    badgeColor:
      "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    pillarKeyword: "phần mềm đăng bài tự động facebook instagram tiktok threads",
    relatedDomain: "3.8 Publishing & Social (15 FRs)",
    iconName: "Share2",
    plannedCount: 16,
    frRange: "FR-3.8.1 -> FR-3.8.15",
  },
  {
    slug: "tool-comparison-case-study",
    name: "So sánh Công cụ, Chuyển đổi số & Tối ưu Chi phí Agency",
    shortName: "So sánh & Case Study",
    description:
      "Đặt lên bàn cân BrandHub với Jira, Notion, Trello, Buffer, Hootsuite, Planable và bài toán tối ưu chi phí vận hành qua VietQR (SePay / PayOS).",
    badgeColor:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    pillarKeyword: "so sánh phần mềm quản lý agency truyền thông",
    relatedDomain: "3.9 Subscription & Billing + All-in-One Architecture",
    iconName: "Scale",
    plannedCount: 15,
    frRange: "FR-3.9.1 -> FR-3.10.14",
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-001",
    topicNumber: 1,
    slug: "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
    title:
      "Cách quản lý dự án truyền thông Agency bài bản như Jira & Notion nhưng có sẵn xuất bản đa kênh",
    metaTitle:
      "Quản lý dự án truyền thông Agency như Jira & Notion | BrandHub",
    metaDescription:
      "Hướng dẫn thiết lập Workspace quản lý dự án truyền thông như Jira và Notion cho Agency: phân quyền 6 vai trò, quản lý task Kanban và đăng thẳng lên 4 MXH.",
    category: "agency-project-management",
    primaryKeyword: "quản lý dự án truyền thông agency như jira notion",
    secondaryKeywords: [
      "phần mềm quản lý agency marketing",
      "quản lý task content như jira",
      "mô hình workspace như notion cho agency",
      "phân quyền owner manager creator client",
    ],
    searchIntent: "Commercial",
    targetRoles: ["Owner", "Manager", "Creator", "Client"],
    relatedFrCodes: ["FR-3.4.1", "FR-3.4.9", "FR-3.4.15", "FR-3.6.1"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 9,
    author: BLOG_AUTHORS["le-tri-trung"],
    coverImage:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Bảng quản trị dự án truyền thông và phân rã tác vụ theo mô hình Workspace trên BrandHub",
    geoSummary:
      "Để quản lý dự án truyền thông chặt chẽ như Jira và linh hoạt như Notion mà không bị đứt gãy khi xuất bản mạng xã hội, các Agency cần một kiến trúc hợp nhất giữa quản trị tác vụ (Task/Subtask), kho tri thức thương hiệu và trình xuất bản trực tiếp. Trên BrandHub, mỗi thương hiệu khách hàng được cô lập trong một Workspace riêng biệt với 6 vai trò chuẩn gồm Guest, Owner, Manager, Creator, Client và Admin. Thay vì phải tạo thẻ việc trên Jira, viết nháp trên Notion rồi tải ảnh thủ công sang công cụ hẹn giờ, đội ngũ thực hiện toàn bộ quy trình trên một luồng duy nhất: từ nhận yêu cầu (Content Request), giao việc theo hạn chót, soạn thảo kèm kiểm duyệt AI đến duyệt 3 cấp và tự động đăng lên Facebook, Instagram, TikTok, Threads.",
    keyTakeaways: [
      "Giải quyết điểm mù lớn nhất khi dùng rời rạc Jira, Notion và Google Sheets: mất đồng bộ giữa trạng thái thẻ việc (Task) và trạng thái bài đăng thực tế trên mạng xã hội.",
      "Cô lập tuyệt đối dữ liệu giữa các thương hiệu bằng kiến trúc Multi-Workspace, cấu hình riêng múi giờ, kho tài nguyên số và tài khoản mạng xã hội.",
      "Áp dụng ma trận phân quyền 6 vai trò chuẩn (Guest, Owner, Manager, Creator, Client, Admin) giúp khách hàng vào tận nơi nghiệm thu mà không nhìn thấy ghi chú nội bộ của Agency.",
      "Tăng tốc khởi tạo dự án mới trong 30 giây nhờ thư viện Workspace Template chuẩn hóa theo từng ngành hàng.",
    ],
    sections: [
      {
        id: "tai-sao-jira-notion-roi-rac-gay-nghen-agency",
        heading:
          "Tại sao ghép nối Jira, Notion và bảng tính lại gây nghẽn cổ chai ở các Agency truyền thông?",
        paragraphs: [
          "Hầu hết các đội ngũ truyền thông đều bắt đầu theo cùng một kịch bản quen thuộc. Họ dùng Notion để lưu Brand Guidelines và lịch biên tập, rồi mở thêm Jira hoặc Trello để chia thẻ công việc cho đội thiết kế và biên tập viên. Ở quy mô 1 đến 2 dự án nhỏ, cách ghép nối này chạy khá ổn. Nhưng khi Agency tăng tốc lên 10 hay 30 thương hiệu khách hàng cùng lúc, sự phân mảnh dữ liệu bắt đầu ngốn sạch hàng chục giờ làm việc mỗi tuần.",
          "Lý do thực ra rất dễ hiểu. Bản chất Jira và Notion sinh ra để quản lý phần mềm hoặc lưu trữ tài liệu tổng quát, chứ không hề hiểu ngữ cảnh của một bài đăng mạng xã hội. Một thẻ việc trên Jira đâu biết khung hình 9:16 của TikTok khác khung 4:5 của Instagram chỗ nào? Nó cũng chẳng thể báo cho bạn biết OAuth token của Fanpage vừa hết hạn lúc nửa đêm, càng không biết tự động khóa bản nháp khi bài viết đang nằm chờ khách hàng phê duyệt.",
        ],
        comparisonTable: {
          caption:
            "Đối chiếu mô hình quản lý kết hợp Jira + Notion truyền thống và kiến trúc Workspace hợp nhất trên BrandHub",
          headers: [
            "Hạng mục vận hành",
            "Dùng rời rạc Jira + Notion + Sheets",
            "Kiến trúc hợp nhất trên BrandHub",
          ],
          rows: [
            [
              "Khởi tạo không gian dự án mới",
              "Copy thủ công từng bảng, cấp quyền lại từ đầu (30-45 phút)",
              "Chọn Workspace Template dựng sẵn cấu trúc (30 giây)",
            ],
            [
              "Phân quyền khách hàng nghiệm thu",
              "Dễ lộ comment nội bộ hoặc phải xuất file gửi qua chat",
              "Vai trò Client chuyên biệt, chỉ xem và duyệt đúng bản trình",
            ],
            [
              "Liên kết từ Task sang bài đăng MXH",
              "Copy-paste chữ và tải ảnh thủ công sang trình đăng bài",
              "Task gắn liền trình soạn thảo, duyệt xong tự động lên lịch đăng",
            ],
            [
              "Kiểm soát chuẩn giọng văn thương hiệu",
              "Đọc lại tài liệu PDF/Notion bằng mắt thường",
              "AI GraphRAG (Neo4j + ChromaDB) đối chiếu tự động",
            ],
          ],
        },
      },
      {
        id: "kien-truc-da-workspace-va-6-vai-tro-chuan",
        heading:
          "Cách thiết lập kiến trúc đa Workspace và phân quyền 6 vai trò chuẩn trên BrandHub",
        paragraphs: [
          "Làm sao để vừa giữ được kỷ luật thép của Jira, vừa có không gian viết bài thoáng đãng như Notion? Câu trả lời nằm ở cách phân tầng từ cấp Tổ chức (Agency) xuống từng Không gian làm việc (Workspace). Trên BrandHub, mỗi Workspace đại diện cho một thương hiệu độc lập. Mỗi không gian như vậy có múi giờ riêng (chẳng hạn Asia/Ho_Chi_Minh), kho tài nguyên số riêng và bộ kết nối mạng xã hội hoàn toàn tách biệt.",
          "Mọi thao tác bên trong đều xoay quanh 6 vai trò chuẩn gồm Guest, Owner, Manager, Creator, Client và Admin. Không ai giẫm chân lên việc của ai. Nhân sự vừa đăng nhập vào là thấy ngay đúng phần việc mình cần xử lý trong ngày.",
        ],
        subheadings: [
          {
            title: "1. Owner và Manager: Kiến trúc sư vận hành chiến dịch",
            body: "Owner nắm quyền quản trị cao nhất của Agency, quản lý gói đăng ký (Subscription), phân bổ hạn mức AI Credits và khởi tạo các Workspace. Trong từng Workspace, Manager đóng vai trò điều phối trực tiếp: lập kế hoạch Media Campaign, phân rã các gói dịch vụ thành danh sách Task/Subtask, gán hạn chót và kiểm duyệt chất lượng nội bộ trước khi gửi cho khách hàng.",
          },
          {
            title: "2. Creator: Không gian sáng tạo tập trung không xao nhãng",
            body: "Creator nhận các Task được giao trực tiếp trên bảng công việc, mở trình soạn thảo tích hợp AI Studio để viết caption, tạo hình ảnh hoặc video từ đại sứ ảo và đính kèm ấn phẩm. Khi Creator nhấn gửi duyệt, hệ thống tự động khóa trạng thái chỉnh sửa để bảo toàn phiên bản đang trình.",
          },
          {
            title: "3. Client và Guest: Nghiệm thu minh bạch, không cần đào tạo công cụ phức tạp",
            body: "Đối tác thương hiệu khi chưa có tài khoản có thể xem báo giá gói truyền thông với tư cách Guest qua liên kết chia sẻ bảo mật. Khi chiến dịch bắt đầu, đại diện thương hiệu tham gia Workspace dưới vai trò Client để xem bản mô phỏng bài đăng (Preview) giống hệt giao diện thật trên Facebook, Instagram, TikTok, Threads và bấm Phê duyệt hoặc Yêu cầu chỉnh sửa kèm ghi chú cụ thể.",
          },
        ],
        inlineCta: {
          badge: "KHỞI TẠO WORKSPACE CHUẨN AGENCY",
          title: "Trải nghiệm mô hình quản trị dự án truyền thông All-in-One",
          description:
            "Tạo miễn phí Workspace đầu tiên với đầy đủ bảng quản lý Task, phân quyền 6 vai trò và lịch xuất bản 4 nền tảng mạng xã hội.",
          primaryText: "Đăng ký Workspace miễn phí",
          primaryHref: "/register",
          secondaryText: "Đăng nhập hệ thống",
          secondaryHref: "/login",
          featureHighlight: "Miễn phí gói Starter · Hỗ trợ 5 thành viên",
        },
      },
      {
        id: "phan-ra-task-truyen-thong-va-lien-ket-lich-xuat-ban",
        heading:
          "Quy trình 5 bước phân rã Task truyền thông từ Brief đến lịch xuất bản tự động",
        paragraphs: [
          "Điểm ăn tiền nhất khi quản lý việc trên BrandHub là mỗi Task đều mang thuộc tính truyền thông gốc. Bạn không cần tự tạo các trường tùy chỉnh rườm rà nữa. Bài nào đăng kênh nào, mấy giờ lên sóng đều hiển thị ngay trên thẻ việc.",
        ],
        checklist: [
          "Bước 1: Tiếp nhận yêu cầu qua cổng Content Request hoặc chuyển thẳng từ Gói truyền thông đã chốt. Mọi dữ liệu đầu vào đều tập trung một chỗ.",
          "Bước 2: Manager chia chiến dịch thành từng Task bài đăng, ấn phẩm hoặc khảo sát khách hàng (Survey). Ai làm việc gì, hạn chót ngày nào đều hiện rõ.",
          "Bước 3: Creator viết bài trong Docs/Post Editor, bật AI GraphRAG kiểm tra giọng văn và chạy Check Compliance Content để lọc từ nhạy cảm.",
          "Bước 4: Chạy luồng duyệt 3 cấp (Creator gửi -> Manager duyệt nội bộ -> Client chốt). Lịch sử phiên bản được lưu vết tự động.",
          "Bước 5: Client vừa bấm duyệt là bài viết vào thẳng hàng đợi của Publisher Service để tự động đăng lên Facebook, Instagram, TikTok và Threads.",
        ],
        callout: {
          label: "Kinh nghiệm vận hành thực tế",
          text: "Khi quản lý trên 50 bài đăng mỗi tuần, hãy tận dụng tính năng lọc Task theo trạng thái phê duyệt và nền tảng mục tiêu. Điều này giúp Manager phát hiện ngay các bài sắp đến giờ lên sóng nhưng vẫn kẹt ở bước chờ Client phản hồi.",
        },
      },
    ],
    faqs: [
      {
        question:
          "Tôi đang dùng Notion và Jira thì chuyển sang BrandHub có mất nhiều thời gian làm quen không?",
        answer:
          "Không mất nhiều thời gian. BrandHub cung cấp sẵn các Workspace Template được thiết kế riêng cho quy trình Agency truyền thông và cho phép soạn thảo ở chế độ Docs quen thuộc như Notion, đồng thời giữ nguyên cấu trúc giao việc, hạn chót và trạng thái rõ ràng như Jira.",
      },
      {
        question:
          "Khách hàng (Client) vào Workspace có nhìn thấy các công việc nội bộ đang làm dở của Agency không?",
        answer:
          "Không. Hệ thống áp dụng cơ chế kiểm soát truy cập theo vai trò (RBAC). Chỉ khi Manager đã duyệt nội bộ và chuyển trạng thái bài viết sang trình duyệt khách hàng, Client mới nhận thông báo và xem bản trình hoàn chỉnh.",
      },
    ],
    primaryCta: {
      badge: "CHUYỂN ĐỔI SỐ QUY TRÌNH AGENCY",
      title: "Thay thế sự rời rạc của Sheets, Chat và các tool lẻ tẻ ngay hôm nay",
      description:
        "Khởi tạo không gian làm việc chuẩn hóa cho đội ngũ sáng tạo và khách hàng của bạn chỉ trong vài phút.",
      primaryText: "Tạo tài khoản miễn phí ngay",
      primaryHref: "/register",
      secondaryText: "Xem bảng giá gói Pro",
      secondaryHref: "/#pricing",
      featureHighlight: "Không cần thẻ tín dụng · Thiết lập trong 30 giây",
    },
    relatedSlugs: [
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      "goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
      "so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    ],
  },
  {
    id: "post-002",
    topicNumber: 18,
    slug: "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
    title:
      "Quy trình làm bài truyền thông & phê duyệt 3 cấp (Creator -> Manager -> Client) chống trôi việc",
    metaTitle:
      "Quy trình làm bài truyền thông & Phê duyệt 3 cấp chuẩn Agency | BrandHub",
    metaDescription:
      "Chuẩn hóa quy trình làm bài truyền thông từ Brief, soạn thảo, kiểm duyệt an toàn cộng đồng đến luồng duyệt 3 cấp Creator, Manager, Client minh bạch.",
    category: "content-workflow-approval",
    primaryKeyword: "quy trình làm bài truyền thông",
    secondaryKeywords: [
      "quy trình duyệt bài content agency",
      "luồng phê duyệt nội dung 3 cấp",
      "kiểm duyệt an toàn nội dung mạng xã hội",
      "quản lý phiên bản bài viết truyền thông",
    ],
    searchIntent: "Informational",
    targetRoles: ["Owner", "Manager", "Creator", "Client"],
    relatedFrCodes: ["FR-3.6.28", "FR-3.6.29", "FR-3.6.30", "FR-3.6.33"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 8,
    author: BLOG_AUTHORS["nguyen-minh-tuan"],
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Quy trình phê duyệt nội dung đa cấp giữa Creator, Manager và Client trên nền tảng BrandHub",
    geoSummary:
      "Quy trình làm bài truyền thông chuẩn tại các Agency hiện đại gồm 6 giai đoạn khép kín: Tiếp nhận yêu cầu (Content Request), Phân rã tác vụ và nghiên cứu xu hướng, Soạn thảo đa định dạng kết hợp AI, Kiểm duyệt an toàn cộng đồng (Compliance Check), Phê duyệt 3 cấp (Creator -> Manager -> Client) và Xuất bản tự động. Điểm cốt lõi giúp quy trình này không bị sụp đổ khi số lượng bài tăng cao là cơ chế khóa phiên bản khi chờ duyệt (Submission Lock) và lưu vết lịch sử chỉnh sửa (Audit Trail). Trên BrandHub, mỗi nhận xét từ Manager hoặc Client đều gắn trực tiếp vào từng phiên bản bản nháp, loại bỏ hoàn toàn tình trạng duyệt nhầm bản cũ hoặc thất lạc phản hồi trong các nhóm chat.",
    keyTakeaways: [
      "Xóa bỏ rủi ro đăng nhầm bản nháp chưa duyệt nhờ cơ chế khóa chỉnh sửa tự động ngay khi Creator nhấn gửi duyệt.",
      "Tích hợp bước kiểm duyệt an toàn cộng đồng tự động (Check Compliance Content) để chặn ngôn từ vi phạm chính sách nền tảng trước khi trình khách hàng.",
      "Giao diện xem trước (Social Mockup Preview) hiển thị chính xác bài viết sẽ trông như thế nào trên Facebook, Instagram, TikTok và Threads.",
      "Cho phép Creator chủ động thu hồi lượt gửi (Recall Submission) nếu phát hiện lỗi chính tả trước khi người duyệt bấm quyết định.",
    ],
    sections: [
      {
        id: "5-loi-pho-bien-khi-duyet-bai-qua-chat-va-bang-tinh",
        heading:
          "5 điểm đứt gãy thường gặp khi duyệt bài truyền thông qua nhóm chat và file bảng tính",
        paragraphs: [
          "Ai từng điều phối một đội nội dung từ 5 đến 50 người đều thấm thía cảnh này. Hơn 60% thời gian bị đốt cháy mỗi tuần không nằm ở lúc viết bài hay dựng ảnh. Nó nằm ở khâu chờ duyệt và sửa đi sửa lại theo những dòng tin nhắn đứt quãng. Khi bạn gửi một đường link văn bản kèm vài tấm ảnh rời qua nhóm chat, khách hàng rất khó hình dung bài đăng thực tế khi lên sóng sẽ trông ra sao.",
          "Mọi chuyện còn rối hơn khi có ba bốn người cùng nhảy vào góp ý trong một luồng chat dài. Tin nhắn sau đè lên tin nhắn trước. Creator rất dễ sót ý hoặc vô tình sửa nhầm vào bản nháp cũ. Đến khi bài đăng chính thức trên Fanpage gặp sự cố, không ai truy lại được người nào đã chốt phiên bản đó vào lúc mấy giờ.",
        ],
      },
      {
        id: "luong-duyet-3-cap-creator-manager-client-hoat-dong-ra-sao",
        heading:
          "Cơ chế hoạt động của luồng phê duyệt 3 cấp: Creator -> Manager -> Client",
        paragraphs: [
          "Muốn dứt điểm tình trạng tam sao thất bản, quy trình duyệt phải được đóng khung thành 3 chốt chặn rõ ràng. Mỗi vai trò giữ một nút bấm quyết định.",
        ],
        subheadings: [
          {
            title: "Cấp 1: Creator hoàn thiện bản nháp và chạy kiểm duyệt Compliance",
            body: "Creator viết bài, chọn nhóm hashtag và đính kèm ảnh hoặc video ngay trong trình soạn thảo. Trước khi nộp, Creator bấm chạy Check Compliance Content. Công cụ này sẽ quét toàn bộ văn bản để bắt các từ nhạy cảm, bạo lực hoặc vi phạm tiêu chuẩn cộng đồng. Khi mọi thứ đã sạch lỗi, Creator mới nhấn nút Gửi duyệt.",
          },
          {
            title: "Cấp 2: Manager rà soát chất lượng nội bộ (Internal QA)",
            body: "Ngay giây phút bấm gửi, bản nháp tự động khóa lại và chuyển sang bàn làm việc của Manager. Manager sẽ soi bài viết dựa trên mục tiêu của Media Campaign và bộ quy chuẩn thương hiệu. Chưa ổn thì bấm Từ chối kèm ghi chú rõ lý do. Đạt chuẩn rồi thì bấm duyệt nội bộ để đẩy bài sang cổng nghiệm thu của khách hàng.",
          },
          {
            title: "Cấp 3: Client nghiệm thu trên bản xem trước trực quan",
            body: "Client không cần đọc file chữ khô khan nữa. Họ mở trực tiếp khung mô phỏng giao diện của cả 4 kênh Facebook, Instagram, TikTok và Threads. Thấy ưng ý, Client chỉ cần bấm Phê duyệt. Hệ thống lập tức ghi lại dấu thời gian, tên người duyệt và đẩy bài vào lịch xuất bản tự động.",
          },
        ],
        inlineCta: {
          badge: "CHUẨN HÓA LUỒNG PHÊ DUYỆT",
          title: "Trải nghiệm quy trình duyệt bài 3 cấp có lưu vết lịch sử phiên bản",
          description:
            "Chấm dứt cảnh trôi feedback trong nhóm chat. Mời đội ngũ và khách hàng vào duyệt bài trực quan trên BrandHub.",
          primaryText: "Dùng thử quy trình duyệt bài",
          primaryHref: "/register",
          secondaryText: "Xem hướng dẫn chi tiết",
          secondaryHref: "/help/faq",
          featureHighlight: "Tích hợp khóa bản nháp & kiểm duyệt AI tự động",
        },
      },
      {
        id: "quan-ly-lich-su-phien-ban-va-kiem-duyet-an-toan",
        heading:
          "Quản lý lịch sử phiên bản (Version History) và bảo vệ an toàn thương hiệu",
        paragraphs: [
          "Mỗi lần bài viết được gửi đi, trả về hay chỉnh sửa, hệ thống đều chụp lại một bản lưu (Snapshot) độc lập. Không một dòng góp ý nào bị thất lạc. Manager và Client chỉ cần mở thanh lịch sử phiên bản là đối chiếu được ngay bản mới đã sửa đúng yêu cầu ở vòng trước hay chưa.",
          "Ở tầng quản trị cao nhất, vai trò Admin còn nắm trong tay hàng đợi Content Moderation Queue. Những nội dung bị gắn cờ rủi ro cao sẽ được chặn lại tại đây để rà soát lần cuối, giữ an toàn tuyệt đối cho tài khoản truyền thông của doanh nghiệp.",
        ],
        checklist: [
          "Kiểm tra độ dài ký tự và số lượng hashtag theo ngưỡng chuẩn của từng nền tảng (Facebook, Instagram, TikTok, Threads).",
          "Quét tự động rủi ro ngôn từ cộng đồng trước khi gửi duyệt.",
          "Khóa quyền sửa bài trong suốt thời gian chờ Manager hoặc Client ra quyết định.",
          "Lưu trữ toàn bộ lịch sử nhận xét theo từng vòng duyệt để làm căn cứ nghiệm thu cuối tháng.",
        ],
      },
    ],
    faqs: [
      {
        question:
          "Nếu Creator lỡ bấm gửi duyệt nhưng phát hiện sai lỗi chính tả thì xử lý thế nào?",
        answer:
          "Khi Manager hoặc Client chưa bấm ra quyết định duyệt, Creator có thể nhấn nút Thu hồi lượt gửi (Recall) để mở khóa lại trình soạn thảo, sửa lỗi và gửi duyệt lại ngay lập tức.",
      },
      {
        question:
          "Hệ thống có kiểm tra đạo văn hay bản quyền hình ảnh không?",
        answer:
          "Hệ thống tập trung vào kiểm duyệt tuân thủ an toàn nội dung cộng đồng (Check Compliance Content cho ngôn từ nhạy cảm, quy chuẩn an toàn thương hiệu) và đối chiếu giọng văn Brand Guidelines qua AI GraphRAG.",
      },
    ],
    primaryCta: {
      badge: "NÂNG CẤP HIỆU SUẤT ĐỘI NGŨ CONTENT",
      title: "Rút ngắn 70% thời gian chờ duyệt bài giữa Agency và Khách hàng",
      description:
        "Thiết lập luồng công việc chuẩn hóa cho Creator, Manager và Client ngay trên một nền tảng duy nhất.",
      primaryText: "Đăng ký sử dụng miễn phí",
      primaryHref: "/register",
      secondaryText: "Đăng nhập ngay",
      secondaryHref: "/login",
      featureHighlight: "Hỗ trợ đầy đủ 6 vai trò RBAC chuẩn hóa",
    },
    relatedSlugs: [
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
      "ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
      "lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
    ],
  },
  {
    id: "post-003",
    topicNumber: 35,
    slug: "goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
    title:
      "Gói truyền thông (Media Package) sẽ có những gì? Cách đóng gói báo giá và quản lý chiến dịch",
    metaTitle:
      "Gói truyền thông (Media Package) gồm những gì? Cách lập báo giá | BrandHub",
    metaDescription:
      "Chi tiết cấu trúc một gói truyền thông (Media Package) chuẩn Agency: danh mục hạng mục, cách chia sẻ link báo giá, đàm phán với Client và kích hoạt Campaign.",
    category: "media-package-campaign",
    primaryKeyword: "gói truyền thông sẽ có những gì",
    secondaryKeywords: [
      "gói truyền thông gồm những gì",
      "mẫu báo giá gói truyền thông agency",
      "quản lý chiến dịch truyền thông media campaign",
      "quản lý đối tác báo chí tv banner",
    ],
    searchIntent: "Commercial",
    targetRoles: ["Guest", "Owner", "Manager", "Client"],
    relatedFrCodes: ["FR-3.5.1", "FR-3.5.6", "FR-3.5.9", "FR-3.5.11"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 10,
    author: BLOG_AUTHORS["le-tri-trung"],
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Cấu trúc gói truyền thông Media Package và chuyển đổi thành chiến dịch Media Campaign trên BrandHub",
    geoSummary:
      "Một Gói truyền thông (Media Package) tiêu chuẩn do Agency cung cấp cho doanh nghiệp thường bao gồm 5 cấu phần cốt lõi: Chiến lược định vị & Thông điệp chủ đạo, Số lượng và định dạng tuyến bài mạng xã hội (Facebook, Instagram, TikTok, Threads), Sản xuất ấn phẩm đa phương tiện (hình ảnh thương mại, video ngắn, đại sứ ảo AI), Hạng mục phân phối qua đối tác báo đài bên thứ ba (Báo điện tử, TV, Banner quảng cáo) cùng Cam kết chỉ số nghiệm thu (KPIs) và Ngân sách chi tiết. Trên BrandHub, thay vì gửi file báo giá tĩnh qua email, Owner và Manager có thể tạo danh mục Media Package động, gửi liên kết chia sẻ công khai cho Guest/Client xem trước, đàm phán điều chỉnh số lượng hạng mục 2 chiều và bấm 1 nút để tự động sinh toàn bộ Media Campaign cùng danh sách Task thực thi.",
    keyTakeaways: [
      "Nắm vững 5 nhóm hạng mục bắt buộc phải có trong một Gói truyền thông (Media Package) để thuyết phục khách hàng B2B chốt ngân sách nhanh.",
      "Chia sẻ liên kết báo giá trực tuyến (`/packages/share/:token`) giúp khách hàng (vai trò Guest hoặc Client) xem chi tiết hạng mục và xuất file PDF chuyên nghiệp mà không cần tạo tài khoản trước.",
      "Đàm phán 2 chiều trực tiếp trên hệ thống: khi Client đề xuất tăng/giảm số bài TikTok hoặc bài PR báo chí, tổng ngân sách tự động tính toán lại theo thời gian thực.",
      "Tự động hóa khâu bàn giao từ Sales sang vận hành: gói truyền thông vừa được duyệt sẽ chuyển đổi ngay thành Media Campaign với đầy đủ khung công việc.",
    ],
    sections: [
      {
        id: "5-thanh-phan-cot-loi-trong-mot-goi-truyen-thong-chuan",
        heading:
          "Một gói truyền thông (Media Package) chuyên nghiệp sẽ có những gì?",
        paragraphs: [
          "Khi doanh nghiệp đi tìm Agency đồng hành, câu hỏi đầu tiên của họ rất thực tế: Bỏ ra ngần ấy ngân sách thì nhận về chính xác những đầu việc gì? Một bản báo giá chỉ ghi chung chung vài dòng kiểu 'chăm sóc fanpage trọn gói' rất khó thuyết phục được các chủ doanh nghiệp kỹ tính. Thậm chí nó còn là mầm mống gây tranh cãi khi nghiệm thu cuối tháng.",
          "Muốn chốt hợp đồng nhanh, gói truyền thông phải bóc tách rõ từng hạng mục định lượng. Khách nhìn vào là hiểu ngay tiền của họ đi đâu.",
        ],
        subheadings: [
          {
            title: "1. Hạng mục sản xuất và xuất bản nội dung mạng xã hội (4 kênh trọng tâm)",
            body: "Ghi rõ số lượng bài viết tiêu chuẩn, bộ ảnh carousel và các video ngắn phân bổ trên Facebook, Instagram, TikTok và Threads. Tần suất lên bài mỗi tuần cũng phải chốt cụ thể ngay từ đầu.",
          },
          {
            title: "2. Hạng mục ứng dụng AI Studio và sản xuất Media",
            body: "Bao gồm việc nạp tài liệu Brand Guidelines vào kho tri thức GraphRAG, dựng hình ảnh sản phẩm thương mại, tạo đại sứ thương hiệu ảo (Virtual Ambassador) và sản xuất video ngắn bắt sóng xu hướng.",
          },
          {
            title: "3. Hạng mục Booking đối tác truyền thông bên thứ ba (Báo chí, TV, Banner)",
            body: "Với những chiến dịch mở bán quy mô lớn, chỉ chạy mạng xã hội thôi là chưa đủ. Gói truyền thông sẽ cộng thêm danh sách các đầu báo điện tử (Newspaper), khung giờ phát sóng truyền hình (TV) hoặc vị trí đặt bảng quảng cáo (Banner) kèm đơn giá minh bạch.",
          },
          {
            title: "4. Hạng mục khảo sát thị trường và báo cáo phân tích (Survey & Analytics)",
            body: "Đính kèm các biểu mẫu khảo sát lấy ý kiến người tiêu dùng (Public Survey) và bảng đo lường chỉ số tương tác thực tế theo từng tuần.",
          },
        ],
        comparisonTable: {
          caption:
            "Cấu trúc tham khảo 3 cấp độ Gói truyền thông (Media Package) phổ biến cho doanh nghiệp",
          headers: [
            "Thành phần trong gói",
            "Gói Khởi Động (Brand Starter)",
            "Gói Tăng Trưởng (Growth Retainer)",
            "Gói Toàn Diện (Integrated Campaign)",
          ],
          rows: [
            [
              "Tuyến bài mạng xã hội",
              "12 bài/tháng (Facebook + Instagram)",
              "25 bài/tháng (FB + IG + TikTok + Threads)",
              "45+ bài/tháng đa định dạng trên 4 kênh",
            ],
            [
              "Sản xuất AI & Media",
              "Chuẩn hóa Brand Voice GraphRAG",
              "GraphRAG + 1 Đại sứ ảo AI + 8 AI Video",
              "Full AI Studio + 20 Video + Khảo sát khách hàng",
            ],
            [
              "Đối tác Báo đài (PR/TV/Banner)",
              "Tùy chọn bổ sung theo nhu cầu",
              "2-3 bài PR báo điện tử chuyên ngành",
              "Tích hợp chuỗi bài Báo chí + TV + Banner",
            ],
            [
              "Luồng duyệt & Nghiệm thu",
              "Workspace riêng + Duyệt 3 cấp",
              "Workspace riêng + Báo cáo tuần tự động",
              "Quản trị đa chiến dịch + Dashboard thời gian thực",
            ],
          ],
        },
      },
      {
        id: "quy-trinh-dam-phan-2-chieu-va-chuyen-doi-thanh-media-campaign",
        heading:
          "Từ báo giá Media Package đến kích hoạt chiến dịch (Media Campaign) chỉ trong 1 cú nhấp chuột",
        paragraphs: [
          "Hãy nhìn lại cách làm truyền thống. Bạn gửi file báo giá qua email, rồi hai bên quần thảo qua lại 4 đến 5 bản sửa bảng tính. Đến khi khách hàng gật đầu chốt gói, Manager lại phải mở hợp đồng ra đọc từng dòng để gõ tay từng đầu việc vào bảng quản lý task. Khâu nhập liệu thủ công này vừa tốn cả buổi chiều vừa rất dễ sót hạng mục đã hứa với khách.",
          "Trên BrandHub, luồng báo giá Media Package nối thẳng trực tiếp sang Media Campaign. Không cần nhập tay lại bất kỳ dòng nào.",
        ],
        checklist: [
          "Tạo thư viện Gói truyền thông mẫu ở cấp Agency hoặc tạo gói riêng theo từng Workspace. Thao tác chỉ mất vài phút.",
          "Xuất liên kết chia sẻ bảo mật gửi cho Guest xem trực tiếp trên trình duyệt hoặc tải bản PDF.",
          "Client gửi đề xuất tăng giảm số lượng bài ngay trên màn hình đàm phán. Tổng ngân sách tự nhảy lại tức thì.",
          "Khi gói được chốt, hệ thống tự động sinh Media Campaign kèm toàn bộ nhóm công việc tương ứng.",
          "Quản lý luôn danh bạ đối tác báo chí, truyền hình và vị trí đặt Banner ngay trong cùng chiến dịch.",
        ],
        inlineCta: {
          badge: "TỰ ĐỘNG HÓA BÁO GIÁ & CHIẾN DỊCH",
          title: "Xây dựng Catalog Gói truyền thông chuyên nghiệp cho Agency của bạn",
          description:
            "Tạo báo giá trực tuyến, gửi link chia sẻ cho khách hàng và tự động sinh toàn bộ Task chiến dịch ngay khi chốt deal.",
          primaryText: "Khởi tạo Media Package ngay",
          primaryHref: "/register",
          secondaryText: "Xem chi tiết tính năng trên trang chủ",
          secondaryHref: "/#media-package",
          featureHighlight: "Chia sẻ link báo giá không cần đăng nhập · Xuất PDF 1-click",
        },
      },
    ],
    faqs: [
      {
        question:
          "Khách hàng nhận link báo giá Gói truyền thông có bắt buộc phải đăng ký tài khoản mới xem được không?",
        answer:
          "Không bắt buộc. Với liên kết chia sẻ công khai bảo mật bằng token, người nhận ở vai trò Guest có thể mở xem toàn bộ cấu trúc gói, bảng giá chi tiết và tải PDF ngay trên điện thoại hoặc máy tính.",
      },
      {
        question:
          "Làm sao để quản lý các hạng mục đăng báo chí hoặc truyền hình không xuất bản qua API mạng xã hội?",
        answer:
          "BrandHub tích hợp phân hệ Quản lý Đối tác Chiến dịch (Campaign Partners) cho phép lưu trữ danh bạ báo điện tử, kênh TV và vị trí Banner, sử dụng AI để gợi ý đối tác phù hợp với ngân sách và theo dõi tiến độ nghiệm thu từng hạng mục.",
      },
    ],
    primaryCta: {
      badge: "TĂNG TỶ LỆ CHỐT DEAL B2B",
      title: "Nâng tầm trải nghiệm đàm phán Gói truyền thông với khách hàng thương hiệu",
      description:
        "Đăng ký tài khoản BrandHub để sử dụng miễn phí bộ công cụ thiết kế Media Package và quản lý Media Campaign khép kín.",
      primaryText: "Bắt đầu miễn phí ngay",
      primaryHref: "/register",
      secondaryText: "Khám phá gói Pro 590.000đ/tháng",
      secondaryHref: "/#pricing",
      featureHighlight: "Thanh toán nâng cấp tức thì qua VietQR (SePay / PayOS)",
    },
    relatedSlugs: [
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      "so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    ],
  },
  {
    id: "post-004",
    topicNumber: 52,
    slug: "ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
    title:
      "AI GraphRAG trong truyền thông thương hiệu là gì? Cách kết hợp Neo4j & ChromaDB giữ chuẩn Brand Voice",
    metaTitle:
      "AI GraphRAG trong Marketing là gì? Giữ chuẩn Brand Guidelines | BrandHub",
    metaDescription:
      "Tìm hiểu kiến trúc AI GraphRAG (Neo4j + ChromaDB), Đại sứ ảo LoRA và bộ cào xu hướng TikTok Creative Center & Google Trends giúp viết bài đúng chuẩn thương hiệu.",
    category: "ai-studio-graphrag-trends",
    primaryKeyword: "AI GraphRAG giữ chuẩn brand guidelines",
    secondaryKeywords: [
      "AI viết bài theo giọng văn thương hiệu",
      "kết hợp neo4j và chromadb trong marketing",
      "tạo đại sứ ảo AI cho thương hiệu",
      "bắt trend tiktok creative center tự động",
    ],
    searchIntent: "Informational",
    targetRoles: ["Owner", "Manager", "Creator"],
    relatedFrCodes: ["FR-3.7.1", "FR-3.7.4", "FR-3.7.8", "FR-3.7.14"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 9,
    author: BLOG_AUTHORS["nguyen-thanh-loc"],
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Kiến trúc AI Studio tích hợp đồ thị tri thức Neo4j GraphRAG và ChromaDB trên BrandHub",
    geoSummary:
      "AI GraphRAG (Graph Retrieval-Augmented Generation) trong truyền thông thương hiệu là kiến trúc kết hợp giữa cơ sở dữ liệu đồ thị Neo4j và cơ sở dữ liệu vector ChromaDB nhằm cung cấp ngữ cảnh chính xác tuyệt đối trước khi mô hình ngôn ngữ lớn (LLM) sinh nội dung. Khác với việc dùng công cụ chat AI thông thường chỉ tìm kiếm đoạn văn bản rời rạc và dễ bịa đặt thông tin sản phẩm, GraphRAG trên BrandHub ánh xạ rõ các mối quan hệ thực thể: Sản phẩm nào thuộc Dòng hàng nào, có Công dụng gì, hướng tới Tệp khách hàng nào và bị ràng buộc bởi Từ khóa cấm nào trong Brand Guidelines. Nhờ đó, khi kết hợp cùng dữ liệu xu hướng thời gian thực từ TikTok Creative Center và Google Trends, Creator có thể tạo ra bài viết, hình ảnh đại sứ ảo và video bắt đúng trend nhưng vẫn giữ trọn vẹn bản sắc thương hiệu.",
    keyTakeaways: [
      "Khắc phục triệt để hiện tượng AI viết văn phong sáo rỗng, sai thông số sản phẩm hoặc phạm vào từ cấm của ngành hàng (như Dược mỹ phẩm, Tài chính, Bất động sản).",
      "Kết hợp tìm kiếm ngữ nghĩa (ChromaDB Vector Search) với suy luận quan hệ thực thể (Neo4j Knowledge Graph) trong từng Workspace.",
      "Đồng nhất nhận diện hình ảnh xuyên suốt chiến dịch bằng công nghệ tạo Đại sứ ảo AI (Virtual Ambassador) và sinh video thương mại.",
      "Tự động hóa khâu săn xu hướng mỗi ngày nhờ hệ thống cào dữ liệu (Trend Crawler) từ TikTok Creative Center và Google Trends.",
    ],
    sections: [
      {
        id: "tai-sao-chatgpt-thong-thuong-khong-du-cho-agency-chuyen-nghiep",
        heading:
          "Tại sao các công cụ AI tổng quát thường thất bại khi viết bài cho thương hiệu lớn?",
        paragraphs: [
          "Ai từng dùng các công cụ chat AI phổ thông để viết bài cho nhãn hàng đều sớm nhận ra một điểm yếu chí mạng. Chỉ sau vài câu lệnh qua lại, AI bắt đầu quên sạch danh sách từ cấm của thương hiệu. Tệ hơn, nó còn tự bịa ra tính năng sản phẩm không có thật hoặc viết bằng một giọng văn sáo rỗng giống hệt hàng ngàn trang bán hàng khác.",
          "Vì sao lại có hiện tượng đó? Các hệ thống RAG đời cũ chỉ cắt nhỏ file PDF thành từng đoạn ngắn rồi tìm kiếm theo độ giống nhau của câu chữ. Khi gặp một yêu cầu cần móc nối nhiều tầng dữ liệu như 'Chính sách bảo hành mùa Tết', 'Dòng sản phẩm cao cấp A' và 'Cách xưng hô với khách VIP', cách tìm kiếm phẳng này lập tức bị hụt thông tin.",
        ],
      },
      {
        id: "kien-truc-graphrag-neo4j-va-chromadb-tren-brandhub",
        heading:
          "Cách BrandHub kết hợp Neo4j Knowledge Graph và ChromaDB trong AI Studio",
        paragraphs: [
          "Trên BrandHub, mỗi Workspace có một Kho tri thức thương hiệu (Knowledge Base) hoàn toàn biệt lập. Ngay khi Manager hoặc Creator tải tài liệu Brand Guidelines và thông tin sản phẩm lên, dịch vụ AI (`brandhub-ai-service`) lập tức kích hoạt song song hai luồng xử lý. Mọi thực thể đều được định danh rõ ràng.",
        ],
        subheadings: [
          {
            title: "1. Trích xuất thực thể và quan hệ vào Neo4j",
            body: "Hệ thống phân tích và xây dựng đồ thị kết nối giữa Thương hiệu, Sản phẩm, Tính năng, Đối tượng khách hàng, Giọng văn (Tone of Voice) và Quy tắc tuân thủ. Khi sinh bài viết mới, AI truy vấn đồ thị Neo4j để lấy đúng các ràng buộc bắt buộc.",
          },
          {
            title: "2. Vector hóa ngữ nghĩa vào ChromaDB",
            body: "Các đoạn văn mẫu, câu chuyện thương hiệu và cách diễn đạt đặc trưng được lưu trữ dưới dạng vector nhiều chiều trong ChromaDB, giúp AI học chính xác nhịp điệu câu chữ và cách dùng từ của riêng thương hiệu đó.",
          },
          {
            title: "3. Bắt nhịp xu hướng với AI Trend Crawler & Đại sứ ảo",
            body: "Mỗi ngày hệ thống tự động cào hơn 500 tín hiệu xu hướng từ TikTok Creative Center và Google Trends. Creator chỉ việc chọn một trào lưu đang lên. AI Studio sẽ gợi ý ngay cách lồng ghép thông điệp sản phẩm sao cho tự nhiên nhất, kèm theo công cụ tạo ảnh Đại sứ ảo và dựng video ngắn.",
          },
        ],
        inlineCta: {
          badge: "TRẢI NGHIỆM AI STUDIO GRAPHRAG",
          title: "Biến tài liệu Brand Guidelines tĩnh thành bộ não sáng tạo sống động",
          description:
            "Thử nghiệm ngay AI viết caption chuẩn giọng văn thương hiệu, tạo đại sứ ảo và bắt trend TikTok thời gian thực trên BrandHub.",
          primaryText: "Trải nghiệm AI Studio ngay",
          primaryHref: "/register",
          secondaryText: "Xem kiến trúc AI trên trang chủ",
          secondaryHref: "/#ai-features",
          featureHighlight: "Tặng sẵn AI Credits dùng thử khi đăng ký gói Starter",
        },
      },
    ],
    faqs: [
      {
        question:
          "Dữ liệu Brand Guidelines của thương hiệu A có bị lẫn sang thương hiệu B khi dùng AI không?",
        answer:
          "Tuyệt đối không. Kho tri thức Neo4j và ChromaDB được định danh và cô lập chặt chẽ theo từng `workspace_id`. Khi Creator làm việc trong Workspace nào, AI chỉ được phép truy xuất tri thức của đúng Workspace đó.",
      },
      {
        question:
          "Khi dùng hết hạn mức AI Credits hàng tháng thì tôi có thể mua thêm lẻ không?",
        answer:
          "Có. Owner có thể nạp thêm các gói AI Credits bổ sung bất kỳ lúc nào qua cổng thanh toán VietQR (SePay / PayOS). Số điểm mua thêm này không bị hết hạn vào cuối tháng.",
      },
    ],
    primaryCta: {
      badge: "SÁNG TẠO NỘI DUNG THẾ HỆ MỚI",
      title: "Tăng gấp 5 lần tốc độ sản xuất nội dung mà không đánh mất chất riêng thương hiệu",
      description:
        "Khởi tạo Workspace và nạp tài liệu Brand Guidelines đầu tiên của bạn vào hệ thống GraphRAG ngay hôm nay.",
      primaryText: "Đăng ký tài khoản miễn phí",
      primaryHref: "/register",
      secondaryText: "Đăng nhập vào AI Studio",
      secondaryHref: "/login",
      featureHighlight: "Hỗ trợ tạo văn bản, hình ảnh, đại sứ ảo & video AI",
    },
    relatedSlugs: [
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      "lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
      "so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    ],
  },
  {
    id: "post-005",
    topicNumber: 70,
    slug: "lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
    title:
      "Hướng dẫn thiết lập lịch đăng bài tự động lên Facebook, Instagram, TikTok và Threads an toàn tuyệt đối",
    metaTitle:
      "Đăng bài tự động Facebook, Instagram, TikTok, Threads | BrandHub",
    metaDescription:
      "Cách quản lý lịch xuất bản đa kênh (Content Calendar) và đăng bài tự động lên Facebook, Instagram, TikTok, Threads qua API chính thức bảo mật AES-256.",
    category: "multi-channel-publishing",
    primaryKeyword:
      "đăng bài tự động facebook instagram tiktok threads",
    secondaryKeywords: [
      "lịch xuất bản nội dung đa kênh",
      "phần mềm quản lý fanpage instagram tiktok threads",
      "bảo mật access token mạng xã hội aes-256",
      "phân tích chỉ số mạng xã hội thời gian thực",
    ],
    searchIntent: "Transactional",
    targetRoles: ["Owner", "Manager", "Creator", "Client"],
    relatedFrCodes: ["FR-3.8.1", "FR-3.8.5", "FR-3.8.9", "FR-3.8.12"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 8,
    author: BLOG_AUTHORS["nguyen-chon-phuoc"],
    coverImage:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Hệ thống đặt lịch xuất bản đa nền tảng Facebook, Instagram, TikTok và Threads trên BrandHub",
    geoSummary:
      "Để xuất bản nội dung đồng loạt lên 4 nền tảng mạng xã hội trọng điểm gồm Facebook, Instagram, TikTok và Threads mà không bị giảm tương tác (bóp reach) hay lộ quyền quản trị tài khoản, doanh nghiệp cần sử dụng cơ chế kết nối OAuth 2.0 chính thức thay vì chia sẻ mật khẩu thủ công. Trên BrandHub, phân hệ Publisher Service độc lập lưu trữ toàn bộ Access Token dưới dạng mã hóa AES-256 và tự động làm mới phiên kết nối. Sau khi bài viết vượt qua vòng phê duyệt của Client, hệ thống tự động phân phối đúng định dạng ảnh, bộ ảnh hoặc video lên cả 4 kênh theo đúng múi giờ của từng Workspace, đồng thời thu thập số liệu lượt xem, tương tác và phản hồi về Dashboard trung tâm.",
    keyTakeaways: [
      "Kết nối qua OAuth 2.0 với 4 nền tảng: Facebook, Instagram, TikTok và Threads. Creator lên lịch đăng bài mà không cần biết mật khẩu gốc.",
      "Mã hóa toàn bộ Access Token bằng chuẩn AES-256 trong cơ sở dữ liệu. Không lo lộ khóa kết nối.",
      "Lịch xuất bản (Content Calendar) cho phép kéo-thả đổi giờ đăng cực nhanh. Bạn lọc theo kênh hay trạng thái đều tiện.",
      "Có sẵn cơ chế tự động thử lại (Retry) và báo động ngay nếu API của mạng xã hội gặp sự cố.",
    ],
    sections: [
      {
        id: "rui-ro-khi-chia-se-mat-khau-va-dang-bai-thu-cong",
        heading:
          "Rủi ro bảo mật khi chia sẻ mật khẩu tài khoản mạng xã hội cho nhiều nhân sự",
        paragraphs: [
          "Ở rất nhiều doanh nghiệp và Agency hiện nay, việc cấp quyền đăng bài cho nhân sự mới vẫn diễn ra theo cách cực kỳ thủ công. Họ nhắn thẳng mật khẩu kênh TikTok, Instagram qua nhóm chat hoặc cấp quyền quản trị cao nhất cho hàng loạt tài khoản cá nhân. Đến khi nhân viên nghỉ việc hoặc cộng tác viên kết thúc hợp đồng, khâu thu hồi quyền truy cập trở thành cơn đau đầu thật sự. Nguy cơ mất kênh luôn rình rập.",
          "Chưa kể chuyện canh đúng khung giờ vàng lúc 8 giờ tối hay ngày cuối tuần để đăng tay từng bài lên 4 nền tảng cũng vắt kiệt sức đội ngũ vận hành. Chỉ một phút lơ đễnh khi chuyển tab trên điện thoại, nhân sự hoàn toàn có thể đăng nhầm ảnh của nhãn hàng A lên trang của nhãn hàng B.",
        ],
      },
      {
        id: "quy-trinh-xuat-ban-4-nen-tang-tren-brandhub",
        heading:
          "Kiến trúc xuất bản đa kênh tự động lên Facebook, Instagram, TikTok và Threads",
        paragraphs: [
          "Để xử lý hàng ngàn lệnh hẹn giờ cùng lúc mà không bị nghẽn, BrandHub tách riêng một dịch vụ vi mô chuyên trách việc xuất bản (`brandhub-publisher-service`). Mọi kết nối đều đi qua cổng chính thức.",
        ],
        checklist: [
          "Kết nối một lần duy nhất: Owner hoặc Manager liên kết Facebook, Instagram, TikTok và Threads vào Workspace qua OAuth chính thức.",
          "Soạn thảo và xem trước: Creator chọn đồng thời cả 4 kênh mục tiêu và kiểm tra bố cục ngay trên khung Preview.",
          "Hẹn giờ chuẩn xác: Hệ thống bám sát múi giờ của từng Workspace để tự động đẩy bài lên sóng đúng từng giây.",
          "Đo lường tức thì: Đăng xong có ngay link bài viết thực tế. Biểu đồ lượt xem, bình luận và chia sẻ cũng tự đổ về Post Dashboard.",
        ],
        inlineCta: {
          badge: "XUẤT BẢN ĐA KÊNH TỰ ĐỘNG",
          title: "Kết nối Facebook, Instagram, TikTok và Threads trong 1 không gian duy nhất",
          description:
            "Đặt lịch đăng bài cả tháng chỉ trong một buổi chiều và theo dõi hiệu suất tăng trưởng trực quan.",
          primaryText: "Liên kết kênh & đặt lịch ngay",
          primaryHref: "/register",
          secondaryText: "Tìm hiểu thêm về bảo mật",
          secondaryHref: "/privacy",
          featureHighlight: "Mã hóa Token AES-256 · Hỗ trợ 4 nền tảng chính thức",
        },
      },
    ],
    faqs: [
      {
        question:
          "Đăng bài tự động qua BrandHub có làm giảm lượt tiếp cận (reach) tự nhiên của bài viết không?",
        answer:
          "Không. BrandHub sử dụng hệ thống API xuất bản chính thức dành cho đối tác phát triển của Meta (Facebook, Instagram, Threads) và TikTok, do đó thuật toán phân phối ghi nhận bài đăng hoàn toàn tương đương với thao tác đăng trực tiếp trên ứng dụng gốc.",
      },
      {
        question:
          "Nếu một trong 4 kênh bị hết hạn phiên đăng nhập trước giờ lên sóng thì sao?",
        answer:
          "Trong trình soạn thảo và trang Quản lý tài khoản mạng xã hội, hệ thống luôn hiển thị đèn trạng thái kết nối thời gian thực. Nếu một kênh bị thu hồi quyền hoặc hết hạn token, hệ thống sẽ cảnh báo sớm để Manager nhấn kết nối lại chỉ với 1 cú nhấp chuột.",
      },
    ],
    primaryCta: {
      badge: "TỐI ƯU HÓA LỊCH XUẤT BẢN",
      title: "Giải phóng đội ngũ khỏi việc canh giờ đăng bài thủ công mỗi tối",
      description:
        "Trải nghiệm ngay Lịch nội dung (Content Calendar) và bộ xuất bản tự động 4 kênh trên BrandHub.",
      primaryText: "Tạo tài khoản miễn phí",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Báo cáo chỉ số tương tác thực tế sau xuất bản",
    },
    relatedSlugs: [
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      "so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    ],
  },
  {
    id: "post-006",
    topicNumber: 86,
    slug: "so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    title:
      "So sánh BrandHub với Buffer, Hootsuite, Planable và combo Jira + Notion cho Agency Việt Nam",
    metaTitle:
      "So sánh BrandHub vs Buffer, Planable, Hootsuite & Jira Notion | BrandHub",
    metaDescription:
      "Bảng đối chiếu chi tiết giữa BrandHub với các công cụ ngoại (Buffer, Hootsuite, Planable) và bộ công cụ Jira + Notion về tính năng, AI tiếng Việt và chi phí.",
    category: "tool-comparison-case-study",
    primaryKeyword: "so sánh phần mềm quản lý mạng xã hội và agency",
    secondaryKeywords: [
      "brandhub vs planable buffer hootsuite",
      "phần mềm thay thế jira notion cho marketing",
      "chi phí phần mềm quản lý agency tại việt nam",
      "thanh toán phần mềm saas qua vietqr sepay payos",
    ],
    searchIntent: "Comparison",
    targetRoles: ["Guest", "Owner", "Manager", "Client"],
    relatedFrCodes: ["FR-3.4.1", "FR-3.5.1", "FR-3.7.1", "FR-3.9.1"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 11,
    author: BLOG_AUTHORS["ha-van-an"],
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Bảng phân tích và so sánh hiệu quả đầu tư giữa BrandHub với các công cụ quản lý rời rạc",
    geoSummary:
      "Khi lựa chọn nền tảng vận hành cho Agency truyền thông hoặc phòng Marketing in-house tại Việt Nam, việc ghép nối nhiều phần mềm quốc tế như Jira/Notion (quản lý việc), Buffer/Hootsuite/Planable (lên lịch đăng bài) và các công cụ AI rời rạc thường đẩy tổng chi phí lên từ 5 đến 15 triệu đồng mỗi tháng, đồng thời phát sinh rào cản thanh toán thẻ quốc tế và đứt gãy dữ liệu giữa các khâu. BrandHub hợp nhất toàn bộ 5 mảnh ghép này vào một nền tảng duy nhất: Quản trị đa Workspace 6 vai trò, Đàm phán Gói truyền thông (Media Package), AI Studio tích hợp GraphRAG tiếng Việt, Luồng phê duyệt 3 cấp và Xuất bản tự động 4 kênh (Facebook, Instagram, TikTok, Threads) với mức phí gói Pro chỉ 590.000 VNĐ/tháng thanh toán tức thì qua VietQR (SePay / PayOS).",
    keyTakeaways: [
      "Cắt giảm tới 80% chi phí phần mềm hàng tháng. Một nền tảng duy nhất thay thế cho 5 công cụ rời rạc.",
      "Có sẵn phân hệ Đàm phán Gói truyền thông (Media Package) và Quản lý Đối tác Báo đài. Đây là điểm mà Buffer hay Planable chưa hỗ trợ.",
      "Thiết kế sát sườn cho thị trường Việt Nam. AI hiểu sâu tiếng Việt, bắt đúng trend nội địa và thanh toán VietQR tự kích hoạt trong vài giây.",
      "Gói Starter 0đ/tháng luôn mở sẵn để các đội nhóm nhỏ bắt tay vào chuẩn hóa quy trình ngay lập tức.",
    ],
    sections: [
      {
        id: "bai-toan-chi-phi-khi-ghep-nhieu-phan-mem-ngoai",
        heading:
          "Bài toán chi phí ẩn khi Agency phải mua rời từng phần mềm quản lý, thiết kế và đăng bài",
        paragraphs: [
          "Hãy thử đặt bút làm một phép tính thực tế cho một Agency quy mô 15 nhân sự đang phục vụ 10 nhãn hàng. Bạn mua phần mềm quản lý dự án tính phí theo đầu người. Bạn mua thêm công cụ duyệt bài và hẹn giờ tính tiền theo từng kênh mạng xã hội. Rồi bạn lại trả thêm tiền tài khoản AI viết bài và tạo ảnh cho từng biên tập viên. Cộng dồn tất cả lại, hóa đơn thẻ tín dụng quốc tế mỗi tháng dễ dàng vượt ngưỡng vài trăm đô la Mỹ.",
          "Đắt đỏ là vậy nhưng dữ liệu vẫn nằm rời rạc ở năm bảy nơi. Manager vẫn phải tự tay chép thông tin từ file báo giá sang bảng giao việc. Khách hàng tại Việt Nam đôi khi cũng ngại thao tác vì giao diện phần mềm ngoại hoàn toàn bằng tiếng Anh.",
        ],
        comparisonTable: {
          caption:
            "Bảng đối chiếu toàn diện giữa BrandHub, nhóm công cụ đăng bài quốc tế và mô hình ghép nối thủ công",
          headers: [
            "Tiêu chí đánh giá",
            "BrandHub Platform",
            "Buffer / Hootsuite / Planable",
            "Combo Jira + Notion + Sheets",
          ],
          rows: [
            [
              "Quản trị đa Agency & Cô lập Workspace",
              "Hỗ trợ nguyên bản 6 vai trò RBAC",
              "Tính phụ phí cao theo từng Workspace/User",
              "Phải tự dựng quyền thủ công, dễ lộ dữ liệu",
            ],
            [
              "Báo giá Media Package & Đàm phán 2 chiều",
              "Có sẵn, chốt gói tự sinh Media Campaign",
              "Không có",
              "Làm file bảng tính rời rạc",
            ],
            [
              "AI GraphRAG Brand Guidelines & Đại sứ ảo",
              "Tích hợp Neo4j + ChromaDB + LoRA Studio",
              "Chỉ gợi ý viết lại câu cơ bản",
              "Phải mua thêm gói AI rời bên ngoài",
            ],
            [
              "Luồng duyệt 3 cấp & Khóa bản nháp",
              "Chuẩn Creator -> Manager -> Client",
              "Có duyệt bài nhưng thiếu quản lý Task gốc",
              "Có Task nhưng không có Preview bài đăng MXH",
            ],
            [
              "Xuất bản tự động 4 MXH + Đối tác Báo đài",
              "Facebook, Instagram, TikTok, Threads + Báo/TV",
              "Chỉ mạng xã hội, không quản lý đối tác PR/TV",
              "Không thể tự động đăng bài",
            ],
            [
              "Chi phí & Phương thức thanh toán",
              "Starter 0đ / Pro 590.000đ qua VietQR (SePay/PayOS)",
              "Tính bằng USD theo từng kênh và từng ghế ngồi",
              "Tốn phí theo từng đầu tài khoản nhân sự",
            ],
          ],
        },
      },
      {
        id: "tai-sao-nen-bat-dau-voi-goi-starter-hoac-nang-cap-pro",
        heading:
          "Lộ trình áp dụng BrandHub: Bắt đầu từ gói Starter miễn phí đến mở rộng quy mô với gói Pro",
        paragraphs: [
          "Bạn không cần đập bỏ toàn bộ quy trình cũ của công ty chỉ sau một đêm. Hãy chuyển đổi từng bước nhỏ.",
          "Bắt đầu trước với gói Starter miễn phí 0đ. Bạn tạo thử 1 Workspace thật, mời tối đa 5 thành viên gồm Manager, Creator và đại diện Client của 1 nhãn hàng vào chạy thử trong 2 tuần. Khi thấy tốc độ duyệt bài tăng vọt và muốn mở rộng lên 10 Workspace cùng kho AI Credits dồi dào, Owner chỉ cần quét mã VietQR để lên gói Pro (590.000 VNĐ/tháng). Mất đúng 10 giây là hệ thống mở khóa toàn bộ quyền lợi.",
        ],
        inlineCta: {
          badge: "TỐI ƯU CHI PHÍ & HIỆU SUẤT",
          title: "Sẵn sàng hợp nhất toàn bộ quy trình truyền thông về một nền tảng?",
          description:
            "Bắt đầu miễn phí với gói Starter hoặc nâng cấp gói Pro để mở khóa đa Workspace và kho AI Credits cho toàn Agency.",
          primaryText: "Đăng ký gói Starter 0đ",
          primaryHref: "/register",
          secondaryText: "Xem chi tiết bảng giá Pro",
          secondaryHref: "/#pricing",
          featureHighlight: "Thanh toán VietQR tự động · Không phí ẩn",
        },
      },
    ],
    faqs: [
      {
        question:
          "Thanh toán nâng cấp gói Pro hoặc mua thêm AI Credits trên BrandHub diễn ra như thế nào?",
        answer:
          "Hệ thống tích hợp cổng thanh toán nội địa SePay / PayOS chuẩn VietQR. Khi Owner chọn gói nâng cấp hoặc gói nạp AI Credits, màn hình hiển thị mã QR chuyển khoản ngân hàng. Ngay sau khi quét mã thanh toán thành công, webhook tự động kích hoạt quyền lợi và xuất hóa đơn điện tử trên hệ thống trong vài giây.",
      },
      {
        question:
          "Tôi có thể mời khách hàng (Client) vào duyệt bài mà không phải hướng dẫn kỹ thuật phức tạp không?",
        answer:
          "Hoàn toàn được. Giao diện dành cho vai trò Client được tinh giản tối đa, chỉ tập trung vào xem tiến độ chiến dịch, xem bản mô phỏng bài đăng trên 4 mạng xã hội và bấm nút Duyệt hoặc Góp ý sửa đổi.",
      },
    ],
    primaryCta: {
      badge: "TRẢI NGHIỆM THỰC TẾ NGAY HÔM NAY",
      title: "Đừng để công cụ rời rạc kìm hãm tốc độ phát triển của Agency",
      description:
        "Tạo tài khoản miễn phí, thiết lập Workspace đầu tiên và cảm nhận sự khác biệt của một nền tảng được may đo cho ngành truyền thông Việt Nam.",
      primaryText: "Tạo tài khoản miễn phí ngay",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Trọn bộ Quản trị · AI GraphRAG · Xuất bản 4 kênh",
    },
    relatedSlugs: [
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
      "goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
      "ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
    ],
  },
  ...BLOG_BATCH1_PART1_POSTS,
  ...BLOG_BATCH1_PART2_POSTS,
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogCategoryBySlug(
  slug: string,
): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}
