import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  activeProductionStates,
  editableProductionStates,
} from "@/pages/product-video/types/productVideo";
import type {
  ProductImageFiles,
  ProductImageSlot,
  ProductVideoBrief,
  ProductVideoProduction,
  ProductVideoQuote,
} from "@/pages/product-video/types/productVideo";
import {
  canApproveProduction,
  productVideoService,
  uploadProductImage,
} from "@/pages/product-video/services/productVideoService";
import { useAuthStore } from "@/store/authStore";

export function useProductVideo(workspaceId: string) {
  const { i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const productionId = params.get("productionId");
  const userId = useAuthStore((state) => state.user?.id);
  const queries = useQueryClient();
  const queryKey = ["product-video", userId, workspaceId, productionId];
  const result = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      productVideoService.get(workspaceId, productionId!, signal),
    enabled:
      !!productionId &&
      !!userId &&
      /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(workspaceId),
    retry: false,
    refetchInterval: (query) =>
      query.state.data &&
      activeProductionStates.includes(query.state.data.state)
        ? 5000
        : false,
  });
  const production = result.data;
  const [projectId] = useState(() => crypto.randomUUID());
  const [draft, setDraft] = useState<ProductVideoBrief | null>(null);
  const [files, setFiles] = useState<ProductImageFiles>({});
  const [sceneEdits, setSceneEdits] = useState<Record<string, string>>({});
  const [retryQuote, setRetryQuote] = useState<{
    sceneId: string;
    quote: ProductVideoQuote;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const locked = useRef(false);
  const active = useRef(true);
  const controllers = useRef(new Set<AbortController>());
  const uploaded = useRef(new Map<File, string>());
  const renderKey = useRef(crypto.randomUUID());
  useEffect(() => {
    active.current = true;
    const requests = controllers.current;
    return () => {
      active.current = false;
      for (const request of requests) request.abort();
    };
  }, []);
  const brief: ProductVideoBrief = draft ??
    production?.brief ?? {
      recipeId: "auto",
      productName: "",
      productFacts: "",
      reviewScript: "",
      requirements: "",
      durationSeconds: 15,
      aspectRatio: "9:16",
      productImageAssetId: null,
      packagingImageAssetId: null,
      logoAssetId: null,
      allowGenericPackaging: false,
      cta: "",
      musicId: null,
      preserveSourceAudio: true,
      language: i18n.language.startsWith("en") ? "en" : "vi",
    };
  const dirty =
    draft !== null ||
    Object.keys(files).length > 0 ||
    Object.keys(sceneEdits).length > 0;
  const editable =
    !production || editableProductionStates.includes(production.state);
  const replace = (value: ProductVideoProduction) =>
    queries.setQueryData(
      ["product-video", userId, workspaceId, value.productionId],
      value,
    );
  const run = async (action: (signal: AbortSignal) => Promise<void>) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
      await action(controller.signal);
    } catch (cause) {
      if (active.current && !controller.signal.aborted) setError(cause);
    } finally {
      controllers.current.delete(controller);
      locked.current = false;
      if (active.current) setBusy(false);
    }
  };
  const updateBrief = (patch: Partial<ProductVideoBrief>) => {
    setDraft({ ...brief, ...patch });
    setSceneEdits({});
    setRetryQuote(null);
  };
  const updateFile = (slot: ProductImageSlot, file: File | null) => {
    setFiles({ ...files, [slot]: file });
    updateBrief({ [slot]: null });
  };
  const plan = () =>
    run(async (signal) => {
      const next = { ...brief };
      const targetProject = production?.projectId ?? projectId;
      for (const [slot, file] of Object.entries(files) as [
        ProductImageSlot,
        File | null,
      ][]) {
        if (!file) {
          next[slot] = null;
          continue;
        }
        let assetId = uploaded.current.get(file);
        if (!assetId) {
          assetId = await uploadProductImage(
            workspaceId,
            targetProject,
            file,
            signal,
          );
          uploaded.current.set(file, assetId);
        }
        next[slot] = assetId;
      }
      const value = await productVideoService.plan(
        workspaceId,
        {
          productionId,
          projectId: targetProject,
          expectedRevision: production?.revision ?? 0,
          brief: next,
          sceneEdits: Object.entries(sceneEdits).map(([sceneId, prompt]) => ({
            sceneId,
            prompt,
          })),
        },
        signal,
      );
      if (!active.current) return;
      replace(value);
      setDraft(null);
      setFiles({});
      setSceneEdits({});
      setRetryQuote(null);
      setParams({ productionId: value.productionId }, { replace: true });
    });
  const generate = () =>
    run(async (signal) => {
      if (!production?.quote || !canApproveProduction(production, dirty))
        return;
      replace(
        await productVideoService.generate(
          workspaceId,
          production.productionId,
          { revision: production.revision, quoteId: production.quote.quoteId },
          `pv.generate.${production.productionId}.${production.quote.quoteId}`,
          signal,
        ),
      );
    });
  const getRetryQuote = (sceneId: string) =>
    run(async (signal) => {
      if (!production) return;
      const quote = await productVideoService.retryQuote(
        workspaceId,
        production.productionId,
        sceneId,
        production.revision,
        signal,
      );
      if (active.current) setRetryQuote({ sceneId, quote });
    });
  const retryScene = () =>
    run(async (signal) => {
      if (
        !production ||
        !retryQuote ||
        Date.parse(retryQuote.quote.expiresAt) <= Date.now()
      )
        return;
      replace(
        await productVideoService.retryScene(
          workspaceId,
          production.productionId,
          retryQuote.sceneId,
          production.revision,
          retryQuote.quote.quoteId,
          `pv.retry.${production.productionId}.${retryQuote.quote.quoteId}`,
          signal,
        ),
      );
      if (active.current) setRetryQuote(null);
    });
  const retryRender = () =>
    run(async (signal) => {
      if (!production?.canRetryRender) return;
      replace(
        await productVideoService.retryRender(
          workspaceId,
          production.productionId,
          production.revision,
          renderKey.current,
          signal,
        ),
      );
      renderKey.current = crypto.randomUUID();
    });
  return {
    production,
    brief,
    files,
    sceneEdits,
    retryQuote,
    busy,
    error: error ?? result.error,
    loading: result.isLoading,
    dirty,
    editable,
    updateBrief,
    updateFile,
    editScene: (id: string, prompt: string) =>
      setSceneEdits({ ...sceneEdits, [id]: prompt }),
    plan,
    generate,
    getRetryQuote,
    retryScene,
    retryRender,
    refresh: () => (productionId ? result.refetch() : setError(null)),
  };
}
export type ProductVideoController = ReturnType<typeof useProductVideo>;
