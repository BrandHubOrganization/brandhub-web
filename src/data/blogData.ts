import { BLOG_AUTHORS, type BlogAuthor } from "./blogAuthors";
import { BLOG_CATEGORIES, getBlogCategoryBySlug } from "./blogCategories";
import { BLOG_PILLAR_POSTS } from "./blogPillarPosts";
import { BLOG_BATCH1_PART1_POSTS } from "./blogBatch1Part1";
import { BLOG_BATCH1_PART2_POSTS } from "./blogBatch1Part2";
import { BLOG_BATCH2_PART1_POSTS } from "./blogBatch2Part1";
import { BLOG_BATCH2_PART2_POSTS } from "./blogBatch2Part2";
import { BLOG_BATCH2_PART3_POSTS } from "./blogBatch2Part3";
import { BLOG_BATCH3_PART1_POSTS } from "./blogBatch3Part1";
import { BLOG_BATCH3_PART2_POSTS } from "./blogBatch3Part2";
import { BLOG_BATCH4_PART1_POSTS } from "./blogBatch4Part1";
import { BLOG_BATCH4_PART2_POSTS } from "./blogBatch4Part2";
import type {
  BlogCategorySlug,
  CanonicalRole,
  SearchIntentType,
  BlogCategory,
  BlogComparisonTable,
  BlogInlineCta,
  BlogSection,
  BlogPost,
  BlogPostPreview,
  PlannedBlogTopic,
} from "./blogTypes";

export {
  BLOG_AUTHORS,
  BLOG_CATEGORIES,
  getBlogCategoryBySlug,
  type BlogAuthor,
  type BlogCategorySlug,
  type CanonicalRole,
  type SearchIntentType,
  type BlogCategory,
  type BlogComparisonTable,
  type BlogInlineCta,
  type BlogSection,
  type BlogPost,
  type BlogPostPreview,
  type PlannedBlogTopic,
};

/**
 * Toàn bộ 100 bài viết phân tích chuyên sâu của cả 4 đợt (#001 -> #100)
 * 6 Bài Trụ cột (Pillar Articles) đặt ở đầu, theo sau là toàn bộ chuỗi Cluster Articles.
 */
export const BLOG_POSTS: BlogPost[] = [
  ...BLOG_PILLAR_POSTS,
  ...BLOG_BATCH1_PART1_POSTS,
  ...BLOG_BATCH1_PART2_POSTS,
  ...BLOG_BATCH2_PART1_POSTS,
  ...BLOG_BATCH2_PART2_POSTS,
  ...BLOG_BATCH2_PART3_POSTS,
  ...BLOG_BATCH3_PART1_POSTS,
  ...BLOG_BATCH3_PART2_POSTS,
  ...BLOG_BATCH4_PART1_POSTS,
  ...BLOG_BATCH4_PART2_POSTS,
];

const BLOG_POST_SLUG_MAP = new Map<string, BlogPost>(
  BLOG_POSTS.map((post) => [post.slug, post]),
);

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POST_SLUG_MAP.get(slug);
}

export default BLOG_POSTS;
