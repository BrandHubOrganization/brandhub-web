import axios from "axios";
import { api } from "@/lib/axios";
import type { SocialPlatform } from "@/types/editor";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: unknown };
}

interface ContentResponse {
  text?: string;
  caption?: string;
  hashtags?: string[];
}

export interface GeneratedPostContent {
  caption: string;
  hashtags: string[];
}

export interface AmbassadorPreset {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export interface AmbassadorImageResponse {
  image_url: string;
  s3_key?: string;
  image_type: "ambassador" | "character_sheet";
  seed_used?: number;
  inference_time_ms?: number;
  model_name?: string;
  panel_count?: number;
}

export interface CommercialImageResponse {
  generation_id: string;
  status: "completed" | "failed";
  image_url?: string;
  s3_key?: string;
  aspect_ratio: string;
  width: number;
  height: number;
  seed_used: number;
}

export interface VideoGenerateResponse {
  job_id: string;
  status: "PENDING";
  estimated_wait_seconds: number;
}

export interface VideoStatusResponse {
  job_id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  video_url?: string;
  s3_key?: string;
  error_code?: string;
  error_message?: string;
}

const AI_ASSET_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_AI_ASSET_BASE_URL) ||
  "http://localhost:8082";

export function resolveAiAssetUrl(url: string): string {
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url;
  return `${AI_ASSET_BASE_URL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export async function imageSourceToDataUrl(source: string): Promise<string> {
  if (source.startsWith("data:")) return source;
  const response = await axios.get(resolveAiAssetUrl(source), {
    responseType: "blob",
  });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Không thể đọc ảnh tham chiếu"));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Không thể đọc ảnh"));
    reader.readAsDataURL(response.data);
  });
}

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.error?.message || "AI_SERVICE_ERROR");
  }
  return response.data.data;
}

export const aiGenerationService = {
  async generatePost(input: {
    prompt: string;
    topic?: string;
    tone: string;
    platforms: SocialPlatform[];
    feedback?: string;
    previousCaption?: string;
    hashtagCount?: number;
  }): Promise<GeneratedPostContent> {
    const topic = [
      input.topic,
      input.prompt,
      input.feedback ? `Phản hồi cần áp dụng: ${input.feedback}` : "",
      input.previousCaption
        ? `Nội dung trước cần cải thiện: ${input.previousCaption}`
        : "",
      input.hashtagCount
        ? `Tạo khoảng ${input.hashtagCount} hashtag phù hợp.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await api.post<ApiResponse<ContentResponse>>(
      "/api/v1/ai/content/generate",
      {
        topic,
        tone: input.tone,
        platforms: input.platforms,
      },
    );
    const result = unwrap(response);
    return {
      caption: result.caption || result.text || "",
      hashtags: (result.hashtags || [])
        .slice(0, input.hashtagCount)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
    };
  },

  async listAmbassadorPresets(): Promise<AmbassadorPreset[]> {
    const response = await api.get<ApiResponse<AmbassadorPreset[]>>(
      "/api/v1/ai/ambassadors/presets",
    );
    return unwrap(response).map((preset) => ({
      ...preset,
      image_url: resolveAiAssetUrl(preset.image_url),
    }));
  },

  async generateAmbassador(input: {
    prompt: string;
  }): Promise<AmbassadorImageResponse> {
    const response = await api.post<ApiResponse<AmbassadorImageResponse>>(
      "/api/v1/ai/ambassadors/generate",
      {
        prompt: input.prompt,
      },
    );
    const result = unwrap(response);
    return { ...result, image_url: resolveAiAssetUrl(result.image_url) };
  },

  async generateCharacterSheet(input: {
    referenceImage?: string;
    referenceS3Key?: string;
    presetId?: string;
    name?: string;
  }): Promise<AmbassadorImageResponse> {
    const response = await api.post<ApiResponse<AmbassadorImageResponse>>(
      "/api/v1/ai/ambassadors/character-sheet",
      {
        reference_image: input.referenceImage,
        reference_s3_key: input.referenceS3Key,
        preset_id: input.presetId,
        name: input.name || "BrandHub Ambassador",
      },
    );
    const result = unwrap(response);
    return { ...result, image_url: resolveAiAssetUrl(result.image_url) };
  },

  async generateCommercialImage(input: {
    prompt: string;
    aspectRatio: "1:1" | "4:5" | "9:16" | "16:9";
    productReferenceImage: string;
    ambassador:
      | { source: "preset"; preset_id: string; reference_images: [] }
      | { source: "custom"; reference_images: [string] };
  }): Promise<CommercialImageResponse> {
    const response = await api.post<ApiResponse<CommercialImageResponse>>(
      "/api/v1/ai/image/commercial/generate",
      {
        prompt: input.prompt,
        aspect_ratio: input.aspectRatio,
        product_reference_image: input.productReferenceImage,
        ambassador: input.ambassador,
      },
    );
    const result = unwrap(response);
    return {
      ...result,
      image_url: result.image_url
        ? resolveAiAssetUrl(result.image_url)
        : undefined,
    };
  },

  async generateVideo(input: {
    prompt: string;
    clientId: string;
  }): Promise<VideoGenerateResponse> {
    const response = await api.post<ApiResponse<VideoGenerateResponse>>(
      "/api/v1/ai/video/generate",
      {
        prompt: input.prompt,
        client_id: input.clientId,
        mode: "TEXT_TO_VIDEO",
        aspect_ratio: "16:9",
        duration_seconds: 8,
      },
    );
    return unwrap(response);
  },

  async getVideoStatus(jobId: string): Promise<VideoStatusResponse> {
    const response = await api.get<ApiResponse<VideoStatusResponse>>(
      `/api/v1/ai/video/${encodeURIComponent(jobId)}/status`,
    );
    const result = unwrap(response);
    return {
      ...result,
      video_url: result.video_url
        ? resolveAiAssetUrl(result.video_url)
        : undefined,
    };
  },
};
