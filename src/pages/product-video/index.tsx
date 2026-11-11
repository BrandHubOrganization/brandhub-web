import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { errorCode } from "@/services/adminRevenueService";
import { useProductVideo } from "@/pages/product-video/hooks/useProductVideo";
import { ProductBriefForm } from "@/pages/product-video/components/ProductBriefForm";
import { StoryboardReview } from "@/pages/product-video/components/StoryboardReview";
import { ProductionProgress } from "@/pages/product-video/components/ProductionProgress";
import { ProductionResult } from "@/pages/product-video/components/ProductionResult";
import { useAuthStore } from "@/store/authStore";

export default function ProductVideoPage() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const userId = useAuthStore((state) => state.user?.id);
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <ProductVideoWorkspace
        key={`${userId}:${workspaceId}:${params.get("productionId") ?? "new"}`}
        workspaceId={workspaceId ?? ""}
      />
    </QueryClientProvider>
  );
}
function ProductVideoWorkspace({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const c = useProductVideo(workspaceId);
  const validWorkspace = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(
    workspaceId,
  );
  return (
    <PageWrapper
      title={t("productVideo.title")}
      description={t("productVideo.description")}
      showGuideButton={false}
      actions={
        <Button asChild variant="outline">
          <Link to="/ai-studio/video">
            <ArrowLeft className="size-4" />
            {t("productVideo.back")}
          </Link>
        </Button>
      }
    >
      {!validWorkspace ? (
        <p role="alert">{t("productVideo.noWorkspace")}</p>
      ) : (
        <div className="space-y-5">
          <ol
            className="text-muted-foreground grid gap-2 text-sm sm:grid-cols-3"
            aria-label={t("productVideo.steps")}
          >
            {["stepBrief", "stepReview", "stepResult"].map((step, index) => (
              <li
                key={step}
                className="border-border bg-card flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <span className="text-brand-orange font-semibold">
                  {index + 1}
                </span>
                {t(`productVideo.${step}`)}
              </li>
            ))}
          </ol>
          {c.error != null && (
            <div
              role="alert"
              className="border-destructive/40 bg-card space-y-3 rounded-lg border p-4"
            >
              <p className="text-sm">
                {t(
                  `productVideo.errors.${c.error instanceof Error && c.error.message.startsWith("PRODUCT_VIDEO_") ? c.error.message : errorCode(c.error)}`,
                  { defaultValue: t("productVideo.errors.default") },
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={c.busy}
                onClick={() => void c.refresh()}
              >
                <RefreshCw className="size-4" />
                {t("productVideo.refresh")}
              </Button>
            </div>
          )}
          {c.loading ? (
            <p role="status">{t("productVideo.loading")}</p>
          ) : (
            <>
              {c.production && !c.editable && (
                <ProductionProgress controller={c} />
              )}
              {c.production?.hasResult && (
                <ProductionResult
                  workspaceId={workspaceId}
                  production={c.production}
                />
              )}
              <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                {c.editable && <ProductBriefForm controller={c} />}
                <div
                  className={c.editable ? "min-w-0" : "min-w-0 xl:col-span-2"}
                >
                  <StoryboardReview controller={c} />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
