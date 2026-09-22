import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { clientProfileService } from "@/services/clientProfileService";
import type { ClientProfile } from "@/types/clientProfile";
import type { WorkspaceMember } from "@/types/workspace";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencyId: string;
  existingMembers: WorkspaceMember[];
  value: string;
  onChange: (clientProfileId: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}

// Gán 1 ClientProfile (đã có sẵn trong agency, không thuộc agency_members)
// vào workspace hiện tại với role CLIENT — thành viên cộng tác, không phải
// agency member.
export function AddClientDialog({
  open,
  onOpenChange,
  agencyId,
  existingMembers,
  value,
  onChange,
  submitting,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    clientProfileService
      .listByAgency(agencyId)
      .then(({ data }) => setClients(data.data))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [open, agencyId]);

  const existingClientIds = new Set(
    existingMembers
      .filter((m) => m.role === "CLIENT" && m.clientProfileId)
      .map((m) => m.clientProfileId),
  );
  const available = clients.filter((c) => !existingClientIds.has(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.members.addClientTitle")}</DialogTitle>
        </DialogHeader>

        {!loading && available.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("workspace.members.addClientEmpty")}
          </p>
        ) : (
          <Select value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">
              {t("workspace.members.addClientPlaceholder")}
            </option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
                {c.company ? ` — ${c.company}` : ""}
              </option>
            ))}
          </Select>
        )}

        <DialogFooter>
          <Button
            variant="orange"
            loading={submitting}
            onClick={onSubmit}
            disabled={!value}
          >
            {t("workspace.members.addClientSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
