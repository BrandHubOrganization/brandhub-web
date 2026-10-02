import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { mediaPackageService } from "@/pages/media-package/services/mediaPackageService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { extractErrorMessage, isNotFoundError } from "@/utils/error";
import type {
  CreateCustomMediaPackageRequest,
  MediaPackage,
  WorkspaceMediaPackage,
} from "@/pages/media-package/types/mediaPackage";

export function useWorkspaceMediaPackages(workspaceId: string | undefined) {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<MediaPackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<WorkspaceMediaPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [negotiating, setNegotiating] = useState(false);
  const [approving, setApproving] = useState(false);
  const loadRequestId = useRef(0);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    const requestId = ++loadRequestId.current;
    setLoading(true);
    setError(null);
    try {
      const selectionRequest = mediaPackageService
        .getWorkspacePackage(workspaceId)
        .then(({ data }) => data.data)
        .catch((requestError: unknown) => {
          if (isNotFoundError(requestError)) return null;
          throw requestError;
        });
      const packageRequest = mediaPackageService
        .listAvailableForWorkspace(workspaceId)
        .then(({ data }) => data.data)
        .catch(() => [] as MediaPackage[]);

      const [availablePackages, selection] = await Promise.all([
        packageRequest,
        selectionRequest,
      ]);
      if (requestId === loadRequestId.current) {
        setPackages(availablePackages);
        setSelectedPackage(selection);
        useWorkspaceStore
          .getState()
          .setWorkspaceMediaPackage(
            selection?.workspaceMediaPackageId ?? null,
            selection?.negotiationStatus ?? null,
          );
      }
    } catch (requestError: unknown) {
      if (requestId === loadRequestId.current) {
        setError(
          extractErrorMessage(requestError, t("mediaPackage.errors.load")),
        );
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [t, workspaceId]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => void load());
    return () => window.cancelAnimationFrame(frameId);
  }, [load]);

  const selectPackage = async (packageId: string) => {
    if (!workspaceId) return;
    setSelectingId(packageId);
    try {
      await mediaPackageService.selectForWorkspace(workspaceId, packageId);
      const { data } =
        await mediaPackageService.getWorkspacePackage(workspaceId);
      setSelectedPackage(data.data);
      useWorkspaceStore
        .getState()
        .setWorkspaceMediaPackage(
          data.data.workspaceMediaPackageId,
          data.data.negotiationStatus,
        );
      toast.success(t("mediaPackage.messages.selected"));
    } catch (requestError: unknown) {
      toast.error(
        extractErrorMessage(requestError, t("mediaPackage.errors.select")),
      );
    } finally {
      setSelectingId(null);
    }
  };

  const negotiateTerms = async (terms: {
    budgetAmount?: number;
    durationWeeks?: number;
    scopeDescription?: string;
  }): Promise<boolean> => {
    if (!workspaceId) return false;
    setNegotiating(true);
    try {
      const { data } = await mediaPackageService.negotiateTerms(
        workspaceId,
        terms,
      );
      setSelectedPackage(data.data);
      useWorkspaceStore
        .getState()
        .setWorkspaceMediaPackage(
          data.data.workspaceMediaPackageId,
          data.data.negotiationStatus,
        );
      toast.success(
        t(
          "mediaPackage.messages.negotiateSuccess",
          "Đã gửi đề xuất điều chỉnh điều khoản thành công.",
        ),
      );
      return true;
    } catch (requestError: unknown) {
      toast.error(
        extractErrorMessage(
          requestError,
          t(
            "mediaPackage.errors.negotiate",
            "Không thể gửi đề xuất điều chỉnh.",
          ),
        ),
      );
      return false;
    } finally {
      setNegotiating(false);
    }
  };

  const approvePackage = async (): Promise<boolean> => {
    if (!workspaceId) return false;
    setApproving(true);
    try {
      const { data } = await mediaPackageService.approvePackage(workspaceId);
      setSelectedPackage(data.data);
      useWorkspaceStore
        .getState()
        .setWorkspaceMediaPackage(
          data.data.workspaceMediaPackageId,
          data.data.negotiationStatus,
        );
      toast.success(
        t(
          "mediaPackage.messages.approveSuccess",
          "Đã chấp thuận gói dịch vụ thành công.",
        ),
      );
      return true;
    } catch (requestError: unknown) {
      toast.error(
        extractErrorMessage(
          requestError,
          t("mediaPackage.errors.approve", "Không thể chấp thuận gói dịch vụ."),
        ),
      );
      return false;
    } finally {
      setApproving(false);
    }
  };

  return {
    agencyPackages: packages,
    selectedPackage:
      selectedPackage?.workspaceId === workspaceId ? selectedPackage : null,
    loading,
    error,
    selectingId,
    negotiating,
    approving,
    load,
    selectPackage,
    negotiateTerms,
    approvePackage,
  };
}

export function useAgencyMediaPackages(agencyId: string | undefined) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<MediaPackage[]>([]);
  const [customPackages, setCustomPackages] = useState<MediaPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [updatingPackageId, setUpdatingPackageId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const loadRequestId = useRef(0);

  const load = useCallback(async () => {
    if (!agencyId) return;
    const requestId = ++loadRequestId.current;
    setLoading(true);
    setError(null);
    try {
      const [templateResponse, customResponse] = await Promise.all([
        mediaPackageService.listTemplates(),
        mediaPackageService.listAgencyCustom(agencyId),
      ]);
      if (requestId === loadRequestId.current) {
        setTemplates(templateResponse.data.data);
        setCustomPackages(customResponse.data.data);
      }
    } catch (requestError: unknown) {
      if (requestId === loadRequestId.current) {
        setError(
          extractErrorMessage(requestError, t("mediaPackage.errors.load")),
        );
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [agencyId, t]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => void load());
    return () => window.cancelAnimationFrame(frameId);
  }, [load]);

  const createCustomPackage = async (
    request: CreateCustomMediaPackageRequest,
  ) => {
    if (!agencyId) return false;
    setCreatingCustom(true);
    try {
      const { data } = await mediaPackageService.createCustom(
        agencyId,
        request,
      );
      setCustomPackages((current) => [data.data, ...current]);
      toast.success(t("mediaPackage.messages.customCreated"));
      return true;
    } catch (requestError: unknown) {
      toast.error(
        extractErrorMessage(
          requestError,
          t("mediaPackage.errors.createCustom"),
        ),
      );
      return false;
    } finally {
      setCreatingCustom(false);
    }
  };

  const updateAvailability = async (packageId: string, available: boolean) => {
    if (!agencyId) return;
    setUpdatingPackageId(packageId);
    try {
      const { data } = await mediaPackageService.updateAvailability(
        agencyId,
        packageId,
        available,
      );
      setCustomPackages((current) =>
        current.map((item) => (item.id === packageId ? data.data : item)),
      );
      toast.success(
        t(
          available
            ? "mediaPackage.messages.packageShown"
            : "mediaPackage.messages.packageHidden",
        ),
      );
    } catch (requestError: unknown) {
      toast.error(
        extractErrorMessage(
          requestError,
          t("mediaPackage.errors.updateAvailability"),
        ),
      );
    } finally {
      setUpdatingPackageId(null);
    }
  };

  return {
    templates,
    customPackages,
    loading,
    creatingCustom,
    updatingPackageId,
    error,
    load,
    createCustomPackage,
    updateAvailability,
  };
}
