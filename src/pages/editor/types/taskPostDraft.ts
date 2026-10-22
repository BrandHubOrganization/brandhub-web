import type {
  PostResponse,
  SavePostInput,
  SavePostMedia,
} from "@/services/postService";
import type { SocialPlatform } from "@/types/editor";

export type StoredMedia = Record<string, SavePostMedia>;
export interface TaskPostDraft {
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  storedMedia: StoredMedia;
  targetPlatforms: SocialPlatform[];
  aiGenerated: boolean;
}

export function emptyTaskDraft(): TaskPostDraft {
  return {
    caption: "",
    hashtags: [],
    mediaUrls: [],
    storedMedia: {},
    targetPlatforms: ["FACEBOOK"],
    aiGenerated: false,
  };
}
export function draftFromPost(post: PostResponse): TaskPostDraft {
  return {
    caption: post.caption,
    hashtags: post.hashtags,
    mediaUrls: post.media.map((media) => media.url),
    storedMedia: Object.fromEntries(
      post.media.map((media) => [
        media.url,
        media.s3Key
          ? { s3Key: media.s3Key, mediaType: media.mediaType }
          : {
              externalUrl: media.externalUrl || media.url,
              mediaType: media.mediaType,
            },
      ]),
    ),
    targetPlatforms: post.targetPlatforms,
    aiGenerated: post.aiGenerated,
  };
}
export function postInput(draft: TaskPostDraft): SavePostInput {
  const media = draft.mediaUrls.map(
    (url) =>
      draft.storedMedia[url] || {
        externalUrl: url,
        mediaType: /\.mp4(?:$|\?)/i.test(url)
          ? ("VIDEO" as const)
          : ("IMAGE" as const),
      },
  );
  return {
    caption: draft.caption,
    hashtags: draft.hashtags,
    media,
    targetPlatforms: draft.targetPlatforms,
    aiGenerated: draft.aiGenerated,
  };
}
export function taskEditorError(error: unknown) {
  const response = (
    error as { response?: { data?: { error?: { code?: string } } } }
  )?.response;
  return response?.data?.error?.code || "TASK_STORAGE_UNAVAILABLE";
}
