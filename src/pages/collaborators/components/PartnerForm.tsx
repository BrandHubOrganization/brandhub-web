import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PARTNER_TYPES, type DirectoryPartner, type PartnerFields, type CollaboratorType } from "../types";
import { contactError } from "../contactValidation";

interface Props {
  partner: DirectoryPartner | null;
  busy: boolean;
  onClose: () => void;
  onSave: (fields: PartnerFields) => Promise<boolean>;
}
const CONTACT_FIELDS = ["contactName", "email", "phone", "website"] as const;
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
    setTouched([...CONTACT_FIELDS]);
    if (CONTACT_FIELDS.some(field => contactError(field, contact[field]))) return;
    if (await onSave({ partnerName: name.trim(), partnerType: type, contactInfo: contact, notes })) onClose();
    else setFailed(true);
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>{t(partner ? "collaborators.edit" : "collaborators.create")}</DialogTitle>
        <DialogDescription>{t("collaborators.formHint")}</DialogDescription></DialogHeader>
      <form onSubmit={event => void submit(event)} className="space-y-4">
        {failed && <p role="alert" className="text-sm text-destructive">{t("collaborators.error")}</p>}
        <Input label={t("collaborators.name")} value={name} required maxLength={255} disabled={busy}
          onChange={event => setName(event.target.value)} />
        <div className="space-y-2"><Label htmlFor="partner-type">{t("collaborators.type")}</Label>
          <Select id="partner-type" value={type} disabled={busy}
            onChange={event => setType(event.target.value as CollaboratorType)}>
            {PARTNER_TYPES.map(value => <option key={value} value={value}>{t(`campaign.partners.types.${value}`)}</option>)}
          </Select></div>
        <div className="grid gap-4 sm:grid-cols-2">{CONTACT_FIELDS.map(field => <div key={field}><Input
          label={t(`collaborators.${field}`)} disabled={busy}
          maxLength={field === "phone" ? 40 : field === "website" ? 2048 : 255}
          onBlur={() => setTouched(previous => previous.includes(field) ? previous : [...previous, field])}
          error={touched.includes(field) && contactError(field, contact[field]) ? t(contactError(field, contact[field])!) : undefined}
          aria-describedby={touched.includes(field) && contactError(field, contact[field]) ? `partner-${field}-error` : undefined}
          type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
          value={typeof contact[field] === "string" ? contact[field] as string : ""}
          onChange={event => setContact(previous => ({ ...previous, [field]: event.target.value }))} />
          {touched.includes(field) && contactError(field, contact[field]) && <span id={`partner-${field}-error`} className="sr-only">
            {t(contactError(field, contact[field])!)}
          </span>}</div>)}</div>
        <div className="space-y-2"><Label htmlFor="partner-notes">{t("collaborators.notes")}</Label>
          <Textarea id="partner-notes" value={notes} maxLength={10000} disabled={busy}
            onChange={event => setNotes(event.target.value)} /></div>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>
          {t("collaborators.close")}</Button><Button type="submit" disabled={busy || !name.trim()}>
          {t(busy ? "collaborators.saving" : "collaborators.save")}</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
