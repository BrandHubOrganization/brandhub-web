import { useTranslation } from "react-i18next";
import { Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import type { ClientProfile } from "@/types/clientProfile";
import { cn } from "@/lib/utils";

interface Props {
  profiles: ClientProfile[];
  selectedId: string;
  selectedName: string;
  onSelect: (clientId: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function ClientProfileQuickFill({
  profiles,
  selectedId,
  selectedName,
  onSelect,
  onClear,
  disabled,
}: Props) {
  const { t } = useTranslation();

  if (profiles.length === 0) return null;

  const showDropdown = profiles.length > 4;
  const chipProfiles = showDropdown ? profiles.slice(0, 3) : profiles;

  const clientOptions: SelectMenuOption[] = showDropdown
    ? [
        { value: "", label: t("collaborators.selectClientPlaceholder") },
        ...profiles.map((client) => {
          const label = (client.displayName || client.company || "").trim();
          const details = [client.industry, client.location]
            .filter(Boolean)
            .join(" · ");
          return {
            value: client.id,
            label,
            hint: details || client.contactEmail || client.phone || undefined,
            icon: <Sparkles className="size-3 text-brand-orange" />,
          };
        }),
      ]
    : [];

  return (
    <div className="rounded-xl border border-brand-orange/25 bg-brand-orange/[0.04] p-3 space-y-2">
      {/* Compact Header: Sparkles + Title + Auto-filled Status + Undo */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="size-3.5 shrink-0 text-brand-orange" />
          <span className="text-xs font-semibold text-brand-orange truncate">
            {t("collaborators.quickFillTitle")}
          </span>
          {selectedName && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-3xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate">
              <CheckCircle2 className="size-2.5 shrink-0 text-emerald-500" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">
                {t("collaborators.filledStatus", { name: selectedName })}
              </span>
            </span>
          )}
        </div>
        {selectedName && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="shrink-0 inline-flex items-center gap-1 text-2xs font-medium text-muted-foreground hover:text-foreground active:scale-[0.97] transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50"
          >
            <RotateCcw className="size-2.5" />
            <span>{t("collaborators.undoFill")}</span>
          </button>
        )}
      </div>

      {/* 1-Tap Quick Chips Row: Brand names (displayName || company) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {chipProfiles.map((client) => {
          const isSelected = selectedId === client.id;
          const brandName = (client.displayName || client.company || "").trim();
          return (
            <button
              key={client.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(client.id)}
              className={cn(
                "group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.97]",
                isSelected
                  ? "bg-brand-orange text-white shadow-xs font-semibold ring-2 ring-brand-orange/30"
                  : "bg-background/90 hover:bg-brand-orange/10 border border-border/80 text-foreground hover:border-brand-orange/40 hover:text-brand-orange shadow-2xs",
                disabled && "opacity-50 pointer-events-none"
              )}
              title={client.company || brandName}
            >
              <Sparkles
                className={cn(
                  "size-3 shrink-0 transition-transform group-hover:scale-110",
                  isSelected ? "text-white" : "text-brand-orange"
                )}
              />
              <span className="truncate max-w-[130px] sm:max-w-[170px]">
                {brandName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Compact Dropdown when > 4 profiles */}
      {showDropdown && (
        <SelectMenu
          className="w-full text-xs h-8"
          value={selectedId}
          onChange={onSelect}
          options={clientOptions}
          disabled={disabled}
          ariaLabel={t("collaborators.quickFillTitle")}
        />
      )}
    </div>
  );
}
