import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  clientHashtagPurposes,
  hashtagPurposes,
} from "@/pages/hashtag-groups/types/hashtag";
import type { CreateHashtag } from "@/pages/hashtag-groups/types/hashtag";
import { hashtagErrorKey } from "@/pages/hashtag-groups/services/hashtagService";
import { useHashtagCampaigns } from "@/pages/hashtag-groups/hooks/useHashtagCampaigns";

interface Props {
  onClose: () => void;
  onSubmit: (payload: CreateHashtag) => Promise<void>;
  pending: boolean;
  error: unknown;
  workspaceId: string;
  canRequire: boolean;
  initialTag?: string;
}
export function AddHashtagDialog({
  onClose,
  onSubmit,
  pending,
  error,
  workspaceId,
  canRequire,
  initialTag = "",
}: Props) {
  const { t } = useTranslation();
  const [tag, setTag] = useState(initialTag);
  const [purpose, setPurpose] = useState<CreateHashtag["purpose"]>("BRAND");
  const [campaignId, setCampaignId] = useState("");
  const isEventSpecific = canRequire && purpose === "EVENT_SPECIFIC";
  const campaigns = useHashtagCampaigns(workspaceId, isEventSpecific);
  const prefix = "hashtagGroups.collection.";
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>{t(prefix + "add")}</DialogTitle>
          <DialogDescription>{t(prefix + "description")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit({
              tag,
              purpose,
              isRequired: isEventSpecific,
              campaignId: isEventSpecific ? campaignId : null,
            });
          }}
        >
          <Input
            label={t(prefix + "tag")}
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            required
            maxLength={101}
            disabled={pending}
            autoFocus
          />
          <div className="space-y-2">
            <Label htmlFor="hashtag-purpose">{t(prefix + "purpose")}</Label>
            <Select
              id="hashtag-purpose"
              value={purpose}
              disabled={pending}
              onChange={(event) => {
                const selected = (
                  canRequire ? clientHashtagPurposes : hashtagPurposes
                ).find((value) => value === event.target.value);
                if (selected) {
                  setPurpose(selected);
                  setCampaignId("");
                }
              }}
            >
              {(canRequire ? clientHashtagPurposes : hashtagPurposes).map(
                (value) => (
                  <option key={value} value={value}>
                    {t(prefix + "purposes." + value)}
                  </option>
                ),
              )}
            </Select>
          </div>
          {isEventSpecific && (
            <div className="space-y-2">
              <Label htmlFor="hashtag-campaign">{t(prefix + "campaign")}</Label>
              <Select
                id="hashtag-campaign"
                value={campaignId}
                disabled={pending || campaigns.isPending}
                onChange={(event) => setCampaignId(event.target.value)}
                required
              >
                <option value="">{t(prefix + "selectCampaign")}</option>
                {campaigns.data?.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
              {campaigns.isError && (
                <p role="alert" className="text-destructive text-sm">
                  {t(prefix + "campaignLoadError")}
                </p>
              )}
              {campaigns.data?.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  {t(prefix + "noCampaigns")}
                </p>
              )}
            </div>
          )}
          {error != null && (
            <p role="alert" className="text-destructive text-sm">
              {t(prefix + hashtagErrorKey(error, "saveError"))}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              {t(prefix + "cancel")}
            </Button>
            <Button
              type="submit"
              loading={pending}
              disabled={
                pending ||
                !tag.trim() ||
                (isEventSpecific &&
                  (!campaignId || campaigns.isError || !campaigns.data?.length))
              }
            >
              {t(prefix + "save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
