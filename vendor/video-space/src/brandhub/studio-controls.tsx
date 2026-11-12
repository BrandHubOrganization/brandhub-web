import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CloudUpload, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useEditor } from "@/editor/use-editor";
import { getHostContext, subscribeHostContext } from "@/platform/host";
import { saveToServer } from "./sync";
import { assistantMessages } from "./studio-messages";
import { AutoEditChat } from "./auto-edit-chat";

export function StudioControls() {
  const projectId = useEditor((editor) => editor.project.getActiveOrNull()?.metadata.id);
  return <ProjectStudioControls key={projectId ?? "none"} />;
}

function ProjectStudioControls() {
  const editor = useEditor();
  const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
  const t = assistantMessages[locale];
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState<number | null>(null);
  const busy = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const save = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      const remote = await saveToServer(editor);
      setRevision(remote.revision);
      toast.success(t.savedMedia);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.saveFailed);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }, [editor, t]);
  useEffect(() => {
    const listener = () => void save();
    window.addEventListener("brandhub:save-project", listener);
    return () => window.removeEventListener("brandhub:save-project", listener);
  }, [save]);
  return (
    <>
      <div className="bh-studio-controls">
        <span className="bh-save-state" role="status">
          {revision === null ? t.local : `${t.saved} · v${revision}`}
        </span>
        <Button variant="outline" size="sm" onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <CloudUpload />}
          {t.save}
        </Button>
        <Button ref={trigger} variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Sparkles />
          {t.assistant}
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="bh-ai-panel"
          closeLabel={t.close}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          <header className="bh-ai-header">
            <div>
              <SheetTitle>
                <Sparkles size={18} />
                {t.title}
              </SheetTitle>
              <SheetDescription>{t.description}</SheetDescription>
            </div>
          </header>
          <AutoEditChat locale={locale} />
        </SheetContent>
      </Sheet>
    </>
  );
}
