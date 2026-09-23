const REDIRECT_KEY = "brandhub-auth-redirect";

/** Lưu đích cần quay lại sau khi đăng nhập/đăng ký xong (vd: link accept invitation). */
export function saveAuthRedirect(path: string | null | undefined): void {
  if (!path || path === "/dashboard") return;
  sessionStorage.setItem(REDIRECT_KEY, path);
}

/** Đọc đích đã lưu mà không xoá — dùng ở các bước trung gian (OTP/2FA) để biết còn redirect chờ hay không. */
export function peekAuthRedirect(): string | null {
  return sessionStorage.getItem(REDIRECT_KEY);
}

/** Đọc + xoá đích đã lưu — gọi đúng 1 lần ở bước cuối cùng khi đã có token thật. */
export function consumeAuthRedirect(fallback = "/dashboard"): string {
  const target = sessionStorage.getItem(REDIRECT_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  return target || fallback;
}
