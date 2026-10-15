import type { PlatformType } from "@/types/calendar";
import type { PostPreviewData } from "@/types/preview";
import { FacebookMockup } from "./mockups/FacebookMockup";
import { InstagramMockup } from "./mockups/InstagramMockup";
import { TikTokMockup } from "./mockups/TikTokMockup";
import { ThreadsMockup } from "./mockups/ThreadsMockup";

interface PlatformMockupProps {
  platform: PlatformType;
  data: PostPreviewData;
}

const MOCKUP_BY_PLATFORM: Record<
  PlatformType,
  React.FC<{ data: PostPreviewData }>
> = {
  FACEBOOK: FacebookMockup,
  INSTAGRAM: InstagramMockup,
  TIKTOK: TikTokMockup,
  THREADS: ThreadsMockup,
};

export function PlatformMockup({ platform, data }: PlatformMockupProps) {
  const Mockup = MOCKUP_BY_PLATFORM[platform];
  return <Mockup data={data} />;
}
