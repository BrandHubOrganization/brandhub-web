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
