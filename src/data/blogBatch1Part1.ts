import { BLOG_AUTHORS } from "./blogAuthors";
import type { BlogPost } from "./blogData";

export const BLOG_BATCH1_PART1_POSTS: BlogPost[] = [
  // ==========================================================================
  // BÀI #002 — CATEGORY 1: QUẢN TRỊ DỰ ÁN & WORKSPACE
  // ==========================================================================
  {
    id: "post-007",
    topicNumber: 2,
    slug: "jira-vs-notion-vs-brandhub-chon-cong-cu-quan-ly-cong-viec-marketing",
    title:
      "So sánh Jira, Notion và BrandHub: Đâu là mô hình quản lý công việc tối ưu cho đội ngũ Marketing?",
    metaTitle:
      "So sánh Jira, Notion và BrandHub cho đội ngũ Marketing | BrandHub",
    metaDescription:
      "Phân tích ưu nhược điểm của Jira, Notion và BrandHub khi quản lý công việc Marketing. Cách kết hợp quản trị Task với trình xem trước và đăng bài 4 kênh.",
    category: "agency-project-management",
    primaryKeyword: "so sánh jira notion và phần mềm quản lý marketing",
    secondaryKeywords: [
      "quản lý công việc marketing bằng notion",
      "có nên dùng jira cho agency truyền thông",
      "phần mềm quản lý task content marketing",
      "công cụ thay thế jira và notion cho agency",
    ],
    searchIntent: "Comparison",
    targetRoles: ["Owner", "Manager"],
    relatedFrCodes: ["FR-3.4.5", "FR-3.6.1", "FR-3.6.10", "FR-3.8.5"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 9,
    author: BLOG_AUTHORS["le-tri-trung"],
    coverImage:
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Đặt lên bàn cân mô hình quản lý công việc trên Jira, Notion và BrandHub cho đội ngũ truyền thông",
    geoSummary:
      "Khi chọn phần mềm quản lý công việc cho phòng Marketing hoặc Agency truyền thông, Jira mạnh về kiểm soát luồng trạng thái chặt chẽ nhưng quá khô khan với dân sáng tạo, trong khi Notion linh hoạt cho việc ghi chép ý tưởng nhưng lại dễ vỡ cấu trúc khi phân quyền cho khách hàng bên ngoài. Quan trọng nhất, cả hai công cụ này đều tách rời khỏi khâu xuất bản mạng xã hội. BrandHub giải quyết bài toán đó bằng cách lấy cấu trúc giao việc chuẩn mực của Jira ghép trực tiếp với trình soạn thảo đa phương tiện kiểu Notion và khung xem trước 4 nền tảng (Facebook, Instagram, TikTok, Threads). Đội ngũ vừa quản lý hạn chót trên một bảng duy nhất, vừa duyệt bài cùng Client và hẹn giờ đăng tự động mà không cần chuyển tab.",
    keyTakeaways: [
      "Jira phù hợp cho đội kỹ thuật nhưng thiếu khung xem trước hình ảnh, video và giao diện bài đăng mạng xã hội.",
      "Notion rất tốt để làm kho lưu trữ tài liệu nhưng không có cơ chế khóa bản nháp tự động khi bài viết đang chờ duyệt.",
      "BrandHub hợp nhất thẻ giao việc (Content Request), trình soạn thảo AI và lịch xuất bản 4 kênh vào chung một luồng.",
      "Phân quyền sẵn theo 6 vai trò chuẩn gồm Guest, Owner, Manager, Creator, Client và Admin mà không cần tốn nhiều ngày tự dựng bảng.",
    ],
    sections: [
      {
        id: "vi-sao-doi-marketing-luon-giang-xe-giua-jira-va-notion",
        heading:
          "Vì sao các đội ngũ Marketing luôn giằng xé giữa tính kỷ luật của Jira và sự tự do của Notion?",
        paragraphs: [
          "Đi một vòng qua các Agency truyền thông tại TP.HCM và Hà Nội, bạn sẽ thấy một cảnh tượng rất quen. Đội quản lý dự án thì mê sự chặt chẽ của Jira. Nhưng đội viết bài và thiết kế lại chỉ thích mở Notion vì giao diện thoáng, dễ thả ảnh và gõ chữ mượt tay. Không bên nào chịu nhường bên nào.",
          "Khi ép toàn bộ nhân sự sáng tạo vào Jira, họ cảm thấy như đang điền phiếu báo lỗi phần mềm. Cảm hứng viết lách tụt dốc ngay. Ngược lại, nếu thả tự do hoàn toàn trên Notion, chỉ sau hai tháng vận hành là các bảng dữ liệu bắt đầu loạn nhịp. Người này lỡ tay xóa mất cột trạng thái của người kia. Khách hàng vào xem thì thấy luôn cả những dòng nháp chưa kịp trau chuốt.",
        ],
        comparisonTable: {
          caption:
            "Đặt lên bàn cân 3 công cụ quản lý dưới góc nhìn vận hành truyền thông thực tế",
          headers: [
            "Tiêu chí thực chiến",
            "BrandHub Platform",
            "Jira Software",
            "Notion Workspace",
          ],
          rows: [
            [
              "Độ thân thiện với Creator",
              "Cao, trình soạn thảo kèm ảnh/video trực quan",
              "Thấp, thiên về quản lý ticket kỹ thuật",
              "Cao, dễ viết nháp và lưu tài liệu",
            ],
            [
              "Khóa bản nháp khi chờ duyệt",
              "Tự động khóa ngay khi bấm gửi duyệt",
              "Phải cấu hình workflow phức tạp",
              "Không có, ai có quyền sửa đều gõ đè được",
            ],
            [
              "Mô phỏng giao diện 4 MXH",
              "Có sẵn Facebook, Instagram, TikTok, Threads",
              "Không hỗ trợ",
              "Không hỗ trợ",
            ],
            [
              "Tự động đăng bài sau khi duyệt",
              "Đẩy thẳng sang Publisher Service lên sóng",
              "Không thể đăng bài MXH",
              "Phải tải ảnh và copy chữ đi đăng tay",
            ],
          ],
        },
      },
      {
        id: "cach-brandhub-ket-hop-diem-manh-cua-ca-hai-the-gioi",
        heading:
          "Cách BrandHub lấy kỷ luật giao việc của Jira kết hợp vào không gian sáng tạo của Notion",
        paragraphs: [
          "Chúng tôi không bắt bạn phải chọn một bỏ một. Khi xây dựng phân hệ Content & Workflow trên BrandHub, bài toán đặt ra rất rõ ràng: Manager cần kiểm soát chặt tiến độ, còn Creator cần một chỗ ngồi viết bài thật sướng tay.",
          "Mỗi yêu cầu sản xuất nội dung (Content Request) đóng vai trò như một thẻ việc có hạn chót, mức độ ưu tiên và người phụ trách rõ ràng. Nhưng khi mở thẻ việc đó ra, Creator bước ngay vào một phòng studio sáng tạo hoàn chỉnh. Họ tra cứu Brand Guidelines qua AI GraphRAG, gắn ảnh, cắt cúp tỷ lệ khung hình và xem thử bài đăng sẽ hiển thị trên màn hình điện thoại của người dùng TikTok hay Instagram ra sao.",
        ],
        checklist: [
          "Giao việc rõ người, rõ hạn chót: Manager tạo Content Request gắn thẳng vào chiến dịch Media Campaign đang chạy.",
          "Soạn thảo không cần rời trang: Creator viết bài, gọi AI gợi ý câu mở đầu và đính kèm bộ ảnh ngay trên cùng màn hình.",
          "Chuyển trạng thái một chiều minh bạch: Bài nháp đi đúng lộ trình từ Creator sang Manager rồi mới tới tay Client.",
          "Lên lịch xuất bản tức thì: Duyệt xong là bài nằm gọn trên Content Calendar, chờ đúng giờ vàng để tự động phát hành.",
        ],
        inlineCta: {
          badge: "HỢP NHẤT QUẢN LÝ & SÁNG TẠO",
          title: "Ngừng việc phải mở cùng lúc 4 phần mềm chỉ để đăng 1 bài viết",
          description:
            "Đưa toàn bộ quy trình giao việc, viết bài, duyệt 3 cấp và xuất bản đa kênh về chung một Workspace trên BrandHub.",
          primaryText: "Tạo Workspace miễn phí ngay",
          primaryHref: "/register",
          secondaryText: "Xem quy trình vận hành",
          secondaryHref: "/#how-it-works",
          featureHighlight: "Thiết lập sẵn cấu trúc trong 30 giây · Không cần tự dựng bảng",
        },
      },
    ],
    faqs: [
      {
        question:
          "Đội ngũ của tôi đã quen ghi chép tài liệu trên Notion thì chuyển sang BrandHub thế nào?",
        answer:
          "Bạn chỉ cần xuất các tài liệu Brand Guidelines từ Notion ra định dạng PDF hoặc DOCX rồi tải thẳng vào Kho tri thức (Knowledge Base) của Workspace trên BrandHub. Hệ thống AI GraphRAG sẽ tự động đọc hiểu và áp dụng ngay cho mọi bài viết mới.",
      },
      {
        question:
          "BrandHub có hỗ trợ xem công việc theo dạng danh sách lọc và lịch biểu không?",
        answer:
          "Có đầy đủ. Manager và Creator có thể lọc danh sách Content Request theo trạng thái, mức độ ưu tiên, chiến dịch hoặc chuyển sang giao diện Lịch xuất bản (Content Calendar) theo tuần và tháng.",
      },
    ],
    primaryCta: {
      badge: "TỐI ƯU HÓA NĂNG SUẤT ĐỘI NGŨ",
      title: "Trải nghiệm không gian làm việc sinh ra dành riêng cho dân Truyền thông",
      description:
        "Khởi tạo gói Starter 0đ để cảm nhận sự khác biệt khi Task và bài đăng mạng xã hội nằm chung một nền tảng.",
      primaryText: "Đăng ký dùng thử miễn phí",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Hỗ trợ trọn vẹn 4 nền tảng: Facebook, Instagram, TikTok, Threads",
    },
    relatedSlugs: [
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
      "thiet-ke-cau-truc-da-workspace-cho-agency-quan-ly-20-thuong-hieu",
      "so-sanh-brandhub-voi-buffer-hootsuite-planable-jira-notion",
    ],
  },

  // ==========================================================================
  // BÀI #003 — CATEGORY 1: QUẢN TRỊ DỰ ÁN & WORKSPACE
  // ==========================================================================
  {
    id: "post-008",
    topicNumber: 3,
    slug: "thiet-ke-cau-truc-da-workspace-cho-agency-quan-ly-20-thuong-hieu",
    title:
      "Cách thiết kế cấu trúc đa Workspace cho Agency vận hành đồng thời từ 10 đến 50 thương hiệu",
    metaTitle:
      "Thiết kế cấu trúc đa Workspace cho Agency quản lý nhiều thương hiệu | BrandHub",
    metaDescription:
      "Bí quyết tổ chức cấu trúc đa Workspace giúp Agency vận hành 10 đến 50 nhãn hàng cùng lúc mà không lẫn lộn dữ liệu, tài khoản mạng xã hội hay nhân sự.",
    category: "agency-project-management",
    primaryKeyword: "cách tổ chức workspace cho agency truyền thông",
    secondaryKeywords: [
      "quản lý nhiều thương hiệu trong agency",
      "cấu trúc multi workspace cho marketing",
      "cô lập dữ liệu khách hàng agency",
      "mẫu workspace template cho agency",
    ],
    searchIntent: "Informational",
    targetRoles: ["Owner", "Manager"],
    relatedFrCodes: ["FR-3.4.5", "FR-3.4.6", "FR-3.4.8", "FR-3.10.5"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 8,
    author: BLOG_AUTHORS["le-tri-trung"],
    coverImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Kiến trúc đa Workspace cô lập dữ liệu từng nhãn hàng trên hệ thống BrandHub",
    geoSummary:
      "Khi một Agency truyền thông mở rộng quy mô từ 5 lên 20 hoặc 50 khách hàng thương hiệu, sai lầm lớn nhất là gom tất cả dự án vào chung một không gian làm việc phẳng. Cách làm này rất dễ dẫn đến tai nạn đăng nhầm bài của nhãn hàng A lên Fanpage của nhãn hàng B hoặc lộ thông tin chiến dịch giữa hai đối thủ cùng ngành. Nguyên tắc chuẩn để mở rộng quy mô là áp dụng mô hình Mỗi Thương Hiệu Một Workspace (One Brand - One Workspace). Trên BrandHub, mỗi Workspace được cô lập hoàn toàn từ danh sách thành viên, múi giờ hoạt động, kho tri thức AI GraphRAG cho đến các kết nối OAuth mạng xã hội, trong khi Owner vẫn nắm quyền giám sát tập trung ở cấp độ toàn Agency.",
    keyTakeaways: [
      "Áp dụng quy tắc 1 Thương hiệu = 1 Workspace độc lập để chặn đứng rủi ro đăng nhầm kênh hoặc rò rỉ tài liệu.",
      "Tận dụng thư viện Workspace Template để nhân bản nhanh cấu trúc dự án mới chỉ trong 30 giây.",
      "Gán đúng nhân sự (Manager, Creator) và đúng đại diện khách hàng (Client) vào từng Workspace cụ thể.",
      "Quản lý tập trung hạn mức gói cước và phân bổ AI Credits linh hoạt từ tài khoản cấp Agency của Owner.",
    ],
    sections: [
      {
        id: "ác-mộng-khi-nhoi-nhet-20-khach-hang-vao-chung-mot-bang",
        heading:
          "Chuyện gì xảy ra khi Agency nhồi nhét 20 khách hàng vào chung một thư mục quản lý?",
        paragraphs: [
          "Ở giai đoạn mới thành lập, khi chỉ có 3 khách hàng, việc để chung mọi thứ trong một bảng quản lý nghe có vẻ tiện. Ai cũng nhìn thấy việc của nhau. Mọi thứ có vẻ trong tầm mắt. Nhưng khi con số khách hàng chạm mốc 15 hay 20, sự tiện lợi đó biến thành một mớ hỗn độn thật sự.",
          "Hãy tưởng tượng một Creator buổi sáng viết bài cho chuỗi cà phê A, buổi chiều viết tiếp cho chuỗi trà sữa B. Rủi ro nằm ngay ở đây. Nếu cả hai thương hiệu nằm chung một không gian lưu trữ và chung một danh sách chọn kênh đăng bài, chỉ cần một cú nhấp chuột lệch tay là hình ảnh của hãng A sẽ nằm chễm chệ trên Fanpage của hãng B. Tai nạn nghề nghiệp này có thể khiến Agency mất hợp đồng ngay lập tức.",
        ],
      },
      {
        id: "nguyen-tac-iet-lap-workspace-tren-brandhub",
        heading:
          "4 lớp cô lập dữ liệu trong kiến trúc Multi-Workspace của BrandHub",
        paragraphs: [
          "Ranh giới dữ liệu phải tuyệt đối rõ ràng. Để giúp Owner ngủ ngon mỗi tối khi công ty chạy hàng chục chiến dịch song song, BrandHub dựng sẵn hàng rào kỹ thuật tách biệt từng Workspace ngay từ tầng cơ sở dữ liệu. Không có ngoại lệ nào cả.",
        ],
        subheadings: [
          {
            title: "1. Cô lập kết nối mạng xã hội (Social Accounts Isolation)",
            body: "Fanpage Facebook, tài khoản Instagram, TikTok và Threads của nhãn hàng nào chỉ được phép liên kết vào đúng Workspace của nhãn hàng đó. Khi Creator ngồi trong Workspace A, họ chỉ nhìn thấy đúng 4 kênh của nhãn hàng A.",
          },
          {
            title: "2. Cô lập bộ não AI GraphRAG (Brand Knowledge Isolation)",
            body: "Tài liệu Brand Guidelines và danh sách từ cấm được neo chặt theo mã định danh của từng Workspace. AI tuyệt đối không bao giờ lấy giọng văn trẻ trung của nhãn hàng thời trang GenZ áp nhầm sang bài viết của ngân hàng.",
          },
          {
            title: "3. Cô lập quyền truy cập của Client",
            body: "Mỗi đại diện khách hàng khi được mời vào với vai trò Client chỉ nhìn thấy duy nhất Workspace của thương hiệu mình phụ trách. Họ hoàn toàn không biết sự tồn tại của các Workspace khác trong cùng Agency.",
          },
        ],
        checklist: [
          "Bước 1: Owner đăng nhập và khởi tạo hồ sơ Agency chính thức trên hệ thống.",
          "Bước 2: Chọn mẫu Workspace Template phù hợp với ngành hàng của khách mới để dựng khung nhanh.",
          "Bước 3: Cấu hình múi giờ chuẩn (Timezone) và nạp bộ tài liệu Brand Guidelines vào kho tri thức của Workspace.",
          "Bước 4: Mời Manager, đội ngũ Creator phụ trách dự án và gửi lời mời riêng cho đại diện Client.",
        ],
        inlineCta: {
          badge: "MỞ RỘNG QUY MÔ AGENCY",
          title: "Quản lý tới 10 Workspace độc lập chỉ với gói Pro 590.000đ/tháng",
          description:
            "Bắt đầu miễn phí với 1 Workspace ở gói Starter hoặc nâng cấp gói Pro bất kỳ lúc nào qua VietQR.",
          primaryText: "Khởi tạo Workspace đầu tiên",
          primaryHref: "/register",
          secondaryText: "Xem bảng giá gói Pro",
          secondaryHref: "/#pricing",
          featureHighlight: "Cô lập dữ liệu 100% · Chuyển đổi nhanh giữa các Workspace",
        },
      },
    ],
    faqs: [
      {
        question:
          "Một nhân sự Creator có thể tham gia làm việc ở nhiều Workspace khác nhau không?",
        answer:
          "Hoàn toàn được. Owner hoặc Manager có thể thêm một Creator vào 3 hoặc 5 Workspace mà bạn đó phụ trách. Khi làm việc cho nhãn hàng nào, Creator chỉ cần chọn chuyển sang Workspace đó trên thanh điều hướng.",
      },
      {
        question:
          "Gói Starter miễn phí và gói Pro hỗ trợ tối đa bao nhiêu Workspace?",
        answer:
          "Gói Starter (0đ) hỗ trợ tạo 1 Workspace với tối đa 5 thành viên để bạn vận hành thử nghiệm. Khi nâng cấp lên gói Pro (590.000 VNĐ/tháng), bạn được mở rộng lên tới 10 Workspace độc lập.",
      },
    ],
    primaryCta: {
      badge: "CHUẨN HÓA HẠ TẦNG QUẢN TRỊ",
      title: "Xây dựng nền móng vững chắc để Agency nhân đôi số lượng khách hàng",
      description:
        "Tạo tài khoản và thiết lập kiến trúc đa Workspace chuyên nghiệp trên BrandHub ngay hôm nay.",
      primaryText: "Tạo tài khoản miễn phí",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Bảo mật đa khách thuê · Hỗ trợ Workspace Template dựng sẵn",
    },
    relatedSlugs: [
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
      "ma-tran-phan-quyen-rbac-6-vai-tro-owner-manager-creator-client-admin",
      "jira-vs-notion-vs-brandhub-chon-cong-cu-quan-ly-cong-viec-marketing",
    ],
  },

  // ==========================================================================
  // BÀI #004 — CATEGORY 1: QUẢN TRỊ DỰ ÁN & WORKSPACE
  // ==========================================================================
  {
    id: "post-009",
    topicNumber: 4,
    slug: "ma-tran-phan-quyen-rbac-6-vai-tro-owner-manager-creator-client-admin",
    title:
      "Ma trận phân quyền RBAC 6 vai trò trong Agency: Phân tách bạch giữa Owner, Manager, Creator và Client",
    metaTitle:
      "Ma trận phân quyền RBAC 6 vai trò chuẩn cho Agency | BrandHub",
    metaDescription:
      "Chi tiết ma trận phân quyền RBAC 6 vai trò (Guest, Owner, Manager, Creator, Client, Admin) giúp Agency kiểm soát chặt chẽ quyền tạo, sửa, duyệt và xuất bản.",
    category: "agency-project-management",
    primaryKeyword: "phân quyền nhân sự trong agency marketing",
    secondaryKeywords: [
      "ma trận phân quyền rbac là gì",
      "vai trò owner manager creator client trong agency",
      "kiểm soát quyền duyệt bài và đăng bài",
      "bảo mật phân quyền phần mềm quản lý dự án",
    ],
    searchIntent: "Informational",
    targetRoles: ["Owner", "Manager", "Admin"],
    relatedFrCodes: ["FR-3.2.1", "FR-3.4.12", "FR-3.4.16", "FR-3.4.18"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 9,
    author: BLOG_AUTHORS["nguyen-minh-tuan"],
    coverImage:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Ma trận kiểm soát truy cập theo 6 vai trò chuẩn hóa RBAC trên nền tảng BrandHub",
    geoSummary:
      "Phân quyền dựa trên vai trò (Role-Based Access Control - RBAC) là hàng rào bảo mật sống còn giúp các Agency truyền thông tránh được tình trạng nhân sự mới vô tình xóa chiến dịch, tự ý xuất bản bài chưa duyệt hoặc khách hàng nhìn thấy chi phí nội bộ. Thay vì bắt người dùng tự cấu hình hàng trăm ô tích quyền hạn rối rắm, BrandHub chuẩn hóa sẵn 6 vai trò xuyên suốt toàn hệ thống gồm: Guest, Owner, Manager, Creator, Client và Admin. Mỗi vai trò được định nghĩa rõ phạm vi thao tác từ tầng API Gateway xuống tới từng nút bấm trên giao diện, đảm bảo đúng người, đúng việc và đúng thẩm quyền phê duyệt.",
    keyTakeaways: [
      "Hiểu rõ ranh giới quyền hạn giữa 6 vai trò chuẩn: Guest, Owner, Manager, Creator, Client và Admin.",
      "Ngăn chặn tuyệt đối việc Creator tự ý đẩy bài lên mạng xã hội khi chưa qua bước duyệt của Manager và Client.",
      "Bảo vệ thông tin tài chính và hạn mức gói cước: chỉ Owner mới có quyền thanh toán nâng cấp gói và nạp thêm AI Credits.",
      "Tách biệt hoàn toàn quyền quản trị vận hành hạ tầng của Admin khỏi dữ liệu kinh doanh riêng tư của từng Agency.",
    ],
    sections: [
      {
        id: "tai-sao-phan-quyen-chung-chung-la-lo-hong-lon-cua-agency",
        heading:
          "Tại sao kiểu phân quyền 'Ai cũng là Quản trị viên' lại cực kỳ nguy hiểm cho Agency?",
        paragraphs: [
          "Rất nhiều đội nhóm có thói quen cấp luôn quyền cao nhất cho mọi thành viên khi mới tạo không gian làm việc vì ngại thiết lập chi tiết. Lúc bình thường thì chẳng sao. Nhưng đến khi một cộng tác viên viết bài vô tình bấm xóa nhầm cả chiến dịch lớn, hoặc bấm đăng thẳng một bài nháp nhạy cảm lên Fanpage khách hàng khi chưa ai kịp đọc, hậu quả để lại rất nặng nề.",
          "Muốn vận hành chuyên nghiệp, quyền tạo nội dung và quyền phê duyệt xuất bản bắt buộc phải tách làm hai tay khác nhau. Không ai vừa đá bóng vừa thổi còi.",
        ],
        comparisonTable: {
          caption:
            "Bảng phân định thẩm quyền của 6 vai trò chuẩn hóa trên hệ thống BrandHub",
          headers: [
            "Vai trò hệ thống",
            "Phạm vi truy cập chính",
            "Quyền hạn cốt lõi trên hệ thống",
          ],
          rows: [
            [
              "Guest",
              "Các trang công khai & Link chia sẻ",
              "Xem báo giá Media Package qua link token, tham gia khảo sát, đọc Blog & FAQ",
            ],
            [
              "Owner",
              "Toàn bộ Tổ chức (Agency) & các Workspace",
              "Tạo Agency/Workspace, nâng cấp gói Pro, nạp AI Credits, mời Manager/Member",
            ],
            [
              "Manager",
              "Các Workspace được phân công quản lý",
              "Đàm phán Media Package, tạo Media Campaign, giao Task, duyệt bài nội bộ, lên lịch đăng",
            ],
            [
              "Creator",
              "Các Task & Trình soạn thảo trong Workspace",
              "Soạn thảo nội dung, dùng AI Studio (văn bản, ảnh, video), kiểm tra Compliance, gửi duyệt",
            ],
            [
              "Client",
              "Cổng nghiệm thu của đúng thương hiệu mình",
              "Đàm phán gói dịch vụ, xem tiến độ chiến dịch, xem Preview 4 kênh và bấm Duyệt/Từ chối",
            ],
            [
              "Admin",
              "Phân hệ Quản trị hệ thống (System Portal)",
              "Giám sát sức khỏe dịch vụ, quản lý gói cước gốc, kiểm duyệt hàng đợi cộng đồng toàn cục",
            ],
          ],
        },
      },
      {
        id: "cach-gan-va-thay-doi-vai-tro-linh-hoat-trong-workspace",
        heading:
          "Cách thiết lập và điều chỉnh vai trò nhân sự chỉ với vài cú nhấp chuột",
        paragraphs: [
          "Trên BrandHub, bạn không phải ngồi tích từng quyền nhỏ lẻ. Ngay khi gửi lời mời qua email, Owner hoặc Manager chỉ cần chọn đúng chức danh của người đó trong dự án.",
          "Khi một bạn Creator có năng lực tốt được thăng tiến lên làm trưởng nhóm phụ trách khách hàng mới, Owner chỉ cần đổi vai trò của bạn đó trong Workspace mới thành Manager. Mọi giao diện điều phối chiến dịch và nút duyệt nội bộ sẽ tự động mở ra ngay lập tức.",
        ],
        checklist: [
          "Chỉ cấp quyền Owner cho người sáng lập hoặc giám đốc điều hành trực tiếp nắm ngân sách của Agency.",
          "Gán quyền Manager cho các trưởng nhóm quản lý dự án trực tiếp làm việc với khách hàng và điều phối tiến độ.",
          "Gán quyền Creator cho đội ngũ biên tập viên, thiết kế và cộng tác viên sản xuất nội dung.",
          "Mời đại diện nhãn hàng vào đúng Workspace của họ với vai trò Client để nghiệm thu minh bạch.",
        ],
        inlineCta: {
          badge: "QUẢN TRỊ PHÂN QUYỀN AN TOÀN",
          title: "Thiết lập kỷ luật vận hành chuẩn xác cho từng vị trí trong đội ngũ",
          description:
            "Trải nghiệm cơ chế phân quyền 6 vai trò RBAC đã được cấu hình sẵn sàng trên BrandHub.",
          primaryText: "Đăng ký và phân quyền đội ngũ",
          primaryHref: "/register",
          secondaryText: "Tìm hiểu thêm tại FAQ",
          secondaryHref: "/help/faq",
          featureHighlight: "Bảo mật JWT & Xác thực hai lớp 2FA TOTP",
        },
      },
    ],
    faqs: [
      {
        question:
          "Một tài khoản người dùng có thể vừa là Creator ở Workspace A vừa là Manager ở Workspace B không?",
        answer:
          "Có. Phân quyền thành viên trong từng Workspace được thiết kế linh hoạt để phù hợp với cơ cấu ma trận của các Agency hiện đại.",
      },
      {
        question:
          "Làm sao để thu hồi quyền truy cập ngay lập tức khi một nhân sự nghỉ việc?",
        answer:
          "Owner hoặc Manager chỉ cần vào mục Quản lý thành viên và bấm xóa hoặc vô hiệu hóa thành viên đó khỏi Workspace/Agency. Phiên đăng nhập của họ sẽ lập tức hết hiệu lực.",
      },
    ],
    primaryCta: {
      badge: "BẢO MẬT & KỶ LUẬT VẬN HÀNH",
      title: "Trao đúng quyền cho đúng người trên một nền tảng tập trung",
      description:
        "Khởi tạo tổ chức Agency của bạn trên BrandHub và mời đội ngũ vào làm việc ngay hôm nay.",
      primaryText: "Tạo tài khoản miễn phí",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Phân tách rõ ràng giữa Nội bộ Agency và Khách hàng (Client)",
    },
    relatedSlugs: [
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
      "thiet-ke-cau-truc-da-workspace-cho-agency-quan-ly-20-thuong-hieu",
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
    ],
  },

  // ==========================================================================
  // BÀI #019 — CATEGORY 2: QUY TRÌNH NỘI DUNG & PHÊ DUYỆT
  // ==========================================================================
  {
    id: "post-010",
    topicNumber: 19,
    slug: "cach-viet-content-brief-chuan-giup-creator-viet-dung-y-ngay-lan-dau",
    title:
      "Mẫu phiếu giao việc sáng tạo (Content Request Brief) giúp Creator viết đúng ý ngay từ bản nháp đầu tiên",
    metaTitle:
      "Mẫu Content Brief chuẩn cho Agency giúp viết đúng ý ngay lần đầu | BrandHub",
    metaDescription:
      "Hướng dẫn cấu trúc phiếu giao việc sáng tạo (Content Request Brief) đầy đủ mục tiêu, kênh đăng, giọng văn và hạn chót giúp giảm 70% số lần sửa bài.",
    category: "content-workflow-approval",
    primaryKeyword: "mẫu content brief chuẩn cho agency",
    secondaryKeywords: [
      "cách viết content brief hiệu quả",
      "phiếu giao việc viết bài marketing",
      "quản lý yêu cầu sản xuất nội dung",
      "giảm số lần sửa bài content",
    ],
    searchIntent: "Informational",
    targetRoles: ["Manager", "Creator"],
    relatedFrCodes: ["FR-3.6.1", "FR-3.6.2", "FR-3.6.4", "FR-3.6.6"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 8,
    author: BLOG_AUTHORS["nguyen-minh-tuan"],
    coverImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Giao diện khởi tạo phiếu giao việc Content Request Brief chi tiết trên BrandHub",
    geoSummary:
      "Nguyên nhân hàng đầu khiến một bài viết truyền thông phải đập đi viết lại từ 3 đến 5 lần không phải do biên tập viên yếu tay nghề, mà do đề bài ban đầu (Content Brief) quá sơ sài. Một câu nhắn vội kiểu 'Em viết cho anh bài đẩy doanh số cuối tuần nhé' buộc người viết phải tự đoán ý, dẫn đến lệch thông điệp ngay từ bản nháp đầu tiên. Trên BrandHub, mỗi yêu cầu sản xuất nội dung (Content Request) chuẩn hóa sẵn 6 trường thông tin cốt lõi: Chiến dịch gốc, Mục tiêu thông điệp, Nền tảng xuất bản (Facebook, Instagram, TikTok, Threads), Mức độ ưu tiên, Hạn chót nộp bài và Tài liệu tham chiếu gắn kèm kho tri thức AI GraphRAG.",
    keyTakeaways: [
      "Loại bỏ hoàn toàn kiểu giao việc bằng miệng hoặc nhắn tin cụt lủn một dòng qua nhóm chat.",
      "Cấu trúc sẵn 6 trường thông tin bắt buộc trong mỗi phiếu Content Request để Creator nắm trọn ý đồ chiến dịch.",
      "Tự động liên kết phiếu giao việc với kho Brand Guidelines của Workspace để AI hỗ trợ lập dàn ý sát đề bài.",
      "Giúp Manager theo dõi tập trung hàng trăm yêu cầu nội dung qua bộ lọc trạng thái và mức độ ưu tiên.",
    ],
    sections: [
      {
        id: "hau-qua-cua-nhung-ban-brief-mot-dong-tin-nhan",
        heading:
          "Đề bài một dòng tin nhắn: Thói quen vô tình đốt sạch thời gian của cả Manager lẫn Creator",
        paragraphs: [
          "Chắc hẳn bạn từng chứng kiến tình huống này. Buổi sáng Manager bận họp với khách nên chỉ kịp nhắn vội vào nhóm: 'Chiều nay lên một bài giới thiệu bộ sưu tập thu đông nhé'. Mệnh lệnh ngắn gọn chỉ có vậy. Creator nhận lệnh, ngồi cặm cụi viết suốt 3 tiếng đồng hồ theo hướng kể chuyện cảm xúc.",
          "Đến 4 giờ chiều nộp bài, Manager đọc xong liền lắc đầu: 'Bài này khách cần đánh thẳng vào chương trình giảm giá 20% trên TikTok chứ không phải bài kể chuyện trên Facebook em ơi'. Thế là cả buổi chiều coi như bỏ sông bỏ bể. Ai cũng mệt mỏi. Creator phải thức tối làm lại từ đầu, còn tiến độ dự án thì trễ hẹn.",
        ],
      },
      {
        id: "6-truong-thong-tin-bat-buoc-trong-content-request-tren-brandhub",
        heading:
          "6 trường thông tin vàng trong một phiếu Content Request chuẩn trên BrandHub",
        paragraphs: [
          "Đầu vào chuẩn thì đầu ra mới trúng. Muốn nhận về bản nháp trúng đích ngay lần đầu, đầu vào phải thật rõ nét. Khi tạo mới một Content Request trên BrandHub, biểu mẫu sẽ dẫn dắt Manager điền đủ các thông số cốt lõi chỉ trong chưa đầy 1 phút.",
        ],
        checklist: [
          "1. Gắn đúng Chiến dịch (Media Campaign): Giúp Creator hiểu bài viết này nằm trong giai đoạn mở màn hay giai đoạn chốt đơn của chiến dịch lớn.",
          "2. Xác định rõ Nền tảng mục tiêu: Tích chọn sẵn bài này sẽ lên Facebook, Instagram, TikTok hay Threads để định hình ngay độ dài chữ và khổ ảnh.",
          "3. Tóm tắt Thông điệp chính & Kêu gọi hành động (Key Message & CTA): Nêu rõ 1 điều duy nhất muốn người đọc nhớ và bấm vào sau khi xem xong.",
          "4. Gắn mức độ Ưu tiên & Hạn chót (Priority & Deadline): Phân loại rõ Khẩn cấp, Cao hay Trung bình để Creator biết sắp xếp thứ tự làm việc.",
          "5. Chỉ định đúng Người thực hiện (Assignee): Giao đích danh cho Creator phụ trách, tránh cảnh việc chung không ai nhận.",
          "6. Đính kèm tệp tham khảo & Gợi ý từ AI GraphRAG: Hệ thống tự động móc nối với quy chuẩn giọng văn của nhãn hàng trong Workspace.",
        ],
        inlineCta: {
          badge: "CHUẨN HÓA ĐỀ BÀI SÁNG TẠO",
          title: "Giao việc rõ ràng, nhận bản nháp chuẩn xác ngay lần trình đầu tiên",
          description:
            "Sử dụng ngay phân hệ quản lý Content Request tích hợp sẵn trình soạn thảo và AI Studio trên BrandHub.",
          primaryText: "Tạo Content Request đầu tiên",
          primaryHref: "/register",
          secondaryText: "Đăng nhập vào Workspace",
          secondaryHref: "/login",
          featureHighlight: "Lọc nhanh theo Trạng thái, Ưu tiên, Chiến dịch & Kênh đăng",
        },
      },
    ],
    faqs: [
      {
        question:
          "Sau khi Manager tạo Content Request xong thì Creator bắt đầu viết bài ở đâu?",
        answer:
          "Creator chỉ cần bấm trực tiếp vào thẻ Content Request được giao, nhấn nút Mở trình soạn thảo là toàn bộ thông tin đề bài sẽ hiển thị song song với khung viết bài và công cụ AI Studio.",
      },
      {
        question:
          "Khi chốt xong một Gói truyền thông (Media Package), tôi có phải tạo tay từng Content Request không?",
        answer:
          "Không cần làm thủ công. Hệ thống hỗ trợ chuyển đổi tự động từ gói truyền thông đã duyệt sang chiến dịch và khởi tạo sẵn danh sách các đầu việc tương ứng.",
      },
    ],
    primaryCta: {
      badge: "TĂNG TỐC SẢN XUẤT NỘI DUNG",
      title: "Tiết kiệm hàng chục giờ sửa bài mỗi tuần nhờ quy trình Brief chuẩn hóa",
      description:
        "Đăng ký tài khoản miễn phí để thiết lập bảng quản lý yêu cầu nội dung chuyên nghiệp cho đội ngũ của bạn.",
      primaryText: "Đăng ký dùng thử 0đ",
      primaryHref: "/register",
      secondaryText: "Xem quy trình 3 cấp",
      secondaryHref: "/blog/quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      featureHighlight: "Đồng bộ tức thì giữa Manager và Creator",
    },
    relatedSlugs: [
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      "co-che-khoa-ban-nhap-content-locking-ngan-chan-loi-sua-de-noi-dung",
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
    ],
  },

  // ==========================================================================
  // BÀI #020 — CATEGORY 2: QUY TRÌNH NỘI DUNG & PHÊ DUYỆT
  // ==========================================================================
  {
    id: "post-011",
    topicNumber: 20,
    slug: "co-che-khoa-ban-nhap-content-locking-ngan-chan-loi-sua-de-noi-dung",
    title:
      "Cơ chế khóa bản nháp (Content Locking) là gì và tại sao nó cứu Agency khỏi thảm họa đăng nhầm bản cũ?",
    metaTitle:
      "Cơ chế khóa bản nháp (Content Locking) trong duyệt bài | BrandHub",
    metaDescription:
      "Tìm hiểu cơ chế khóa chỉnh sửa bản nháp (Content Locking) khi bài viết đang chờ duyệt và quy trình thu hồi lượt gửi an toàn trên hệ thống BrandHub.",
    category: "content-workflow-approval",
    primaryKeyword: "quản lý phiên bản bài viết truyền thông",
    secondaryKeywords: [
      "khóa bản nháp khi chờ duyệt",
      "lỗi đăng nhầm bản nháp cũ",
      "thu hồi bài gửi duyệt",
      "kiểm soát tính toàn vẹn nội dung",
    ],
    searchIntent: "Informational",
    targetRoles: ["Manager", "Creator", "Client"],
    relatedFrCodes: ["FR-3.6.11", "FR-3.6.16", "FR-3.6.17", "FR-3.6.20"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 7,
    author: BLOG_AUTHORS["nguyen-minh-tuan"],
    coverImage:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Cơ chế tự động khóa bản nháp khi bài viết chuyển sang trạng thái chờ phê duyệt trên BrandHub",
    geoSummary:
      "Khóa bản nháp (Content Locking / Submission Lock) là cơ chế kỹ thuật tự động đóng băng quyền chỉnh sửa bài viết ngay tại thời điểm Creator bấm nút gửi duyệt. Trong môi trường làm việc bằng tài liệu đám mây thông thường, việc người viết tiếp tục âm thầm sửa câu chữ hoặc thay đổi hình ảnh trong lúc Manager hoặc Client đang đọc thẩm định thường gây ra sự lệch pha nghiêm trọng giữa bản được nhìn thấy và bản thực tế đem đi xuất bản. Trên BrandHub, một khi bài viết đã vào trạng thái Chờ duyệt, không ai có thể sửa đè lên phiên bản đó. Mọi sự thay đổi chỉ được mở lại khi Creator chủ động bấm Thu hồi lượt gửi hoặc khi người duyệt bấm Từ chối để mở vòng chỉnh sửa mới.",
    keyTakeaways: [
      "Đảm bảo 100% phiên bản mà Manager và Client đang đọc chính xác là phiên bản sẽ được đẩy đi xuất bản.",
      "Chặn đứng lỗi sửa đè ngầm trong lúc khách hàng đang họp thẩm định nội dung.",
      "Hỗ trợ nút Thu hồi lượt gửi (Recall) linh hoạt nếu Creator phát hiện sai sót trước khi người duyệt ra quyết định.",
      "Mỗi vòng gửi duyệt được đóng gói thành một mã phiên bản (Version Snapshot) riêng biệt có dấu thời gian rõ ràng.",
    ],
    sections: [
      {
        id: "tai-nan-sua-ngam-khi-duyet-bai-tren-file-tai-lieu-chung",
        heading:
          "Tai nạn 'Sửa ngầm lúc đang duyệt' trên các trình soạn thảo đám mây phổ thông",
        paragraphs: [
          "Tình huống này xảy ra như cơm bữa ở các đội nội dung dùng link tài liệu chia sẻ chung. Lúc 2 giờ chiều, Creator gửi link bài viết cho khách hàng duyệt. Đến 2 giờ 15 phút, khách hàng đang mở file ra đọc đoạn mở đầu và thấy rất ưng ý. Mọi chuyện tưởng đã xong.",
          "Đúng lúc đó ở đầu bên kia, một bạn nhân sự khác lại mở chính file đó ra sửa lại câu tiêu đề và đổi tấm ảnh minh họa mà không báo tiếng nào. Khách hàng đọc xong đoạn cuối liền nhắn tin chốt duyệt. Kết quả là bài đăng lên sóng lại mang phần mở đầu đã bị sửa đổi, kéo theo cuộc tranh cãi gay gắt xem lỗi thuộc về ai.",
        ],
      },
      {
        id: "nguyen-ly-dong-bang-phien-ban-tren-brandhub",
        heading:
          "Nguyên lý đóng băng phiên bản và luồng mở khóa có kiểm soát trên BrandHub",
        paragraphs: [
          "Để bảo vệ cả người viết lẫn người duyệt, BrandHub áp dụng quy tắc khóa cứng trạng thái theo từng bước chuyển giao. Quy trình diễn ra hết sức rạch ròi.",
        ],
        checklist: [
          "Khi bài ở trạng thái Đang thực hiện (In Progress): Creator toàn quyền soạn thảo, chỉnh ảnh và dùng các công cụ AI.",
          "Ngay khi bấm Gửi duyệt (Pending Approval): Nút chỉnh sửa tự động khóa lại. Bản nháp được niêm phong nguyên trạng để trình Manager và Client.",
          "Trường hợp muốn tự sửa nhanh: Nếu Manager chưa bấm quyết định, Creator chỉ cần nhấn nút Thu hồi lượt gửi để kéo bài về trạng thái Đang thực hiện rồi sửa tiếp.",
          "Trường hợp có góp ý chỉnh sửa: Khi Manager hoặc Client nhấn Từ chối kèm ghi chú, hệ thống tự động mở khóa trình soạn thảo để Creator tạo bản cập nhật mới.",
        ],
        callout: {
          label: "Bằng chứng nghiệm thu minh bạch",
          text: "Nhờ cơ chế khóa bản nháp này, khi Client đã bấm nút Phê duyệt ở phiên bản nào, hệ thống Publisher sẽ lấy đúng dữ liệu của phiên bản đã khóa đó để đăng lên Facebook, Instagram, TikTok và Threads.",
        },
        inlineCta: {
          badge: "AN TOÀN TUYỆT ĐỐI KHI DUYỆT BÀI",
          title: "Loại bỏ hoàn toàn rủi ro lệch phiên bản giữa Agency và Khách hàng",
          description:
            "Trải nghiệm trình soạn thảo tích hợp cơ chế khóa bản nháp thông minh và lưu vết lịch sử trên BrandHub.",
          primaryText: "Dùng thử miễn phí ngay",
          primaryHref: "/register",
          secondaryText: "Đọc thêm giải đáp tại FAQ",
          secondaryHref: "/help/faq",
          featureHighlight: "Tự động khóa khi chờ duyệt · Hỗ trợ thu hồi lượt gửi 1 chạm",
        },
      },
    ],
    faqs: [
      {
        question:
          "Khi bài viết đang bị khóa chờ duyệt thì các thành viên có trao đổi thêm được không?",
        answer:
          "Hoàn toàn được. Dù nội dung bài viết được khóa để giữ nguyên trạng, Manager, Creator và Client vẫn có thể để lại bình luận trao đổi hoặc gắn thẻ tên đồng nghiệp ngay tại khung thảo luận của công việc.",
      },
      {
        question:
          "Tôi có xem lại được các bản nháp cũ ở những lần gửi duyệt trước không?",
        answer:
          "Có. Toàn bộ các lượt gửi trước đó đều được lưu giữ trong mục Lịch sử phê duyệt kèm theo thời gian và nhận xét chi tiết của người duyệt.",
      },
    ],
    primaryCta: {
      badge: "KIỂM SOÁT CHẤT LƯỢNG NỘI DUNG",
      title: "Xây dựng quy trình phê duyệt chặt chẽ, không còn nỗi lo đăng nhầm",
      description:
        "Khởi tạo Workspace trên BrandHub để chuẩn hóa toàn bộ vòng đời bài viết từ bản nháp đến khi lên sóng.",
      primaryText: "Tạo tài khoản miễn phí",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Bảo toàn tính toàn vẹn dữ liệu 100%",
    },
    relatedSlugs: [
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      "cach-viet-content-brief-chuan-giup-creator-viet-dung-y-ngay-lan-dau",
      "xem-truoc-bai-dang-preview-tren-facebook-instagram-tiktok-threads",
    ],
  },

  // ==========================================================================
  // BÀI #022 — CATEGORY 2: QUY TRÌNH NỘI DUNG & PHÊ DUYỆT
  // ==========================================================================
  {
    id: "post-012",
    topicNumber: 22,
    slug: "xem-truoc-bai-dang-preview-tren-facebook-instagram-tiktok-threads",
    title:
      "Tính năng mô phỏng giao diện bài đăng (Live Preview) trên Facebook, Instagram, TikTok và Threads trước khi duyệt",
    metaTitle:
      "Xem trước bài đăng (Live Preview) Facebook, Instagram, TikTok, Threads | BrandHub",
    metaDescription:
      "Tại sao khung xem trước bài đăng (Live Social Preview) trên 4 nền tảng Facebook, Instagram, TikTok và Threads giúp Client duyệt bài nhanh gấp 3 lần?",
    category: "content-workflow-approval",
    primaryKeyword: "xem trước bài đăng facebook instagram tiktok threads",
    secondaryKeywords: [
      "mô phỏng giao diện bài đăng mạng xã hội",
      "social media post preview tool",
      "kiểm tra hiển thị ảnh và caption trước khi đăng",
      "duyệt bài trực quan cho khách hàng",
    ],
    searchIntent: "Commercial",
    targetRoles: ["Creator", "Manager", "Client"],
    relatedFrCodes: ["FR-3.6.8", "FR-3.6.9", "FR-3.6.10", "FR-3.6.19"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 8,
    author: BLOG_AUTHORS["ha-van-an"],
    coverImage:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Khung mô phỏng hiển thị bài đăng trực tiếp trên Facebook, Instagram, TikTok và Threads của BrandHub",
    geoSummary:
      "Một bài viết nhìn rất đẹp trên trang giấy trắng của trình soạn thảo văn bản nhưng khi đăng thật lên mạng xã hội lại có thể bị cắt mất dòng tiêu đề quan trọng, bị nút Xem thêm che khuất lời kêu gọi hành động hoặc bị giao diện chữ của TikTok đè lên logo thương hiệu. Tính năng xem trước bài đăng thời gian thực (Live Social Preview) trên BrandHub giải quyết triệt để vấn đề này bằng cách dựng lại chính xác khung hiển thị của cả 4 nền tảng: Facebook, Instagram, TikTok và Threads. Khi Creator gõ từng chữ hoặc thay đổi thứ tự ảnh, khung Preview cập nhật tức thì, giúp Manager và Client nhìn thấy tận mắt thành phẩm cuối cùng trước khi bấm nút phê duyệt.",
    keyTakeaways: [
      "Kiểm tra chính xác vị trí ngắt dòng 'Xem thêm' (See more) trên từng nền tảng để đặt câu Hook và CTA đúng chỗ.",
      "Soi trước bố cục bộ ảnh nhiều tấm (Carousel) và khung hình video dọc 9:16 trên TikTok, Instagram Reels.",
      "Giúp đại diện khách hàng (Client) ra quyết định duyệt bài chỉ trong vài giây vì nhìn thấy ngay giao diện thật.",
      "Chuyển đổi qua lại giữa 4 tab Facebook, Instagram, TikTok và Threads ngay trong một cửa sổ duy nhất.",
    ],
    sections: [
      {
        id: "khoang-cach-giua-file-chu-va-man-hinh-dien-thoai-thuc-te",
        heading:
          "Khoảng cách một trời một vực giữa file văn bản Word/Docs và màn hình điện thoại thực tế",
        paragraphs: [
          "Màn hình máy tính luôn đánh lừa thị giác. Đọc một đoạn văn bản trên màn hình máy tính rộng rãi rất khác với việc lướt ngón tay trên màn hình điện thoại. Trên Facebook hay Instagram, người dùng chỉ nhìn thấy 2 đến 3 dòng đầu tiên trước khi phần còn lại bị ẩn sau chữ 'Xem thêm'. Nếu Creator đặt thông tin khuyến mãi quan trọng nhất ở dòng thứ 5 mà không kiểm tra trước, tỷ lệ người dùng bỏ qua bài viết là rất cao.",
          "Với kênh TikTok và Threads, bài toán hiển thị lại càng khắt khe hơn. Chỗ trống trên màn hình rất hẹp. Trên TikTok, phần tên tài khoản và mô tả bài viết nằm đè trực tiếp lên góc dưới của video. Nếu thiết kế đặt phụ đề hoặc số điện thoại ở sát đáy khung hình, khi đăng lên sẽ bị chữ của ứng dụng che kín mít. Công sức thiết kế coi như đổ bể.",
        ],
      },
      {
        id: "trai-nghiem-khung-preview-4-nen-tang-tren-brandhub",
        heading:
          "Cách sử dụng bộ khung mô phỏng 4 nền tảng (Social Mockup Preview) trên BrandHub",
        paragraphs: [
          "Mắt thấy tai nghe mới duyệt chuẩn được. Sai sót hiển thị sẽ biến mất hoàn toàn. Ngay trong trình soạn thảo bài viết và màn hình phê duyệt của BrandHub, chúng tôi tích hợp sẵn bộ mô phỏng giao diện chuẩn xác theo đúng ngôn ngữ thiết kế của từng mạng xã hội.",
        ],
        subheadings: [
          {
            title: "1. Khung mô phỏng Facebook & Instagram",
            body: "Hiển thị đầy đủ ảnh đại diện trang, tên thương hiệu, nội dung chữ kèm hashtag nổi bật màu xanh, bố cục lưới ảnh hoặc trình phát video cùng thanh nút Thích, Bình luận, Chia sẻ giống hệt ứng dụng thật.",
          },
          {
            title: "2. Khung mô phỏng TikTok dọc chuẩn 9:16",
            body: "Tái hiện màn hình điện thoại dọc với lớp phủ thông tin tài khoản, dòng chạy tên âm thanh và cột biểu tượng tương tác bên phải. Creator nhìn vào là biết ngay vùng an toàn (Safe Zone) của video.",
          },
          {
            title: "3. Khung mô phỏng luồng thảo luận Threads",
            body: "Hiển thị đúng phong cách tối giản đặc trưng của Threads với đường kẻ nối luồng bài viết, giúp thương hiệu căn chỉnh độ dài đoạn văn ngắn gọn, súc tích.",
          },
        ],
        inlineCta: {
          badge: "DUYỆT BÀI TRỰC QUAN 4 KÊNH",
          title: "Thấy trước 100% giao diện bài đăng khi lên sóng trước khi bấm duyệt",
          description:
            "Mời khách hàng vào nghiệm thu bài viết trên khung mô phỏng sống động của Facebook, Instagram, TikTok và Threads.",
          primaryText: "Trải nghiệm trình Preview ngay",
          primaryHref: "/register",
          secondaryText: "Đăng nhập hệ thống",
          secondaryHref: "/login",
          featureHighlight: "Cập nhật thời gian thực theo từng ký tự gõ vào",
        },
      },
    ],
    faqs: [
      {
        question:
          "Khách hàng (Client) khi vào duyệt bài trên điện thoại có xem được khung Preview này không?",
        answer:
          "Có. Khung mô phỏng trên trang Phê duyệt được thiết kế tương thích hoàn toàn với cả màn hình máy tính lẫn điện thoại di động.",
      },
      {
        question:
          "Nếu một bài viết đăng cùng lúc lên cả 4 kênh thì tôi chuyển xem từng kênh thế nào?",
        answer:
          "Phía trên khung Preview có sẵn 4 nút chuyển nhanh mang biểu tượng chính thức của Facebook, Instagram, TikTok và Threads. Bạn chỉ cần chạm vào tên kênh nào là giao diện lập tức đổi sang kênh đó.",
      },
    ],
    primaryCta: {
      badge: "NÂNG TẦM CHẤT LƯỢNG XUẤT BẢN",
      title: "Chấm dứt lỗi mất chữ, che logo hay lệch khung hình khi đăng bài",
      description:
        "Đăng ký tài khoản miễn phí để sử dụng trình soạn thảo đa kênh tích hợp sẵn Live Preview trên BrandHub.",
      primaryText: "Tạo tài khoản miễn phí",
      primaryHref: "/register",
      secondaryText: "Xem lịch xuất bản đa kênh",
      secondaryHref: "/blog/lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
      featureHighlight: "Chuẩn xác cho cả ảnh đơn, bộ ảnh Carousel và Video ngắn",
    },
    relatedSlugs: [
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      "lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
      "co-che-khoa-ban-nhap-content-locking-ngan-chan-loi-sua-de-noi-dung",
    ],
  },

  // ==========================================================================
  // BÀI #023 — CATEGORY 2: QUY TRÌNH NỘI DUNG & PHÊ DUYỆT
  // ==========================================================================
  {
    id: "post-013",
    topicNumber: 23,
    slug: "kiem-duyet-noi-dung-tu-dong-compliance-check-chan-tu-cam-vi-pham",
    title:
      "Kiểm duyệt an toàn thương hiệu tự động (Check Compliance Content): Chặn từ ngữ nhạy cảm trước khi gửi Client",
    metaTitle:
      "Kiểm duyệt nội dung tự động (Compliance Check) chặn từ cấm MXH | BrandHub",
    metaDescription:
      "Cách sử dụng tính năng Check Compliance Content bằng AI để tự động phát hiện từ ngữ vi phạm chính sách cộng đồng, ngôn từ nhạy cảm trước khi xuất bản.",
    category: "content-workflow-approval",
    primaryKeyword: "kiểm duyệt nội dung vi phạm chính sách mạng xã hội",
    secondaryKeywords: [
      "danh sách từ cấm khi đăng bài facebook tiktok",
      "kiểm duyệt an toàn thương hiệu bằng ai",
      "chặn từ ngữ nhạy cảm trong content",
      "bảo vệ fanpage khỏi hạn chế tương tác",
    ],
    searchIntent: "Commercial",
    targetRoles: ["Owner", "Manager", "Creator", "Admin"],
    relatedFrCodes: ["FR-3.6.33", "FR-3.7.7", "FR-3.10.4"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 8,
    author: BLOG_AUTHORS["nguyen-thanh-loc"],
    coverImage:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Hệ thống AI quét kiểm duyệt tuân thủ an toàn nội dung cộng đồng trên trình soạn thảo BrandHub",
    geoSummary:
      "Chỉ một từ ngữ cam kết quá đà trong ngành mỹ phẩm, một cụm từ nhạy cảm vi phạm tiêu chuẩn cộng đồng hoặc một cách diễn đạt gây hiểu lầm cũng có thể khiến bài đăng trên Facebook, Instagram, TikTok và Threads bị hạn chế phân phối, thậm chí khiến kênh truyền thông của thương hiệu bị cảnh cáo. Thay vì phó mặc cho trí nhớ của từng biên tập viên, tính năng Check Compliance Content (FR-3.6.33) trên BrandHub đóng vai trò như một chốt chặn kiểm định tự động bằng AI ngay trong trình soạn thảo. Hệ thống quét toàn bộ văn bản nháp, chỉ rõ từng cụm từ có nguy cơ vi phạm an toàn cộng đồng, bạo lực hoặc ngôn từ phản cảm và gợi ý phương án viết lại an toàn trước khi bài được gửi sang cho Manager và Client.",
    keyTakeaways: [
      "Tự động rà soát các từ ngữ vi phạm tiêu chuẩn an toàn cộng đồng, ngôn từ kích động, bạo lực hoặc nhạy cảm ngay khi đang viết nháp.",
      "Bảo vệ uy tín của Agency: không bao giờ để lọt một bản nháp chứa từ cấm sang màn hình nghiệm thu của Client.",
      "Kết hợp cùng Hàng đợi kiểm duyệt (Content Moderation Queue - FR-3.10.4) ở cấp độ Admin để giữ môi trường xuất bản sạch sẽ.",
      "Tiết kiệm hàng giờ đọc soát lỗi thủ công cho đội ngũ Manager ở những chiến dịch có hàng trăm bài đăng mỗi tháng.",
    ],
    sections: [
      {
        id: "cai-gia-phai-tra-khi-de-lot-tu-ngu-vi-pham-len-kenh-chinh-thuc",
        heading:
          "Cái giá đắt đỏ khi để lọt từ ngữ nhạy cảm lên kênh truyền thông chính thức của nhãn hàng",
        paragraphs: [
          "Thuật toán quét vi phạm không chừa một ai. Các nền tảng như Facebook, Instagram, TikTok và Threads ngày càng siết chặt bộ lọc tự động đối với nội dung thương mại. Những cách viết giật tít kiểu cam kết chữa khỏi tuyệt đối, dùng từ ngữ kích động hoặc chạm vào các chủ đề nhạy cảm rất dễ bị thuật toán đánh gậy ngay khi vừa lên sóng.",
          "Đau đầu ở chỗ, không phải nhân sự Creator nào cũng thuộc lòng hàng trăm quy định an toàn cộng đồng luôn thay đổi mỗi quý. Nếu Manager cũng đọc lướt qua vì quá bận, rủi ro bài đăng bị xóa hoặc tài khoản của khách hàng bị khóa tính năng đăng bài là hoàn toàn có thật.",
        ],
      },
      {
        id: "quy-trinh-quet-compliance-2-lop-tren-brandhub",
        heading:
          "Cách hoạt động của bộ quét Check Compliance Content trên BrandHub",
        paragraphs: [
          "Để biến việc kiểm soát rủi ro thành thói quen nhẹ nhàng hàng ngày, BrandHub đặt nút kiểm tra tuân thủ ngay tại khu vực trung tâm của trình soạn thảo bài viết.",
        ],
        checklist: [
          "Bước 1: Creator hoàn thành bản thảo bài viết trên trình soạn thảo đa kênh.",
          "Bước 2: Nhấn nút Kiểm tra tuân thủ (Check Compliance Content). AI sẽ phân tích ngữ cảnh toàn bài chỉ trong vài giây.",
          "Bước 3: Nếu phát hiện từ ngữ vi phạm quy chuẩn an toàn cộng đồng, hệ thống sẽ tô sáng vị trí từ đó, giải thích rõ lý do rủi ro và đề xuất từ thay thế êm tai hơn.",
          "Bước 4: Bản nháp đạt trạng thái Xanh (An toàn) sẽ được gắn nhãn xác nhận để Manager yên tâm phê duyệt nội bộ.",
        ],
        inlineCta: {
          badge: "LÁ CHẮN AN TOÀN THƯƠNG HIỆU",
          title: "Bảo vệ kênh truyền thông của khách hàng khỏi mọi rủi ro ngôn từ",
          description:
            "Sử dụng ngay bộ công cụ kiểm duyệt tuân thủ AI tích hợp sẵn trong luồng viết bài của BrandHub.",
          primaryText: "Trải nghiệm kiểm duyệt AI ngay",
          primaryHref: "/register",
          secondaryText: "Khám phá AI Studio",
          secondaryHref: "/#ai-features",
          featureHighlight: "Quét tức thì trong 3 giây · Gợi ý cách diễn đạt thay thế an toàn",
        },
      },
    ],
    faqs: [
      {
        question:
          "Tính năng Check Compliance Content kiểm tra những nhóm rủi ro nào?",
        answer:
          "Tính năng này tập trung kiểm tra các yếu tố an toàn cộng đồng, ngôn từ nhạy cảm, phản cảm, bạo lực và sự tuân thủ quy tắc từ vựng thương hiệu trong Workspace.",
      },
      {
        question:
          "Nếu một bài viết có dấu hiệu vi phạm nghiêm trọng tiêu chuẩn nền tảng thì hệ thống xử lý sao?",
        answer:
          "Bên cạnh cảnh báo trực tiếp tại trình soạn thảo, các nội dung bị gắn cờ rủi ro cao sẽ được đưa vào Hàng đợi kiểm duyệt (Content Moderation Queue) để Admin hệ thống rà soát và ngăn chặn phát tán.",
      },
    ],
    primaryCta: {
      badge: "SÁNG TẠO AN TOÀN & CHUẨN MỰC",
      title: "Tự tin xuất bản hàng trăm bài viết mỗi tháng mà không lo vi phạm chính sách",
      description:
        "Khởi tạo Workspace miễn phí trên BrandHub để trang bị ngay bộ lọc an toàn nội dung bằng AI cho đội ngũ của bạn.",
      primaryText: "Đăng ký tài khoản miễn phí",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Kết hợp chặt chẽ giữa AI Compliance và Luồng duyệt 3 cấp",
    },
    relatedSlugs: [
      "quy-trinh-phe-duyet-noi-dung-3-cap-creator-manager-client",
      "ai-graphrag-brand-guidelines-la-gi-ung-dung-neo4j-chromadb",
      "lich-dang-bai-tu-dong-4-kenh-facebook-instagram-tiktok-threads",
    ],
  },

  // ==========================================================================
  // BÀI #036 — CATEGORY 3: GÓI TRUYỀN THÔNG & CHIẾN DỊCH
  // ==========================================================================
  {
    id: "post-014",
    topicNumber: 36,
    slug: "cach-dinh-gia-goi-truyen-thong-social-media-va-pr-bao-chi-cho-agency",
    title:
      "Hướng dẫn định giá Gói truyền thông tích hợp (Social Media + PR Báo chí + Truyền hình) đảm bảo biên lợi nhuận",
    metaTitle:
      "Cách định giá Gói truyền thông Social Media & PR Báo chí | BrandHub",
    metaDescription:
      "Phương pháp tính giá Gói truyền thông (Media Package) kết hợp sản xuất nội dung 4 kênh mạng xã hội với booking Báo chí, Truyền hình đảm bảo biên lợi nhuận cho Agency.",
    category: "media-package-campaign",
    primaryKeyword: "cách tính giá gói truyền thông marketing",
    secondaryKeywords: [
      "định giá dịch vụ agency truyền thông",
      "bảng giá gói quản lý fanpage và pr báo chí",
      "cấu trúc chi phí media package",
      "tính biên lợi nhuận dự án truyền thông",
    ],
    searchIntent: "Commercial",
    targetRoles: ["Owner", "Manager"],
    relatedFrCodes: ["FR-3.4.23", "FR-3.5.1", "FR-3.5.2", "FR-3.5.3"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 9,
    author: BLOG_AUTHORS["le-tri-trung"],
    coverImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Thiết lập cấu trúc định giá Gói truyền thông tích hợp mạng xã hội và đối tác báo đài trên BrandHub",
    geoSummary:
      "Định giá một Gói truyền thông (Media Package) là bài toán cân bằng giữa sức cạnh tranh khi đấu thầu và biên lợi nhuận ròng của Agency. Nhiều đơn vị chỉ nhẩm tính số lượng bài đăng nhân với đơn giá viết bài thô, bỏ quên chi phí giờ công họp chỉnh sửa với khách hàng, chi phí sản xuất hình ảnh/video và phí quản lý khi điều phối các đối tác Báo điện tử hoặc Đài truyền hình. Kết quả là dự án nhìn có vẻ doanh thu lớn nhưng khi quyết toán lại hòa vốn hoặc lỗ. Trên BrandHub, Owner và Manager có thể xây dựng danh mục Media Package theo công thức bóc tách rõ định mức số lượng từng nền tảng (Facebook, Instagram, TikTok, Threads) cộng với đơn giá hạng mục đối tác Báo đài, giúp kiểm soát chính xác giá vốn và báo giá minh bạch cho Client.",
    keyTakeaways: [
      "Áp dụng công thức định giá 4 tầng: Chi phí sản xuất nội dung + Chi phí công cụ & AI + Chi phí Booking đối tác thứ ba + Phí quản trị dự án (Management Fee).",
      "Phân tách rõ đơn giá giữa bài viết ảnh tĩnh, bộ ảnh nhiều tấm và video ngắn trên TikTok/Reels.",
      "Tích hợp trực tiếp đơn giá từ Danh bạ đối tác Báo chí, Truyền hình, Banner vào cấu trúc gói truyền thông.",
      "Sử dụng tính năng nhân bản gói mẫu trên BrandHub để lên báo giá mới chỉ trong 5 phút thay vì ngồi tính lại từng ô Excel.",
    ],
    sections: [
      {
        id: "3-sai-lam-khien-agency-bao-gia-thap-va-bi-hut-loi-nhuan",
        heading:
          "3 cái bẫy định giá khiến nhiều Agency làm quần quật cả tháng nhưng cuối kỳ không thấy lãi",
        paragraphs: [
          "Báo giá cảm tính là con đường ngắn nhất dẫn tới thua lỗ. Sai lầm phổ biến nhất là gộp chung mọi định dạng bài đăng vào một mức giá đồng hạng. Việc viết một bài chữ ngắn kèm tấm ảnh có sẵn trên Threads tốn ít giờ công hơn rất nhiều so với việc lên kịch bản, dựng hình và sản xuất một video ngắn cho kênh TikTok. Hai định dạng này khác hẳn nhau. Nếu bạn báo giá cào bằng, khách hàng sẽ có xu hướng yêu cầu chuyển tối đa sang các định dạng nặng đô, làm đội sản xuất quá tải.",
          "Cái bẫy thứ hai nằm ở khâu quản lý đối tác bên ngoài như đặt bài PR trên báo điện tử hoặc phát sóng truyền hình. Nhiều Agency chỉ cộng ngang giá gốc của nhà báo vào hợp đồng mà quên tính phí biên tập bài PR, phí liên hệ đặt lịch và theo dõi nghiệm thu phát sóng. Làm xong mới thấy hụt vốn.",
        ],
        comparisonTable: {
          caption:
            "Khung bóc tách cấu trúc chi phí chuẩn trong một Gói truyền thông (Media Package)",
          headers: [
            "Nhóm hạng mục trong gói",
            "Đơn vị tính chuẩn",
            "Các yếu tố cần tính đủ vào đơn giá",
          ],
          rows: [
            [
              "Tuyến bài Facebook & Threads",
              "Theo số lượng bài đăng",
              "Nghiên cứu chủ đề, viết caption, thiết kế ảnh chuẩn tỷ lệ, tối đa 2 vòng sửa",
            ],
            [
              "Tuyến bài Instagram & TikTok Video",
              "Theo bộ ảnh Carousel / Video ngắn",
              "Kịch bản phân cảnh, tạo ảnh/video AI Studio hoặc quay dựng, chỉnh sửa hậu kỳ",
            ],
            [
              "Hạng mục Báo chí & Truyền hình",
              "Theo đầu báo / Khung giờ phát sóng",
              "Đơn giá booking đối tác + Chi phí viết bài PR chuẩn báo chí + Phí điều phối",
            ],
            [
              "Phí quản trị & Báo cáo chiến dịch",
              "Theo tháng / Theo chiến dịch",
              "Thiết lập Workspace, họp định kỳ với Client, vận hành lịch đăng & báo cáo số liệu",
            ],
          ],
        },
      },
      {
        id: "cach-dung-bo-khung-media-package-chuan-tren-brandhub",
        heading:
          "Cách dựng sẵn khung định giá Media Package trên BrandHub để báo giá trong 5 phút",
        paragraphs: [
          "Con số trong báo giá phải khớp từng đồng. Không thể làm việc kiểu ước chừng mãi được. Thay vì mỗi lần có khách hàng hỏi thăm lại phải lục tìm file bảng tính cũ rồi sửa từng dòng công thức dễ nhầm lẫn, bạn có thể số hóa toàn bộ bảng giá dịch vụ của Agency ngay trên BrandHub. Mọi thao tác chỉ mất 5 phút.",
        ],
        checklist: [
          "Bước 1: Nhập sẵn danh sách các đối tác Báo điện tử, Đài truyền hình và đơn vị quảng cáo ngoài trời vào Danh bạ đối tác của Agency.",
          "Bước 2: Tạo 3 gói Media Package khung (Gói Cơ bản, Gói Tăng trưởng, Gói Toàn diện) với số lượng bài trên 4 kênh mạng xã hội được định lượng rõ.",
          "Bước 3: Khi có khách hàng mới, nhân bản gói khung sang Workspace của khách và tinh chỉnh số lượng hạng mục theo đúng nhu cầu thực tế.",
          "Bước 4: Bấm xuất liên kết chia sẻ bảo mật hoặc file PDF báo giá để gửi ngay cho khách hàng thẩm định.",
        ],
        inlineCta: {
          badge: "CHUẨN HÓA BẢNG GIÁ DỊCH VỤ",
          title: "Biến việc lập báo giá truyền thông thành lợi thế cạnh tranh của Agency",
          description:
            "Thiết lập danh mục Gói truyền thông chuyên nghiệp và đàm phán trực tuyến với khách hàng trên BrandHub.",
          primaryText: "Khởi tạo gói báo giá ngay",
          primaryHref: "/register",
          secondaryText: "Xem phân hệ Media Package",
          secondaryHref: "/#media-package",
          featureHighlight: "Tự động tính tổng ngân sách · Chuyển thẳng thành Chiến dịch",
        },
      },
    ],
    faqs: [
      {
        question:
          "Nếu khách hàng muốn giảm bớt số lượng bài TikTok để đổi sang tăng bài PR báo chí thì sửa thế nào?",
        answer:
          "Ngay trên giao diện đàm phán Media Package, Manager hoặc Client có thể điều chỉnh số lượng từng hạng mục. Hệ thống sẽ tự động tính toán lại tổng giá trị gói theo thời gian thực để hai bên thống nhất.",
      },
      {
        question:
          "Chi phí sử dụng AI để tạo ảnh và video cho khách hàng nên tính vào đâu?",
        answer:
          "Với gói Pro chỉ 590.000 VNĐ/tháng trên BrandHub, bạn đã có sẵn hạn mức AI Credits lớn và có thể mua thêm các gói nạp lẻ qua VietQR rất rẻ, giúp biên lợi nhuận khâu sản xuất hình ảnh và video của Agency tăng lên đáng kể.",
      },
    ],
    primaryCta: {
      badge: "BẢO VỆ BIÊN LỢI NHUẬN AGENCY",
      title: "Đóng gói dịch vụ bài bản, chốt hợp đồng nhanh và vận hành nhàn nhã",
      description:
        "Đăng ký tài khoản BrandHub để số hóa toàn bộ quy trình từ lập báo giá đến triển khai chiến dịch.",
      primaryText: "Đăng ký miễn phí ngay",
      primaryHref: "/register",
      secondaryText: "Xem bảng giá hệ thống",
      secondaryHref: "/#pricing",
      featureHighlight: "Tích hợp trọn vẹn Social Media & Đối tác Báo đài",
    },
    relatedSlugs: [
      "goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
      "quy-trinh-dam-phan-bao-gia-proposal-giua-agency-va-client-truc-tuyen",
      "tu-dong-chuyen-doi-goi-truyen-thong-da-chot-thanh-chien-dich-media-campaign",
    ],
  },

  // ==========================================================================
  // BÀI #037 — CATEGORY 3: GÓI TRUYỀN THÔNG & CHIẾN DỊCH
  // ==========================================================================
  {
    id: "post-015",
    topicNumber: 37,
    slug: "quy-trinh-dam-phan-bao-gia-proposal-giua-agency-va-client-truc-tuyen",
    title:
      "Số hóa quy trình gửi báo giá (Proposal) và đàm phán điều khoản gói truyền thông trực tiếp giữa Manager và Client",
    metaTitle:
      "Quy trình gửi báo giá Proposal & Đàm phán gói truyền thông | BrandHub",
    metaDescription:
      "Cách chia sẻ link báo giá Gói truyền thông không cần đăng nhập và đàm phán điều khoản 2 chiều giữa Manager và Client ngay trên nền tảng BrandHub.",
    category: "media-package-campaign",
    primaryKeyword: "quy trình gửi báo giá dịch vụ truyền thông",
    secondaryKeywords: [
      "cách gửi proposal cho khách hàng",
      "đàm phán gói truyền thông trực tuyến",
      "chia sẻ link báo giá marketing",
      "tăng tỷ lệ chốt sale cho agency",
    ],
    searchIntent: "Commercial",
    targetRoles: ["Owner", "Manager", "Client"],
    relatedFrCodes: ["FR-3.5.5", "FR-3.5.6", "FR-3.5.7", "FR-3.5.8"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 8,
    author: BLOG_AUTHORS["le-tri-trung"],
    coverImage:
      "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Luồng chia sẻ liên kết báo giá và đàm phán trực tuyến 2 chiều giữa Agency và Client trên BrandHub",
    geoSummary:
      "Khâu đàm phán báo giá (Proposal Negotiation) thường là nơi làm nguội lạnh sự hào hứng của khách hàng nhanh nhất nếu hai bên cứ phải gửi qua gửi lại hàng chục tệp đính kèm mang tên 'Bao_gia_v1', 'Bao_gia_v2_sua_ngan_sach', 'Bao_gia_final_chot.xlsx'. Khách hàng xem trên điện thoại thì chữ nhỏ li ti, còn Manager thì dễ nhầm lẫn không biết bản nào mới là bản khách vừa đồng ý. Trên BrandHub, quy trình này được thay thế bằng một liên kết chia sẻ trực tuyến (`/packages/share/:token`) kèm luồng thương lượng 2 chiều. Khách hàng mở link xem ngay không cần tạo tài khoản, để lại đề xuất điều chỉnh hạng mục trực tiếp và bấm xác nhận chốt gói chỉ trong vài thao tác.",
    keyTakeaways: [
      "Gửi báo giá bằng liên kết web tương tác hoặc xuất PDF chuẩn chỉnh thay cho các file bảng tính rời rạc.",
      "Khách hàng (ở vai trò Guest hoặc Client) mở xem được ngay trên điện thoại mà không bị vướng bước bắt buộc đăng ký tài khoản.",
      "Lưu vết toàn bộ lịch sử đề xuất tăng giảm số lượng bài viết hoặc ngân sách giữa hai bên.",
      "Rút ngắn thời gian từ lúc gửi Proposal lần đầu đến lúc chốt hợp đồng từ 2 tuần xuống còn 2 ngày.",
    ],
    sections: [
      {
        id: "tai-sao-khach-hang-ngai-doc-bao-gia-dinh-kem-qua-email",
        heading:
          "Tại sao các chủ doanh nghiệp ngày càng ngại mở những file bảng tính báo giá dài lê thê?",
        paragraphs: [
          "Phần lớn các giám đốc thương hiệu hoặc chủ doanh nghiệp rất ít khi ngồi cố định trước màn hình máy tính lớn. Họ thường tranh thủ đọc đề xuất của Agency ngay trên điện thoại trong lúc di chuyển. Một file bảng tính gồm 8 cột 40 dòng khi mở trên màn hình điện thoại sẽ buộc họ phải phóng to thu nhỏ liên tục. Trải nghiệm đọc khó chịu đó khiến họ tặc lưỡi: 'Để lúc nào về văn phòng mở máy tính xem sau'. Và thế là thương vụ bị ngâm lại cả tuần lễ.",
          "Chưa kể khi khách muốn hỏi lại một dòng nhỏ trong bảng giá, họ lại phải chụp màn hình khoanh đỏ gửi qua chat. Vài lần trao đổi như vậy là thông tin bị cắt vụn.",
        ],
      },
      {
        id: "4-buoc-dam-phan-2-chieu-tren-brandhub",
        heading:
          "4 bước đàm phán và chốt Gói truyền thông trực tuyến trên BrandHub",
        paragraphs: [
          "Chúng tôi thiết kế giao diện xem báo giá giống như một trang giới thiệu sản phẩm cao cấp, rõ ràng trên mọi kích thước màn hình.",
        ],
        checklist: [
          "Bước 1: Manager hoàn thiện cấu trúc gói truyền thông và nhấn nút Chia sẻ để lấy liên kết riêng (`/packages/share/:token`) hoặc xuất file PDF.",
          "Bước 2: Khách hàng nhấp vào liên kết để xem danh mục dịch vụ, số lượng bài đăng trên 4 mạng xã hội, danh sách đối tác báo đài và tổng chi phí.",
          "Bước 3: Nếu muốn điều chỉnh, khách hàng nhập trực tiếp đề xuất thay đổi trên màn hình. Manager nhận thông báo tức thì để cập nhật lại phương án.",
          "Bước 4: Khi hai bên thống nhất mọi điều khoản, gói truyền thông được bấm Chấp thuận và đóng dấu trạng thái sẵn sàng triển khai.",
        ],
        inlineCta: {
          badge: "CHỐT DEAL NHANH GẤP 3 LẦN",
          title: "Gửi báo giá truyền thông theo cách khiến khách hàng ấn tượng ngay từ cái nhìn đầu tiên",
          description:
            "Tạo và chia sẻ liên kết báo giá Media Package chuyên nghiệp trên BrandHub chỉ trong 2 phút.",
          primaryText: "Trải nghiệm tạo Proposal ngay",
          primaryHref: "/register",
          secondaryText: "Xem demo trên trang chủ",
          secondaryHref: "/#media-package",
          featureHighlight: "Xem mượt trên điện thoại · Không bắt khách phải đăng nhập",
        },
      },
    ],
    faqs: [
      {
        question:
          "Liên kết chia sẻ báo giá có an toàn không hay ai trên mạng cũng tìm thấy được?",
        answer:
          "Rất an toàn. Mỗi liên kết chia sẻ được bảo vệ bằng một chuỗi mã khóa (Token) ngẫu nhiên duy nhất và được gắn thẻ chặn máy tìm kiếm (`noindex`), nên chỉ những người được bạn gửi link mới mở xem được.",
      },
      {
        question:
          "Tôi có thể hủy hiệu lực của liên kết báo giá sau khi đã gửi không?",
        answer:
          "Có. Manager hoặc Owner có thể thu hồi hoặc làm mới liên kết chia sẻ bất kỳ lúc nào ngay trong phần cài đặt của gói truyền thông đó.",
      },
    ],
    primaryCta: {
      badge: "NÂNG CẤP TRẢI NGHIỆM KHÁCH HÀNG",
      title: "Biến khâu đàm phán báo giá thành bước khởi đầu suôn sẻ cho mọi dự án",
      description:
        "Khởi tạo tài khoản miễn phí trên BrandHub để bắt đầu gửi những bản Proposal trực tuyến chuyên nghiệp nhất.",
      primaryText: "Đăng ký dùng thử 0đ",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Đàm phán 2 chiều minh bạch · Xuất PDF chuẩn thương hiệu",
    },
    relatedSlugs: [
      "goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
      "cach-dinh-gia-goi-truyen-thong-social-media-va-pr-bao-chi-cho-agency",
      "tu-dong-chuyen-doi-goi-truyen-thong-da-chot-thanh-chien-dich-media-campaign",
    ],
  },

  // ==========================================================================
  // BÀI #038 — CATEGORY 3: GÓI TRUYỀN THÔNG & CHIẾN DỊCH
  // ==========================================================================
  {
    id: "post-016",
    topicNumber: 38,
    slug: "tu-dong-chuyen-doi-goi-truyen-thong-da-chot-thanh-chien-dich-media-campaign",
    title:
      "Cách biến hợp đồng gói truyền thông vừa ký thành kế hoạch chiến dịch (Media Campaign) chỉ bằng 1 cú nhấp chuột",
    metaTitle:
      "Tự động chuyển Gói truyền thông thành Chiến dịch Media Campaign | BrandHub",
    metaDescription:
      "Chấm dứt cảnh nhập liệu thủ công sau khi chốt hợp đồng. Cách BrandHub tự động chuyển đổi Gói truyền thông đã duyệt thành Media Campaign và danh sách Task.",
    category: "media-package-campaign",
    primaryKeyword: "quản lý chiến dịch truyền thông tổng thể",
    secondaryKeywords: [
      "chuyển báo giá thành kế hoạch dự án",
      "khởi tạo chiến dịch media campaign",
      "theo dõi tiến độ bàn giao bài viết",
      "bàn giao giữa sales và vận hành trong agency",
    ],
    searchIntent: "Transactional",
    targetRoles: ["Owner", "Manager", "Client"],
    relatedFrCodes: ["FR-3.5.9", "FR-3.5.10", "FR-3.5.11", "FR-3.5.12"],
    publishedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    readingTimeMinutes: 8,
    author: BLOG_AUTHORS["nguyen-chon-phuoc"],
    coverImage:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt:
      "Quy trình chuyển đổi tự động từ Media Package sang Media Campaign và phân rã công việc trên BrandHub",
    geoSummary:
      "Điểm đứt gãy lớn nhất trong quy trình vận hành Agency thường nằm ở ranh giới giữa lúc ký hợp đồng xong và lúc bắt tay vào sản xuất. Đội kinh doanh chốt một đằng, nhưng khi bàn giao sang đội sản xuất thì thông tin bị rơi rớt, dẫn đến việc làm thiếu số lượng bài video cam kết hoặc quên lịch đặt bài báo chí cho khách. Trên BrandHub, ngay khi Gói truyền thông (Media Package) được phê duyệt, hệ thống cung cấp tính năng chuyển đổi trực tiếp thành Chiến dịch truyền thông (Media Campaign - FR-3.5.9). Toàn bộ định mức số lượng bài đăng trên 4 nền tảng và danh sách đối tác báo đài trong gói sẽ tự động hóa thân thành khung theo dõi tiến độ chiến dịch mà không cần nhập tay lại một chữ nào.",
    keyTakeaways: [
      "Xóa bỏ hoàn toàn độ trễ bàn giao giữa khâu chốt báo giá và khâu triển khai sản xuất.",
      "Tự động kế thừa 100% số lượng hạng mục cam kết từ Media Package sang Media Campaign.",
      "Hiển thị thanh tiến độ hoàn thành thực tế (ví dụ: đã xuất bản 12/20 bài Facebook, 4/8 video TikTok) cho cả Manager và Client.",
      "Gắn kết toàn bộ Content Request và trạng thái làm việc với đối tác Báo đài vào chung một chiến dịch gốc.",
    ],
    sections: [
      {
        id: "noi-dau-ban-giao-hop-dong-giua-team-chot-khach-va-team-san-xuat",
        heading:
          "Tại sao khâu bàn giao sau khi ký hợp đồng luôn là nơi dễ phát sinh sai sót nhất?",
        paragraphs: [
          "Ký được hợp đồng mới chỉ là bước một. Ở nhiều công ty truyền thông, ngày ký được hợp đồng mới vừa là ngày vui nhưng cũng là ngày bắt đầu chuỗi rối rắm. Người phụ trách khách hàng phải ngồi mở bản phụ lục hợp đồng dài 5 trang ra, rồi gõ tay từng đầu việc vào bảng quản lý cho đội nội dung. Sai một con số là lệch cả tháng. Chỉ cần gõ nhầm con số 15 bài Instagram thành 12 bài, đến ngày cuối tháng khi khách hàng đối chiếu nghiệm thu, cả đội mới tá hỏa chạy bù bài trong đêm.",
          "Khi số lượng chiến dịch đang chạy cùng lúc vượt quá con số 10, việc nhớ xem chiến dịch nào còn nợ khách mấy bài video, mấy bài báo điện tử bằng trí nhớ hay bảng tính rời là điều bất khả thi. Đội ngũ rất dễ bị quá tải.",
        ],
      },
      {
        id: "co-che-1-click-campaign-conversion-tren-brandhub",
        heading:
          "Cơ chế chuyển đổi 1 chạm từ Media Package sang Media Campaign hoạt động ra sao?",
        paragraphs: [
          "Không cần nhập tay lại bất kỳ dòng nào. Trên BrandHub, dữ liệu từ lúc báo giá đến lúc xuất bản chảy xuyên suốt trên một đường ống duy nhất. Bạn chỉ cần chốt gói một lần là có ngay bộ khung vận hành.",
        ],
        checklist: [
          "1. Kích hoạt chiến dịch từ gói đã duyệt: Ngay tại màn hình Media Package đã chốt, Manager bấm nút Khởi tạo Chiến dịch.",
          "2. Tự động dựng khung định mức (Deliverables Quota): Hệ thống đọc toàn bộ số lượng bài viết của từng kênh (Facebook, Instagram, TikTok, Threads) và danh sách đối tác để tạo bảng theo dõi.",
          "3. Phân bổ phiếu giao việc (Content Request): Manager giao từng cụm bài viết cho đội ngũ Creator gắn trực tiếp với mã chiến dịch đó.",
          "4. Tự động cộng dồn tiến độ: Mỗi khi một bài viết thuộc chiến dịch được duyệt và đăng thành công, thanh tiến độ của Media Campaign tự động nhảy số cập nhật theo thời gian thực.",
        ],
        inlineCta: {
          badge: "VẬN HÀNH CHIẾN DỊCH KHÉP KÍN",
          title: "Không bao giờ giao thiếu bài hay trễ hạn nghiệm thu với khách hàng",
          description:
            "Trải nghiệm luồng chuyển đổi tự động từ Gói truyền thông sang Chiến dịch thực thi trên BrandHub.",
          primaryText: "Khởi tạo Chiến dịch đầu tiên",
          primaryHref: "/register",
          secondaryText: "Tìm hiểu thêm về Media Package",
          secondaryHref: "/#media-package",
          featureHighlight: "Đồng bộ định mức tự động · Báo cáo tiến độ trực quan cho Client",
        },
      },
    ],
    faqs: [
      {
        question:
          "Trong quá trình chạy chiến dịch, nếu khách hàng mua bổ sung thêm hạng mục thì có cập nhật được không?",
        answer:
          "Hoàn toàn được. Manager có thể cập nhật thông tin chiến dịch và tạo thêm các Content Request hoặc thêm đối tác truyền thông mới vào chiến dịch đang chạy.",
      },
      {
        question:
          "Khách hàng (Client) có tự vào xem tiến độ chiến dịch đã chạy được bao nhiêu phần trăm không?",
        answer:
          "Có. Khi đăng nhập vào Workspace, Client nhìn thấy ngay biểu đồ tiến độ hoàn thành của từng hạng mục trong Media Campaign mà không cần phải nhắn tin hỏi Manager mỗi tuần.",
      },
    ],
    primaryCta: {
      badge: "TỰ ĐỘNG HÓA QUẢN TRỊ DỰ ÁN",
      title: "Nối liền mạch từ bản báo giá đến từng bài đăng thực tế trên mạng xã hội",
      description:
        "Đăng ký tài khoản miễn phí để quản lý trọn vẹn vòng đời chiến dịch truyền thông trên BrandHub.",
      primaryText: "Tạo tài khoản miễn phí ngay",
      primaryHref: "/register",
      secondaryText: "Đăng nhập hệ thống",
      secondaryHref: "/login",
      featureHighlight: "Quản lý tập trung 100% đầu việc & Đối tác chiến dịch",
    },
    relatedSlugs: [
      "goi-truyen-thong-media-package-la-gi-cach-xay-dung-bao-gia",
      "quy-trinh-dam-phan-bao-gia-proposal-giua-agency-va-client-truc-tuyen",
      "quan-ly-du-an-truyen-thong-agency-nhu-jira-notion-voi-brandhub",
    ],
  },
];
