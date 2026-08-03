/**
 * Dữ liệu bài viết mẫu cho 4 mini-post ở 4 góc cinematic hero.
 * Mỗi platform có 3 slide xoay vòng — nội dung mô phỏng bài đăng thật
 * từ agency owner, content creator, brand client trên mạng xã hội.
 *
 * Số liệu (like, comment, share) dựa trên engagement thực tế của
 * từng nền tảng: TikTok cao nhất (thuật toán đề xuất nội dung mới),
 * Instagram trung bình-cao, Facebook trung bình, LinkedIn thấp nhất
 * nhưng chất lượng tương tác cao hơn.
 *
 * Nguồn cảm hứng: case study thật từ ColdIQ, Emplifi, Buffer,
 * ContentStudio, Loomly, Vista Social (TrustRadius), HubSpot 2026
 * Instagram Marketing Report.
 */
export interface FeedSlideBase {
  likesSeed: number;
  commentsLabel: string;
  /** Ảnh/video thumbnail cho bài đăng — dùng ảnh thật từ Picsum Photos. */
  imageUrl: string;
}

// ── Instagram ─────────────────────────────────────────────────────

export interface InstagramSlide extends FeedSlideBase {
  caption: string;
}

export const instagramFeed: InstagramSlide[] = [
  {
    caption:
      "Từ 3 tiếng xuống 15 phút cho 1 bài đăng. Không filter, không màu mè — chỉ là workflow thực tế của team mình sau 2 tháng dùng BrandHub. Lên lịch 1 tuần content trong 1 buổi sáng. Cái cảm giác không còn phải thức khuya lên bài nữa nó nhẹ cả người.",
    likesSeed: 3847,
    commentsLabel: "218",
    imageUrl: "https://picsum.photos/seed/content-workflow/600/600",
  },
  {
    caption:
      "Swipe để xem bảng so sánh trước/sau khi chuyển từ 5 công cụ rời rạc về 1 nền tảng duy nhất. 3 tháng, 247 bài đăng, 0 missed deadline. Cột 'sai format' và 'đăng nhầm giờ' giờ là chuyện quá khứ. Team 4 người quản lý 12 brand cùng lúc.",
    likesSeed: 5620,
    commentsLabel: "403",
    imageUrl: "https://picsum.photos/seed/creative-studio/600/600",
  },
  {
    caption:
      "Caption này được AI viết trong 30 giây — nhưng quan trọng hơn là nó match đúng tone giọng brand mình. BrandHub AI Assistant giờ hiểu cả cách mình dùng emoji, cách xuống dòng, cả mấy từ 'kiểu kiểu' mình hay dùng. Cứ như có thêm 1 copywriter trong team vậy.",
    likesSeed: 2190,
    commentsLabel: "127",
    imageUrl: "https://picsum.photos/seed/branding-workspace/600/600",
  },
];

// ── TikTok ─────────────────────────────────────────────────────────

export interface TikTokSlide extends FeedSlideBase {
  caption: string;
  sharesLabel: string;
}

export const tiktokFeed: TikTokSlide[] = [
  {
    caption:
      "POV: bạn vừa phát hiện ra 1 tool tự động hóa toàn bộ content calendar cho 5 nền tảng chỉ trong 1 click. Team content từ 6 người xuống 3. Sếp không còn hỏi 'bài đăng đâu' mỗi sáng nữa.",
    likesSeed: 84700,
    commentsLabel: "2.4K",
    sharesLabel: "16.8K",
    imageUrl: "https://picsum.photos/seed/social-phone/280/498",
  },
  {
    caption:
      "1 công cụ thay thế Canva + Google Calendar + Trello + Google Drive + Messenger. Nghe ảo nhưng thật. Đây là stack thực tế team mình dùng để quản lý 8 client cùng lúc. Ai bảo agency lúc nào cũng hỗn loạn?",
    likesSeed: 62300,
    commentsLabel: "1.8K",
    sharesLabel: "11.2K",
    imageUrl: "https://picsum.photos/seed/tech-dashboard/280/498",
  },
  {
    caption:
      "React cùng team content tụi mình khi nhận brief 5 campaign Tết cùng 1 lúc. Có BrandHub Calendar nên kéo thả 15 phút xong lịch, không phải ngồi Excel 3 tiếng như năm ngoái. Mọi người hỏi nhiều quá nên tụi mình làm clip này.",
    likesSeed: 51200,
    commentsLabel: "1.3K",
    sharesLabel: "9.6K",
    imageUrl: "https://picsum.photos/seed/team-collaboration/280/498",
  },
];

// ── Facebook ───────────────────────────────────────────────────────

export interface FacebookSlide extends FeedSlideBase {
  authorName: string;
  authorRole: string;
  content: string;
  sharesLabel: string;
}

export const facebookFeed: FacebookSlide[] = [
  {
    authorName: "Minh Nguyễn",
    authorRole: "Founder & Creative Director, Bloom Digital Agency",
    content:
      "Sau 4 tháng dùng BrandHub cho toàn bộ operation của agency, đây là con số thật: 12 client, 3 content writer, 247 bài đăng/tháng, 0 trễ deadline. Trước đây team mình dùng 5 công cụ khác nhau — Canva để design, Google Sheets để tracking, Trello để assign task, Drive để duyệt bài, Messenger để feedback. Mỗi lần 1 bài đi từ idea đến published là 3-4 ngày. Giờ tất cả trong 1 tab. Cái mình thích nhất là approval workflow: client vào duyệt bài ngay trên nền tảng, không còn cái cảnh screenshot bài đăng gửi qua Messenger rồi 'anh ơi duyệt giúp em'. Ai làm agency sẽ hiểu cảm giác này.",
    likesSeed: 3200,
    commentsLabel: "486",
    sharesLabel: "127",
    imageUrl: "https://picsum.photos/seed/agency-workspace/800/400",
  },
  {
    authorName: "Thu Hà",
    authorRole: "Owner, TheCosmos Beauty",
    content:
      "Brand nhỏ không có team content riêng. 1 mình mình vừa chụp ảnh, viết caption, đăng bài, trả lời comment. Trước khi biết BrandHub, mỗi ngày mất 3-4 tiếng cho social — giờ còn 30 phút. AI viết caption theo đúng giọng brand (mình dùng tiếng Việt là chính, BrandHub AI hỗ trợ tiếng Việt rất tốt, không bị kiểu dịch word-by-word như mấy tool khác). Calendar kéo thả trực quan, nhìn 1 cái biết ngay tuần này đăng gì. Doanh thu online tăng 40% trong 2 tháng đầu, không phải vì mình giỏi hơn mà vì có thời gian tập trung vào sản phẩm thay vì mắc kẹt với content.",
    likesSeed: 1850,
    commentsLabel: "267",
    sharesLabel: "58",
    imageUrl: "https://picsum.photos/seed/beauty-products/800/400",
  },
  {
    authorName: "Đức Anh",
    authorRole: "COO, NextGen Media Group",
    content:
      "Quản lý chiến dịch Tết 2026 cho 5 brand cùng lúc với team 8 người. Nếu không có BrandHub, chắc mình đã không sống sót qua tháng 1. Tính năng cross-platform publishing giúp 1 bài đăng đi 5 kênh (FB, IG, TT, LI, X) chỉ với 1 cú click. Content calendar cho phép nhìn toàn cảnh tất cả campaign trên 1 màn hình — phát hiện ngay được lỗi trùng giờ, trùng nội dung. Team mình tăng 240% output, giảm 80% thời gian họp duyệt bài. ROI đo được: tiết kiệm ~$3,200/tháng chi phí công cụ + nhân sự.",
    likesSeed: 4710,
    commentsLabel: "632",
    sharesLabel: "215",
    imageUrl: "https://picsum.photos/seed/campaign-dashboard/800/400",
  },
];

// ── LinkedIn ───────────────────────────────────────────────────────

export interface LinkedInSlide extends FeedSlideBase {
  authorName: string;
  authorTitle: string;
  content: string;
  articleHeadline: string;
}

export const linkedinFeed: LinkedInSlide[] = [
  {
    authorName: "Linh Phạm",
    authorTitle: "Head of Marketing, Unilever Vietnam",
    content:
      "Sau 6 tháng triển khai BrandHub cho team marketing 25 người, chúng tôi đã tăng 240% output content trong khi giảm 80% thời gian approval. Trước đây quy trình duyệt 1 bài đăng qua 4 cấp mất trung bình 3.2 ngày — giờ còn 4 giờ. Đây là case study chi tiết về cách chúng tôi chuyển đổi từ manual workflow sang AI-assisted content operations mà vẫn giữ được brand safety và compliance.",
    articleHeadline:
      "How We Scaled Content Operations 3x Without Adding Headcount — A Unilever Vietnam Case Study",
    likesSeed: 1247,
    commentsLabel: "89",
    imageUrl: "https://picsum.photos/seed/corporate-meeting/800/400",
  },
  {
    authorName: "James Tran",
    authorTitle: "VP Growth, Nimbus Group",
    content:
      "Chúng tôi đã evaluate 4 nền tảng content management (BrandHub, ContentStudio, Loomly, Vista Social) trong 3 tháng trước khi quyết định. Tiêu chí: multi-brand support, AI writing quality, approval workflow, cross-platform publishing, pricing. BrandHub thắng ở 4/5 tiêu chí. Đây là breakdown chi tiết từng nền tảng — không sponsored, chỉ là kinh nghiệm thực tế của team growth.",
    articleHeadline:
      "We Evaluated 4 Content Platforms Over 90 Days — Here's Our Scorecard",
    likesSeed: 876,
    commentsLabel: "54",
    imageUrl: "https://picsum.photos/seed/data-analytics/800/400",
  },
  {
    authorName: "Sarah Chen",
    authorTitle: "Content Operations Lead, Zalora Group",
    content:
      "Quản lý content cho 6 thị trường Đông Nam Á, mỗi thị trường 1 ngôn ngữ, 1 bộ brand guideline riêng — đó là bài toán chúng tôi đối mặt mỗi ngày. BrandHub giải quyết được 3 điểm đau lớn nhất: (1) centralized content calendar cho phép regional team nhìn thấy toàn bộ campaign từ Singapore HQ, (2) AI localization giúp dịch + điều chỉnh tone cho từng thị trường trong vài phút thay vì vài ngày, (3) approval workflow phân quyền theo region — market lead duyệt local content, regional director duyệt campaign lớn. Kết quả: time-to-market giảm 65%, content consistency score tăng từ 6.2 lên 8.9/10.",
    articleHeadline:
      "Managing Content Across 6 Markets, 6 Languages: Our BrandHub Playbook",
    likesSeed: 1530,
    commentsLabel: "112",
    imageUrl: "https://picsum.photos/seed/global-business/800/400",
  },
];

// ── Ghost commenter — người dùng giả lập gõ bình luận (CursorGhost) ──

export interface GhostCommenter {
  name: string;
  /** @handle cho IG/TikTok, headline nghề nghiệp cho LinkedIn. */
  handle: string;
  initials: string;
  avatarGradient: string;
}

export const GHOST_COMMENTERS: GhostCommenter[] = [
  {
    name: "Thu Hà",
    handle: "thuha.beauty",
    initials: "TH",
    avatarGradient: "from-pink-400 to-rose-500",
  },
  {
    name: "Đức Anh",
    handle: "ducanh.media",
    initials: "ĐA",
    avatarGradient: "from-blue-400 to-indigo-500",
  },
  {
    name: "Minh Khuê",
    handle: "khuept",
    initials: "MK",
    avatarGradient: "from-emerald-400 to-teal-500",
  },
  {
    name: "Quang Huy",
    handle: "huy.agency",
    initials: "QH",
    avatarGradient: "from-amber-400 to-orange-500",
  },
  {
    name: "Bảo Trân",
    handle: "baotran.cx",
    initials: "BT",
    avatarGradient: "from-violet-400 to-purple-500",
  },
];

/**
 * Headline nghề nghiệp dùng riêng cho LinkedIn (song song GHOST_COMMENTERS
 * theo index) — LinkedIn luôn hiện chức danh dưới tên, không dùng @handle.
 */
export const GHOST_HEADLINES = [
  "Marketing Manager tại Beauty Co.",
  "Founder, Agency nhỏ 5 người",
  "Content Lead, E-commerce startup",
  "Freelance Social Media Strategist",
  "Growth Marketer, SaaS B2B",
];

// Mỗi platform 1 giọng điệu bình luận khác nhau — đúng văn hoá nền tảng.

/** Instagram: casual, emoji, câu ngắn. */
export const IG_GHOST_COMMENTS = [
  "Cho mình xin tên tool với ạ 🙏",
  "Đẹp quá, mình cũng đang cần cái này 😍",
  "Team mình y chang luôn, cứu cánh thật sự",
  "Có link dùng thử không bạn ơi?",
  "Auto follow luôn, quá hay 🔥",
];

/** TikTok: viết tắt, gen-Z, cảm thán mạnh. */
export const TT_GHOST_COMMENTS = [
  "real quá 😭 team mình y chang",
  "chỗ nào mua v ạ",
  "cứu tui với, đúng nỗi đau luôn",
  "video này nên viral hơn nữa 🔥",
  "team content xem cái này đi ạ",
];

/** Facebook: câu dài, hỏi cụ thể, giọng thân mật đời thường. */
export const FB_GHOST_COMMENTS = [
  "Anh cho em hỏi giá gói cho agency 5 người là bao nhiêu vậy ạ? Bên em đang tìm giải pháp tương tự.",
  "Đọc xong thấy đúng vấn đề của team mình luôn, để mình tìm hiểu thêm xem sao.",
  "Team bên chị dùng được mấy tháng rồi, hiệu quả thật chứ không phải quảng cáo đâu mọi người.",
  "Cảm ơn bài chia sẻ chi tiết, đúng cái mình đang tìm kiếm cho quý sau.",
];

/** LinkedIn: formal, chuyên môn, hỏi sâu về số liệu/case study. */
export const LI_GHOST_COMMENTS = [
  "Con số ấn tượng. Anh/chị có thể chia sẻ thêm về quy trình migration không?",
  "Case study rất hữu ích. Team mình đang cân nhắc giải pháp tương tự cho quý tới.",
  "Đây đúng là bài toán nhiều team marketing đang gặp phải. Cảm ơn đã chia sẻ chi tiết.",
  "Insight rất giá trị, đặc biệt phần về approval workflow. Sẽ áp dụng thử.",
];
