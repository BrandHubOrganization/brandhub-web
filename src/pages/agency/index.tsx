import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Building2, Eye, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import { useAgencyStore } from "@/store/agencyStore";
import type { Agency } from "@/types/agency";

export function AgencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);

  useEffect(() => {
    agencyService
      .list()
      .then(({ data }) => {
        setAgencies(data.data);
        // Chỉ có 1 agency: tự động chọn luôn, khỏi cần bấm.
        if (data.data.length === 1) setCurrentAgencyId(data.data[0].id);
      })
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("agency.errors.loadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [t, setCurrentAgencyId]);

  if (loading) return null;

  return (
    <PageWrapper
      title={t("agency.list.title")}
      description={t("agency.list.description")}
      actions={
        <Button
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white"
          onClick={() => navigate("/agency/create")}
        >
          <Plus className="size-3.5" />
          {t("agency.list.createButton")}
        </Button>
      }
    >
      {agencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <Building2 className="text-muted-foreground size-10" />
          <div>
            <p className="text-base font-semibold">
              {t("agency.list.emptyTitle")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("agency.list.emptyDescription")}
            </p>
          </div>
          <Button
            className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-white"
            onClick={() => navigate("/agency/create")}
          >
            <Plus className="size-4" />
            {t("agency.list.emptyButton")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agencies.map((a) => (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setCurrentAgencyId(a.id);
                navigate(`/agency/${a.id}`);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setCurrentAgencyId(a.id);
                  navigate(`/agency/${a.id}`);
                }
              }}
              className="bg-card hover:border-brand-orange/40 flex cursor-pointer flex-col rounded-xl border p-5 shadow-xs transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-brand-orange/10 text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{a.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {a.description || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 cursor-pointer gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentAgencyId(a.id);
                    navigate(`/agency/${a.id}`);
                  }}
                >
                  <Eye className="size-3.5" />
                  {t("agency.list.viewProfile")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 cursor-pointer gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentAgencyId(a.id);
                    navigate(`/agency/${a.id}/members`);
                  }}
                >
                  <Users className="size-3.5" />
                  {t("agency.list.manageMembers")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

export default AgencyPage;
