export const CREDIT_QUERY_OPTIONS = {
  retry: false,
  staleTime: 30_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export const creditKeys = {
  scope: (userId: string | undefined, agencyId: string) =>
    ["credit", userId, agencyId] as const,
  prices: (userId: string | undefined) => ["credit", userId, "prices"] as const,
};
