"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Trophy,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Camera,
  Dumbbell,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  Search,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { mockLeaderboard, mockChallenges } from "@/lib/mock-data";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";
import { useUser } from "@/lib/auth-context";
import { useCommunityStore } from "@/lib/stores/communityStore";
import type { CommunityPost, CommunityComment } from "@/lib/types/community";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  Pro: { bg: "#39E60918", color: "#39E609" },
  Elite: { bg: "#f9731618", color: "#f97316" },
  Trainer: { bg: "#38bdf818", color: "#38bdf8" },
  Ambassador: { bg: "#a855f718", color: "#a855f7" },
};

const FILTERS = ["Recent", "Most Liked", "Following"] as const;
type FilterType = (typeof FILTERS)[number];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function relativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */

function Avatar({
  name,
  size = 42,
  color = "#39E609",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}18`,
        border: `1.5px solid ${color}38`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        fontWeight: 700,
        fontSize: size * 0.31,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── PostSkeleton ────────────────────────────────────────────────────────── */

function PostSkeleton() {
  return (
    <div
      style={{
        background: "#1c1c1c",
        border: "1px solid #2a2a2a",
        borderRadius: 14,
        padding: "18px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-line {
          background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
        }
      `}</style>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div className="skeleton-line" style={{ width: 42, height: 42, borderRadius: "50%" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="skeleton-line" style={{ height: 12, width: "40%" }} />
          <div className="skeleton-line" style={{ height: 10, width: "25%" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div className="skeleton-line" style={{ height: 12, width: "95%" }} />
        <div className="skeleton-line" style={{ height: 12, width: "80%" }} />
        <div className="skeleton-line" style={{ height: 12, width: "60%" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-line" style={{ flex: 1, height: 36, borderRadius: 8 }} />
        ))}
      </div>
    </div>
  );
}

/* ─── EmptyFeed ──────────────────────────────────────────────────────────── */

function EmptyFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 32px",
        background: "#1c1c1c",
        border: "1px solid #2a2a2a",
        borderRadius: 14,
        gap: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(57,230,9,0.1)",
          border: "1px solid rgba(57,230,9,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Dumbbell size={32} color="#39E609" />
      </div>
      <div>
        <p style={{ color: "#ffffff", fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>
          No posts yet
        </p>
        <p style={{ color: "#6b7280", fontSize: 13, margin: 0, maxWidth: 300 }}>
          Be the first to share your progress! Post a PR, workout, or tip to inspire the community.
        </p>
      </div>
    </motion.div>
  );
}

/* ─── DeleteConfirmModal ─────────────────────────────────────────────────── */

function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1c1c1c",
          border: "1px solid #3a3a3a",
          borderRadius: 16,
          padding: "28px 24px",
          maxWidth: 380,
          width: "100%",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Trash2 size={20} color="#ef4444" />
        </div>
        <h3
          style={{
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 16,
            margin: "0 0 8px",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {title}
        </h3>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 24px", lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              color: "#9ca3af",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              background: loading ? "#7f1d1d" : "#ef4444",
              border: "none",
              borderRadius: 10,
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── CommentsSection ────────────────────────────────────────────────────── */

function CommentsSection({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string | null;
}) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { incrementCommentCount, decrementCommentCount } = useCommunityStore();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useUser();

  const { data: comments = [], isLoading } = useQuery<CommunityComment[]>({
    queryKey: ["comments", postId],
    queryFn: () => api(`/community/posts/${postId}/comments`),
    staleTime: 30_000,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      api(`/community/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onMutate: () => {
      // Optimistically bump count in the feed
      incrementCommentCount(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setNewComment("");
    },
    onError: () => {
      decrementCommentCount(postId);
      toast.error("Failed to post comment.");
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      api(`/community/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setEditingId(null);
      toast.success("Comment updated.");
    },
    onError: () => toast.error("Failed to edit comment."),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      api(`/community/posts/${postId}/comments/${commentId}`, { method: "DELETE" }),
    onMutate: () => {
      decrementCommentCount(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setDeletingId(null);
      toast.success("Comment deleted.");
    },
    onError: () => {
      incrementCommentCount(postId);
      toast.error("Failed to delete comment.");
    },
  });

  const handleSubmitComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    addCommentMutation.mutate(trimmed);
  };

  return (
    <div style={{ padding: "0 18px 16px", borderTop: "1px solid #222" }}>
      {/* Add comment */}
      <div style={{ display: "flex", gap: 8, paddingTop: 14, marginBottom: 12 }}>
        <Avatar name={user?.fullName || "You"} size={32} />
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitComment()}
            placeholder="Write a comment…"
            style={{
              flex: 1,
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 13,
              color: "#ffffff",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(57,230,9,0.45)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
          />
          <button
            disabled={!newComment.trim() || addCommentMutation.isPending}
            onClick={handleSubmitComment}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: newComment.trim() ? "#39E609" : "#222",
              border: "none",
              cursor: newComment.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            <Send size={14} color={newComment.trim() ? "#000" : "#555"} />
          </button>
        </div>
      </div>

      {/* Comment list */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid rgba(57,230,9,0.1)",
              borderTopColor: "#39E609",
              borderRadius: "50%",
              animation: "feed-spin 0.6s linear infinite",
            }}
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 12px",
                  background: "#111",
                  borderRadius: 10,
                  border: "1px solid #222",
                }}
              >
                <Avatar name={comment.authorName} size={28} color="#9ca3af" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ color: "#ffffff", fontWeight: 600, fontSize: 12 }}>
                      {comment.authorName}
                    </span>
                    <span style={{ color: "#4b5563", fontSize: 11 }}>
                      {relativeTime(comment.createdAt)}
                    </span>
                    {comment.editedAt && (
                      <span style={{ color: "#4b5563", fontSize: 11 }}>(edited)</span>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                        style={{
                          flex: 1,
                          background: "#1c1c1c",
                          border: "1px solid rgba(57,230,9,0.45)",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 12,
                          color: "#fff",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() =>
                          editCommentMutation.mutate({
                            commentId: comment.id,
                            content: editContent,
                          })
                        }
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#39E609" }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <p style={{ color: "#d1d5db", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                      {comment.content}
                    </p>
                  )}
                </div>

                {/* Edit / Delete for own comments */}
                {comment.authorId === currentUserId && editingId !== comment.id && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#4b5563",
                        padding: "2px",
                      }}
                      title="Edit comment"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setDeletingId(comment.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#4b5563",
                        padding: "2px",
                      }}
                      title="Delete comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {comments.length === 0 && !isLoading && (
            <p style={{ color: "#4b5563", fontSize: 12, textAlign: "center", padding: "8px 0" }}>
              No comments yet. Be the first!
            </p>
          )}
        </div>
      )}

      {/* Delete comment confirm */}
      <AnimatePresence>
        {deletingId && (
          <DeleteConfirmModal
            title="Delete comment?"
            message="This will permanently remove your comment."
            onConfirm={() => deleteCommentMutation.mutate(deletingId)}
            onCancel={() => setDeletingId(null)}
            loading={deleteCommentMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── EditPostModal ──────────────────────────────────────────────────────── */

function EditPostModal({
  post,
  onClose,
  onSave,
  saving,
}: {
  post: CommunityPost;
  onClose: () => void;
  onSave: (data: { content: string; tags: string[] }) => void;
  saving: boolean;
}) {
  const [content, setContent] = useState(post.content);
  const [tagsStr, setTagsStr] = useState((post.tags || []).join(", "));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ content: trimmed, tags });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1c1c1c",
          border: "1px solid #3a3a3a",
          borderRadius: 16,
          padding: "24px",
          maxWidth: 520,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3
            style={{
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 16,
              margin: 0,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Edit Post
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
          >
            <X size={18} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            background: "#111",
            border: "1px solid rgba(57,230,9,0.35)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 14,
            color: "#ffffff",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.6,
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />

        <div style={{ marginTop: 12 }}>
          <label style={{ color: "#6b7280", fontSize: 12, display: "block", marginBottom: 6 }}>
            Tags (comma-separated)
          </label>
          <input
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="e.g. PR, legday, strength"
            style={{
              width: "100%",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: "9px 14px",
              fontSize: 13,
              color: "#ffffff",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(57,230,9,0.35)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              color: "#9ca3af",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            style={{
              flex: 1,
              padding: "10px",
              background: saving || !content.trim() ? "#1a3a0a" : "#39E609",
              border: "none",
              borderRadius: 10,
              color: saving || !content.trim() ? "#39E609" : "#000",
              fontSize: 13,
              fontWeight: 700,
              cursor: saving || !content.trim() ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── PostCard ───────────────────────────────────────────────────────────── */

function PostCard({
  post,
  index,
  currentUserId,
}: {
  post: CommunityPost;
  index: number;
  currentUserId: string | null;
}) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { toggleLike, updatePost, removePost } = useCommunityStore();

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId !== null && post.authorId === currentUserId;
  const badge = post.authorBadge;
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Like mutation – optimistic */
  const likeMutation = useMutation({
    mutationFn: () =>
      api(`/community/posts/${post.id}/like`, { method: "POST" }),
    onMutate: () => {
      if (!currentUserId) return;
      toggleLike(post.id, currentUserId);
    },
    onSuccess: (data) => {
      updatePost(post.id, { likes: data.likes, liked: data.liked });
    },
    onError: () => {
      if (!currentUserId) return;
      // Rollback
      toggleLike(post.id, currentUserId);
      toast.error("Failed to update like.");
    },
  });

  /* Edit mutation */
  const editMutation = useMutation({
    mutationFn: (payload: { content: string; tags: string[] }) =>
      api(`/community/posts/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      updatePost(post.id, {
        content: data.content,
        tags: data.tags,
        editedAt: data.editedAt,
      });
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast.success("Post updated.");
    },
    onError: () => toast.error("Failed to update post."),
  });

  /* Delete mutation */
  const deleteMutation = useMutation({
    mutationFn: () =>
      api(`/community/posts/${post.id}`, { method: "DELETE" }),
    onSuccess: () => {
      removePost(post.id);
      setShowDeleteModal(false);
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      toast.success("Post deleted.");
    },
    onError: () => toast.error("Failed to delete post."),
  });

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community#${post.id}`).catch(() => {});
    toast.success("Link copied to clipboard!");
  };

  return (
    <>
      <motion.div
        id={`post-${post.id}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        style={{
          background: "#1c1c1c",
          border: "1px solid #2a2a2a",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={post.authorName} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ color: "#ffffff", fontWeight: 600, fontSize: 14 }}>
                  {post.authorName}
                </span>

                {badge && badgeStyle && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 5,
                      background: badgeStyle.bg,
                      color: badgeStyle.color,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {badge}
                  </span>
                )}

                {post.type === "achievement" && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 5,
                      background: "rgba(249,115,22,0.15)",
                      color: "#f97316",
                    }}
                  >
                    <Trophy size={11} style={{ display: "inline-block", marginRight: 3, verticalAlign: "middle" }} />
                    Achievement
                  </span>
                )}
                {post.type === "progress" && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 5,
                      background: "rgba(56,189,248,0.12)",
                      color: "#38bdf8",
                    }}
                  >
                    <TrendingUp size={11} style={{ display: "inline-block", marginRight: 3, verticalAlign: "middle" }} />
                    Progress
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>
                  {relativeTime(post.createdAt)}
                </p>
                {post.editedAt && (
                  <span style={{ color: "#4b5563", fontSize: 11 }}> · edited</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions menu (edit/delete for owner, more for others) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }} ref={menuRef}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowMenu((p) => !p)}
                style={{
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  padding: 4,
                }}
              >
                <MoreHorizontal size={16} />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      background: "#252525",
                      border: "1px solid #333",
                      borderRadius: 10,
                      overflow: "hidden",
                      minWidth: 140,
                      zIndex: 100,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    }}
                  >
                    <button
                      onClick={() => { handleShare(); setShowMenu(false); }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 14px",
                        background: "none",
                        border: "none",
                        color: "#d1d5db",
                        fontSize: 13,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#333")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <Share2 size={14} /> Copy link
                    </button>

                    {isOwner && (
                      <>
                        <button
                          onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 14px",
                            background: "none",
                            border: "none",
                            color: "#d1d5db",
                            fontSize: 13,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = "#333")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <Pencil size={14} /> Edit post
                        </button>
                        <button
                          onClick={() => { setShowDeleteModal(true); setShowMenu(false); }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 14px",
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: 13,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = "#333")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <Trash2 size={14} /> Delete post
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Workout Data Chip ── */}
        {post.workoutData?.value && (
          <div style={{ padding: "0 18px 10px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(57,230,9,0.08)",
                border: "1px solid rgba(57,230,9,0.2)",
                borderRadius: 8,
                padding: "6px 12px",
              }}
            >
              <Dumbbell size={13} color="#39E609" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#39E609" }}>
                {post.workoutData.type}:
              </span>
              <span style={{ fontSize: 12, color: "#d1d5db" }}>{post.workoutData.value}</span>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        <div style={{ padding: "0 18px 14px" }}>
          <p style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            {post.content}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {post.tags.map((t) => (
                <span key={t} style={{ fontSize: 12, color: "#39E609", cursor: "pointer" }}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Image ── */}
        {post.imageUrl && (
          <div
            style={{
              width: "100%",
              maxHeight: 300,
              background: "#111",
              borderTop: "1px solid #2a2a2a",
              borderBottom: "1px solid #2a2a2a",
              overflow: "hidden",
            }}
          >
            <img
              src={post.imageUrl}
              alt="Post"
              style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
            />
          </div>
        )}

        {/* ── Stats row ── */}
        <div
          style={{
            padding: "8px 18px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 12,
            color: "#6b7280",
            borderBottom: "1px solid #222",
          }}
        >
          <span>{post.likes.length.toLocaleString()} {post.likes.length === 1 ? "like" : "likes"}</span>
          <button
            onClick={() => setShowComments((p) => !p)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 12, padding: 0 }}
          >
            {post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"}
          </button>
          <span>{post.shares} shares</span>
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", padding: "4px 8px" }}>
          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => currentUserId ? likeMutation.mutate() : toast.error("Sign in to like posts")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 4px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "none",
              color: post.liked ? "#ef4444" : "#9ca3af",
              transition: "color 0.15s, background 0.15s",
            }}
          >
            <Heart
              size={16}
              fill={post.liked ? "#ef4444" : "none"}
              color={post.liked ? "#ef4444" : undefined}
            />
            Like
          </motion.button>

          {/* Comment */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowComments((p) => !p)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 4px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "none",
              color: showComments ? "#38bdf8" : "#9ca3af",
              transition: "color 0.15s",
            }}
          >
            <MessageCircle size={16} color={showComments ? "#38bdf8" : undefined} />
            Comment
            {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </motion.button>

          {/* Share */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleShare}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 4px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "none",
              color: "#9ca3af",
              transition: "color 0.15s",
            }}
          >
            <Share2 size={16} />
            Share
          </motion.button>
        </div>

        {/* ── Comments Section ── */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <CommentsSection postId={post.id} currentUserId={currentUserId} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showEditModal && (
          <EditPostModal
            post={post}
            onClose={() => setShowEditModal(false)}
            onSave={(data) => editMutation.mutate(data)}
            saving={editMutation.isPending}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            title="Delete post?"
            message="This will permanently remove your post and all its comments. This cannot be undone."
            onConfirm={() => deleteMutation.mutate()}
            onCancel={() => setShowDeleteModal(false)}
            loading={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── PostComposer ───────────────────────────────────────────────────────── */

function PostComposer({ currentUserName }: { currentUserName: string }) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { addPost, currentUserId } = useCommunityStore();

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [workoutValue, setWorkoutValue] = useState("");
  const [postType, setPostType] = useState<"general" | "achievement" | "progress">("general");
  const [showExtras, setShowExtras] = useState(false);
  const [showPR, setShowPR] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  const createMutation = useMutation({
    mutationFn: (payload: object) =>
      api("/community/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onMutate: async (payload: any) => {
      // Optimistic insert at top of feed
      const tempPost: CommunityPost = {
        id: `temp-${Date.now()}`,
        authorId: currentUserId || "",
        authorName: currentUserName,
        authorAvatar: "",
        content: payload.content,
        tags: payload.tags || [],
        imageUrl: payload.imageUrl || "",
        workoutData: payload.workoutData || null,
        likes: [],
        liked: false,
        commentsCount: 0,
        shares: 0,
        type: payload.type || "general",
        createdAt: new Date().toISOString(),
        editedAt: null,
      };
      addPost(tempPost);
      return { tempPost };
    },
    onSuccess: (data, _vars, context) => {
      // Replace temp post with real one from server
      const { updatePost } = useCommunityStore.getState();
      if (context?.tempPost) {
        updatePost(context.tempPost.id, { ...data, id: data.id });
        // Swap id
        const { removePost, addPost: add } = useCommunityStore.getState();
        removePost(context.tempPost.id);
        add(data);
      }
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setContent("");
      setImageUrl("");
      setWorkoutType("");
      setWorkoutValue("");
      setPostType("general");
      setShowExtras(false);
      setShowPR(false);
      setShowPhoto(false);
      toast.success("Post shared with the community! 💪");
    },
    onError: (_err, _vars, context) => {
      if (context?.tempPost) {
        const { removePost } = useCommunityStore.getState();
        removePost(context.tempPost.id);
      }
      toast.error("Failed to create post. Please try again.");
    },
  });

  const handlePost = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const payload: Record<string, unknown> = { content: trimmed, type: postType };
    if (imageUrl.trim()) payload.imageUrl = imageUrl.trim();
    if (workoutType.trim() && workoutValue.trim()) {
      payload.workoutData = { type: workoutType.trim(), value: workoutValue.trim() };
    }

    createMutation.mutate(payload);
  };

  const typeButtons = [
    { label: "General", value: "general" as const, color: "#9ca3af" },
    { label: "Achievement", value: "achievement" as const, color: "#f97316" },
    { label: "Progress", value: "progress" as const, color: "#38bdf8" },
  ];

  return (
    <div
      style={{
        background: "#1c1c1c",
        border: "1px solid #2a2a2a",
        borderRadius: 14,
        padding: "18px 18px 14px",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Avatar name={currentUserName} size={40} color="#39E609" />
        <div style={{ flex: 1 }}>
          <textarea
            placeholder="Share your progress, PR, tips or motivation…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              background: "#111",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 13,
              color: "#ffffff",
              outline: "none",
              resize: "none",
              lineHeight: 1.6,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(57,230,9,0.45)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
          />

          {/* Post type selector */}
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {typeButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setPostType(btn.value)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 999,
                  border: `1px solid ${postType === btn.value ? btn.color : "#2a2a2a"}`,
                  background: postType === btn.value ? `${btn.color}15` : "#111",
                  color: postType === btn.value ? btn.color : "#6b7280",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extras: Photo URL / PR */}
      <AnimatePresence>
        {(showPR || showPhoto) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 12, paddingLeft: 52, display: "flex", flexDirection: "column", gap: 8 }}>
              {showPhoto && (
                <input
                  placeholder="Paste image URL…"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    background: "#111",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "#fff",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(57,230,9,0.35)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                />
              )}
              {showPR && (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    placeholder="Type (e.g. PR, Workout)"
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value)}
                    style={{
                      flex: 1,
                      background: "#111",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#fff",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(57,230,9,0.35)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                  />
                  <input
                    placeholder="Value (e.g. Deadlift 140kg)"
                    value={workoutValue}
                    onChange={(e) => setWorkoutValue(e.target.value)}
                    style={{
                      flex: 2,
                      background: "#111",
                      border: "1px solid #2a2a2a",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#fff",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(57,230,9,0.35)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
                  />
                </div>
              )}

              {/* PR chip preview */}
              {workoutType && workoutValue && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(57,230,9,0.08)",
                    border: "1px solid rgba(57,230,9,0.2)",
                    borderRadius: 8,
                    padding: "4px 10px",
                    width: "fit-content",
                  }}
                >
                  <Dumbbell size={12} color="#39E609" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#39E609" }}>{workoutType}:</span>
                  <span style={{ fontSize: 11, color: "#d1d5db" }}>{workoutValue}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 12,
          paddingLeft: 52,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => { setShowPhoto((p) => !p); setShowExtras(true); }}
            style={{
              fontSize: 12,
              color: showPhoto ? "#38bdf8" : "#9ca3af",
              background: showPhoto ? "rgba(56,189,248,0.08)" : "#111",
              border: `1px solid ${showPhoto ? "rgba(56,189,248,0.3)" : "#2a2a2a"}`,
              padding: "5px 12px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            <Camera size={12} /> Photo URL
          </button>
          <button
            onClick={() => { setShowPR((p) => !p); setShowExtras(true); }}
            style={{
              fontSize: 12,
              color: showPR ? "#39E609" : "#9ca3af",
              background: showPR ? "rgba(57,230,9,0.08)" : "#111",
              border: `1px solid ${showPR ? "rgba(57,230,9,0.3)" : "#2a2a2a"}`,
              padding: "5px 12px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            <Dumbbell size={12} /> PR / Workout
          </button>
        </div>

        <button
          disabled={!content.trim() || createMutation.isPending}
          onClick={handlePost}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: content.trim() && !createMutation.isPending ? "#000" : "#39E60960",
            background: content.trim() && !createMutation.isPending ? "#39E609" : "#1a3a0a",
            border: "none",
            padding: "8px 24px",
            borderRadius: 8,
            cursor: content.trim() && !createMutation.isPending ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: content.trim() ? "0 0 12px rgba(57,230,9,0.3)" : "none",
          }}
        >
          {createMutation.isPending ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}

/* ─── CommunityPage ──────────────────────────────────────────────────────── */

export default function CommunityPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { user, isLoaded } = useUser();
  const { posts, setPosts, setCurrentUserId, currentUserId } = useCommunityStore();

  const [filter, setFilter] = useState<FilterType>("Recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Set current user id in store
  useEffect(() => {
    if (isLoaded && user?.id) {
      setCurrentUserId(user.id);
    }
  }, [isLoaded, user?.id, setCurrentUserId]);

  // Fetch community posts and sync into Zustand store
  const { isLoading, data: postsData } = useQuery<CommunityPost[]>({
    queryKey: ["communityPosts"],
    queryFn: () => api("/community/posts"),
    staleTime: 60_000,
    enabled: isLoaded,
  });

  useEffect(() => {
    if (postsData) {
      setPosts(postsData);
    }
  }, [postsData, setPosts]);

  // Filtered & sorted feed
  const displayPosts = useCallback(() => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (filter === "Most Liked") {
      filtered = filtered.sort((a, b) => b.likes.length - a.likes.length);
    } else if (filter === "Recent") {
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    // "Following" – show full feed (no graph in DB yet)

    return filtered;
  }, [posts, filter, searchQuery]);

  const visiblePosts = displayPosts();
  const currentUserName = user?.fullName || "Athlete";

  return (
    <>
      <style>{`
        @keyframes feed-spin { to { transform: rotate(360deg); } }
        .community-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .community-layout { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ padding: "24px 0", maxWidth: "100%" }}>
        <div className="community-layout">

          {/* ════ Main Feed ════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

            {/* Title row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h1
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 26,
                  color: "#ffffff",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Community Feed
              </h1>
              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 10, padding: "8px 14px" }}>
                <Search size={14} color="#6b7280" />
                <input
                  placeholder="Search posts…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: 13,
                    width: 160,
                  }}
                />
              </div>
            </div>

            {/* Composer */}
            <PostComposer currentUserName={currentUserName} />

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  title={f === "Following" ? "Follow system coming soon" : undefined}
                  style={{
                    padding: "7px 18px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: filter === f ? "none" : "1px solid #2a2a2a",
                    background: filter === f ? "#39E609" : "#1c1c1c",
                    color: filter === f ? "#000000" : "#9ca3af",
                    transition: "all 0.2s",
                    boxShadow: filter === f ? "0 0 12px rgba(57,230,9,0.35)" : "none",
                    opacity: f === "Following" ? 0.65 : 1,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Posts */}
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : visiblePosts.length === 0 ? (
              <EmptyFeed />
            ) : (
              <AnimatePresence mode="popLayout">
                {visiblePosts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={i}
                    currentUserId={currentUserId}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* ════ Right Sidebar ════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

            {/* Active Challenges */}
            <div
              style={{
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                borderRadius: 14,
                padding: "18px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 14,
                  margin: "0 0 16px 0",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <Trophy size={16} color="#f97316" />
                Active Challenges
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {mockChallenges
                  .filter((c) => c.status === "active")
                  .slice(0, 3)
                  .map((ch) => (
                    <div key={ch.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600 }}>{ch.name}</span>
                        <span style={{ color: "#39E609", fontSize: 12, fontWeight: 700 }}>{ch.progress}%</span>
                      </div>
                      <div style={{ height: 6, background: "#1f1f1f", borderRadius: 999, overflow: "hidden" }}>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: ch.progress / 100 }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{ height: "100%", background: "#39E609", borderRadius: 999, transformOrigin: "left" }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280", fontSize: 11 }}>{ch.participants.toLocaleString()} joined</span>
                        <span style={{ color: "#f97316", fontSize: 11, fontWeight: 700 }}>+{ch.xpReward} XP</span>
                      </div>
                    </div>
                  ))}
                <button
                  style={{ fontSize: 12, color: "#39E609", background: "none", border: "none", cursor: "pointer", textAlign: "center", paddingTop: 4 }}
                  onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.textDecoration = "underline")}
                  onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.textDecoration = "none")}
                >
                  View all challenges →
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <div
              style={{
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                borderRadius: 14,
                padding: "18px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 14,
                  margin: "0 0 16px 0",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <Zap size={16} color="#39E609" />
                Leaderboard
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {mockLeaderboard.map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: entry.rank === 1 ? "rgba(57,230,9,0.08)" : "transparent",
                      border: entry.rank === 1 ? "1px solid rgba(57,230,9,0.2)" : "1px solid transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          width: 22,
                          textAlign: "center",
                          flexShrink: 0,
                          color: entry.rank === 1 ? "#39E609" : entry.rank === 2 ? "#f97316" : "#6b7280",
                        }}
                      >
                        #{entry.rank}
                      </span>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#2a2a2a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#ffffff",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(entry.user.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: "#ffffff", fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {entry.user.name}
                        </p>
                        {entry.user.badge && (
                          <span style={{ fontSize: 10, color: "#39E609" }}>{entry.user.badge}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 700 }}>{entry.xp.toLocaleString()}</span>
                      <span style={{ color: "#6b7280", fontSize: 10 }}>XP</span>
                      {entry.change === "up" ? <ArrowUp size={12} color="#39E609" /> : entry.change === "down" ? <ArrowDown size={12} color="#ef4444" /> : <Minus size={12} color="#4b5563" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Suggested Members */}
            <div
              style={{
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                borderRadius: 14,
                padding: "18px",
              }}
            >
              <h3
                style={{
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 14,
                  margin: "0 0 16px 0",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Suggested Members
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {(
                  [
                    { name: "Alex Thompson", tier: "Pro", color: "#39E609" },
                    { name: "Sarah Chen", tier: "Elite", color: "#38bdf8" },
                    { name: "Mike Rodriguez", tier: "Pro", color: "#a855f7" },
                  ] as const
                ).map(({ name, tier, color }) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={name} size={36} color={color} />
                      <div>
                        <p style={{ color: "#ffffff", fontSize: 13, fontWeight: 600, margin: 0 }}>{name}</p>
                        <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>{tier} Member</p>
                      </div>
                    </div>
                    <button
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#39E609",
                        border: "1px solid rgba(57,230,9,0.3)",
                        background: "transparent",
                        padding: "5px 14px",
                        borderRadius: 999,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(57,230,9,0.1)")}
                      onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                      onClick={() => toast.success(`Following ${name}!`)}
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
