import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignLoadingState() {
  const { t } = useTranslation();
  return (
    <section
      role="status"
      aria-label={t("campaign.loading")}
      aria-busy="true"
      className="space-y-3"
    >
      <Skeleton className="h-9 w-2/3 max-w-96 motion-reduce:animate-none" />
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="border-border flex gap-3 border-b p-3">
          <Skeleton className="h-12 w-36 motion-reduce:animate-none" />
          <Skeleton className="h-12 w-36 motion-reduce:animate-none" />
        </div>
        <Skeleton className="m-3 h-8 w-2/3 motion-reduce:animate-none" />
        <div className="min-h-[55dvh] space-y-3 p-3">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-8 w-full motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
