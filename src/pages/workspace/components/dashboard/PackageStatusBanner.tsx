import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PackageOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PackageStatusBannerProps {
  workspaceId: string;
  isPackageApproved: boolean;
  isPackageNegotiating: boolean;
  isClient: boolean;
}

export function PackageStatusBanner({
  workspaceId,
  isPackageApproved,
  isPackageNegotiating,
  isClient,
}: PackageStatusBannerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isPackageApproved) {
    return null;
  }

  return (
    <section
      className={`mb-6 flex flex-col gap-4 rounded-2xl border p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between ${
        isPackageNegotiating
          ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15"
          : "border-brand-orange/30 bg-brand-orange-soft/60"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
            isPackageNegotiating
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              : "bg-brand-orange/20 text-brand-orange"
          }`}
        >
          <PackageOpen className="size-5.5" />
        </div>
        <div>
          <h2 className="text-foreground font-semibold">
            {isPackageNegotiating
              ? t("workspace.dashboard.packageNegotiatingTitle")
              : t("workspace.dashboard.packageRequiredTitle")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {isPackageNegotiating
              ? t("workspace.dashboard.packageNegotiatingDescription")
              : t(
                  isClient
                    ? "workspace.dashboard.packageRequiredClientDescription"
                    : "workspace.dashboard.packageRequiredAgencyDescription",
                )}
          </p>
        </div>
      </div>
      {workspaceId && (
        <Button
          variant="orange"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => navigate(`/workspaces/${workspaceId}/media-package`)}
        >
          {isPackageNegotiating
            ? t("workspace.dashboard.viewPackage")
            : t("workspace.dashboard.selectPackage")}
          <ArrowRight className="ml-1.5 size-4" />
        </Button>
      )}
    </section>
  );
}
