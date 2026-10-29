import { api } from "@/services/api";
import { requireApiData } from "@/lib/apiData";
import type {
  CreditPriceImportPreview,
  CreditPriceImportRequest,
  CreditPriceImportResult,
} from "@/pages/credit/types/creditPriceImport";

const path = "/api/v1/admin/credit/prices/import";
export const creditPriceImportService = {
  async preview(file: File, signal?: AbortSignal) {
    const form = new FormData();
    form.append("file", file);
    return requireApiData<CreditPriceImportPreview>(
      (await api.post(`${path}/preview`, form, { signal })).data,
    );
  },
  async apply(file: File, request: CreditPriceImportRequest) {
    const form = new FormData();
    form.append("file", file);
    form.append(
      "request",
      new Blob([JSON.stringify(request)], { type: "application/json" }),
    );
    return requireApiData<CreditPriceImportResult>(
      (await api.post(`${path}/apply`, form)).data,
    );
  },
};
