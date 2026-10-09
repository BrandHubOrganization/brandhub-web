import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addHashtag,
  listHashtags,
  removeHashtag,
} from "@/pages/hashtag-groups/services/hashtagService";
import type {
  CreateHashtag,
  HashtagFilter,
} from "@/pages/hashtag-groups/types/hashtag";

export function useHashtagCollection(workspaceId: string, userId: string) {
  const client = useQueryClient();
  const [filter, setFilter] = useState<HashtagFilter>({
    q: "",
    purpose: "",
    isRequired: undefined,
    page: 0,
  });
  const key = ["hashtag-collection", userId, workspaceId];
  const query = useQuery({
    queryKey: [...key, filter],
    queryFn: ({ signal }) => listHashtags(workspaceId, filter, signal),
    retry: false,
    gcTime: 0,
  });
  const create = useMutation({
    mutationFn: (payload: CreateHashtag) => addHashtag(workspaceId, payload),
    onSuccess: async () => {
      setFilter({ q: "", purpose: "", isRequired: undefined, page: 0 });
      await client.invalidateQueries({ queryKey: key });
    },
  });
  const remove = useMutation({
    mutationFn: ({ hashtagId, version }: { hashtagId: string; version: number }) =>
      removeHashtag(workspaceId, hashtagId, version),
    onSuccess: async () => {
      setFilter((previous) => ({ ...previous, page: 0 }));
      await client.invalidateQueries({ queryKey: key });
    },
  });
  function changeFilter(change: Partial<HashtagFilter>) {
    setFilter((previous) => ({
      ...previous,
      ...change,
      page: change.page ?? 0,
    }));
  }
  return { filter, changeFilter, query, create, remove };
}
