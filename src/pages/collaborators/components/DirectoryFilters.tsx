import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { useDirectory } from "../hooks/useDirectory";
import { PARTNER_TYPES } from "../types";
export function DirectoryFilters({ state, onCreate }: {
  state: ReturnType<typeof useDirectory>; onCreate: () => void;
}) {
  const { t } = useTranslation();
  return <div className="flex flex-wrap items-end gap-3"><div className="min-w-0 flex-1 sm:min-w-60">
    <Input label={t("collaborators.search")} maxLength={100} value={state.search}
      onChange={event => state.setSearch(event.target.value)} /></div>
    <div className="w-full space-y-2 sm:w-44"><Label htmlFor="directory-active">{t("collaborators.status")}</Label>
      <Select id="directory-active" value={state.active} onChange={event => state.setActive(event.target.value)}>
        <option value="all">{t("collaborators.all")}</option><option value="true">{t("collaborators.active")}</option>
        <option value="false">{t("collaborators.inactive")}</option></Select></div>
    <div className="w-full space-y-2 sm:w-44"><Label htmlFor="directory-type">{t("collaborators.type")}</Label>
      <Select id="directory-type" value={state.type} onChange={event => state.setType(event.target.value)}>
        <option value="">{t("collaborators.all")}</option>{PARTNER_TYPES.map(type => <option key={type} value={type}>
          {t(`campaign.partners.types.${type}`)}</option>)}</Select></div>
    <Button disabled={state.busy} onClick={onCreate}>{t("collaborators.create")}</Button>
  </div>;
}
