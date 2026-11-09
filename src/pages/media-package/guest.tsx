import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { PackageProposalView } from "@/pages/media-package/components/PackageProposalView";
import { MediaPackageLoadingState } from "@/pages/media-package/components/MediaPackagePageState";
import type { PackageOfferingDetails } from "@/pages/media-package/types/mediaPackage";
import { SeoHead } from "@/components/seo/SeoHead";

interface PublicPackage {
  agencyName: string;
  name: string;
  durationWeeks: number | null;
  budgetAmount: number | null;
  scopeDescription: string | null;
  offeringDetails: PackageOfferingDetails;
}
export default function GuestMediaPackagePage() {
  const { token } = useParams<{ token: string }>();
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? i18n.language).startsWith("en")
    ? "en"
    : "vi";
  const query = useQuery({
    queryKey: ["guest-package", token],
    retry: false,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const url = new URL(
        `/api/v1/public/media-packages/${encodeURIComponent(token ?? "")}`,
        api.defaults.baseURL || window.location.origin,
      );
      const response = await fetch(url, {
        signal,
        cache: "no-store",
        credentials: "omit",
      });
      if (!response.ok) throw new Error("PACKAGE_UNAVAILABLE");
      const body = (await response.json()) as {
        success: boolean;
        data: PublicPackage | null;
      };
      if (!body.success || !body.data) throw new Error("PACKAGE_UNAVAILABLE");
      return body.data;
    },
  });
  const p = query.data;
  return (
    <main className="bg-background text-foreground min-h-dvh px-4 py-10 sm:px-8">
      <SeoHead
        title={p?.name ? `${p.name} — Đề xuất Gói Truyền thông | BrandHub` : "Đề xuất Gói Truyền thông | BrandHub"}
        canonicalPath="/packages/share"
        noindex
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <div
          role="group"
          aria-label={t("mediaPackage.guest.language")}
          className="flex justify-end gap-1"
        >
          {(["vi", "en"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              lang={value}
              variant={language === value ? "orange" : "secondary"}
              aria-pressed={language === value}
              onClick={() => void i18n.changeLanguage(value)}
              className="min-h-11"
            >
              {t(`mediaPackage.share.languages.${value}`)}
            </Button>
          ))}
        </div>
        {query.isPending ? (
          <MediaPackageLoadingState />
        ) : query.isError || !p ? (
          <section role="alert" className="space-y-4 rounded-xl border p-6">
            <h1 className="text-xl font-semibold">
              {t("mediaPackage.guest.unavailable")}
            </h1>
            <Button variant="outline" onClick={() => void query.refetch()}>
              {t("mediaPackage.guest.retry")}
            </Button>
          </section>
        ) : (
          <PackageProposalView mediaPackage={p} titleAs="h1" />
        )}
      </div>
    </main>
  );
}
