import { Clapperboard, Image, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SocialPlatform } from "@/types/editor";
import { AIGeneratePanel } from "./AIGeneratePanel";
import { AIImageStudioPanel } from "./AIImageStudioPanel";
import { AIVideoAssistPanel } from "./AIVideoAssistPanel";
import { AiCreditNotice } from "@/pages/editor/components/AiCreditNotice";

interface ContentCreatorAiPanelProps {
  topic: string;
  targetPlatforms: SocialPlatform[];
  referenceMediaUrls: string[];
  onApplyText: (caption: string, hashtags: string[], imageUrl?: string) => void;
  onApplyImage: (imageUrl: string, s3Key?: string) => void;
  onApplyVideo: (videoUrl: string, s3Key?: string) => void;
}

export function ContentCreatorAiPanel({
  topic,
  targetPlatforms,
  referenceMediaUrls,
  onApplyText,
  onApplyImage,
  onApplyVideo,
}: ContentCreatorAiPanelProps) {
  const { t } = useTranslation();

  return (
    <section aria-label={t("editor.studio.aiPanelLabel")}>
      <AiCreditNotice />
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="border-border bg-muted/95 sticky top-0 z-30 grid h-10 w-full grid-cols-3 border p-1 shadow-sm backdrop-blur">
          <TabsTrigger
            value="text"
            className="text-muted-foreground hover:text-foreground data-[state=active]:bg-brand-orange text-xs font-medium transition-colors data-[state=active]:font-semibold data-[state=active]:text-white [&_svg]:data-[state=active]:text-white"
          >
            <Sparkles className="size-3.5" />
            {t("editor.studio.tabs.text")}
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="text-muted-foreground hover:text-foreground data-[state=active]:bg-brand-orange text-xs font-medium transition-colors data-[state=active]:font-semibold data-[state=active]:text-white [&_svg]:data-[state=active]:text-white"
          >
            <Image className="size-3.5" />
            {t("editor.studio.tabs.image")}
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="text-muted-foreground hover:text-foreground data-[state=active]:bg-brand-orange text-xs font-medium transition-colors data-[state=active]:font-semibold data-[state=active]:text-white [&_svg]:data-[state=active]:text-white"
          >
            <Clapperboard className="size-3.5" />
            {t("editor.studio.tabs.video")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-3">
          <AIGeneratePanel
            topic={topic}
            targetPlatforms={targetPlatforms}
            showImageTools={false}
            onApplyAIResult={onApplyText}
          />
        </TabsContent>
        <TabsContent value="image" className="mt-3">
          <AIImageStudioPanel
            referenceMediaUrls={referenceMediaUrls}
            onApplyImage={onApplyImage}
          />
        </TabsContent>
        <TabsContent value="video" className="mt-3">
          <AIVideoAssistPanel
            referenceMediaUrls={referenceMediaUrls}
            onApplyVideo={onApplyVideo}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
