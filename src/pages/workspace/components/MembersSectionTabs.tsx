import { useTranslation } from "react-i18next";
import { Users, Building2 } from "lucide-react";

export type MembersSection = "internal" | "clients";

interface Props {
  active: MembersSection;
  internalCount: number;
  clientCount: number;
  onChange: (section: MembersSection) => void;
}

export function MembersSectionTabs({
  active,
  internalCount,
  clientCount,
  onChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex gap-6 border-b text-sm font-medium">
      <button
        onClick={() => onChange("internal")}
        className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
          active === "internal"
            ? "border-brand-orange text-brand-orange font-semibold"
            : "text-muted-foreground hover:text-foreground border-transparent"
        }`}
      >
        <Users className="size-4" />
        <span>
          {t("workspace.members.internalTab", { count: internalCount })}
        </span>
      </button>

      <button
        onClick={() => onChange("clients")}
        className={`flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition-colors ${
          active === "clients"
            ? "border-brand-orange text-brand-orange font-semibold"
            : "text-muted-foreground hover:text-foreground border-transparent"
        }`}
      >
        <Building2 className="size-4" />
        <span>{t("workspace.members.clientsTab", { count: clientCount })}</span>
      </button>
    </div>
  );
}
