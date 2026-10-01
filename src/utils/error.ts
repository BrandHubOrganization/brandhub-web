/**
 * Trích xuất error message từ backend error response.
 * Backend trả về: { response: { data: { error: { message, details: { fields } } } } }
 * VALIDATION_ERROR luôn có message generic ("Request validation failed") —
 * ưu tiên field lỗi đầu tiên trong details.fields để user biết chỗ sai thật.
 */
export function extractErrorMessage(err: unknown, defaultMsg: string): string {
  const error = (
    err as {
      response?: {
        data?: {
          error?: {
            message?: string;
            details?: { fields?: Record<string, string> };
          };
        };
      };
    }
  )?.response?.data?.error;

  const fieldErrors = error?.details?.fields;
  if (fieldErrors) {
    const firstEntry = Object.entries(fieldErrors)[0];
    if (firstEntry) {
      const [field, message] = firstEntry;
      return `${field}: ${message}`;
    }
  }

  return error?.message ?? defaultMsg;
}

/**
 * 404 = chưa có dữ liệu, không phải lỗi. Dùng để hiện empty state thay vì toast.
 */
export function isNotFoundError(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 404;
}
