import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";
import { userService, type UserLookupResponse } from "@/services/userService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Tra cứu exact-match user theo email khi gõ đủ email hợp lệ (debounced).
 * Dùng để gợi ý "người này đã có tài khoản" khi mời thành viên/khách hàng. */
export function useUserLookup(email: string) {
  const debouncedEmail = useDebounce(email.trim().toLowerCase(), 400);
  const [match, setMatch] = useState<UserLookupResponse | null>(null);

  useEffect(() => {
    if (!EMAIL_RE.test(debouncedEmail)) {
      setMatch(null);
      return;
    }
    let cancelled = false;
    userService
      .lookupByEmail(debouncedEmail)
      .then(({ data }) => {
        if (!cancelled) setMatch(data.data);
      })
      .catch(() => {
        if (!cancelled) setMatch(null);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedEmail]);

  return match;
}
