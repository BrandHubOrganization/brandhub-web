import { useMemo } from "react";
import { useNavigate, useParams as useRouterParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  return useMemo(() => ({
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
  }), [navigate]);
}

export function useParams<T extends Record<string, string>>() {
  return useRouterParams() as T;
}
