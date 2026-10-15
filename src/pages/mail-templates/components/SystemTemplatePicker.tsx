import { useState } from "react";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { adminMailTemplateService } from "../services/mailTemplateService";
import type { MailTemplateSummary } from "../types";
import { htmlToPlainText } from "../utils";

interface Props {
  /** Receives the chosen template subject and its body as plain text (Broadcast is plain text). */
  onPick: (subject: string, text: string) => void;
}

/** Admin Broadcast helper (FR 3.10.1, DA-1259): copies a system template into the compose form. */
export function SystemTemplatePicker({ onPick }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MailTemplateSummary[] | null>(null);
  const [loading, setLoading] = useState(false);

  const show = async () => {
    setOpen(true);
    setLoading(true);
    try {
      setItems((await adminMailTemplateService.list({ size: 100 })).content);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const choose = async (row: MailTemplateSummary) => {
    const full = await adminMailTemplateService.get(row.id);
    onPick(full.subject, htmlToPlainText(full.bodyHtml));
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => void show()}>
        <FileText className="size-3.5" />
        {t("mailTemplate.picker.button")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("mailTemplate.picker.title")}</DialogTitle>
            <DialogDescription>{t("mailTemplate.picker.hint")}</DialogDescription>
          </DialogHeader>
          {loading && <Spinner />}
          {!loading && items && items.length === 0 && (
            <p className="text-muted-foreground text-sm">{t("mailTemplate.picker.empty")}</p>
          )}
          <ul className="space-y-2">
            {(items ?? []).map((row) => (
              <li key={row.id}>
                <button type="button" onClick={() => void choose(row)}
                  className="hover:bg-muted/50 w-full rounded border p-3 text-left">
                  <span className="block font-medium">{row.name}</span>
                  <span className="text-muted-foreground block truncate text-xs">{row.subject}</span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
