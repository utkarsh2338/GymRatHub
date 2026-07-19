import { create } from "zustand";
import type { CommunityPost } from "@/lib/types/community";

interface CommunityState {
  posts: CommunityPost[];
  currentUserId: string | null;

  // Setters
  setCurrentUserId: (id: string | null) => void;
  setPosts: (posts: CommunityPost[]) => void;

  // Optimistic CRUD actions
  addPost: (post: CommunityPost) => void;
  updatePost: (id: string, patch: Partial<CommunityPost>) => void;
  removePost: (id: string) => void;

  // Optimistic like toggle
  toggleLike: (postId: string, userId: string) => void;

  // Optimistic comment count
  incrementCommentCount: (postId: string) => void;
  decrementCommentCount: (postId: string) => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  posts: [],
  currentUserId: null,

  setCurrentUserId: (id) => set({ currentUserId: id }),

  setPosts: (posts) => set({ posts }),

  addPost: (post) =>
    set((state) => ({ posts: [post, ...state.posts] })),

  updatePost: (id, patch) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  removePost: (id) =>
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),

  toggleLike: (postId, userId) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const alreadyLiked = p.likes.includes(userId);
        const newLikes = alreadyLiked
          ? p.likes.filter((id) => id !== userId)
          : [...p.likes, userId];
        return { ...p, likes: newLikes, liked: !alreadyLiked };
      }),
    })),

  incrementCommentCount: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ),
    })),

  decrementCommentCount: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) }
          : p
      ),
    })),
}));
