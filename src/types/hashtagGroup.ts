export interface HashtagGroup {
  id: string;
  name: string;
  hashtags: string[];
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHashtagGroupPayload {
  name: string;
  hashtags: string[];
}
