import { useTranslation } from "react-i18next";
import { Sparkles, Trash2 } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Ambassador, AmbassadorStatus } from "../types/ambassador";

const STATUS_BADGE_VARIANT: Record<AmbassadorStatus, BadgeProps["variant"]> = {
  TRAINING: "PENDING_REVIEW",
  READY: "PUBLISHED",
  FAILED: "FAILED",
};

export interface AmbassadorCardProps {
  ambassador: Ambassador;
  onGenerateVideo: (ambassador: Ambassador) => void;
  onDelete: (id: string) => void;
}

export function AmbassadorCard({
  ambassador,
  onGenerateVideo,
  onDelete,
}: AmbassadorCardProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs">
      <div className="flex items-center gap-3">
        <img
          src={ambassador.faceImageUrl}
          alt={ambassador.name}
          className="border-border size-14 shrink-0 rounded-full border object-cover"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-foreground truncate text-sm font-semibold">
            {ambassador.name}
          </h3>
          <Badge variant={STATUS_BADGE_VARIANT[ambassador.status]}>
            {t(`aiStudio.ambassadors.status.${ambassador.status}`)}
          </Badge>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        {t("aiStudio.ambassadors.videosGenerated", {
          count: ambassador.videosGenerated,
        })}
      </p>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="orange"
          className="flex-1 gap-1.5 text-xs"
          disabled={ambassador.status !== "READY"}
          onClick={() => onGenerateVideo(ambassador)}
        >
          <Sparkles className="size-3.5" />
          {t("aiStudio.ambassadors.generateVideo")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={() => onDelete(ambassador.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default AmbassadorCard;
