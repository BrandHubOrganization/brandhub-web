import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  emptyLayout,
  parseLayout,
  renderLayoutPreview,
  serializeLayout,
  validateBlocks,
} from "@/pages/mail-templates/blocks";
import {
  clearDraft,
  loadDraft,
  saveDraft,
} from "@/pages/mail-templates/drafts";
import { analyzeVariables } from "@/pages/mail-templates/utils";
import { errorCode } from "@/services/adminRevenueService";
import type { MailBlock, MailLocale } from "@/pages/mail-templates/blocks";
import type {
  MailAttachment,
  MailTemplate,
  MailTemplateScope,
  TemplatePayload,
} from "@/pages/mail-templates/types";

export interface FormAdapter {
  save: (
    payload: TemplatePayload,
    existing: MailTemplate | null,
  ) => Promise<MailTemplate>;
  uploadAttachment?: (file: File) => Promise<MailAttachment>;
  scopes: MailTemplateScope[];
  agencyId?: string;
}

export interface UseMailTemplateFormParams {
  template: MailTemplate | null;
  mode: "create" | "edit";
  adapter: FormAdapter;
  onClose: () => void;
  onSaved: (template: MailTemplate) => void;
  draftKey?: string;
}

interface Draft {
  name: string;
  subject: string;
  layoutJson: string;
  scope?: MailTemplateScope;
}

const MAX_ATTACHMENTS = 3;

export function useMailTemplateForm({
  template,
  mode,
  adapter,
  onClose,
  onSaved,
  draftKey,
}: UseMailTemplateFormParams) {
  const { t } = useTranslation();
  const resumable = mode === "create" && !template && !!draftKey;
  const [restored] = useState<Draft | null>(() =>
    resumable ? loadDraft<Draft>(draftKey!) : null,
  );
  const [name, setName] = useState(restored?.name ?? template?.name ?? "");
  const [subject, setSubject] = useState(
    restored?.subject ?? template?.subject ?? "",
  );
  const [initialLayout] = useState(() =>
    parseLayout(restored?.layoutJson ?? template?.layoutJson),
  );
  const [blocks, setBlocks] = useState<MailBlock[]>(initialLayout.blocks);
  const [locale, setLocale] = useState<MailLocale>(
    initialLayout.locale ?? "vi",
  );
  const [scope, setScope] = useState<MailTemplateScope>(
    restored?.scope && adapter.scopes.includes(restored.scope)
      ? restored.scope
      : (template?.scope ?? adapter.scopes[0]),
  );
  const [showRestored, setShowRestored] = useState(!!restored);
  const isLegacy =
    mode === "edit" &&
    !!template &&
    !template.layoutJson &&
    !!template.bodyHtml;
  const [attachments, setAttachments] = useState<MailAttachment[]>(
    template?.attachments ?? [],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const layoutJson = useMemo(
    () => serializeLayout({ version: 1, locale, blocks }),
    [locale, blocks],
  );
  const previewHtml = useMemo(
    () => renderLayoutPreview(blocks, locale),
    [blocks, locale],
  );
  const blockErrors = useMemo(() => validateBlocks(blocks), [blocks]);
  const analysis = useMemo(
    () => analyzeVariables(subject, previewHtml),
    [subject, previewHtml],
  );
  const dirty =
    mode === "edit"
      ? name !== (template?.name ?? "") ||
        subject !== (template?.subject ?? "") ||
        layoutJson !== serializeLayout(parseLayout(template?.layoutJson))
      : !!(name || subject || blocks.length);

  useEffect(() => {
    if (!resumable || !dirty) return;
    const timer = window.setTimeout(
      () => saveDraft<Draft>(draftKey!, { name, subject, layoutJson, scope }),
      600,
    );
    return () => window.clearTimeout(timer);
  }, [resumable, dirty, draftKey, name, subject, layoutJson, scope]);

  const discardDraft = () => {
    if (draftKey) clearDraft(draftKey);
    setName("");
    setSubject("");
    setBlocks(emptyLayout().blocks);
    setShowRestored(false);
  };

  const requestClose = () => {
    if (busy) return;
    if (dirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    onClose();
  };

  const fail = (e: unknown) => {
    const code = errorCode(e);
    const message = t(`mailTemplate.errors.${code}`, {
      defaultValue: t("mailTemplate.errors.generic"),
    });
    setError(message);
    toast.error(message);
  };

  const submit = async () => {
    if (
      !name.trim() ||
      !subject.trim() ||
      blocks.length === 0 ||
      Object.keys(blockErrors).length > 0
    ) {
      setError(t("mailTemplate.errors.VALIDATION_ERROR"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload: TemplatePayload = {
        name: name.trim(),
        subject: subject.trim(),
        layoutJson,
        ...(mode === "create"
          ? {
              scope,
              ...(adapter.agencyId ? { agencyId: adapter.agencyId } : {}),
            }
          : {}),
        ...(adapter.uploadAttachment
          ? { attachmentIds: attachments.map((a) => a.attachmentId) }
          : {}),
      };
      if (mode === "create" && template) payload.cloneFromId = template.id;
      const saved = await adapter.save(
        payload,
        mode === "edit" ? template : null,
      );
      if (draftKey) clearDraft(draftKey);
      toast.success(t("mailTemplate.form.saved"));
      onSaved(saved);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const addAttachment = async (file: File) => {
    if (!adapter.uploadAttachment) return;
    if (attachments.length >= MAX_ATTACHMENTS) {
      setError(t("mailTemplate.form.maxFiles", { count: MAX_ATTACHMENTS }));
      return;
    }
    try {
      const uploaded = await adapter.uploadAttachment(file);
      setAttachments((current) => [...current, uploaded]);
    } catch (e) {
      fail(e);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((current) =>
      current.filter((x) => x.attachmentId !== attachmentId),
    );
  };

  return {
    name,
    setName,
    subject,
    setSubject,
    blocks,
    setBlocks,
    locale,
    setLocale,
    scope,
    setScope,
    attachments,
    addAttachment,
    removeAttachment,
    showRestored,
    discardDraft,
    busy,
    error,
    isLegacy,
    previewHtml,
    blockErrors,
    analysis,
    discardConfirmOpen,
    setDiscardConfirmOpen,
    requestClose,
    submit,
  };
}
