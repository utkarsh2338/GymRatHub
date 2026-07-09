"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Trophy, Users, Zap, CheckCircle, Swords, Flame, Droplets, Activity, Dumbbell, Moon, Lock } from "lucide-react";
import { mockLeaderboard } from "@/lib/mock-data";
import type { Challenge } from "@/lib/types";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";
import EmojiToIcon from "@/components/shared/EmojiToIcon";

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const BADGES = [
  { icon: Swords, name: "Iron Warrior", earned: true, xp: 750, desc: "20 strength workouts", color: "#f97316" },
  { icon: Flame, name: "7-Day Blaze", earned: true, xp: 200, desc: "7 consecutive days", color: "#ef4444" },
  { icon: Droplets, name: "Hydration King", earned: false, xp: 150, desc: "Hit water goal 10 days", color: "#38bdf8" },
  { icon: Activity, name: "Speed Demon", earned: false, xp: 300, desc: "Complete 5 cardio sessions", color: "#a855f7" },
  { icon: Dumbbell, name: "Protein Pro", earned: true, xp: 250, desc: "Hit protein goal 7 days", color: "#39E609" },
  { icon: Moon, name: "Night Owl", earned: false, xp: 100, desc: "Work out after 8pm, 5 times", color: "#eab308" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "#39E609",
  completed: "#38bdf8",
  upcoming: "#a855f7",
};

/* ─────────────────────────────────────────────
   ChallengeCard
───────────────────────────────────────────── */
function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [joined, setJoined] = useState(
    challenge.status === "active" || challenge.status === "joined"
  );
  const [showXP, setShowXP] = useState(false);

  const joinMutation = useMutation({
    mutationFn: () => api(`/challenges/${challenge.id}/join`, { method: "POST" }),
    onSuccess: () => {
      setJoined(true);
      setShowXP(true);
      toast.success(`🎉 Joined "${challenge.name}"! +${challenge.xpReward} XP incoming`);
      setTimeout(() => setShowXP(false), 1200);
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: () => toast.error("Could not join challenge. Try again."),
  });

  const handleJoin = () => joinMutation.mutate();

  const statusColor = STATUS_COLORS[challenge.status] ?? "#39E609";
  const isCompleted = challenge.status === "completed";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
      whileHover={{ scale: 1.015, y: -3 }}
      style={{
        position: "relative",
        background: "#1c1c1c",
        border: `1px solid ${isCompleted ? "rgba(56,189,248,0.25)" : "#2a2a2a"}`,
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "border-color 0.2s",
      }}
    >
      {/* XP Float */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ y: -50, opacity: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              color: "#39E609",
              fontWeight: 900,
              fontSize: "18px",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            +{challenge.xpReward} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <EmojiToIcon emoji={challenge.badgeEmoji || "🏆"} size={26} color={statusColor} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, color: "#ffffff", fontWeight: 600, fontSize: "15px", lineHeight: 1.3 }}>
              {challenge.name}
            </h3>
            <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "12px", lineHeight: 1.4 }}>
              {challenge.description}
            </p>
          </div>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            background: `${statusColor}1a`,
            color: statusColor,
            letterSpacing: "0.02em",
            textTransform: "capitalize",
          }}
        >
          {challenge.status}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "8px",
          }}
        >
          <span>Progress</span>
          <span style={{ fontWeight: 700, color: statusColor }}>{challenge.progress}%</span>
        </div>
        <div
          style={{
            height: "8px",
            background: "#111111",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: (index % 3) * 0.08 + 0.3, ease: "easeOut" }}
            style={{
              height: "100%",
              width: `${challenge.progress}%`,
              borderRadius: "999px",
              background: isCompleted
                ? "linear-gradient(90deg, #38bdf8, #22d3ee)"
                : "linear-gradient(90deg, #39E609, #22c55e)",
              transformOrigin: "left",
            }}
          />
        </div>
      </div>

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "12px", color: "#6b7280" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Users style={{ width: "14px", height: "14px" }} />
            <span>{challenge.participants.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#f97316", fontWeight: 700 }}>
            <Zap style={{ width: "14px", height: "14px" }} />
            <span>+{challenge.xpReward} XP</span>
          </div>
        </div>

        {isCompleted ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#38bdf8", fontSize: "12px", fontWeight: 700 }}>
            <CheckCircle style={{ width: "15px", height: "15px" }} />
            Completed!
          </div>
        ) : !joined ? (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            style={{
              background: "#39E609",
              color: "#000000",
              border: "none",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: joinMutation.isPending ? "wait" : "pointer",
              letterSpacing: "0.01em",
              opacity: joinMutation.isPending ? 0.7 : 1,
            }}
          >
            {joinMutation.isPending ? "Joining…" : "Join Challenge"}
          </motion.button>
        ) : (
          <span style={{ fontSize: "12px", color: "#39E609", fontWeight: 700 }}>✓ Joined</span>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   BadgeCard
───────────────────────────────────────────── */
function BadgeCard({ badge, index }: { badge: (typeof BADGES)[0]; index: number }) {
  const [popped, setPopped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", bounce: 0.4 }}
      whileHover={badge.earned ? { scale: 1.07, rotate: 2 } : { scale: 1.02 }}
      onClick={() => {
        if (badge.earned) {
          setPopped(true);
          toast.success(`Badge "${badge.name}" Earned!`);
          setTimeout(() => setPopped(false), 600);
        }
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 12px",
        borderRadius: "14px",
        textAlign: "center",
        cursor: badge.earned ? "pointer" : "default",
        background: badge.earned ? "#1c1c1c" : "#0f0f0f",
        border: badge.earned ? "1px solid rgba(57,230,9,0.28)" : "1px solid #1a1a1a",
        opacity: badge.earned ? 1 : 0.5,
        gap: "6px",
      }}
    >
      <motion.div
        animate={popped ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {badge.earned ? (
          <badge.icon size={34} color={badge.color} />
        ) : (
          <Lock size={34} color="#6b7280" />
        )}
      </motion.div>
      <p style={{ margin: 0, color: "#ffffff", fontSize: "12px", fontWeight: 600, lineHeight: 1.3 }}>
        {badge.name}
      </p>
      <p style={{ margin: 0, color: "#6b7280", fontSize: "11px", lineHeight: 1.4 }}>{badge.desc}</p>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316", marginTop: "2px" }}>
        +{badge.xp} XP
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function ChallengesPage() {
  const [filter, setFilter] = useState("All");
  const api = useApiClient();

  const { data: challenges = [], isLoading } = useQuery<Challenge[]>({
    queryKey: ["challenges"],
    queryFn: () => api("/challenges"),
  });

  const filtered =
    filter === "All"
      ? challenges
      : challenges.filter((c) => c.status === filter.toLowerCase());

  const tabs = ["All", "Active", "Completed", "Upcoming"];

  return (
    <>
      {/* Scoped responsive styles */}
      <style>{`
        .challenges-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .challenges-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1400px) {
          .challenges-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 480px) {
          .badges-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 900px) {
          .badges-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        .xp-banner-inner {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 600px) {
          .xp-banner-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .challenges-tab-btn:hover {
          color: #ffffff !important;
          border-color: #3f3f3f !important;
        }
      `}</style>

      <div
        style={{
          padding: "28px 24px",
          maxWidth: "1400px",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* ── Page Header ── */}
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(22px, 4vw, 32px)",
              color: "#ffffff",
              lineHeight: 1.2,
            }}
          >
            Challenges
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Push your limits and earn rewards
          </p>
        </div>

        {/* ── XP Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            background: "linear-gradient(135deg, #0d1f0d 0%, #111111 100%)",
            border: "1px solid rgba(57,230,9,0.3)",
            borderRadius: "16px",
            padding: "20px 24px",
          }}
        >
          <div className="xp-banner-inner">
            {/* Left: level info */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "rgba(57,230,9,0.12)",
                  border: "2px solid rgba(57,230,9,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                ⚡
              </div>
              <div>
                <p style={{ margin: 0, color: "#ffffff", fontWeight: 700, fontSize: "16px" }}>
                  Your XP Level
                </p>
                <p style={{ margin: "3px 0 0", color: "#6b7280", fontSize: "13px" }}>
                  Level 14 · 2,840 XP total
                </p>
              </div>
            </div>

            {/* Right: progress bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "220px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#6b7280" }}>Progress to Level 15</span>
                <span style={{ color: "#39E609", fontWeight: 700 }}>68%</span>
              </div>
              <div
                style={{
                  height: "10px",
                  background: "#1a1a1a",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 0.68 }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                  style={{
                    height: "100%",
                    width: "100%",
                    background: "linear-gradient(90deg, #39E609, #22c55e)",
                    borderRadius: "999px",
                    transformOrigin: "left",
                  }}
                />
              </div>
              <p style={{ margin: 0, color: "#4b5563", fontSize: "11px" }}>
                1,960 XP to next level
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Filter Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "6px",
            width: "fit-content",
          }}
        >
          {tabs.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                className="challenges-tab-btn"
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  border: active ? "none" : "1px solid transparent",
                  background: active ? "#39E609" : "transparent",
                  color: active ? "#000000" : "#6b7280",
                  letterSpacing: "0.01em",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* ── Challenge Cards Grid ── */}
        <div>
          {isLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "56px 24px",
                color: "#6b7280",
                fontSize: "15px",
                background: "#1c1c1c",
                borderRadius: "14px",
                border: "1px solid #2a2a2a",
              }}
            >
              Loading challenges…
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "56px 24px",
                color: "#4b5563",
                fontSize: "15px",
                background: "#1c1c1c",
                borderRadius: "14px",
                border: "1px solid #2a2a2a",
              }}
            >
              No challenges found for &quot;{filter}&quot;
            </div>
          ) : (
            <div className="challenges-grid">
              {filtered.map((ch, i) => (
                <ChallengeCard key={ch.id} challenge={ch} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── Badges Section ── */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <Trophy style={{ width: "20px", height: "20px", color: "#f97316", flexShrink: 0 }} />
            <h2
              style={{
                margin: 0,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                color: "#ffffff",
              }}
            >
              Your Badges
            </h2>
            <span
              style={{
                marginLeft: "4px",
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {BADGES.filter((b) => b.earned).length}/{BADGES.length} earned
            </span>
          </div>

          <div className="badges-grid">
            {BADGES.map((badge, i) => (
              <BadgeCard key={badge.name} badge={badge} index={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
