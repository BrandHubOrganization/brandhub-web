/**
 * Trích xuất error message từ backend error response.
 * Backend trả về: { response: { data: { error: { message: string } } } }
 */
export function extractErrorMessage(err: unknown, defaultMsg: string): string {
  return (
    (err as { response?: { data?: { error?: { message?: string } } } })
      ?.response?.data?.error?.message ?? defaultMsg
  );
}

/**
 * 404 = chưa có dữ liệu, không phải lỗi. Dùng để hiện empty state thay vì toast.
 */
export function isNotFoundError(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 404;
}
