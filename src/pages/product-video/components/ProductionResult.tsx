import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clapperboard, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { productVideoService } from "@/pages/product-video/services/productVideoService";
import type { ProductVideoProduction } from "@/pages/product-video/types/productVideo";

export function ProductionResult({
  workspaceId,
  production,
}: {
  workspaceId: string;
  production: ProductVideoProduction;
}) {
  const { t } = useTranslation();
  const content = useQuery({
    queryKey: ["product-video-content", workspaceId, production.productionId],
    queryFn: ({ signal }) =>
      productVideoService.content(workspaceId, production.productionId, signal),
    retry: false,
    staleTime: Infinity,
  });
  const preview = useCallback(
    (node: HTMLVideoElement | null) => {
      if (!node || !content.data) return;
      const url = URL.createObjectURL(content.data);
      node.src = url;
      return () => {
        node.removeAttribute("src");
        node.load();
        URL.revokeObjectURL(url);
      };
    },
    [content.data],
  );
  const download = () => {
    if (!content.data) return;
    const url = URL.createObjectURL(content.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brandhub-${production.productionId}.mp4`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };
  return (
    <section className="border-border bg-card space-y-4 rounded-xl border p-4 md:p-6">
      <h2 className="text-lg font-semibold">{t("productVideo.result")}</h2>
      {content.data && (
        <video
          ref={preview}
          aria-label={t("productVideo.result")}
          controls
          playsInline
          className="bg-muted max-h-[60vh] w-full rounded-lg"
        />
      )}
      {content.isLoading && (
        <p role="status" className="text-muted-foreground text-sm">
          {t("productVideo.loadingResult")}
        </p>
      )}
      {content.isError && (
        <div role="alert" className="space-y-2">
          <p>{t("productVideo.resultError")}</p>
          <Button variant="outline" onClick={() => void content.refetch()}>
            {t("productVideo.refresh")}
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={!content.data} onClick={download}>
          <Download className="size-4" />
          {t("productVideo.download")}
        </Button>
        <Button asChild variant="orange">
          <Link
            to={`/workspaces/${workspaceId}/video-space?productionId=${encodeURIComponent(production.productionId)}`}
          >
            <Clapperboard className="size-4" />
            {t("productVideo.openEditor")}
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        {t("productVideo.editHelp")}
      </p>
    </section>
  );
}
