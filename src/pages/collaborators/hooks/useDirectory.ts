import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { directoryService } from "../services/directoryService";
import type { DirectoryPartner, PartnerPage } from "../types";
import { SAMPLE_DIRECTORY_PARTNERS } from "../sampleCollaborators";

export function useDirectory(agencyId: string) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [type, setType] = useState("");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [demoPartners] = useState<DirectoryPartner[]>(SAMPLE_DIRECTORY_PARTNERS);
  const [result, setResult] = useState<{ key: string; data?: PartnerPage<DirectoryPartner>; error?: boolean }>();
  const key = JSON.stringify([agencyId, page, search, active, type, revision]);

  const reload = () => {
    setDemoLoaded(false);
    setRevision((value) => value + 1);
  };

  useEffect(() => {
    if (demoLoaded) return;
    let current = true;
    const timer = setTimeout(() => {
      directoryService
        .list(agencyId, {
          page,
          search,
          active: active === "all" ? undefined : active === "true",
          type: type || undefined,
        })
        .then((response) => {
          if (current) setResult({ key, data: response.data.data });
        })
        .catch(() => {
          if (current) setResult({ key, error: true });
        });
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [agencyId, page, search, active, type, key, demoLoaded]);

  const loadDemoData = () => {
    setDemoLoaded(true);
    toast.success(t("collaborators.demoLoaded"));
  };

  const filteredDemo = useMemo(() => {
    if (!demoLoaded) return null;
    return demoPartners.filter((p) => {
      if (search && !p.partnerName.toLowerCase().includes(search.toLowerCase())) return false;
      if (active !== "all" && String(p.isActive) !== active) return false;
      if (type && p.partnerType !== type) return false;
      return true;
    });
  }, [demoLoaded, demoPartners, search, active, type]);

  async function mutate(operation: () => Promise<unknown>) {
    if (busy) return false;
    setBusy(true);
    try {
      await operation();
      toast.success(t("collaborators.saved"));
      reload();
      return true;
    } catch (failure) {
      const code = isAxiosError<{ error?: { code?: string } }>(failure)
        ? failure.response?.data.error?.code
        : undefined;
      const known = [
        "COLLABORATOR_USED",
        "COLLABORATOR_HISTORY_UNVERIFIED",
        "COLLABORATOR_VERSION_CONFLICT",
        "FORBIDDEN",
      ];
      toast.error(
        t(
          known.includes(code ?? "")
            ? `collaborators.errors.${code}`
            : "collaborators.error",
        ),
      );
      reload();
      return false;
    } finally {
      setBusy(false);
    }
  }

  const filter = (setter: (value: string) => void) => (value: string) => {
    setPage(0);
    setter(value);
  };

  const data: PartnerPage<DirectoryPartner> | undefined =
    demoLoaded && filteredDemo
      ? {
          content: filteredDemo,
          totalElements: filteredDemo.length,
          totalPages: Math.max(1, Math.ceil(filteredDemo.length / 20)),
          size: 20,
          number: page,
        }
      : result?.key === key
        ? result.data
        : undefined;

  return {
    page,
    setPage,
    search,
    setSearch: filter(setSearch),
    active,
    setActive: filter(setActive),
    type,
    setType: filter(setType),
    busy,
    mutate,
    reload,
    loadDemoData,
    isDemo: demoLoaded,
    loading: !demoLoaded && result?.key !== key,
    data,
    error: !demoLoaded && result?.key === key && result.error,
  };
}
