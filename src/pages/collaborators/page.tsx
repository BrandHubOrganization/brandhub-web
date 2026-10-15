import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { useDirectory } from "./hooks/useDirectory";
import { PartnerForm } from "./components/PartnerForm";
import { PartnerDetails } from "./components/PartnerDetails";
import { PartnerAction, type DirectoryAction } from "./components/PartnerAction";
import { DirectoryFilters } from "./components/DirectoryFilters";
import { DirectoryResults } from "./components/DirectoryResults";
import { directoryService } from "./services/directoryService";
import type { DirectoryPartner } from "./types";

function Directory({ agencyId }: { agencyId: string }) {
  const state = useDirectory(agencyId);
  const [editing, setEditing] = useState<DirectoryPartner | null | undefined>();
  const [detail, setDetail] = useState<DirectoryPartner | null>(null);
  const [action, setAction] = useState<DirectoryAction | null>(null);
  async function confirm() {
    if (action && await state.mutate(() => directoryService[action.kind](agencyId, action.partner))) setAction(null);
  }
  return <div className="space-y-5">
    <DirectoryFilters state={state} onCreate={() => setEditing(null)} />
    <DirectoryResults state={state} onDetail={setDetail} onEdit={setEditing}
      onAction={(partner, kind) => setAction({ partner, kind })} />
    {editing !== undefined && <PartnerForm partner={editing} busy={state.busy} onClose={() => setEditing(undefined)}
      onSave={fields => state.mutate(() => editing ? directoryService.update(agencyId, editing, fields)
        : directoryService.create(agencyId, fields))} />}
    {detail && <PartnerDetails partner={detail} onClose={() => setDetail(null)} />}
    <PartnerAction action={action} busy={state.busy} onClose={() => setAction(null)} onConfirm={() => void confirm()} />
  </div>;
}
export default function DirectoryPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  return <PageWrapper hideBanner title={t("collaborators.title")} description={t("collaborators.description")}>
    {id && <Directory key={id} agencyId={id} />}
  </PageWrapper>;
}
