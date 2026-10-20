import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface ApplyHashtagToPostButtonProps {
  workspaceId: string;
  tag: string;
  isRequired: boolean;
}

export function ApplyHashtagToPostButton({
  workspaceId,
  tag,
  isRequired,
}: ApplyHashtagToPostButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const prefix = "hashtagGroups.collection.";

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isRequired}
      aria-label={
        isRequired
          ? t(prefix + "campaignApplyUnavailable")
          : t(prefix + "applyToPost", { tag })
      }
      onClick={() =>
        navigate(`/workspaces/${workspaceId}/editor`, {
          state: { prefilledHashtags: [`#${tag}`] },
        })
      }
    >
      {t(prefix + "applyToPostShort")}
    </Button>
  );
}
