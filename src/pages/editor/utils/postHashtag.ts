export function normalizePostHashtag(value: string) {
  return value.trim().replace(/^#+/, "").normalize("NFC").toLowerCase();
}

export function formatPostHashtag(value: string) {
  const tag = value.trim().replace(/^#+/, "");
  return tag ? `#${tag}` : "";
}

export function hasPostHashtag(hashtags: string[], candidate: string) {
  const normalizedCandidate = normalizePostHashtag(candidate);
  return hashtags.some(
    (hashtag) => normalizePostHashtag(hashtag) === normalizedCandidate,
  );
}
