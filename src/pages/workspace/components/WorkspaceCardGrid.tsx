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
            className="bg-card rounded-xl border border-border overflow-hidden shadow-xs transition-all hover:border-brand-orange/40 flex flex-col cursor-pointer"
          >
            {/* Top Brand Color Strip */}
            <div
              className="h-1.5 w-full shrink-0"
              style={{ backgroundColor: brandColor }}
            />

            <div className="p-5 flex-1 flex flex-col justify-between">
              {/* Header */}
              <div>
                <div className="flex items-start gap-3">
                  {ws.logoUrl ? (
                    <img
                      src={ws.logoUrl}
                      alt={ws.name}
                      className="size-11 shrink-0 rounded-xl object-cover border border-border"
                    />
                  ) : (
                    <div
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold select-none"
                      style={{
                        backgroundColor: `${brandColor}18`,
                        color: brandColor,
                      }}
                    >
                      {ws.logoIcon ? (
                        <LogoIcon className="size-5" />
                      ) : (
                        ws.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-sm text-foreground hover:text-brand-orange transition-colors">
                        {ws.name}
                      </h3>
                      {ws.myRole && (
                        <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-semibold text-brand-orange shrink-0">
                          {t(`workspace.roles.${ws.myRole}`, ws.myRole)}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground truncate text-xs mt-0.5">
                      {ws.tagline || ws.description || "—"}
                    </p>
                  </div>
                </div>

                {/* Industry & Size Badges */}
                {(ws.industry || ws.companySize) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ws.industry && (
                      <span className="bg-brand-orange/10 text-brand-orange text-[11px] rounded-full px-2.5 py-0.5 font-medium">
                        {t(`workspace.industry.${ws.industry}`, ws.industry)}
                      </span>
                    )}
                    {ws.companySize && (
                      <span className="bg-muted text-muted-foreground text-[11px] rounded-full px-2.5 py-0.5 font-medium">
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
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border px-3 h-8 text-xs font-medium transition-colors hover:border-brand-orange/50 hover:text-brand-orange"
                >
                  <LayoutDashboard className="size-3.5" />
                  {t("workspace.list.enterDashboard", "Vào Dashboard")}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigate(`/workspaces/${ws.id}/members`); }}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
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
