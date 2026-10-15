import { useEffect, useState } from "react";
import { Trash2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { errorCode } from "@/services/adminRevenueService";
import { mailTemplateService } from "../services/mailTemplateService";
import type { Recipient, RecipientCandidate, RecipientGroup } from "../types";

interface Props {
  workspaceId: string;
  /** Everything currently selected, used when saving a group. */
  current: Recipient[];
  onAdd: (rows: Recipient[]) => void;
}

/** Add recipients from Workspace members / Clients and from saved groups, or save the current list as a group. */
export function RecipientPicker({ workspaceId, current, onAdd }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<RecipientCandidate[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<RecipientGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      mailTemplateService
        .recipientCandidates(workspaceId, query)
        .then((rows) => !cancelled && setCandidates(rows))
        .catch(() => !cancelled && setCandidates([]))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query, workspaceId]);

  useEffect(() => {
    if (!open) return;
    mailTemplateService.recipientGroups(workspaceId).then(setGroups).catch(() => setGroups([]));
  }, [open, workspaceId]);

  const toggle = (email: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });

  const addChecked = () => {
    const rows = candidates
      .filter((c) => checked.has(c.email))
      .map((c) => ({ email: c.email, ...(c.name ? { name: c.name } : {}) }));
    if (rows.length > 0) onAdd(rows);
    setChecked(new Set());
  };

  const addGroup = () => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    onAdd(group.recipients.map((r) => ({ email: r.email, ...(r.name ? { name: r.name } : {}) })));
  };

  const saveGroup = async () => {
    if (!groupName.trim() || current.length === 0) return;
    try {
      const created = await mailTemplateService.createRecipientGroup(
        workspaceId,
        groupName.trim(),
        current.map((r) => ({ email: r.email, name: r.name })),
      );
      setGroups((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setGroupName("");
      toast.success(t("mailTemplate.recipients.groupSaved"));
    } catch (e) {
      toast.error(t(`mailTemplate.errors.${errorCode(e)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    }
  };

  const removeGroup = async () => {
    if (!groupId) return;
    try {
      await mailTemplateService.deleteRecipientGroup(workspaceId, groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setGroupId("");
      toast.success(t("mailTemplate.recipients.groupDeleted"));
    } catch (e) {
      toast.error(t(`mailTemplate.errors.${errorCode(e)}`, { defaultValue: t("mailTemplate.errors.generic") }));
    }
  };

  return (
    <div className="space-y-2 text-sm">
      <Button type="button" variant="outline" size="sm" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Users className="size-4" />
        {t("mailTemplate.recipients.addFromWorkspace")}
      </Button>
      {open && (
        <div className="bg-muted/30 space-y-3 rounded-lg border p-3" data-testid="recipient-picker">
          <Input aria-label={t("mailTemplate.recipients.search")} placeholder={t("mailTemplate.recipients.search")}
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <ul className="max-h-40 space-y-1 overflow-y-auto" aria-label={t("mailTemplate.recipients.results")}>
            {!loading && candidates.length === 0 && (
              <li className="text-muted-foreground text-xs">{t("mailTemplate.recipients.noResults")}</li>
            )}
            {candidates.map((c) => (
              <li key={c.email}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={checked.has(c.email)} onChange={() => toggle(c.email)} />
                  <span className="min-w-0 flex-1 truncate">
                    {c.name ? `${c.name} · ` : ""}<span className="text-muted-foreground">{c.email}</span>
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t(c.source === "CLIENT" ? "mailTemplate.recipients.client" : "mailTemplate.recipients.member")}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <Button type="button" size="sm" disabled={checked.size === 0} onClick={addChecked}>
            {t("mailTemplate.recipients.addSelected", { count: checked.size })}
          </Button>

          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium">{t("mailTemplate.recipients.groups")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-40 flex-1">
                <Select aria-label={t("mailTemplate.recipients.chooseGroup")} value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}>
                  <option value="">{t("mailTemplate.recipients.chooseGroup")}</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{`${g.name} (${g.count})`}</option>)}
                </Select>
              </div>
              <Button type="button" size="sm" variant="outline" disabled={!groupId} onClick={addGroup}>
                {t("mailTemplate.recipients.addGroup")}
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={!groupId}
                aria-label={t("mailTemplate.recipients.deleteGroup")} onClick={() => void removeGroup()}>
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-40 flex-1">
                <Input aria-label={t("mailTemplate.recipients.groupName")} placeholder={t("mailTemplate.recipients.groupName")}
                  maxLength={80} value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              </div>
              <Button type="button" size="sm" variant="outline"
                disabled={!groupName.trim() || current.length === 0} onClick={() => void saveGroup()}>
                {t("mailTemplate.recipients.saveGroup", { count: current.length })}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
