/**
 * Dữ liệu bài viết mẫu cho 4 mini-post ở 4 góc cinematic hero.
 * Mỗi platform có 3 slide xoay vòng — nội dung mô phỏng bài đăng thật
 * từ agency owner, content creator, brand client trên mạng xã hội.
 *
 * Text (caption/content/comment) không hardcode ở đây — chỉ giữ i18n KEY,
 * bản dịch thật nằm trong locales/{vi,en}.json dưới `landing.heroFeed.*`.
 * Số liệu (like, comment, share) dựa trên engagement thực tế của
 * từng nền tảng: TikTok cao nhất (thuật toán đề xuất nội dung mới),
 * Instagram trung bình-cao, Facebook trung bình, LinkedIn thấp nhất
 * nhưng chất lượng tương tác cao hơn.
 */
export interface FeedSlideBase {
  likesSeed: number;
  commentsLabel: string;
  /** Ảnh/video thumbnail cho bài đăng — dùng ảnh thật từ Picsum Photos. */
  imageUrl: string;
}

// ── Instagram ─────────────────────────────────────────────────────

export interface InstagramSlide extends FeedSlideBase {
  captionKey: string;
}

export const instagramFeed: InstagramSlide[] = [
  {
    captionKey: "landing.heroFeed.instagram.0.caption",
    likesSeed: 3847,
    commentsLabel: "218",
    imageUrl: "https://picsum.photos/seed/content-workflow/600/600",
  },
  {
    captionKey: "landing.heroFeed.instagram.1.caption",
    likesSeed: 5620,
    commentsLabel: "403",
    imageUrl: "https://picsum.photos/seed/creative-studio/600/600",
  },
  {
    captionKey: "landing.heroFeed.instagram.2.caption",
    likesSeed: 2190,
    commentsLabel: "127",
    imageUrl: "https://picsum.photos/seed/branding-workspace/600/600",
  },
];

// ── TikTok ─────────────────────────────────────────────────────────

export interface TikTokSlide extends FeedSlideBase {
  captionKey: string;
  sharesLabel: string;
}

export const tiktokFeed: TikTokSlide[] = [
  {
    captionKey: "landing.heroFeed.tiktok.0.caption",
    likesSeed: 84700,
    commentsLabel: "2.4K",
    sharesLabel: "16.8K",
    imageUrl: "https://picsum.photos/seed/social-phone/280/498",
  },
  {
    captionKey: "landing.heroFeed.tiktok.1.caption",
    likesSeed: 62300,
    commentsLabel: "1.8K",
    sharesLabel: "11.2K",
    imageUrl: "https://picsum.photos/seed/tech-dashboard/280/498",
  },
  {
    captionKey: "landing.heroFeed.tiktok.2.caption",
    likesSeed: 51200,
    commentsLabel: "1.3K",
    sharesLabel: "9.6K",
    imageUrl: "https://picsum.photos/seed/team-collaboration/280/498",
  },
];

// ── Facebook ───────────────────────────────────────────────────────

export interface FacebookSlide extends FeedSlideBase {
  authorNameKey: string;
  authorRoleKey: string;
  contentKey: string;
  sharesLabel: string;
}

export const facebookFeed: FacebookSlide[] = [
  {
    authorNameKey: "landing.heroFeed.facebook.0.authorName",
    authorRoleKey: "landing.heroFeed.facebook.0.authorRole",
    contentKey: "landing.heroFeed.facebook.0.content",
    likesSeed: 3200,
    commentsLabel: "486",
    sharesLabel: "127",
    imageUrl: "https://picsum.photos/seed/agency-workspace/800/400",
  },
  {
    authorNameKey: "landing.heroFeed.facebook.1.authorName",
    authorRoleKey: "landing.heroFeed.facebook.1.authorRole",
    contentKey: "landing.heroFeed.facebook.1.content",
    likesSeed: 1850,
    commentsLabel: "267",
    sharesLabel: "58",
    imageUrl: "https://picsum.photos/seed/beauty-products/800/400",
  },
  {
    authorNameKey: "landing.heroFeed.facebook.2.authorName",
    authorRoleKey: "landing.heroFeed.facebook.2.authorRole",
    contentKey: "landing.heroFeed.facebook.2.content",
    likesSeed: 4710,
    commentsLabel: "632",
    sharesLabel: "215",
    imageUrl: "https://picsum.photos/seed/campaign-dashboard/800/400",
  },
];

// ── LinkedIn ───────────────────────────────────────────────────────

export interface LinkedInSlide extends FeedSlideBase {
  authorNameKey: string;
  authorTitleKey: string;
  contentKey: string;
  articleHeadlineKey: string;
}

export const linkedinFeed: LinkedInSlide[] = [
  {
    authorNameKey: "landing.heroFeed.linkedin.0.authorName",
    authorTitleKey: "landing.heroFeed.linkedin.0.authorTitle",
    contentKey: "landing.heroFeed.linkedin.0.content",
    articleHeadlineKey: "landing.heroFeed.linkedin.0.articleHeadline",
    likesSeed: 1247,
    commentsLabel: "89",
    imageUrl: "https://picsum.photos/seed/corporate-meeting/800/400",
  },
  {
    authorNameKey: "landing.heroFeed.linkedin.1.authorName",
    authorTitleKey: "landing.heroFeed.linkedin.1.authorTitle",
    contentKey: "landing.heroFeed.linkedin.1.content",
    articleHeadlineKey: "landing.heroFeed.linkedin.1.articleHeadline",
    likesSeed: 876,
    commentsLabel: "54",
    imageUrl: "https://picsum.photos/seed/data-analytics/800/400",
  },
  {
    authorNameKey: "landing.heroFeed.linkedin.2.authorName",
    authorTitleKey: "landing.heroFeed.linkedin.2.authorTitle",
    contentKey: "landing.heroFeed.linkedin.2.content",
    articleHeadlineKey: "landing.heroFeed.linkedin.2.articleHeadline",
    likesSeed: 1530,
    commentsLabel: "112",
    imageUrl: "https://picsum.photos/seed/global-business/800/400",
  },
];

// ── Ghost commenter — người dùng giả lập gõ bình luận (CursorGhost) ──

export interface GhostCommenter {
  nameKey: string;
  /** @handle cho IG/TikTok — không dịch (username giả). */
  handle: string;
  initials: string;
  avatarGradient: string;
}

export const GHOST_COMMENTERS: GhostCommenter[] = [
  {
    nameKey: "landing.heroFeed.commenters.0.name",
    handle: "thuha.beauty",
    initials: "TH",
    avatarGradient: "from-pink-400 to-rose-500",
  },
  {
    nameKey: "landing.heroFeed.commenters.1.name",
    handle: "ducanh.media",
    initials: "ĐA",
    avatarGradient: "from-blue-400 to-indigo-500",
  },
  {
    nameKey: "landing.heroFeed.commenters.2.name",
    handle: "khuept",
    initials: "MK",
    avatarGradient: "from-emerald-400 to-teal-500",
  },
  {
    nameKey: "landing.heroFeed.commenters.3.name",
    handle: "huy.agency",
    initials: "QH",
    avatarGradient: "from-amber-400 to-orange-500",
  },
  {
    nameKey: "landing.heroFeed.commenters.4.name",
    handle: "baotran.cx",
    initials: "BT",
    avatarGradient: "from-violet-400 to-purple-500",
  },
];

/**
 * Headline nghề nghiệp dùng riêng cho LinkedIn (song song GHOST_COMMENTERS
 * theo index) — LinkedIn luôn hiện chức danh dưới tên, không dùng @handle.
 */
export const GHOST_HEADLINE_KEYS = [
  "landing.heroFeed.commenters.0.headline",
  "landing.heroFeed.commenters.1.headline",
  "landing.heroFeed.commenters.2.headline",
  "landing.heroFeed.commenters.3.headline",
  "landing.heroFeed.commenters.4.headline",
];

// Mỗi platform 1 giọng điệu bình luận khác nhau — đúng văn hoá nền tảng.

/** Instagram: casual, emoji, câu ngắn. */
export const IG_GHOST_COMMENT_KEYS = [
  "landing.heroFeed.ghostComments.ig.0",
  "landing.heroFeed.ghostComments.ig.1",
  "landing.heroFeed.ghostComments.ig.2",
  "landing.heroFeed.ghostComments.ig.3",
  "landing.heroFeed.ghostComments.ig.4",
];

/** TikTok: viết tắt, gen-Z, cảm thán mạnh. */
export const TT_GHOST_COMMENT_KEYS = [
  "landing.heroFeed.ghostComments.tt.0",
  "landing.heroFeed.ghostComments.tt.1",
  "landing.heroFeed.ghostComments.tt.2",
  "landing.heroFeed.ghostComments.tt.3",
  "landing.heroFeed.ghostComments.tt.4",
];

/** Facebook: câu dài, hỏi cụ thể, giọng thân mật đời thường. */
export const FB_GHOST_COMMENT_KEYS = [
  "landing.heroFeed.ghostComments.fb.0",
  "landing.heroFeed.ghostComments.fb.1",
  "landing.heroFeed.ghostComments.fb.2",
  "landing.heroFeed.ghostComments.fb.3",
];

/** LinkedIn: formal, chuyên môn, hỏi sâu về số liệu/case study. */
export const LI_GHOST_COMMENT_KEYS = [
  "landing.heroFeed.ghostComments.li.0",
  "landing.heroFeed.ghostComments.li.1",
  "landing.heroFeed.ghostComments.li.2",
  "landing.heroFeed.ghostComments.li.3",
];
