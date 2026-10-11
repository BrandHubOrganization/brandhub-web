import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { extractErrorMessage } from "@/utils/error";
import { workspaceService, type DuplicateMemberOption } from "@/services/workspaceService";
import type { Workspace } from "@/types/workspace";
import { useAuthStore } from "@/store/authStore";

interface Props {
  source: Workspace | null;
  onClose: () => void;
}

export function DuplicateWorkspaceDialog({ source, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ownerId = useAuthStore((state) => state.user?.id);
  const [members, setMembers] = useState<DuplicateMemberOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [copyTimezone, setCopyTimezone] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [optionsReady, setOptionsReady] = useState(false);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setName(`${source.name} - ${t("workspace.duplicate.copySuffix")}`);
    setSelected([]);
    setMembers([]);
    setCopyTimezone(false);
    setConfirming(false);
    setRequestId(crypto.randomUUID());
    setOptionsReady(false);
    workspaceService.duplicateOptions(source.id)
      .then(({ data }) => {
        if (cancelled) return;
        setMembers((data.data ?? []).filter((member) => member.userId !== ownerId));
        setOptionsReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) toast.error(extractErrorMessage(error, t("workspace.duplicate.loadFailed")));
      });
    return () => { cancelled = true; };
  }, [source, t, ownerId]);

  const toggle = (id: string) => setSelected((current) =>
    current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  const submit = async () => {
    if (!source || !name.trim()) return;
    setBusy(true);
    try {
      const { data } = await workspaceService.duplicate(source.id, {
        requestId, name: name.trim(), copyTimezone, memberIds: selected,
      });
      toast.success(t("workspace.duplicate.success"));
      onClose();
      navigate(`/workspaces/${data.data.id}/dashboard`);
    } catch (error) {
      toast.error(extractErrorMessage(error, t("workspace.duplicate.failed")));
    } finally {
      setBusy(false);
    }
  };

  const selectedMembers = members.filter((member) => selected.includes(member.memberId));
  const tooManyManagers = selectedMembers.filter((member) => member.role === "MANAGER").length > 1;

  return (
    <Dialog open={!!source} onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("workspace.duplicate.title")}</DialogTitle>
          <DialogDescription>{t("workspace.duplicate.description")}</DialogDescription>
        </DialogHeader>
        {!confirming ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              {t("workspace.duplicate.newName")}
              <Input className="mt-1" value={name} maxLength={255}
                onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={copyTimezone}
                onChange={(event) => setCopyTimezone(event.target.checked)} />
              {t("workspace.duplicate.copyTimezone")}
            </label>
            <div>
              <p className="mb-2 text-sm font-medium">{t("workspace.duplicate.members")}</p>
              <p className="mb-2 text-xs text-muted-foreground">{t("workspace.duplicate.ownerAlwaysIncluded")}</p>
              <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                {members.map((member) => (
                  <label key={member.memberId} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selected.includes(member.memberId)}
                      onChange={() => toggle(member.memberId)} />
                    <span>{member.name} · {member.role}</span>
                  </label>
                ))}
              </div>
              {tooManyManagers && <p className="mt-1 text-sm text-destructive">{t("workspace.duplicate.oneManager")}</p>}
            </div>
            <p className="text-xs text-muted-foreground">{t("workspace.duplicate.resourcesUnavailable")}</p>
            <p className="text-xs text-muted-foreground">{t("workspace.duplicate.noHistory")}</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>{t("workspace.duplicate.summaryName", { name })}</p>
            <p>{t("workspace.duplicate.summaryTimezone", { value: copyTimezone ? source?.settings?.timezone || "Asia/Ho_Chi_Minh" : "Asia/Ho_Chi_Minh" })}</p>
            <p>{t("workspace.duplicate.summaryMembers", { count: selectedMembers.length })}</p>
            {selectedMembers.map((member) => <p key={member.memberId}>• {member.name} · {member.role}</p>)}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy}
            onClick={() => confirming ? setConfirming(false) : onClose()}>
            {confirming ? t("workspace.duplicate.back") : t("workspace.duplicate.cancel")}
          </Button>
          <Button disabled={busy || !optionsReady || !name.trim() || tooManyManagers}
            onClick={() => confirming ? void submit() : setConfirming(true)}>
            {confirming ? t("workspace.duplicate.create") : t("workspace.duplicate.review")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
