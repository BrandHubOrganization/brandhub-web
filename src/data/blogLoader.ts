import { BLOG_POST_SUMMARIES } from "./blogPostIndex";
import type { BlogBatchKey, BlogPost, BlogPostSummary } from "./blogTypes";

export { BLOG_POST_SUMMARIES };

const SUMMARY_BY_SLUG = new Map<string, BlogPostSummary>(
  BLOG_POST_SUMMARIES.map((s) => [s.slug, s]),
);

const FULL_POST_CACHE = new Map<string, BlogPost>();
const LOADED_BATCHES = new Map<BlogBatchKey, Promise<BlogPost[]>>();

const BATCH_IMPORTERS: Record<BlogBatchKey, () => Promise<BlogPost[]>> = {
  pillar: () => import("./blogPillarPosts").then((m) => m.BLOG_PILLAR_POSTS),
  b1p1: () => import("./blogBatch1Part1").then((m) => m.BLOG_BATCH1_PART1_POSTS),
  b1p2: () => import("./blogBatch1Part2").then((m) => m.BLOG_BATCH1_PART2_POSTS),
  b2p1: () => import("./blogBatch2Part1").then((m) => m.BLOG_BATCH2_PART1_POSTS),
  b2p2: () => import("./blogBatch2Part2").then((m) => m.BLOG_BATCH2_PART2_POSTS),
  b2p3: () => import("./blogBatch2Part3").then((m) => m.BLOG_BATCH2_PART3_POSTS),
  b3p1: () => import("./blogBatch3Part1").then((m) => m.BLOG_BATCH3_PART1_POSTS),
  b3p2: () => import("./blogBatch3Part2").then((m) => m.BLOG_BATCH3_PART2_POSTS),
  b4p1: () => import("./blogBatch4Part1").then((m) => m.BLOG_BATCH4_PART1_POSTS),
  b4p2: () => import("./blogBatch4Part2").then((m) => m.BLOG_BATCH4_PART2_POSTS),
};

export function getBlogPostSummaryBySlug(
  slug: string,
): BlogPostSummary | undefined {
  return SUMMARY_BY_SLUG.get(slug);
}

export function getCachedBlogPostBySlug(slug: string): BlogPost | undefined {
  return FULL_POST_CACHE.get(slug);
}

export async function loadBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const cached = FULL_POST_CACHE.get(slug);
  if (cached) return cached;

  const summary = SUMMARY_BY_SLUG.get(slug);
  if (!summary) return undefined;

  let batchPromise = LOADED_BATCHES.get(summary.batchKey);
  if (!batchPromise) {
    batchPromise = BATCH_IMPORTERS[summary.batchKey]().then((posts) => {
      for (const p of posts) {
        FULL_POST_CACHE.set(p.slug, p);
      }
      return posts;
    });
    LOADED_BATCHES.set(summary.batchKey, batchPromise);
  }

  await batchPromise;
  return FULL_POST_CACHE.get(slug);
}
