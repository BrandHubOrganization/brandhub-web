import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function useClearStoragePreview() {
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    if (!params.has("storagePreview")) return;
    const clean = new URLSearchParams(params);
    clean.delete("storagePreview");
    clean.delete("variant");
    setParams(clean, { replace: true });
  }, [params, setParams]);
}
