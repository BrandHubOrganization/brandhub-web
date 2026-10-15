/** Reject invalid envelopes rather than resolving queries with undefined data. */
export function requireApiData<T>(envelope: unknown): T {
  if (typeof envelope !== "object" || envelope === null || !("success" in envelope)
      || envelope.success !== true || !("data" in envelope) || envelope.data == null) {
    throw new Error("INVALID_API_RESPONSE");
  }
  return envelope.data as T;
}
