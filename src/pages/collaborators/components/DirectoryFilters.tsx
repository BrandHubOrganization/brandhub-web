import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  PowerOff,
  Search,
  X,
  Plus,
  Newspaper,
  Image,
  Tv,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import type { useDirectory } from "../hooks/useDirectory";
import { PARTNER_TYPES } from "../types";

const TYPE_ICONS: Record<string, ReactNode> = {
  NEWSPAPER: <Newspaper className="size-4 text-brand-orange" />,
  BANNER: <Image className="size-4 text-brand-orange" />,
  TV: <Tv className="size-4 text-brand-orange" />,
  OTHER: <Layers className="size-4 text-brand-orange" />,
};

export function DirectoryFilters({
  state,
  onCreate,
}: {
  state: ReturnType<typeof useDirectory>;
  onCreate: () => void;
}) {
  const { t } = useTranslation();

  const statusOptions: SelectMenuOption[] = [
    { value: "all", label: t("collaborators.all") },
    {
      value: "true",
      label: t("collaborators.active"),
      icon: <CheckCircle2 className="size-4 text-emerald-500" />,
    },
    {
      value: "false",
      label: t("collaborators.inactive"),
      icon: <PowerOff className="size-4 text-muted-foreground" />,
    },
  ];

  const typeOptions: SelectMenuOption[] = [
    { value: "", label: t("collaborators.all") },
    ...PARTNER_TYPES.map((type) => ({
      value: type,
      label: t(`campaign.partners.types.${type}`),
      icon: TYPE_ICONS[type],
    })),
  ];

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="min-w-0 flex-1 sm:min-w-64">
          <Input
            label={t("collaborators.search")}
            placeholder={t("collaborators.search")}
            maxLength={100}
            value={state.search}
            onChange={(event) => state.setSearch(event.target.value)}
            iconPrefix={<Search className="size-4 text-muted-foreground" />}
            iconSuffix={
              state.search ? (
                <button
                  type="button"
                  onClick={() => state.setSearch("")}
                  aria-label={t("collaborators.resetFilters")}
                  className="pointer-events-auto cursor-pointer p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              ) : null
            }
          />
        </div>

        {/* Status Filter */}
        <div className="flex w-full flex-col gap-1.5 sm:w-44">
          <Label className="text-xs font-semibold tracking-wide text-foreground">
            {t("collaborators.status")}
          </Label>
          <SelectMenu
            value={state.active}
            onChange={state.setActive}
            options={statusOptions}
            ariaLabel={t("collaborators.status")}
            className="w-full"
            disabled={state.busy}
          />
        </div>

        {/* Partner Type Filter */}
        <div className="flex w-full flex-col gap-1.5 sm:w-52">
          <Label className="text-xs font-semibold tracking-wide text-foreground">
            {t("collaborators.type")}
          </Label>
          <SelectMenu
            value={state.type}
            onChange={state.setType}
            options={typeOptions}
            ariaLabel={t("collaborators.type")}
            className="w-full"
            disabled={state.busy}
          />
        </div>

        {/* Add Partner Button */}
        <Button
          variant="orange"
          disabled={state.busy}
          onClick={onCreate}
          className="w-full sm:w-auto active:scale-[0.97] transition-all cursor-pointer shadow-xs"
        >
          <Plus className="size-4 mr-1.5" />
          {t("collaborators.create")}
        </Button>
      </div>
    </div>
  );
}
