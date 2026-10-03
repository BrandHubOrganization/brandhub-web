import { useTranslation } from "react-i18next";
import { MapPin, Calendar, Building2, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Workspace } from "@/types/workspace";
import { getLogoIcon } from "@/pages/agency/logoIcons";

interface Props {
  workspaces: Workspace[];
  onOpen: (workspaceId: string) => void;
}

export function WorkspaceCardGrid({ workspaces, onOpen }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((ws) => {
        const brandColor = ws.brandColor || "#f05a28";
        const LogoIcon = getLogoIcon(ws.logoIcon);

        return (
          <div
            key={ws.id}
            onClick={() => onOpen(ws.id)}
            className="group bg-card rounded-xl border border-border overflow-hidden shadow-xs transition-all duration-200 hover:border-brand-orange/40 hover:shadow-md flex flex-col cursor-pointer"
          >
            {/* Top Cover Banner */}
            <div className="relative h-28 w-full shrink-0 overflow-hidden bg-muted/40">
              {ws.bannerUrl ? (
                <img
                  src={ws.bannerUrl}
                  alt=""
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                />
              ) : (
                <div
                  className="size-full select-none"
                  style={{
                    background: brandColor
                      ? `linear-gradient(135deg, ${brandColor}38 0%, ${brandColor}15 50%, ${brandColor}08 100%)`
                      : "linear-gradient(135deg, hsl(var(--muted)/0.7) 0%, hsl(var(--muted)/0.25) 100%)",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
            </div>

            <div className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between">
              {/* Header: Overlapping Avatar + Role Badge */}
              <div>
                <div className="relative -mt-8 mb-3 flex items-end justify-between gap-3">
                  {ws.logoUrl ? (
                    <img
                      src={ws.logoUrl}
                      alt={ws.name}
                      className="size-16 shrink-0 rounded-2xl object-cover border-4 border-card bg-card shadow-md transition-transform duration-300 group-hover:scale-102"
                    />
                  ) : (
                    <div
                      className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-base font-bold border-4 border-card shadow-md select-none transition-transform duration-300 group-hover:scale-102 text-white"
                      style={{
                        backgroundColor: brandColor || "#f05a28",
                        color: "#ffffff",
                      }}
                    >
                      {ws.logoIcon ? (
                        <LogoIcon className="size-6 text-white" />
                      ) : (
                        ws.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                  )}

                  {ws.myRole && (
                    <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-[11px] font-semibold text-brand-orange shrink-0 border border-brand-orange/20 shadow-2xs">
                      {t(`workspace.roles.${ws.myRole}`, ws.myRole)}
                    </span>
                  )}
                </div>

                {/* Workspace Title & Tagline */}
                <div>
                  <h3 className="truncate font-semibold text-sm sm:text-base text-foreground group-hover:text-brand-orange transition-colors">
                    {ws.name}
                  </h3>
                  <p className="text-muted-foreground truncate text-xs mt-1">
                    {ws.tagline || ws.description || "—"}
                  </p>
                </div>

                {/* Industry & Size Badges */}
                {(ws.industry || ws.companySize) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ws.industry && (
                      <span className="bg-brand-orange/10 text-brand-orange text-[11px] rounded-full px-2.5 py-0.5 font-medium border border-brand-orange/15">
                        {t(`workspace.industry.${ws.industry}`, ws.industry)}
                      </span>
                    )}
                    {ws.companySize && (
                      <span className="bg-muted text-muted-foreground text-[11px] rounded-full px-2.5 py-0.5 font-medium border border-border/50">
                        {t(`agency.companySize.${ws.companySize}`, ws.companySize)}
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="text-muted-foreground mt-3 space-y-1.5 text-xs">
                  {ws.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0 text-brand-orange" />
                      <span className="truncate">{ws.location}</span>
                    </div>
                  )}
                  {ws.createdAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0 text-brand-orange" />
                      <span>
                        {t("workspace.list.createdAt", {
                          date: new Date(ws.createdAt).toLocaleDateString(
                            i18n.language === "vi" ? "vi-VN" : "en-US",
                            { year: "numeric", month: "long" },
                          ),
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Action */}
              <div
                className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onOpen(ws.id)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border px-3 h-8.5 text-xs font-medium transition-colors hover:border-brand-orange/50 hover:text-brand-orange hover:bg-brand-orange/[0.04]"
                >
                  <LayoutDashboard className="size-3.5" />
                  {t("workspace.list.enterDashboard", "Vào Dashboard")}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigate(`/workspaces/${ws.id}/members`); }}
                  className="flex size-8.5 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40"
                  title={t("workspace.list.membersButton", "Thành viên")}
                >
                  <Building2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
