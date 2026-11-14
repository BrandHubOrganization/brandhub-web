import type { BlogAuthor } from "./blogAuthors";

export type BlogCategorySlug =
  | "agency-project-management"
  | "content-workflow-approval"
  | "media-package-campaign"
  | "ai-studio-graphrag-trends"
  | "multi-channel-publishing"
  | "tool-comparison-case-study";

export type CanonicalRole =
  | "Guest"
  | "Owner"
  | "Manager"
  | "Creator"
  | "Client"
  | "Admin";

export type SearchIntentType =
  | "Informational"
  | "Commercial"
  | "Transactional"
  | "Comparison";

export interface BlogCategory {
  slug: BlogCategorySlug;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
  pillarKeyword: string;
  relatedDomain: string;
  iconName: string;
  plannedCount: number;
}

export interface BlogComparisonTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface BlogInlineCta {
  badge: string;
  title: string;
  description: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
  featureHighlight: string;
}

export interface BlogSection {
  id: string;
  heading: string;
  paragraphs: string[];
  subheadings?: {
    title: string;
    body: string;
  }[];
  checklist?: string[];
  comparisonTable?: BlogComparisonTable;
  callout?: {
    label: string;
    text: string;
  };
  inlineCta?: BlogInlineCta;
}

export interface BlogPost {
  id: string;
  topicNumber: number;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: BlogCategorySlug;
  primaryKeyword: string;
  secondaryKeywords: string[];
  hashtags: string[];
  searchIntent: SearchIntentType;
  targetRoles: CanonicalRole[];
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  author: BlogAuthor;
  coverImage: string;
  coverImageAlt: string;
  /** 130-170 words direct answer optimized for Google AI Overviews, ChatGPT Search & Perplexity (GEO) */
  geoSummary: string;
  keyTakeaways: string[];
  sections: BlogSection[];
  faqs: {
    question: string;
    answer: string;
  }[];
  primaryCta: BlogInlineCta;
  relatedSlugs: string[];
}

export type BlogBatchKey =
  | "pillar"
  | "b1p1"
  | "b1p2"
  | "b2p1"
  | "b2p2"
  | "b2p3"
  | "b3p1"
  | "b3p2"
  | "b4p1"
  | "b4p2";

export type BlogPostSummary = Omit<
  BlogPost,
  "sections" | "faqs" | "primaryCta"
> & {
  batchKey: BlogBatchKey;
};

export interface BlogPostPreview {
  id: string;
  topicNumber: number;
  slug: string;
  title: string;
  metaDescription: string;
  category: BlogCategorySlug;
  hashtags: string[];
  publishedAt: string;
  readingTimeMinutes: number;
  author: BlogAuthor;
  coverImage: string;
  coverImageAlt: string;
}

export interface PlannedBlogTopic {
  topicNumber: number;
  slug: string;
  title: string;
  category: BlogCategorySlug;
  primaryKeyword: string;
  searchIntent: SearchIntentType;
  targetRoles: CanonicalRole[];
  brandhubFeature: string;
  ctaTarget: string;
  priorityBatch: "Batch 1" | "Batch 2" | "Batch 3" | "Batch 4";
  isPublished: boolean;
}
