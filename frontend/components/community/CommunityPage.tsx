"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  Trophy,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Camera,
  Dumbbell,
} from "lucide-react";
import { mockLeaderboard, mockChallenges } from "@/lib/mock-data";
import type { Post } from "@/lib/types";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";

/* ─── Constants ──────────────────────────────────────────────────── */

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  Pro: { bg: "#39E60918", color: "#39E609" },
  Elite: { bg: "#f9731618", color: "#f97316" },
  Trainer: { bg: "#38bdf818", color: "#38bdf8" },
  Ambassador: { bg: "#a855f718", color: "#a855f7" },
};

/* ─── PostCard ───────────────────────────────────────────────────── */

function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [showComment, setShowComment] = useState(false);
  const api = useApiClient();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => api(`/community/posts/${post.id}/like`, { method: "POST" }),
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikes(data.likes);
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const badge = post.author.badge;
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;

  const actionButtons = [
    {
      icon: Heart,
      label: "Like",
      active: liked,
      color: "#ef4444",
      action: handleLike,
    },
    {
      icon: MessageCircle,
      label: "Comment",
      active: showComment,
      color: "#38bdf8",
      action: () => setShowComment((p) => !p),
    },
    {
      icon: Share2,
      label: "Share",
      active: false,
      color: "#39E609",
      action: () => toast.success("Link copied!"),
    },
    {
      icon: Bookmark,
      label: "Save",
      active: false,
      color: "#a855f7",
      action: () => toast.success("Post saved!"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.12 }}
      style={{
        background: "#1c1c1c",
        border: "1px solid #2a2a2a",
        borderRadius: "14px",
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Avatar */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(57,230,9,0.15)",
              border: "1.5px solid rgba(57,230,9,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#39E609",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {post.author.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          {/* Author info */}
          <div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
            >
              <span
                style={{ color: "#ffffff", fontWeight: 600, fontSize: 14 }}
              >
                {post.author.name}
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
                  <Trophy size={11} style={{ display: "inline-block", marginRight: 4, verticalAlign: "middle" }} /> Achievement
                </span>
              )}
            </div>

            <p style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Follow + More */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!post.author.isFollowing && (
            <button
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#39E609",
                border: "1px solid rgba(57,230,9,0.3)",
                background: "rgba(57,230,9,0.06)",
                padding: "4px 14px",
                borderRadius: 999,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(57,230,9,0.15)")
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(57,230,9,0.06)")
              }
              onClick={() => toast.success(`Following ${post.author.name}!`)}
            >
              Follow
            </button>
          )}
          <button
            style={{
              color: "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "0 18px 14px" }}>
        <p
          style={{
            color: "#d1d5db",
            fontSize: 14,
            lineHeight: 1.65,
          }}
        >
          {post.content}
        </p>

        {post.tags && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            {post.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 12,
                  color: "#39E609",
                  cursor: "pointer",
                }}
              >
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
            height: 220,
            background: "#111",
            borderTop: "1px solid #2a2a2a",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <img
            src={post.imageUrl}
            alt="Post"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
        <span>{likes.toLocaleString()} likes</span>
        <span>{post.comments} comments</span>
        <span>{post.shares} shares</span>
      </div>

      {/* ── Action buttons ── */}
      <div
        style={{
          display: "flex",
          padding: "4px 8px",
        }}
      >
        {actionButtons.map((btn) => (
          <motion.button
            key={btn.label}
            whileTap={{ scale: 0.9 }}
            onClick={btn.action}
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
              color: btn.active ? btn.color : "#9ca3af",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseOver={(e) => {
              if (!btn.active)
                (e.currentTarget as HTMLButtonElement).style.color = "#e5e7eb";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.03)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = btn.active
                ? btn.color
                : "#9ca3af";
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            <btn.icon
              size={16}
              fill={
                btn.active && btn.label === "Like" ? btn.color : "none"
              }
              color={btn.active ? btn.color : undefined}
            />
            {btn.label}
          </motion.button>
        ))}
      </div>

      {/* ── Comment box ── */}
      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "0 18px 16px",
                display: "flex",
                gap: 8,
              }}
            >
              <input
                placeholder="Write a comment..."
                style={{
                  flex: 1,
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 13,
                  color: "#ffffff",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(57,230,9,0.45)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "#2a2a2a")
                }
              />
              <button
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#39E609",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                onClick={() => {
                  toast.success("Comment posted!");
                  setShowComment(false);
                }}
              >
                <Send size={15} color="#000" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── CommunityPage ──────────────────────────────────────────────── */

export default function CommunityPage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [postContent, setPostContent] = useState("");
  const FILTERS = ["All", "Following", "Trending", "New"];

  // Fetch Community Posts
  const { data: postsData, isLoading } = useQuery<Post[]>({
    queryKey: ["communityPosts"],
    queryFn: () => api("/community/posts"),
  });

  // Query User Profile
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api("/users/profile"),
  });

  const createPostMutation = useMutation({
    mutationFn: (newPost: { content: string }) =>
      api("/community/posts", {
        method: "POST",
        body: JSON.stringify(newPost),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setPostContent("");
    },
  });

  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    createPostMutation.mutate({ content: postContent });
  };

  return (
    <>
      {/* Responsive style */}
      <style>{`
        .community-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .community-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          padding: "24px 0",
          maxWidth: "100%",
        }}
      >
        <div className="community-layout">
          {/* ════ Main Feed ════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

            {/* Page title */}
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

            {/* ── Post Composer ── */}
            <div
              style={{
                background: "#1c1c1c",
                border: "1px solid #2a2a2a",
                borderRadius: 14,
                padding: "18px 18px 14px",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Current user avatar */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#39E609",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#000",
                    flexShrink: 0,
                  }}
                >
                  {userProfile?.name ? userProfile.name.split(" ").map((n: string) => n[0]).join("") : "JD"}
                </div>

                <input
                  placeholder="Share your progress, tips or motivation..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  style={{
                    flex: 1,
                    background: "#111",
                    border: "1px solid #2a2a2a",
                    borderRadius: 10,
                    padding: "10px 16px",
                    fontSize: 13,
                    color: "#ffffff",
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(57,230,9,0.45)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#2a2a2a")
                  }
                />
              </div>

              {/* Composer toolbar */}
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
                  {[
                    { label: "Photo", icon: Camera },
                    { label: "Achievement", icon: Trophy },
                    { label: "PR", icon: Dumbbell },
                  ].map((item) => (
                    <button
                      key={item.label}
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        background: "#111",
                        border: "1px solid #2a2a2a",
                        padding: "5px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "color 0.15s",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onMouseOver={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#ffffff")
                      }
                      onMouseOut={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#9ca3af")
                      }
                    >
                      <item.icon size={12} />
                      {item.label}
                    </button>
                  ))}
                </div>

                <button
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#000",
                    background: "#39E609",
                    border: "none",
                    padding: "7px 22px",
                    borderRadius: 8,
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    transition: "opacity 0.15s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.opacity =
                      "0.85")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
                  }
                  onClick={handleCreatePost}
                >
                  Post
                </button>
              </div>
            </div>

            {/* ── Feed Filters ── */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
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
                    boxShadow:
                      filter === f
                        ? "0 0 12px rgba(57,230,9,0.35)"
                        : "none",
                  }}
                  onMouseOver={(e) => {
                    if (filter !== f)
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#ffffff";
                  }}
                  onMouseOut={(e) => {
                    if (filter !== f)
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#9ca3af";
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* ── Posts ── */}
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(57,230,9,0.1)", borderTopColor: "#39E609", animation: "feed-spin 0.6s linear infinite" }} />
                <style>{`@keyframes feed-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              (postsData || []).map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))
            )}
          </div>

          {/* ════ Right Sidebar ════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

            {/* ── Active Challenges ── */}
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600 }}>
                          {ch.name}
                        </span>
                        <span
                          style={{ color: "#39E609", fontSize: 12, fontWeight: 700 }}
                        >
                          {ch.progress}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          height: 6,
                          background: "#1f1f1f",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: ch.progress / 100 }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{
                            height: "100%",
                            background: "#39E609",
                            borderRadius: 999,
                            transformOrigin: "left",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#6b7280", fontSize: 11 }}>
                          {ch.participants.toLocaleString()} joined
                        </span>
                        <span
                          style={{ color: "#f97316", fontSize: 11, fontWeight: 700 }}
                        >
                          +{ch.xpReward} XP
                        </span>
                      </div>
                    </div>
                  ))}

                <button
                  style={{
                    fontSize: 12,
                    color: "#39E609",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "center",
                    paddingTop: 4,
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.textDecoration =
                      "underline")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.textDecoration =
                      "none")
                  }
                >
                  View all challenges →
                </button>
              </div>
            </div>

            {/* ── Leaderboard ── */}
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
                <TrendingUp size={16} color="#39E609" />
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
                      background:
                        entry.rank === 1
                          ? "rgba(57,230,9,0.08)"
                          : "transparent",
                      border:
                        entry.rank === 1
                          ? "1px solid rgba(57,230,9,0.2)"
                          : "1px solid transparent",
                    }}
                  >
                    {/* Left: rank + avatar + name */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          width: 22,
                          textAlign: "center",
                          flexShrink: 0,
                          color:
                            entry.rank === 1
                              ? "#39E609"
                              : entry.rank === 2
                              ? "#f97316"
                              : "#6b7280",
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
                        {entry.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: 600,
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {entry.user.name}
                        </p>
                        {entry.user.badge && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#39E609",
                            }}
                          >
                            {entry.user.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: XP + change arrow */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {entry.xp.toLocaleString()}
                      </span>
                      <span style={{ color: "#6b7280", fontSize: 10 }}>XP</span>
                      {entry.change === "up" ? (
                        <ArrowUp size={12} color="#39E609" />
                      ) : entry.change === "down" ? (
                        <ArrowDown size={12} color="#ef4444" />
                      ) : (
                        <Minus size={12} color="#4b5563" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Suggested Members ── */}
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
                  <div
                    key={name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#000",
                          flexShrink: 0,
                        }}
                      >
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p
                          style={{
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {name}
                        </p>
                        <p
                          style={{
                            color: "#6b7280",
                            fontSize: 11,
                            margin: 0,
                          }}
                        >
                          {tier} Member
                        </p>
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
                      onMouseOver={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(57,230,9,0.1)")
                      }
                      onMouseOut={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background =
                          "transparent")
                      }
                      onClick={() => toast.success(`Following ${name}!`)}
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* End sidebar */}
        </div>
      </div>
    </>
  );
}
