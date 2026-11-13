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
        media.materialId
          ? { materialId: media.materialId, mediaType: media.mediaType }
          : media.s3Key
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
export function postInputWithMaterial(
  post: PostResponse,
  materialId: string,
  mediaType: "IMAGE" | "VIDEO",
): SavePostInput {
  const input = postInput(draftFromPost(post));
  return { ...input, media: [...input.media, { materialId, mediaType }] };
}
export function taskEditorError(error: unknown) {
  const response = (
    error as { response?: { data?: { error?: { code?: string } } } }
  )?.response;
  return response?.data?.error?.code || "TASK_STORAGE_UNAVAILABLE";
}

export type PostPart = "CAPTION" | "MEDIA" | "CHANNELS";
const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Post parts that differ from the saved copy; mirrors backend `TaskPostService.changedSections`. */
export function changedPostParts(
  saved: TaskPostDraft,
  draft: TaskPostDraft,
): PostPart[] {
  const parts: PostPart[] = [];
  if (saved.caption !== draft.caption || !same(saved.hashtags, draft.hashtags))
    parts.push("CAPTION");
  if (
    !same(saved.mediaUrls, draft.mediaUrls) ||
    !same(saved.storedMedia, draft.storedMedia)
  )
    parts.push("MEDIA");
  if (!same(saved.targetPlatforms, draft.targetPlatforms))
    parts.push("CHANNELS");
  return parts;
}

/** Section key of a post part: POST.CAPTION / VIDEO.CAPTION…; media of a short video is `VIDEO.EDIT`. */
export function postPartKey(
  sections: { key: string }[],
  part: PostPart,
): string | undefined {
  const video = sections.some((s) => s.key.startsWith("VIDEO."));
  if (video) return part === "MEDIA" ? "VIDEO.EDIT" : `VIDEO.${part}`;
  return `POST.${part}`;
}
