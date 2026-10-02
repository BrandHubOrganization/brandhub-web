import { useTranslation } from "react-i18next";
import { MapPin, Calendar } from "lucide-react";
import type { Workspace } from "@/types/workspace";

interface Props {
  workspaces: Workspace[];
  onOpen: (workspaceId: string) => void;
}

export function WorkspaceCardGrid({ workspaces, onOpen }: Props) {
  const { t, i18n } = useTranslation();

  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          onClick={() => onOpen(ws.id)}
          className="border-border bg-card hover:border-brand-orange/50 flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border text-left transition-colors"
        >
          <div
            className="h-1.5"
            style={{ background: ws.brandColor || "#f05a28" }}
          />
          <div className="flex-1 space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                style={{
                  background: `${ws.brandColor || "#f05a28"}1a`,
                  color: ws.brandColor || "#f05a28",
                }}
              >
                {ws.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-foreground truncate text-sm font-bold">
                  {ws.name}
                </h3>
              </div>
            </div>

            {ws.myRole && (
              <span className="bg-brand-orange-soft text-brand-orange text-2xs inline-block rounded-full px-2 py-0.5 font-medium">
                {t(`workspace.roles.${ws.myRole}`)}
              </span>
            )}

            {(ws.industry || ws.companySize) && (
              <div className="flex flex-wrap gap-1.5">
                {ws.industry && (
                  <span className="bg-muted text-muted-foreground text-2xs rounded-full px-2 py-0.5 font-medium">
                    {t(`workspace.industry.${ws.industry}`)}
                  </span>
                )}
                {ws.companySize && (
                  <span className="bg-muted text-muted-foreground text-2xs rounded-full px-2 py-0.5 font-medium">
                    {t(`agency.companySize.${ws.companySize}`)}
                  </span>
                )}
              </div>
            )}

            <div className="text-muted-foreground space-y-1 text-xs">
              {ws.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">{ws.location}</span>
                </div>
              )}
              {ws.createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 shrink-0" />
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
        </button>
      ))}
    </div>
  );
}
