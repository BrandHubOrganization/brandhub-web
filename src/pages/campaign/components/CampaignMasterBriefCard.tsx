import { useEffect, useState } from "react";
import { Bot, Copy, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusMark } from "@/components/micro";
import {
  RichTextContent,
  RichTextInput,
  stripRichTextHtml,
} from "@/components/ui/rich-text-input";
import { buildAiPromptFromBrief } from "@/pages/campaign/utils/campaignBrief";

export function CampaignMasterBriefCard({
  campaignName,
  generatedBrief,
  updatedAt,
  editable,
  busy,
  onGenerate,
  onChange,
}: {
  campaignName: string;
  generatedBrief: string;
  updatedAt?: string;
  editable: boolean;
  busy: boolean;
  onGenerate: () => void;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const hasBrief = Boolean(stripRichTextHtml(generatedBrief));
  const [justGenerated, setJustGenerated] = useState(false);

  useEffect(() => {
    if (!justGenerated) return;
    const timer = window.setTimeout(() => setJustGenerated(false), 1800);
    return () => window.clearTimeout(timer);
  }, [justGenerated]);

  async function copyText(text: string, messageKey: string) {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t(messageKey));
    } catch {
      toast.error(t("campaign.timeline.saveFailed"));
    }
  }

  return (
    <div className="border-brand-orange/45 bg-brand-orange-soft/30 space-y-2.5 rounded-lg border p-3 lg:col-span-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-brand-orange flex size-6 items-center justify-center rounded-md text-white shadow-2xs">
            <Sparkles className="size-3.5" />
          </span>
          <span className="text-brand-orange text-xs font-bold">
            {t("campaign.brief.sections.generatedMasterBrief")}
          </span>
          {updatedAt && (
            <span className="text-muted-foreground text-[11px]">
              ({new Date(updatedAt).toLocaleString()})
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {hasBrief && (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 gap-1 px-2.5 text-xs"
                onClick={() =>
                  void copyText(
                    stripRichTextHtml(generatedBrief),
                    "campaign.brief.copiedClient",
                  )
                }
              >
                <Copy className="size-3" />
                <span>{t("campaign.brief.copyClientBrief")}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 h-7 gap-1 px-2.5 text-xs font-semibold"
                onClick={() =>
                  void copyText(
                    buildAiPromptFromBrief(campaignName, generatedBrief, t),
                    "campaign.brief.copiedAi",
                  )
                }
              >
                <Bot className="size-3" />
                <span>{t("campaign.brief.copyAiPrompt")}</span>
              </Button>
            </>
          )}
          {editable && (
            <Button
              type="button"
              size="sm"
              variant="orange"
              disabled={busy}
              className="h-7 gap-1.5 px-3 text-xs font-semibold shadow-xs"
              onClick={() => {
                onGenerate();
                setJustGenerated(true);
              }}
            >
              {busy ? (
                <StatusMark state="saving" tone="white" size="xs" />
              ) : justGenerated ? (
                <StatusMark state="success" tone="white" size="xs" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              <span>
                {hasBrief
                  ? t("campaign.brief.regenerateBrief")
                  : t("campaign.brief.generateBrief")}
              </span>
            </Button>
          )}
        </div>
      </div>

      {editable ? (
        <RichTextInput
          id="brief-generated-master"
          value={generatedBrief}
          onChange={onChange}
          placeholder={t("campaign.brief.generatedPlaceholder")}
          editorClassName="bg-background min-h-44 max-h-96 overflow-y-auto px-4 py-3 text-xs leading-relaxed"
        />
      ) : hasBrief ? (
        <div className="border-border/80 bg-background rounded-lg border px-4 py-3 text-xs leading-relaxed shadow-2xs">
          <RichTextContent value={generatedBrief} />
        </div>
      ) : (
        <p className="text-muted-foreground text-xs italic">
          {t("campaign.brief.generatedPlaceholder")}
        </p>
      )}
    </div>
  );
}
