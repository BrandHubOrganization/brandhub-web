import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { PartnerContactFields, CONTACT_FIELD_CONFIG } from "./PartnerContactFields";
import {
  PARTNER_TYPES,
  type DirectoryPartner,
  type PartnerFields,
  type CollaboratorType,
} from "../types";
import { contactError } from "../contactValidation";
import {
  Building2,
  FileText,
  Check,
  Newspaper,
  Image as ImageIcon,
  Tv,
  Layers,
} from "lucide-react";

interface Props {
  partner: DirectoryPartner | null;
  busy: boolean;
  onClose: () => void;
  onSave: (fields: PartnerFields) => Promise<boolean>;
}

const PARTNER_TYPE_ICONS: Record<CollaboratorType, React.ReactNode> = {
  NEWSPAPER: <Newspaper className="size-4 shrink-0" />,
  BANNER: <ImageIcon className="size-4 shrink-0" />,
  TV: <Tv className="size-4 shrink-0" />,
  OTHER: <Layers className="size-4 shrink-0" />,
};

export function PartnerForm({ partner, busy, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(partner?.partnerName ?? "");
  const [type, setType] = useState<CollaboratorType>(partner?.partnerType ?? "NEWSPAPER");
  const [notes, setNotes] = useState(partner?.notes ?? "");
  const [contact, setContact] = useState<Record<string, unknown>>(partner?.contactInfo ?? {});
  const [failed, setFailed] = useState(false);
  const [touched, setTouched] = useState<string[]>([]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFailed(false);
    setTouched(CONTACT_FIELD_CONFIG.map((f) => f.field));
    if (CONTACT_FIELD_CONFIG.some((f) => contactError(f.field, contact[f.field]))) return;
    if (
      await onSave({
        partnerName: name.trim(),
        partnerType: type,
        contactInfo: contact,
        notes,
      })
    ) {
      onClose();
    } else {
      setFailed(true);
    }
  }

  const partnerTypeOptions: SelectMenuOption[] = PARTNER_TYPES.map((pt) => ({
    value: pt,
    label: t(`campaign.partners.types.${pt}`),
    icon: PARTNER_TYPE_ICONS[pt],
  }));

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="border-border/80 flex max-h-[88vh] flex-col overflow-hidden rounded-2xl border p-0 shadow-2xl sm:max-w-xl">
        {/* Fixed Header */}
        <DialogHeader className="border-border/60 shrink-0 border-b px-6 py-4 pr-12 text-left">
          <DialogTitle className="text-lg font-bold">
            {t(partner ? "collaborators.edit" : "collaborators.create")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {t("collaborators.formHint")}
          </DialogDescription>
        </DialogHeader>

        {/* Modal Form with Scrollable Body and Fixed Footer */}
        <form
          onSubmit={(event) => void submit(event)}
          className="flex flex-1 flex-col overflow-hidden min-h-0"
        >
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            {failed && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {t("collaborators.error")}
              </p>
            )}

            {/* Name & Type 2-column responsive layout */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Input
                label={t("collaborators.name")}
                iconPrefix={<Building2 className="size-4 shrink-0" />}
                value={name}
                required
                maxLength={255}
                disabled={busy}
                placeholder={t("collaborators.name")}
                onChange={(event) => setName(event.target.value)}
              />

              <div className="space-y-1.5">
                <Label className="flex items-center gap-0.5 text-xs font-semibold tracking-wide">
                  <span>{t("collaborators.type")}</span>
                  <span className="text-destructive ml-0.5 font-bold" aria-hidden="true">*</span>
                </Label>
                <SelectMenu
                  ariaLabel={t("collaborators.type")}
                  value={type}
                  onChange={(val) => setType(val as CollaboratorType)}
                  options={partnerTypeOptions}
                  disabled={busy}
                  className="h-9 w-full"
                />
              </div>
            </div>

            {/* Contact fields 2-column responsive layout */}
            <PartnerContactFields
              contact={contact}
              touched={touched}
              busy={busy}
              onBlur={(f) => setTouched((prev) => (prev.includes(f) ? prev : [...prev, f]))}
              onChange={(f, val) => setContact((prev) => ({ ...prev, [f]: val }))}
            />

            {/* Notes with Rich Text */}
            <div className="space-y-1.5">
              <RichTextInput
                id="partner-notes"
                label={
                  <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide">
                    <FileText className="text-muted-foreground size-3.5 shrink-0" />
                    <span>{t("collaborators.notes")}</span>
                  </span>
                }
                value={notes}
                disabled={busy}
                placeholder={t("collaborators.notes")}
                onChange={(html) => setNotes(html)}
              />
            </div>
          </div>

          {/* Fixed Footer Actions */}
          <div className="border-border/60 shrink-0 border-t bg-muted/20 px-6 py-3.5 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              {t("collaborators.close")}
            </Button>
            <Button
              type="submit"
              variant="orange"
              loading={busy}
              disabled={busy || !name.trim()}
              className="min-w-28 shadow-xs"
            >
              {!busy && <Check className="mr-1.5 size-4" />}
              {t(busy ? "collaborators.saving" : "collaborators.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
