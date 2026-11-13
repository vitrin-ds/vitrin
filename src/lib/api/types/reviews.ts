import type { ImageAsset } from "./catalog";

/** A customer review (Figma Reviews, module 06.02). */
export interface Review {
  id: string;
  productId: string;
  /** Display name as the customer chose it. */
  author: string;
  /** 1–5. */
  rating: number;
  title: string;
  body: string;
  /** ISO 8601. */
  date: string;
  /** Bought through this store. */
  verified: boolean;
  photos: ImageAsset[];
  /** "Was this review helpful?" votes. */
  helpfulCount: number;
  notHelpfulCount: number;
  /** "pending" = sent by this visitor and awaiting moderation; published reviews omit it. */
  status?: "pending";
}

export type ReviewVote = "helpful" | "not-helpful";

/** What Write a Review sends. Photos aren't stored by the mock. */
export interface ReviewInput {
  /** 1–5. */
  rating: number;
  title: string;
  body: string;
  recommend: "yes" | "no" | null;
  nickname: string;
  email: string;
}
