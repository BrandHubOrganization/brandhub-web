import type { Post, PostStatus, PlatformTarget, MediaType } from "@/types/post";

let idCounter = 100;

function makePost(
  id: string,
  title: string,
  status: PostStatus,
  platformTargets: PlatformTarget[],
  scheduledAt?: string,
  publishedAt?: string,
): Post {
  return {
    id,
    workspaceId: "ws-1",
    clientId: "client-1",
    title,
    caption: `${title} — nội dung mẫu cho bài đăng này.`,
    hashtags: ["#brandhub", "#marketing"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    ],
    mediaType: "IMAGE" as MediaType,
    platformTargets,
    status,
    scheduledAt,
    publishedAt,
    createdBy: "user-1",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  };
}

const MOCK_POSTS: Post[] = [
  makePost(
    "post-1",
    "Ra mắt sản phẩm mới",
    "SCHEDULED",
    [{ platform: "FACEBOOK", postType: "FEED", optimizedCaption: "" }],
    "2026-08-25T09:00:00Z",
  ),
  makePost(
    "post-2",
    "Khuyến mãi cuối tuần",
    "PUBLISHED",
    [
      { platform: "INSTAGRAM", postType: "FEED", optimizedCaption: "" },
      { platform: "FACEBOOK", postType: "FEED", optimizedCaption: "" },
    ],
    undefined,
    "2026-08-20T10:00:00Z",
  ),
  makePost(
    "post-3",
    "Video giới thiệu thương hiệu",
    "FAILED",
    [{ platform: "TIKTOK", postType: "VIDEO", optimizedCaption: "" }],
    "2026-08-19T14:00:00Z",
  ),
  makePost(
    "post-4",
    "Bài viết chia sẻ kiến thức",
    "SCHEDULED",
    [{ platform: "THREADS", postType: "TEXT", optimizedCaption: "" }],
    "2026-08-27T08:00:00Z",
  ),
  makePost(
    "post-5",
    "Thông báo sự kiện Zalo OA",
    "PUBLISHED",
    [{ platform: "ZALO_OA", postType: "ARTICLE", optimizedCaption: "" }],
    undefined,
    "2026-08-15T07:30:00Z",
  ),
  makePost(
    "post-6",
    "Clip Youtube tổng kết tháng",
    "FAILED",
    [{ platform: "YOUTUBE", postType: "VIDEO", optimizedCaption: "" }],
    "2026-08-18T16:00:00Z",
  ),
  makePost(
    "post-7",
    "Chiến dịch đa nền tảng Q3",
    "SCHEDULED",
    [
      { platform: "FACEBOOK", postType: "FEED", optimizedCaption: "" },
      { platform: "INSTAGRAM", postType: "FEED", optimizedCaption: "" },
      { platform: "TIKTOK", postType: "VIDEO", optimizedCaption: "" },
    ],
    "2026-08-30T09:00:00Z",
  ),
  makePost("post-8", "Draft bài viết mùa lễ hội", "DRAFT", [
    { platform: "FACEBOOK", postType: "FEED", optimizedCaption: "" },
  ]),
];

export async function getScheduledPosts(): Promise<Post[]> {
  return Promise.resolve(MOCK_POSTS.map((p) => ({ ...p })));
}

export interface CreatePostInput {
  title: string;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  platformTargets: PlatformTarget[];
  scheduledAt?: string;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const post = makePost(
    `post-${idCounter++}`,
    input.title,
    input.scheduledAt ? "SCHEDULED" : "DRAFT",
    input.platformTargets,
    input.scheduledAt,
  );
  post.caption = input.caption;
  post.hashtags = input.hashtags;
  post.mediaUrls = input.mediaUrls.length ? input.mediaUrls : post.mediaUrls;
  MOCK_POSTS.unshift(post);
  return Promise.resolve({ ...post });
}

export async function retryPost(id: string): Promise<Post> {
  const post = MOCK_POSTS.find((p) => p.id === id);
  if (!post) throw new Error("Post not found");
  post.status = "SCHEDULED";
  post.scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  return Promise.resolve({ ...post });
}
