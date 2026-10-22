import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, User, X, Users, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreditAmountForm } from "@/pages/credit/components/CreditAmountForm";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { CreditUsagePanel } from "@/pages/credit/components/CreditUsagePanel";
import { useMemberCredit } from "@/pages/credit/hooks/useCreditConfiguration";
import { useCreditUsage } from "@/pages/credit/hooks/useCreditReporting";
import type { AgencyMember } from "@/types/agency";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRoleBadge(role: string) {
  const normalized = role.toUpperCase();
  if (
    normalized === "PROJECT_MANAGER" ||
    normalized === "MANAGER" ||
    normalized === "ADMIN" ||
    normalized === "OWNER"
  ) {
    return (
      <span className="inline-flex items-center rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
        Manager
      </span>
    );
  }
  if (normalized === "CREATOR") {
    return (
      <span className="inline-flex items-center rounded-md border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
        Creator
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {role}
    </span>
  );
}

function MemberMiniUsage({
  agencyId,
  memberId,
}: {
  agencyId: string;
  memberId: string;
}) {
  const query = useCreditUsage(agencyId, memberId);

  if (query.isPending) {
    return (
      <div className="h-1.5 w-16 rounded-full bg-muted/60 animate-pulse mt-1" />
    );
  }

  if (query.isError || !query.data) {
    return null;
  }

  const { used, held, limit } = query.data;
  if (limit === null || limit <= 0) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono mt-0.5">
        <span>{used}</span>
        <span>/</span>
        <span>∞</span>
      </div>
    );
  }

  const totalCommitted = used + held;
  const pct = Math.min(100, Math.round((totalCommitted / limit) * 100));
  const barColor =
    pct >= 90
      ? "bg-red-500"
      : pct >= 75
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden flex">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            barColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

export function MemberCreditPanel({
  agencyId,
  members,
  defaultAgencyLimit,
}: {
  agencyId: string;
  members: AgencyMember[];
  defaultAgencyLimit?: number | null;
}) {
  const { t } = useTranslation();
  const [memberId, setMemberId] = useState("");
  const [search, setSearch] = useState("");

  const selected = members.find((member) => member.userId === memberId);
  const visible = members.filter((member) =>
    `${member.fullName ?? ""} ${member.email ?? ""}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );

  return (
    <section aria-label={t("credit.member.select")} className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="size-4.5" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t("credit.member.select")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t(
              "credit.member.subtitle",
              "Quản lý hạn ngạch credit cho từng thành viên Agency",
            )}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(18rem,1fr)_minmax(0,2fr)]">
        {/* Left Column: Member List */}
        <div className="border-border/70 bg-card space-y-3.5 rounded-2xl border p-4 shadow-xs">
          {/* Search box with icons */}
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4" />
            <Input
              placeholder={t("credit.member.search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 pr-8 text-xs sm:text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Member items list */}
          <div
            className="max-h-[380px] space-y-1.5 overflow-y-auto pr-1"
            aria-label={t("credit.member.select")}
          >
            {visible.map((member) => {
              const isSelected = memberId === member.userId;
              const displayName =
                member.fullName || member.email || member.userId;
              const initials = getInitials(displayName);

              return (
                <button
                  key={member.userId}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setMemberId(member.userId)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all cursor-pointer border",
                    isSelected
                      ? "border-brand-orange/40 bg-brand-orange/10 dark:bg-brand-orange/15 shadow-2xs"
                      : "border-transparent hover:border-border/60 hover:bg-muted/50",
                  )}
                >
                  {/* Avatar / Initials */}
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="size-9 rounded-full object-cover shrink-0 ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange/20 to-amber-500/10 text-brand-orange text-xs font-bold uppercase shadow-2xs">
                      {initials}
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="block truncate text-xs sm:text-sm font-medium text-foreground">
                        {displayName}
                      </span>
                      {getRoleBadge(member.role)}
                    </div>

                    {member.fullName && member.email ? (
                      <span className="text-muted-foreground block truncate text-[11px]">
                        {member.email}
                      </span>
                    ) : null}

                    {/* Mini progress bar of credit quota */}
                    <MemberMiniUsage
                      agencyId={agencyId}
                      memberId={member.userId}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <div className="py-6 text-center">
              <User className="mx-auto size-8 text-muted-foreground/40 mb-1.5" />
              <p className="text-muted-foreground text-xs">
                {t(
                  members.length
                    ? "credit.member.noResults"
                    : "credit.member.empty",
                )}
              </p>
            </div>
          ) : null}
        </div>

        {/* Right Column: Member Detail Form & Usage */}
        {selected ? (
          <div key={selected.userId} className="min-w-0 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
              <h3 className="text-sm font-semibold text-foreground break-words flex items-center gap-1.5">
                <Sparkles className="size-4 text-brand-orange" />
                {t("credit.member.selected", {
                  name: selected.fullName || selected.email || selected.userId,
                })}
              </h3>
            </div>

            <MemberDetail
              agencyId={agencyId}
              memberId={selected.userId}
              defaultAgencyLimit={defaultAgencyLimit}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <User className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {t("credit.member.choose")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {t(
                "credit.member.chooseHelp",
                "Chọn một thành viên từ danh sách bên trái để xem báo cáo sử dụng và gán hạn ngạch riêng.",
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function MemberDetail({
  agencyId,
  memberId,
  defaultAgencyLimit,
}: {
  agencyId: string;
  memberId: string;
  defaultAgencyLimit?: number | null;
}) {
  const { t } = useTranslation();
  const { query, save, reload } = useMemberCredit(agencyId, memberId);

  const presets = [
    { label: "500", value: 500 },
    { label: "1.000", value: 1000 },
    { label: "5.000", value: 5000 },
    {
      label:
        defaultAgencyLimit !== null && defaultAgencyLimit !== undefined
          ? `Mặc định Agency (${defaultAgencyLimit})`
          : "Mặc định Agency (10)",
      value: defaultAgencyLimit ?? 10,
    },
  ];

  return (
    <div className="space-y-4">
      {query.data ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 border border-border/50 px-3.5 py-2 rounded-xl">
          <span>
            {t("credit.member.source", "Nguồn hạn mức")}:{" "}
            <strong className="text-foreground">
              {t(`credit.sourceLabel.${query.data.source}`)}
            </strong>
          </span>
          <span className="font-mono tabular-nums">
            {query.data.effectiveLimit === null
              ? t("credit.usage.unlimited")
              : `${query.data.effectiveLimit} credits/kỳ`}
          </span>
        </div>
      ) : null}

      {query.isPending || query.isError ? (
        <CreditQueryState
          loading={query.isPending}
          error={query.error}
          retry={() => query.refetch()}
        />
      ) : (
        <CreditAmountForm
          key={query.data.revision}
          title={t("credit.member.title")}
          description={t(`credit.source.${query.data.source}`)}
          initial={query.data.effectiveLimit}
          revision={query.data.revision}
          presets={presets}
          onSave={save}
          onReload={reload}
        />
      )}

      <CreditUsagePanel agencyId={agencyId} memberId={memberId} />
    </div>
  );
}
