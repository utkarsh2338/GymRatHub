// ─── Community Extended Types ───────────────────────────────────────────────
// These extend the base Post/Comment types with richer fields needed for
// the full CRUD social feed implementation.

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  content: string;
  imageUrl?: string;
  workoutData?: { type: string; value: string } | null;
  tags?: string[];
  /** Array of clerkIds who liked this post */
  likes: string[];
  /** Whether the current user has liked this post */
  liked: boolean;
  commentsCount: number;
  shares: number;
  createdAt: string;
  editedAt?: string | null;
  type?: "general" | "achievement" | "progress";
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
}
