import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Contact2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DirectoryPartner } from "../types";
import { getGroupLetter } from "../contactHelpers";
import { PartnerListItem } from "./PartnerListItem";

interface Props {
  partners: DirectoryPartner[];
  busy: boolean;
  onDetail: (partner: DirectoryPartner) => void;
  onEdit: (partner: DirectoryPartner) => void;
  onAction: (partner: DirectoryPartner, action: "delete" | "deactivate") => void;
}

const ALPHABET = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z", "#"
];

export function PartnerList({ partners, busy, onDetail, onEdit, onAction }: Props) {
  const { t } = useTranslation();

  const grouped = useMemo(() => {
    const sorted = [...partners].sort((a, b) =>
      a.partnerName.localeCompare(b.partnerName, "vi", { sensitivity: "base" })
    );

    const map = new Map<string, DirectoryPartner[]>();
    for (const partner of sorted) {
      const letter = getGroupLetter(partner.partnerName);
      const list = map.get(letter) || [];
      list.push(partner);
      map.set(letter, list);
    }

    const letters = Array.from(map.keys()).sort((a, b) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    });

    return letters.map((letter) => ({
      letter,
      items: map.get(letter)!,
    }));
  }, [partners]);

  const activeLetters = useMemo(() => {
    return new Set(grouped.map((g) => g.letter));
  }, [grouped]);

  function scrollToSection(letter: string) {
    const target = document.getElementById(`partner-section-${letter}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (!partners.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card p-12 text-center shadow-2xs">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Contact2 aria-hidden="true" className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {t("collaborators.emptyTitle")}
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          {t("collaborators.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex items-start gap-2">
      {/* iOS Contacts Container */}
      <div
        aria-label={t("collaborators.title")}
        className="flex-1 min-w-0 rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden"
      >
        {grouped.map((group) => (
          <section key={group.letter} id={`partner-section-${group.letter}`} className="relative">
            {/* Sticky Letter Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-y border-border/40 bg-muted/80 backdrop-blur-xs px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-2xs">
              <span className="text-foreground font-extrabold">{group.letter}</span>
              <span className="text-[10px] font-medium text-muted-foreground/80 lowercase">
                {group.items.length} {t("collaborators.title").toLowerCase()}
              </span>
            </div>

            {/* Partners List in Group */}
            <ul className="divide-y divide-border/30">
              {group.items.map((partner) => (
                <PartnerListItem
                  key={partner.id}
                  partner={partner}
                  busy={busy}
                  onDetail={onDetail}
                  onEdit={onEdit}
                  onAction={onAction}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* A-Z Index Strip (iOS Style Right Edge) */}
      <aside
        aria-label="A-Z index"
        className="sticky top-20 hidden md:flex flex-col items-center justify-center py-2 px-1 text-[11px] font-semibold select-none z-20 shrink-0 bg-card/60 backdrop-blur-xs rounded-xl border border-border/40 shadow-2xs"
      >
        {ALPHABET.map((letter) => {
          const hasItems = activeLetters.has(letter);
          return (
            <button
              key={letter}
              type="button"
              disabled={!hasItems}
              onClick={() => scrollToSection(letter)}
              className={cn(
                "size-5.5 flex items-center justify-center rounded-full transition-all text-[11px]",
                hasItems
                  ? "text-brand-orange hover:bg-brand-orange/15 hover:scale-125 font-bold cursor-pointer active:scale-95"
                  : "text-muted-foreground/25 cursor-default"
              )}
              title={hasItems ? t("collaborators.jumpToLetter", { letter }) : undefined}
            >
              {letter}
            </button>
          );
        })}
      </aside>
    </div>
  );
}
